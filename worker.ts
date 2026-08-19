const ESPN_BASE = "https://hs-consumer-api.espncricinfo.com";
const LIVE_URLS = [
  `${ESPN_BASE}/v1/pages/matches/live?lang=en&clubId=null`,
  `${ESPN_BASE}/v1/pages/matches/live?lang=en`,
];
const CURRENT_URLS = [
  `${ESPN_BASE}/v1/pages/matches/current?lang=en&latest=true&clubId=null`,
  `${ESPN_BASE}/v1/pages/matches/current?lang=en&latest=true`,
];
const RSS_LIVE_URLS = [
  "https://static.cricinfo.com/rss/livescores.xml",
  "https://www.espncricinfo.com/ci/engine/match/scores/rss.xml",
];
let lastGoodPayload: any | null = null;

const HEADERS = {
  "Accept": "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Origin": "https://www.espncricinfo.com",
  "Referer": "https://www.espncricinfo.com/live-cricket-score",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",
  "Cache-Control": "no-cache, no-store, max-age=0",
  "Pragma": "no-cache",
};

const NO_STORE = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
};

function clean(value: unknown): string {
  return String(value ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function firstNonEmpty(...values: unknown[]): string {
  for (const value of values) {
    const text = clean(value);
    if (text) return text;
  }
  return "";
}

function unwrapRows(data: any): any[] {
  if (Array.isArray(data?.matches)) return data.matches;
  if (Array.isArray(data?.content?.matches)) return data.content.matches;
  if (Array.isArray(data?.page?.matches)) return data.page.matches;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

function teamName(item: any): string {
  const t = item?.team ?? item;
  return firstNonEmpty(t?.name, t?.longName, t?.displayName, t?.shortName, t?.shortDisplayName, t?.abbreviation);
}

function teamScore(item: any): string {
  const score = item?.score;
  if (typeof score === "string" || typeof score === "number") return clean(score);
  if (score && typeof score === "object") {
    const display = firstNonEmpty(score?.display, score?.value, score?.runs);
    if (display) return display;
    if (Array.isArray(score?.innings)) {
      return score.innings.map((x: any) => firstNonEmpty(x?.display, x?.score, x?.runs)).filter(Boolean).join(" & ");
    }
  }
  if (Array.isArray(item?.innings)) {
    return item.innings.map((x: any) => firstNonEmpty(x?.display, x?.score, x?.runs)).filter(Boolean).join(" & ");
  }
  return firstNonEmpty(item?.scoreText, item?.score?.display);
}

function classify(match: any, sourceIsLiveEndpoint = false): "LIVE" | "UPCOMING" | "RESULT" | null {
  const stage = clean(match?.stage).toUpperCase();
  const state = clean(match?.state).toUpperCase();
  const raw = firstNonEmpty(match?.statusText, match?.status, match?.matchStatus, match?.state, match?.stage).toUpperCase();

  // The dedicated ESPNcricinfo live endpoint is an authoritative live source.
  if (sourceIsLiveEndpoint) return "LIVE";

  if ((stage === "RUNNING" && state === "LIVE") || state === "LIVE" || /\bLIVE\b|\bIN[- ]PLAY\b/.test(raw)) {
    return "LIVE";
  }

  const resultWords = ["COMPLETED", "COMPLETE", "RESULT", "FINAL", "FINISHED", "ABANDONED", "CANCELLED", "CANCELED", "NO RESULT", "TIED", "DRAWN"];
  if (resultWords.some(word => raw.includes(word)) || ["RESULT", "COMPLETED", "COMPLETE", "FINISHED"].includes(stage)) return "RESULT";

  const upcomingWords = ["SCHEDULED", "UPCOMING", "PREVIEW", "NOT STARTED", "YET TO START"];
  if (upcomingWords.some(word => raw.includes(word)) || ["SCHEDULED", "UPCOMING"].includes(stage)) return "UPCOMING";

  // Never infer LIVE from a clock/time alone.
  if (stage === "RUNNING") return state === "LIVE" ? "LIVE" : "UPCOMING";
  return null;
}


function xmlText(value: string): string {
  return clean(value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " "));
}

function parseLiveRss(xml: string): any[] {
  const items: any[] = [];
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}\\b[^>]*>([\s\S]*?)<\/${tag}>`, "i"));
      return m ? xmlText(m[1]) : "";
    };
    const title = get("title");
    const description = get("description");
    const link = get("link") || get("guid");
    if (!title) continue;
    const parts = title.split(/\s+v\s+/i);
    const teamA = clean(parts[0]);
    const teamB = clean(parts.slice(1).join(" v "));
    if (!teamA || !teamB) continue;
    const scoreText = description || title;
    const matchId = (link.match(/(\d{5,})/) || [])[1] || `${teamA}|${teamB}`;
    items.push({
      match_id: String(matchId),
      id: String(matchId),
      title,
      team1: teamA,
      teamA,
      scoreA: scoreText,
      team2: teamB,
      teamB,
      scoreB: "",
      status: "LIVE",
      match_status: "LIVE",
      seriesId: "",
      series: "",
      sport: "Cricket",
      url: link || "https://www.espncricinfo.com/live-cricket-score",
      source: "ESPNcricinfo",
      sourceUrl: "https://www.espncricinfo.com/live-cricket-score",
    });
  }
  return items;
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`, {
    method: "GET",
    headers: {
      ...HEADERS,
      "Accept": "application/rss+xml, application/xml, text/xml, text/plain, */*",
    },
    cf: { cacheTtl: 0, cacheEverything: false },
  });
  if (!response.ok) throw new Error(`ESPNcricinfo RSS ${response.status} for ${url}`);
  return response.text();
}

