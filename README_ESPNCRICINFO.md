# AXBET ESPNcricinfo live-feed update

Only the cricket data extraction path was changed. Existing AXBET UI, Firebase/auth, styling, loading screen, account controls, and application behavior are preserved.

## Data source
ESPNcricinfo's consumer feed is used for cricket match discovery:
- Live: `https://hs-consumer-api.espncricinfo.com/v1/pages/matches/live?lang=en`
- Current: `https://hs-consumer-api.espncricinfo.com/v1/pages/matches/current?lang=en&latest=true`
- Public source page: `https://www.espncricinfo.com/live-cricket-score`

The scraper treats ESPNcricinfo's LIVE state as authoritative. It does not infer LIVE from a start time. If the feed fails, the previous backend snapshot is retained rather than inventing a match or changing a match to UPCOMING.

## Refresh
The existing frontend requests `/api/matches` every 5 seconds. Cloudflare's Worker handles `/api/*` and fetches ESPNcricinfo live/current data with cache disabled.

## Cloudflare
Root directory: `/`
Build command:
`npm install`

Deploy command:
`npx wrangler deploy`

Build output directory: leave empty.
