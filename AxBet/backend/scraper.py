import json
import time
from datetime import datetime
from pathlib import Path

try:
    from curl_cffi import requests
    USE_CURL_CFFI = True
except ImportError:
    import requests
    USE_CURL_CFFI = False

BASE_DIR = Path(__file__).resolve().parent
MATCHES_FILE = BASE_DIR / "matches.json"

ESPN_BASE = "https://hs-consumer-api.espncricinfo.com"
LIVE_URL = f"{ESPN_BASE}/v1/pages/matches/live?lang=en"
CURRENT_URLS = [
    f"{ESPN_BASE}/v1/pages/matches/current?lang=en&latest=true&clubId=null",
    f"{ESPN_BASE}/v1/pages/matches/current?lang=en&latest=true",
]
LIVE_URLS = [
    f"{ESPN_BASE}/v1/pages/matches/live?lang=en&clubId=null",
    f"{ESPN_BASE}/v1/pages/matches/live?lang=en",
]
RSS_URLS = [
    "https://static.cricinfo.com/rss/livescores.xml",
    "https://www.espncricinfo.com/ci/engine/match/scores/rss.xml",
]
MAX_MATCHES = 8
REFRESH_INTERVAL = 5
REQUEST_TIMEOUT = 20

HEADERS = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.espncricinfo.com",
    "Referer": "https://www.espncricinfo.com/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}


def clean(value):
    return " ".join(str(value or "").replace("\xa0", " ").split()).strip()


def first(*values):
    for value in values:
        text = clean(value)
        if text:
            return text
    return ""


def team_name(item):
    team = item.get("team") or item
    return first(team.get("name"), team.get("displayName"), team.get("shortName"), team.get("shortDisplayName"), team.get("abbreviation"))


def team_score(item):
    score = item.get("score")
    if isinstance(score, (str, int, float)):
        return clean(score)
    if isinstance(score, dict):
        return first(score.get("display"), score.get("runs"), score.get("value"))
    innings = item.get("innings")
    if isinstance(innings, list) and innings:
        return first(innings[0].get("score"), innings[0].get("display")) if isinstance(innings[0], dict) else clean(innings[0])
    return first(item.get("scoreText"))


def classify(match, forced_live=False):
    if forced_live:
        return "LIVE"
    stage = clean(match.get("stage")).upper()
    state = clean(match.get("state")).upper()
    raw = first(match.get("statusText"), match.get("status"), match.get("matchStatus"), match.get("state"), match.get("stage")).upper()

    if stage == "RUNNING" and state == "LIVE":
        return "LIVE"
    if state == "LIVE" or raw == "LIVE" or "LIVE" in raw:
        return "LIVE"

    result_words = ("COMPLETED", "COMPLETE", "RESULT", "FINAL", "FINISHED", "ABANDONED", "CANCELLED", "CANCELED", "NO RESULT", "TIED", "DRAWN")
    if any(word in raw for word in result_words) or stage in {"RESULT", "COMPLETED", "COMPLETE", "FINISHED"}:
        return "RESULT"

    if any(word in raw for word in ("SCHEDULED", "UPCOMING", "PREVIEW", "NOT STARTED", "YET TO START")) or stage in {"SCHEDULED", "UPCOMING"}:
        return "UPCOMING"
    if stage == "RUNNING":
        return "LIVE" if state == "LIVE" else "UPCOMING"
    return None


def match_url(match):
    series = match.get("series") or {}
    series_id = first(series.get("objectId"), series.get("id"))
    match_id = first(match.get("objectId"), match.get("id"))
    series_slug = clean(series.get("slug"))
    match_slug = clean(match.get("slug"))
    if series_id and match_id and series_slug and match_slug:
        return f"https://www.espncricinfo.com/series/{series_slug}-{series_id}/{match_slug}-{match_id}/live-cricket-score"
    return "https://www.espncricinfo.com/live-cricket-score"


def normalize_match(match, forced_live=False):
    teams = match.get("teams") if isinstance(match.get("teams"), list) else []
    if len(teams) < 2:
        return None
    team_a = team_name(teams[0])
    team_b = team_name(teams[1])
    match_id = first(match.get("objectId"), match.get("id"))
    if not match_id or not team_a or not team_b:
        return None
    status = classify(match, forced_live)
    if not status:
        return None
    series = match.get("series") or {}
    return {
        "match_id": match_id,
        "id": match_id,
        "title": first(match.get("name"), match.get("title"), f"{team_a} vs {team_b}"),
        "team1": team_a,
        "teamA": team_a,
        "scoreA": team_score(teams[0]),
        "team2": team_b,
        "teamB": team_b,
        "scoreB": team_score(teams[1]),
        "status": status,
        "match_status": first(match.get("statusText"), match.get("status"), match.get("state"), match.get("stage")),
        "seriesId": first(series.get("objectId"), series.get("id")),
        "series": first(series.get("name"), series.get("longName")),
        "sport": "Cricket",
        "url": match_url(match),
        "source": "ESPNcricinfo",
        "sourceUrl": "https://www.espncricinfo.com/live-cricket-score",
    }


