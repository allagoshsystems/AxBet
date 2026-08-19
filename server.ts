import express from "express";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ESPN_LIVE = "https://hs-consumer-api.espncricinfo.com/v1/pages/matches/live?lang=en";
const ESPN_CURRENT = "https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?lang=en&latest=true";
const REFRESH_INTERVAL = 5000;

app.use(cors());
app.use(express.json());

const HEADERS: HeadersInit = {
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  Origin: "https://www.espncricinfo.com",
  Referer: "https://www.espncricinfo.com/",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151.0.0.0 Safari/537.36",
  "Cache-Control": "no-cache",
  Pragma: "no-cache"
};

const clean = (v: unknown) => String(v ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
const first = (...xs: unknown[]) => xs.map(clean).find(Boolean) || "";

function teamName(x: any) {
  const t = x?.team ?? x ?? {};
  return first(t.name, t.displayName, t.shortName, t.shortDisplayName, t.abbreviation);
}
function teamScore(x: any) {
  const s = x?.score;
  if (typeof s === "string" || typeof s === "number") return clean(s);
  return first(s?.display, s?.runs, s?.value, x?.scoreText);
}
function statusOf(m: any, forcedLive = false) {
  if (forcedLive) return "LIVE";
  const stage = clean(m?.stage).toUpperCase();
  const state = clean(m?.state).toUpperCase();
  const raw = first(m?.statusText, m?.status, m?.matchStatus, m?.state, m?.stage).toUpperCase();
  if ((stage === "RUNNING" && state === "LIVE") || state === "LIVE" || raw === "LIVE" || raw.includes("LIVE")) return "LIVE";
  if (["COMPLETED","COMPLETE","RESULT","FINAL","FINISHED","ABANDONED","CANCELLED","CANCELED","NO RESULT","TIED","DRAWN"].some(w => raw.includes(w))) return "RESULT";
  if (["SCHEDULED","UPCOMING"].includes(stage) || ["SCHEDULED","UPCOMING","PREVIEW","NOT STARTED","YET TO START"].some(w => raw.includes(w))) return "UPCOMING";
  if (stage === "RUNNING") return state === "LIVE" ? "LIVE" : "UPCOMING";
  return null;
}
function normalize(m: any, forcedLive = false) {
  const teams = Array.isArray(m?.teams) ? m.teams : [];
  if (teams.length < 2) return null;
  const a = teamName(teams[0]), b = teamName(teams[1]);
  const id = first(m?.objectId, m?.id);
  const status = statusOf(m, forcedLive);
  if (!a || !b || !id || !status) return null;
  const series = m?.series ?? {};
  const sid = first(series.objectId, series.id), slug = clean(series.slug), mslug = clean(m.slug);
  const url = sid && mslug && slug ? `https://www.espncricinfo.com/series/${slug}-${sid}/${mslug}-${id}/live-cricket-score` : "https://www.espncricinfo.com/live-cricket-score";
  return { match_id:String(id), id:String(id), title:first(m.name,m.title,`${a} vs ${b}`), team1:a,teamA:a,scoreA:teamScore(teams[0]),team2:b,teamB:b,scoreB:teamScore(teams[1]),status,match_status:first(m.statusText,m.status,m.state,m.stage),seriesId:sid,series:first(series.name,series.longName),sport:"Cricket",url,source:"ESPNcricinfo",sourceUrl:"https://www.espncricinfo.com/live-cricket-score" };
}
async function fetchJson(url:string){
  const r = await fetch(url,{headers:HEADERS, signal:AbortSignal.timeout(15000)});
  if(!r.ok) throw new Error(`ESPNcricinfo ${r.status}`);
  return r.json();
}
async function getMatches(){
  const rs = await Promise.allSettled([fetchJson(ESPN_LIVE),fetchJson(ESPN_CURRENT)]);
  const out:any[]=[];
  rs.forEach((r,i)=>{if(r.status==='fulfilled' && Array.isArray(r.value?.matches)){for(const m of r.value.matches){const n=normalize(m,i===0);if(n)out.push(n);}}});
  const map=new Map<string,any>();
  for(const m of out){const k=m.match_id;if(!map.has(k)||m.status==='LIVE')map.set(k,m);}
  const rank:any={LIVE:1,UPCOMING:2,RESULT:3};
  const matches=[...map.values()].sort((a,b)=>(rank[a.status]-rank[b.status])||`${a.teamA} ${a.teamB}`.localeCompare(`${b.teamA} ${b.teamB}`)).slice(0,8);
  if(!matches.length) throw new Error("ESPNcricinfo returned no usable matches");
  return {success:true,source:"ESPNcricinfo",source_url:"https://www.espncricinfo.com/live-cricket-score",count:matches.length,max_matches:8,refresh_interval:5,matches,events:matches,updated_at:Date.now()};
}
app.get("/api/matches",async(_req,res)=>{try{const data=await getMatches();res.set("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate");res.json(data);}catch(e){res.status(503).json({success:false,source:"ESPNcricinfo",error:String(e),matches:[],events:[]});}});
app.get("/health",(_req,res)=>res.json({success:true,status:"online",source:"ESPNcricinfo",refresh_interval:REFRESH_INTERVAL}));
app.listen(PORT,()=>console.log(`AXBET ESPNcricinfo API listening on ${PORT}`));
