# AXBET V5 Cloudflare/NPM fixed package

This package preserves the AXBET frontend, Firebase account flow, match refresh logic, LIVE/UPCOMING/RESULT handling, and backend files from the previous fixed version.

Cloudflare configuration:

```text
Root directory: /
Build command: npm install
Deploy command: npx wrangler deploy
Build output directory: empty
```

Important: keep `bun.lock` out of the GitHub repository. Cloudflare detects a Bun lockfile and may automatically run `bun install --frozen-lockfile`.
