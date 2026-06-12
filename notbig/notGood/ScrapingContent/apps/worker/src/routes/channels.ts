import type { Env } from "../types";
import { badRequest, json, parseJsonBody } from "../lib/http";
import * as db from "../lib/db";
import { getConfig } from "../lib/config";
import { runScrapeForChannel } from "../lib/scraper";

interface CreateChannelBody {
  handle: string;
  label: string;
  exam: string;
}

export async function handleChannels(req: Request, env: Env, pathname: string): Promise<Response | null> {
  if (pathname === "/api/channels" && req.method === "GET") {
    const channels = await db.listChannels(env.DB);
    return json({ items: channels });
  }

  if (pathname === "/api/channels" && req.method === "POST") {
    const body = await parseJsonBody<CreateChannelBody>(req);
    if (!body?.handle || !body.label || !body.exam) {
      return badRequest("handle, label, and exam are required");
    }

    const safeHandle = body.handle.replace(/^@/, "").trim().toLowerCase();
    if (!/^[a-z0-9_]{4,}$/.test(safeHandle)) {
      return badRequest("Invalid Telegram channel handle format");
    }

    try {
      const created = await db.createChannel(env.DB, {
        handle: safeHandle,
        label: body.label.trim(),
        exam: body.exam.trim()
      });
      return json(created, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create channel";
      return json({ error: message }, { status: 409 });
    }
  }

  const channelIdMatch = pathname.match(/^\/api\/channels\/([^/]+)$/);
  if (channelIdMatch && req.method === "GET") {
    const channel = await db.getChannel(env.DB, channelIdMatch[1]);
    if (!channel) {
      return json({ error: "Channel not found" }, { status: 404 });
    }
    return json(channel);
  }

  const toggleMatch = pathname.match(/^\/api\/channels\/([^/]+)\/toggle$/);
  if (toggleMatch && req.method === "POST") {
    const body = await parseJsonBody<{ enabled: 0 | 1 }>(req);
    if (!body || (body.enabled !== 0 && body.enabled !== 1)) {
      return badRequest("enabled must be 0 or 1");
    }
    await db.setChannelEnabled(env.DB, toggleMatch[1], body.enabled);
    return json({ ok: true });
  }

  const runMatch = pathname.match(/^\/api\/channels\/([^/]+)\/run$/);
  if (runMatch && req.method === "POST") {
    const channel = await db.getChannel(env.DB, runMatch[1]);
    if (!channel) {
      return json({ error: "Channel not found" }, { status: 404 });
    }

    const runId = await db.startRun(env.DB, channel.id, "manual");
    const result = await runScrapeForChannel(env, channel, getConfig(env), "manual");
    await db.finishRun(env.DB, runId, result);

    return json({ runId, ...result });
  }

  const progressMatch = pathname.match(/^\/api\/channels\/([^/]+)\/progress$/);
  if (progressMatch && req.method === "GET") {
    const channel = await db.getChannel(env.DB, progressMatch[1]);
    if (!channel) {
      return json({ error: "Channel not found" }, { status: 404 });
    }

    const monthRows = await db.getMonthStats(env.DB, channel.id);
    const lastRun = await db.getLastRun(env.DB, channel.id);

    const start = new Date("2025-01-01T00:00:00.000Z");
    const now = new Date();
    const months: any[] = [];
    for (let d = new Date(start); d <= now; d.setUTCMonth(d.getUTCMonth() + 1)) {
      const monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      const found = monthRows.find((x) => x.month_key === monthKey);
      let coveragePct = 0;
      if (found?.backfill_done === 1) {
        coveragePct = 100;
      } else if (monthKey === `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`) {
        const daysElapsed = now.getUTCDate();
        const daysSet = new Set<string>();
        const rows = await env.DB
          .prepare("SELECT substr(posted_at, 1, 10) as day FROM posts WHERE channel_id = ? AND month_key = ?")
          .bind(channel.id, monthKey)
          .all<{ day: string }>();
        for (const r of rows.results ?? []) {
          daysSet.add(r.day);
        }
        coveragePct = Math.round((daysSet.size / Math.max(1, daysElapsed)) * 100);
      } else if (found && found.total_posts > 0) {
        coveragePct = 60;
      }

      months.push({
        channelId: channel.id,
        monthKey,
        totalPosts: found?.total_posts ?? 0,
        textPosts: found?.text_posts ?? 0,
        images: found?.images ?? 0,
        files: found?.files ?? 0,
        minPostedAt: found?.min_posted_at ?? null,
        maxPostedAt: found?.max_posted_at ?? null,
        backfillDone: found?.backfill_done ?? 0,
        coveragePct
      });
    }

    return json({
      channel,
      months,
      lastRun: {
        startedAt: lastRun?.started_at ?? null,
        finishedAt: lastRun?.finished_at ?? null,
        mode: lastRun?.mode ?? null,
        error: lastRun?.error ?? null
      }
    });
  }

  return null;
}