async function getRssLive(): Promise<any[]> {
  const errors: string[] = [];
  for (const url of RSS_LIVE_URLS) {
    try {
      const xml = await fetchText(url);
      const matches = parseLiveRss(xml);
      if (matches.length) return matches;
      errors.push(`${url}: empty feed`);
    } catch (error) {
      errors.push(String(error));
    }
  }
  throw new Error(errors.join(" | "));
}

function matchUrl(match: any): string {
  const series = match?.series ?? {};
  const seriesId = firstNonEmpty(series?.objectId, series?.id);
  const matchId = firstNonEmpty(match?.objectId, match?.id);
  const seriesSlug = clean(series?.slug);
  const matchSlug = clean(match?.slug);
  if (seriesId && matchId && seriesSlug && matchSlug) {
    return `https://www.espncricinfo.com/series/${encodeURIComponent(seriesSlug)}-${encodeURIComponent(seriesId)}/${encodeURIComponent(matchSlug)}-${encodeURIComponent(matchId)}/live-cricket-score`;
  }
  return "https://www.espncricinfo.com/live-cricket-score";
}

function normalizeMatch(match: any, sourceIsLiveEndpoint = false): any | null {
  const teams = Array.isArray(match?.teams) ? match.teams : [];
  if (teams.length < 2) return null;

  const teamA = teamName(teams[0]);
  const teamB = teamName(teams[1]);
  const matchId = firstNonEmpty(match?.objectId, match?.id, match?.matchId);
  if (!matchId || !teamA || !teamB) return null;

  const status = classify(match, sourceIsLiveEndpoint);
  if (!status) return null;

  const series = match?.series ?? {};
  return {
    match_id: String(matchId),
    id: String(matchId),
    title: firstNonEmpty(match?.name, match?.title, `${teamA} vs ${teamB}`),
    team1: teamA,
    teamA,
    scoreA: teamScore(teams[0]),
    team2: teamB,
    teamB,
    scoreB: teamScore(teams[1]),
    status,
    match_status: firstNonEmpty(match?.statusText, match?.status, match?.state, match?.stage),
    seriesId: firstNonEmpty(series?.objectId, series?.id),
    series: firstNonEmpty(series?.name, series?.longName),
    sport: "Cricket",
    url: matchUrl(match),
    source: "ESPNcricinfo",
    sourceUrl: "https://www.espncricinfo.com/live-cricket-score",
  };
}