def fetch_json(url):
    if USE_CURL_CFFI:
        response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, impersonate="chrome")
    else:
        response = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    return response.json()


def fetch_text(url):
    if USE_CURL_CFFI:
        response = requests.get(url, headers={**HEADERS, "Accept": "application/rss+xml, application/xml, text/xml, */*"}, timeout=REQUEST_TIMEOUT, impersonate="chrome")
    else:
        response = requests.get(url, headers={**HEADERS, "Accept": "application/rss+xml, application/xml, text/xml, */*"}, timeout=REQUEST_TIMEOUT)
    response.raise_for_status()
    return response.text


def parse_rss_live(xml):
    import re
    from html import unescape
    items = []
    for block in re.findall(r"<item\\b[\\s\\S]*?</item>", xml, flags=re.I):
        def tag(name):
            m = re.search(rf"<{name}\\b[^>]*>([\\s\\S]*?)</{name}>", block, flags=re.I)
            if not m:
                return ""
            text = re.sub(r"<!\\[CDATA\\[|\\]\\]>", "", m.group(1))
            return clean(unescape(re.sub(r"<[^>]+>", " ", text)))
        title, description = tag("title"), tag("description")
        link = tag("link") or tag("guid")
        if not title:
            continue
        parts = re.split(r"\\s+v\\s+", title, maxsplit=1, flags=re.I)
        if len(parts) != 2:
            continue
        team_a, team_b = clean(parts[0]), clean(parts[1])
        match_id_match = re.search(r"(\\d{5,})", link)
        match_id = match_id_match.group(1) if match_id_match else f"rss-{abs(hash(title))}"
        items.append({
            "match_id": str(match_id), "id": str(match_id), "title": title,
            "team1": team_a, "teamA": team_a, "scoreA": description,
            "team2": team_b, "teamB": team_b, "scoreB": "", "status": "LIVE",
            "match_status": "LIVE", "seriesId": "", "series": "", "sport": "Cricket",
            "url": link or "https://www.espncricinfo.com/live-cricket-score",
            "source": "ESPNcricinfo", "sourceUrl": "https://www.espncricinfo.com/live-cricket-score"
        })
    return items


def first_successful_json(urls):
    errors = []
    for url in urls:
        try:
            return fetch_json(url), url
        except Exception as exc:
            errors.append(f"{url}: {exc}")
    raise RuntimeError(" | ".join(errors))


def collect(data, forced_live=False):
    rows = data.get("matches", []) if isinstance(data, dict) else []
    output = []
    for row in rows:
        match = normalize_match(row, forced_live)
        if match:
            output.append(match)
    return output


def scrape_all():
    matches = []
    errors = []
    try:
        data, _ = first_successful_json(CURRENT_URLS)
        matches.extend(collect(data, False))
    except Exception as exc:
        errors.append(f"current: {exc}")
    try:
        data, _ = first_successful_json(LIVE_URLS)
        matches.extend(collect(data, True))
    except Exception as exc:
        errors.append(f"live: {exc}")
    if not matches:
        for url in RSS_URLS:
            try:
                rss_matches = parse_rss_live(fetch_text(url))
                if rss_matches:
                    matches.extend(rss_matches)
                    break
            except Exception as exc:
                errors.append(f"rss: {url}: {exc}")
    if not matches:
        raise RuntimeError("ESPNcricinfo feed unavailable; no matches returned. " + " | ".join(errors))
    return dedupe_sort(matches)[:MAX_MATCHES]

def save_matches(matches):
    data = {
        "success": True,
        "source": "ESPNcricinfo",
        "source_url": "https://www.espncricinfo.com/live-cricket-score",
        "count": len(matches),
        "max_matches": MAX_MATCHES,
        "refresh_interval": REFRESH_INTERVAL,
        "matches": matches,
        "events": matches,
        "updated_at": int(time.time() * 1000),
        "updated_iso": datetime.utcnow().isoformat() + "Z",
    }
    temporary = MATCHES_FILE.with_suffix(".tmp")
    temporary.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    temporary.replace(MATCHES_FILE)
    print(f"Saved {len(matches)} ESPNcricinfo matches at {data['updated_iso']}")
    for i, match in enumerate(matches, 1):
        print(f"{i}. [{match['status']}] {match['teamA']} vs {match['teamB']} | {match['scoreA']} | {match['scoreB']}")


def update_matches():
    try:
        matches = scrape_all()
    except Exception as exc:
        print(f"ESPNcricinfo scraper error: {exc}")
        print("Keeping the previous matches.json. No fake or fabricated match state is written.")
        return
    if matches:
        save_matches(matches)
    else:
        print("ESPNcricinfo returned no usable matches; keeping previous snapshot.")


def main():
    print("Starting ESPNcricinfo scraper; refresh interval is 5 seconds.")
    while True:
        try:
            update_matches()
            time.sleep(REFRESH_INTERVAL)
        except KeyboardInterrupt:
            print("Scraper stopped.")
            break
        except Exception as exc:
            print(f"Unexpected scraper error: {exc}")
            time.sleep(REFRESH_INTERVAL)


if __name__ == "__main__":
    main()
