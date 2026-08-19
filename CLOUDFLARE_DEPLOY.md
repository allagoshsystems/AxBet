# AXBET Cloudflare deployment

## Cloudflare Workers Builds settings

- Root directory: `/`
- Build command: `npm install`
- Deploy command: `npx wrangler deploy`
- Build output directory: leave empty

Do not use `bun install` and do not add `bun.lock` to this repository.

## Why
This project is configured for npm. `package.json` contains one Vite dependency only, and the Bun lockfile was removed so Cloudflare will not automatically run `bun install --frozen-lockfile`.

## Wrangler
`wrangler.jsonc` serves `./frontend` as Workers Static Assets.

The Python/FastAPI scraper remains a separate backend service. The frontend first loads `/matches.json` and then refreshes match data every 5 seconds, with `/api/matches` as a backend fallback.

## Deploy locally
```bash
npm install
npx wrangler whoami
npx wrangler deploy --dry-run
npx wrangler deploy
```