async function fetchJson(url: string): Promise<any> {
  const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}_=${Date.now()}`, {
    method: "GET",
    headers: HEADERS,
    cf: { cacheTtl: 0, cacheEverything: false },
  });
  if (!response.ok) throw new Error(`ESPNcricinfo ${response.status} for ${url}`);
  return response.json();
}

async function firstSuccessful(urls: string[]): Promise<{ data: any; url: string }> {
  const errors: string[] = [];
  for (const url of urls) {
    try {
      return { data: await fetchJson(url), url };
    } catch (error) {
      errors.push(String(error));
    }
  }
  throw new Error(errors.join(" | "));
}

function collectMatches(data: any, sourceIsLiveEndpoint = false): any[] {
  return unwrapRows(data)
    .map(row => normalizeMatch(row, sourceIsLiveEndpoint))
    .filter(Boolean) as any[];
}

function dedupeAndSort(matches: any[]): any[] {
  const map = new Map<string, any>();
  const rank = (s: string) => s === "LIVE" ? 1 : s === "UPCOMING" ? 2 : 3;
  for (const match of matches) {
    const key = String(match.match_id || `${match.teamA}|${match.teamB}`).toLowerCase();
    const existing = map.get(key);
    if (!existing || rank(match.status) < rank(existing.status)) map.set(key, match);
  }
  return [...map.values()].sort((a, b) => {
    const r = rank(a.status) - rank(b.status);
    if (r !== 0) return r;
    return `${a.teamA} ${a.teamB}`.localeCompare(`${b.teamA} ${b.teamB}`);
  });
}

async function getMatches(): Promise<any> {
  const matches: any[] = [];
  const errors: string[] = [];

  // Current is the broad discovery source. The live endpoint is then merged on top.
  try {
    const current = await firstSuccessful(CURRENT_URLS);
    matches.push(...collectMatches(current.data, false));
  } catch (error) {
    errors.push(`current: ${String(error)}`);
  }

  try {
    const live = await firstSuccessful(LIVE_URLS);
    matches.push(...collectMatches(live.data, true));
  } catch (error) {
    errors.push(`live: ${String(error)}`);
  }

  const selected = dedupeAndSort(matches).slice(0, 50);
  if (!selected.length) {
    try {
      matches.push(...await getRssLive());
    } catch (error) {
      errors.push(`rss: ${String(error)}`);
    }
  }

  const finalMatches = dedupeAndSort(matches).slice(0, 50);
  if (!finalMatches.length) throw new Error(`No usable ESPNcricinfo matches. ${errors.join(" | ")}`);

  const liveCount = finalMatches.filter(x => x.status === "LIVE").length;
  const payload = {
    success: true,
    source: "ESPNcricinfo",
    source_url: "https://www.espncricinfo.com/live-cricket-score",
    count: finalMatches.length,
    live_count: liveCount,
    refresh_interval: 5,
    matches: finalMatches,
    events: finalMatches,
    updated_at: Date.now(),
    feed_warning: errors.length ? errors.join(" | ") : "",
  };
  lastGoodPayload = payload;
  return payload;
}

export default {
  async fetch(request: Request, env: { ASSETS: { fetch: (request: Request) => Promise<Response> } }): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/matches" || url.pathname === "/api/live" || url.pathname === "/api/upcoming") {
      try {
        const payload = await getMatches();
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json; charset=utf-8", ...NO_STORE },
        });
      } catch (error) {
        if (lastGoodPayload) {
          return new Response(JSON.stringify({
            ...lastGoodPayload,
            success: true,
            stale: true,
            feed_warning: String(error),
            served_at: Date.now(),
          }), {
            status: 200,
            headers: { "Content-Type": "application/json; charset=utf-8", ...NO_STORE },
          });
        }
        return new Response(JSON.stringify({
          success: false,
          source: "ESPNcricinfo",
          source_url: "https://www.espncricinfo.com/live-cricket-score",
          error: String(error),
          matches: [],
          events: [],
          updated_at: Date.now(),
        }), {
          status: 503,
          headers: { "Content-Type": "application/json; charset=utf-8", ...NO_STORE },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
