import type { Channel, MediaRecord, PostRecord } from "@tg-scraper/shared";
import { monthKey, nowIso, uuid } from "./util";

interface ChannelRow {
  id: string;
  handle: string;
  label: string;
  exam: string;
  enabled: number;
  start_date: string;
  backfill_cursor_msg_id: number | null;
  latest_cursor_msg_id: number | null;
  last_run_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

function mapChannel(row: ChannelRow): Channel {
  return {
    id: row.id,
    handle: row.handle,
    label: row.label,
    exam: row.exam,
    enabled: row.enabled,
    startDate: row.start_date,
    backfillCursorMsgId: row.backfill_cursor_msg_id,
    latestCursorMsgId: row.latest_cursor_msg_id,
    lastRunAt: row.last_run_at,
    lastError: row.last_error,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function listChannels(db: D1Database): Promise<Channel[]> {
  const rows = await db.prepare("SELECT * FROM channels ORDER BY created_at DESC").all<ChannelRow>();
  return (rows.results ?? []).map(mapChannel);
}

export async function getChannel(db: D1Database, id: string): Promise<Channel | null> {
  const row = await db.prepare("SELECT * FROM channels WHERE id = ?").bind(id).first<ChannelRow>();
  return row ? mapChannel(row) : null;
}

export async function createChannel(
  db: D1Database,
  input: { handle: string; label: string; exam: string }
): Promise<Channel> {
  const now = nowIso();
  const id = uuid();
  await db
    .prepare(
      `INSERT INTO channels (
        id, handle, label, exam, enabled, start_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, 1, '2025-01-01', ?, ?)`
    )
    .bind(id, input.handle.toLowerCase(), input.label, input.exam, now, now)
    .run();

  const channel = await getChannel(db, id);
  if (!channel) {
    throw new Error("Failed to create channel");
  }
  return channel;
}

export async function setChannelEnabled(db: D1Database, id: string, enabled: number): Promise<void> {
  await db
    .prepare("UPDATE channels SET enabled = ?, updated_at = ? WHERE id = ?")
    .bind(enabled ? 1 : 0, nowIso(), id)
    .run();
}

export async function startRun(db: D1Database, channelId: string, mode: string): Promise<string> {
  const id = uuid();
  await db
    .prepare("INSERT INTO scrape_runs (id, channel_id, mode, started_at) VALUES (?, ?, ?, ?)")
    .bind(id, channelId, mode, nowIso())
    .run();
  return id;
}

export async function finishRun(
  db: D1Database,
  runId: string,
  data: { pagesFetched: number; postsAdded: number; imagesAdded: number; filesAdded: number; error: string | null }
): Promise<void> {
  await db
    .prepare(
      `UPDATE scrape_runs
       SET finished_at = ?, pages_fetched = ?, posts_added = ?, images_added = ?, files_added = ?, error = ?
       WHERE id = ?`
    )
    .bind(nowIso(), data.pagesFetched, data.postsAdded, data.imagesAdded, data.filesAdded, data.error, runId)
    .run();
}

export async function updateChannelRunStatus(
  db: D1Database,
  channelId: string,
  data: { lastError: string | null; latestCursorMsgId?: number | null; backfillCursorMsgId?: number | null }
): Promise<void> {
  await db
    .prepare(
      `UPDATE channels
       SET last_run_at = ?,
           last_error = ?,
           latest_cursor_msg_id = COALESCE(?, latest_cursor_msg_id),
           backfill_cursor_msg_id = COALESCE(?, backfill_cursor_msg_id),
           updated_at = ?
       WHERE id = ?`
    )
    .bind(
      nowIso(),
      data.lastError,
      data.latestCursorMsgId ?? null,
      data.backfillCursorMsgId ?? null,
      nowIso(),
      channelId
    )
    .run();
}

export async function upsertPost(
  db: D1Database,
  input: Omit<PostRecord, "id" | "createdAt" | "updatedAt">
): Promise<{ id: string; inserted: boolean }> {
  const existing = await db
    .prepare("SELECT id FROM posts WHERE channel_id = ? AND message_id = ?")
    .bind(input.channelId, input.messageId)
    .first<{ id: string }>();

  const now = nowIso();
  if (existing) {
    await db
      .prepare(
        `UPDATE posts
         SET posted_at = ?, month_key = ?, text_preview = ?, text_r2_key = ?, has_text = ?, image_count = ?, file_count = ?,
             content_hash = ?, raw_json_r2_key = ?, updated_at = ?
         WHERE id = ?`
      )
      .bind(
        input.postedAt,
        input.monthKey,
        input.textPreview,
        input.textR2Key,
        input.hasText,
        input.imageCount,
        input.fileCount,
        input.contentHash,
        input.rawJsonR2Key,
        now,
        existing.id
      )
      .run();
    return { id: existing.id, inserted: false };
  }

  const id = uuid();
  await db
    .prepare(
      `INSERT INTO posts (
        id, channel_id, message_id, posted_at, month_key, text_preview, text_r2_key,
        has_text, image_count, file_count, content_hash, raw_json_r2_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.channelId,
      input.messageId,
      input.postedAt,
      input.monthKey,
      input.textPreview,
      input.textR2Key,
      input.hasText,
      input.imageCount,
      input.fileCount,
      input.contentHash,
      input.rawJsonR2Key,
      now,
      now
    )
    .run();

  return { id, inserted: true };
}

export async function findMediaBySource(db: D1Database, postId: string, sourceUrl: string): Promise<string | null> {
  const row = await db
    .prepare("SELECT id FROM media WHERE post_id = ? AND source_url = ?")
    .bind(postId, sourceUrl)
    .first<{ id: string }>();
  return row?.id ?? null;
}

export async function insertMedia(db: D1Database, media: Omit<MediaRecord, "id" | "createdAt">): Promise<void> {
  await db
    .prepare(
      `INSERT INTO media (
        id, post_id, kind, source_url, r2_key, content_type, size_bytes, expires_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(uuid(), media.postId, media.kind, media.sourceUrl, media.r2Key, media.contentType, media.sizeBytes, media.expiresAt, nowIso())
    .run();
}

export async function recalcMonthStats(db: D1Database, channelId: string, month: string): Promise<void> {
  const row = await db
    .prepare(
      `SELECT
          COUNT(*) AS total_posts,
          SUM(CASE WHEN has_text = 1 THEN 1 ELSE 0 END) AS text_posts,
          SUM(image_count) AS images,
          SUM(file_count) AS files,
          MIN(posted_at) AS min_posted_at,
          MAX(posted_at) AS max_posted_at
       FROM posts
       WHERE channel_id = ? AND month_key = ?`
    )
    .bind(channelId, month)
    .first<{
      total_posts: number;
      text_posts: number | null;
      images: number | null;
      files: number | null;
      min_posted_at: string | null;
      max_posted_at: string | null;
    }>();

  await db
    .prepare(
      `INSERT INTO month_stats (
         channel_id, month_key, total_posts, text_posts, images, files, min_posted_at, max_posted_at, backfill_done
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
       ON CONFLICT(channel_id, month_key) DO UPDATE SET
         total_posts = excluded.total_posts,
         text_posts = excluded.text_posts,
         images = excluded.images,
         files = excluded.files,
         min_posted_at = excluded.min_posted_at,
         max_posted_at = excluded.max_posted_at`
    )
    .bind(
      channelId,
      month,
      row?.total_posts ?? 0,
      row?.text_posts ?? 0,
      row?.images ?? 0,
      row?.files ?? 0,
      row?.min_posted_at ?? null,
      row?.max_posted_at ?? null
    )
    .run();
}

export async function markBackfillDone(db: D1Database, channelId: string, month: string): Promise<void> {
  await db
    .prepare(
      `UPDATE month_stats
       SET backfill_done = 1
       WHERE channel_id = ? AND month_key = ?`
    )
    .bind(channelId, month)
    .run();
}

export async function getMonthStats(db: D1Database, channelId: string): Promise<any[]> {
  const rows = await db
    .prepare("SELECT * FROM month_stats WHERE channel_id = ? ORDER BY month_key ASC")
    .bind(channelId)
    .all<any>();
  return rows.results ?? [];
}

export async function getLastRun(db: D1Database, channelId: string): Promise<any | null> {
  const row = await db
    .prepare("SELECT started_at, finished_at, mode, error FROM scrape_runs WHERE channel_id = ? ORDER BY started_at DESC LIMIT 1")
    .bind(channelId)
    .first<any>();
  return row ?? null;
}

export async function listPosts(
  db: D1Database,
  input: { channelId: string; month: string; cursor: string | null; limit?: number }
): Promise<{ items: PostRecord[]; nextCursor: string | null }> {
  const limit = input.limit ?? 20;
  const cursorPostedAt = input.cursor ?? "9999-12-31T23:59:59.000Z";

  const rows = await db
    .prepare(
      `SELECT * FROM posts
       WHERE channel_id = ? AND month_key = ? AND posted_at < ?
       ORDER BY posted_at DESC
       LIMIT ?`
    )
    .bind(input.channelId, input.month, cursorPostedAt, limit + 1)
    .all<any>();

  const results = (rows.results ?? []) as any[];
  const items = results.slice(0, limit).map((r) => ({
    id: r.id,
    channelId: r.channel_id,
    messageId: r.message_id,
    postedAt: r.posted_at,
    monthKey: r.month_key,
    textPreview: r.text_preview,
    textR2Key: r.text_r2_key,
    hasText: r.has_text,
    imageCount: r.image_count,
    fileCount: r.file_count,
    contentHash: r.content_hash,
    rawJsonR2Key: r.raw_json_r2_key,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));

  const nextCursor = results.length > limit ? items[items.length - 1]?.postedAt ?? null : null;
  return { items, nextCursor };
}

export async function getPostWithMedia(db: D1Database, postId: string): Promise<{ post: any; media: any[] } | null> {
  const post = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(postId).first<any>();
  if (!post) {
    return null;
  }
  const media = await db.prepare("SELECT * FROM media WHERE post_id = ? ORDER BY created_at ASC").bind(postId).all<any>();
  return {
    post: {
      id: post.id,
      channelId: post.channel_id,
      messageId: post.message_id,
      postedAt: post.posted_at,
      monthKey: post.month_key,
      textPreview: post.text_preview,
      textR2Key: post.text_r2_key,
      hasText: post.has_text,
      imageCount: post.image_count,
      fileCount: post.file_count,
      contentHash: post.content_hash,
      rawJsonR2Key: post.raw_json_r2_key,
      createdAt: post.created_at,
      updatedAt: post.updated_at
    },
    media: media.results ?? []
  };
}

export async function getMediaById(db: D1Database, id: string): Promise<any | null> {
  return await db.prepare("SELECT * FROM media WHERE id = ?").bind(id).first<any>();
}

export async function listExpiredMedia(db: D1Database, now: string, limit = 100): Promise<any[]> {
  const rows = await db
    .prepare("SELECT * FROM media WHERE expires_at IS NOT NULL AND expires_at < ? LIMIT ?")
    .bind(now, limit)
    .all<any>();
  return rows.results ?? [];
}

export async function deleteMedia(db: D1Database, id: string): Promise<unknown> {
  return await db.prepare("DELETE FROM media WHERE id = ?").bind(id).run();
}

export function computeMonthFromDate(isoDate: string): string {
  return monthKey(isoDate);
}
