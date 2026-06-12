import type { Env } from "./types";
import { getConfig } from "./lib/config";
import { isAdminAuthorized } from "./lib/admin";
import { json, unauthorized } from "./lib/http";
import * as db from "./lib/db";
import { handleChannels } from "./routes/channels";
import { handlePosts } from "./routes/posts";
import { handleMedia } from "./routes/media";
import { runScrapeForChannel } from "./lib/scraper";

async function dispatchApi(req: Request, env: Env): Promise<Response> {
  if (!isAdminAuthorized(req, env)) {
    return unauthorized();
  }

  const url = new URL(req.url);
  const pathname = url.pathname;

  for (const routeHandler of [
    () => handleChannels(req, env, pathname),
    () => handlePosts(req, env, url, pathname),
    () => handleMedia(req, env, pathname)
  ]) {
    const response = await routeHandler();
    if (response) {
      return response;
    }
  }

  return json({ error: "Not found" }, { status: 404 });
}

async function runScheduledScrape(env: Env): Promise<void> {
  const cfg = getConfig(env);
  const channels = await db.listChannels(env.DB);

  // Keep scheduled runs bounded for free tier safety.
  const runCandidates = channels.filter((c) => c.enabled === 1).slice(0, 3);

  for (const channel of runCandidates) {
    const mode = channel.backfillCursorMsgId ? "incremental" : "backfill";
    const runId = await db.startRun(env.DB, channel.id, mode);
    const result = await runScrapeForChannel(env, channel, cfg, mode);
    await db.finishRun(env.DB, runId, result);
  }
}

async function runCleanup(env: Env): Promise<void> {
  const expired = await db.listExpiredMedia(env.DB, new Date().toISOString(), 250);
  for (const item of expired) {
    await env.BUCKET.delete(item.r2_key);
    await db.deleteMedia(env.DB, item.id);
  }
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/api/")) {
      return dispatchApi(req, env);
    }
    return json({ ok: true, service: "tg-scraper-api" });
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const cron = event.cron;
    if (cron === "30 2 * * *") {
      ctx.waitUntil(runCleanup(env));
      return;
    }
    ctx.waitUntil(runScheduledScrape(env));
  }
};
