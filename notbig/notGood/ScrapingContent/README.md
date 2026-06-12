# Telegram Public Channel Scraper Admin

Monorepo scaffold for a Cloudflare-based Telegram public channel scraper admin.

## Structure

- `apps/worker`: Cloudflare Worker API, cron jobs, scraper logic, D1 + R2 integration
- `apps/web`: Next.js admin dashboard (home + channel detail)
- `packages/shared`: shared TypeScript types

## Implemented

- Channel management APIs
- Manual run endpoint (`POST /api/channels/:id/run`)
- Scheduled scrape + daily cleanup cron handlers
- D1 schema migration for channels/posts/media/runs/month stats
- Telegram `https://t.me/s/<handle>` scraper with bounded pages, delays, and backoff-safe failure handling
- R2 media/text storage with temporary file TTL (`expires_at` + cleanup)
- Next.js dashboard pages:
  - `/` channel list + add/toggle/run
  - `/channels/[id]` month progress + recent posts
- Next.js API proxy route to forward requests to Worker using `ADMIN_KEY`

## Environment

### Worker (`apps/worker`)

- `ADMIN_KEY` (required)
- D1 binding: `DB`
- R2 binding: `BUCKET`
- Optional:
  - `MAX_PAGES_PER_RUN`
  - `MAX_IMAGE_DOWNLOADS`
  - `MAX_FILE_DOWNLOADS`
  - `REQUEST_DELAY_MIN_MS`
  - `REQUEST_DELAY_MAX_MS`
  - `FILE_TTL_DAYS`

### Web (`apps/web`)

- `API_BASE_URL` (required, Worker base URL, e.g. `http://127.0.0.1:8787`)
- `ADMIN_KEY` (required, same as Worker)
- `NEXT_PUBLIC_APP_ORIGIN` (optional, defaults `http://localhost:3000` for server-side fetches)

## Local dev

1. Install dependencies:

```bash
pnpm install
```

2. Apply migration to D1 (example):

```bash
cd apps/worker
pnpm wrangler d1 migrations apply tg-scraper --local
```

3. Run Worker:

```bash
cd apps/worker
pnpm dev
```

4. Run web app:

```bash
cd apps/web
pnpm dev
```

## Deployment (later Cloudflare integration)

- Deploy Worker from `apps/worker` with D1 + R2 bindings configured.
- Deploy Next.js app to Cloudflare Pages from `apps/web`.
- Set `API_BASE_URL` in Pages to Worker URL and set matching `ADMIN_KEY` in both services.

## Notes

- Current scraper parsing relies on Telegram preview HTML structure and is intentionally conservative.
- Scheduled scraping is bounded (`enabled channels`, `max pages`, media caps) to stay free-tier friendly.
- `month_stats` is recalculated incrementally per touched month for UI speed.
