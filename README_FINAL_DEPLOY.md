# AXBET ESPNcricinfo Cloudflare + npm

## Cloudflare Workers Build settings
Root directory: `/`

Build command:
```bash
npm install
```

Deploy command:
```bash
npx wrangler deploy
```

Build output directory: leave empty.

## Match feed
The live match pipeline is ESPNcricinfo-first. It polls on every page request and the frontend polls every 5 seconds.

Order of source attempts:
1. ESPNcricinfo current matches endpoint with `clubId=null`
2. ESPNcricinfo current matches endpoint
3. ESPNcricinfo live matches endpoint with `clubId=null`
4. ESPNcricinfo live matches endpoint
5. ESPNcricinfo live RSS fallback

LIVE is only assigned from the dedicated live feed or explicit ESPNcricinfo live state. The system does not infer LIVE from scheduled clock text.

If ESPNcricinfo is temporarily unavailable, the frontend keeps the last verified snapshot instead of inventing or relabeling a match. The indicator changes to `Feed Offline` or `ESPNcricinfo (stale)` so stale data is never presented as fresh.
