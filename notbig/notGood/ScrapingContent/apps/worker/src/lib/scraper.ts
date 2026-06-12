import { sha256Hex } from "./hash";
import { monthKey, nowIso, randomInt, sleep } from "./util";
import type { Config, Env } from "../types";
import * as db from "./db";
import type { Channel } from "@tg-scraper/shared";

interface ParsedPost {
  messageId: number;
  postedAt: string;
  text: string;
  imageUrls: string[];
  fileUrls: string[];
}

interface RunStats {
  pagesFetched: number;
  postsAdded: number;
  imagesAdded: number;
  filesAdded: number;
  newestMessageId: number | null;
  oldestMessageId: number | null;
  reachedStartDate: boolean;
}

const TELEGRAM_ORIGIN = "https://t.me";
const TARGET_START_DATE = "2025-01-01T00:00:00.000Z";

function normalizeUrl(input: string): string {
  if (input.startsWith("http://") || input.startsWith("https://")) {
    return input;
  }
  if (input.startsWith("//")) {
    return `https:${input}`;
  }
  return `${TELEGRAM_ORIGIN}${input}`;
}

function extractRegex(text: string, regex: RegExp): string[] {
  const result: string[] = [];
  for (const match of text.matchAll(regex)) {
    if (match[1]) {
      result.push(match[1]);
    }
  }
  return result;
}

function decodeHtml(html: string): string {
  return html
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function stripTags(html: string): string {
  return decodeHtml(html.replace(/<br\s*\/?/gi, "\n").replace(/<[^>]*>/g, "").trim());
}

function parsePostsFromHtml(html: string): ParsedPost[] {
  const blocks = html.match(/<div class="tgme_widget_message_wrap[\s\S]*?<\/div>\s*<\/div>/g) ?? [];
  const parsed: ParsedPost[] = [];

  for (const block of blocks) {
    const idMatch = block.match(/data-post="[^"]+\/(\d+)"/);
    const timeMatch = block.match(/<time[^>]+datetime="([^"]+)"/);
    if (!idMatch || !timeMatch) {
      continue;
    }

    const messageId = Number.parseInt(idMatch[1], 10);
    if (!Number.isFinite(messageId)) {
      continue;
    }

    const textMatch = block.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/);
    const text = textMatch ? stripTags(textMatch[1]) : "";

    const imageUrls = extractRegex(block, /background-image:url\('([^']+)'\)/g).map(normalizeUrl);
    const fileUrls = extractRegex(block, /href="([^"]+\.pdf[^"]*)"/gi).map(normalizeUrl);

    parsed.push({
      messageId,
      postedAt: new Date(timeMatch[1]).toISOString(),
      text,
      imageUrls,
      fileUrls
    });
  }

  parsed.sort((a, b) => b.messageId - a.messageId);
  return parsed;
}

function getRunMode(channel: Channel): "backfill" | "incremental" {
  return channel.backfillCursorMsgId ? "incremental" : "backfill";
}

function nextPageUrl(handle: string, before?: number): string {
  const base = `${TELEGRAM_ORIGIN}/s/${handle}`;
  return before ? `${base}?before=${before}` : base;
}

async function fetchTelegramPage(handle: string, before: number | undefined): Promise<Response> {
  return fetch(nextPageUrl(handle, before), {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      accept: "text/html,application/xhtml+xml"
    }
  });
}

async function putMediaToR2(env: Env, key: string, sourceUrl: string): Promise<{ contentType: string | null; sizeBytes: number | null } | null> {
  const response = await fetch(sourceUrl, {
    headers: {
      "user-agent": "Mozilla/5.0"
    }
  });
  if (!response.ok || !response.body) {
    return null;
  }

  const contentType = response.headers.get("content-type");
  const contentLength = response.headers.get("content-length");
  await env.BUCKET.put(key, response.body, {
    httpMetadata: {
      contentType: contentType ?? undefined
    }
  });

  return {
    contentType,
    sizeBytes: contentLength ? Number.parseInt(contentLength, 10) : null
  };
}

function toTextPreview(text: string): string {
  const clean = text.trim();
  return clean.length > 220 ? `${clean.slice(0, 217)}...` : clean;
}

async function processPost(
  env: Env,
  channel: Channel,
  post: ParsedPost,
  cfg: Config,
  counters: { imageDownloads: number; fileDownloads: number }
): Promise<{ inserted: boolean; imagesAdded: number; filesAdded: number }> {
  const textHashInput = `${post.text}::${post.imageUrls.join(",")}::${post.fileUrls.join(",")}`;
  const contentHash = await sha256Hex(textHashInput);
  const postMonth = monthKey(post.postedAt);

  let textR2Key: string | null = null;
  if (post.text.length > 280) {
    textR2Key = `text/${channel.handle}/${postMonth}/${post.messageId}.txt`;
    await env.BUCKET.put(textR2Key, post.text, {
      httpMetadata: { contentType: "text/plain; charset=utf-8" }
    });
  }

  const upsert = await db.upsertPost(env.DB, {
    channelId: channel.id,
    messageId: post.messageId,
    postedAt: post.postedAt,
    monthKey: postMonth,
    textPreview: toTextPreview(post.text),
    textR2Key,
    hasText: post.text.trim() ? 1 : 0,
    imageCount: post.imageUrls.length,
    fileCount: post.fileUrls.length,
    contentHash,
    rawJsonR2Key: null
  });

  let imagesAdded = 0;
  let filesAdded = 0;

  for (const imageUrl of post.imageUrls) {
    const existing = await db.findMediaBySource(env.DB, upsert.id, imageUrl);
    if (existing) {
      continue;
    }

    const hash = await sha256Hex(imageUrl);
    const key = `img/${channel.handle}/${postMonth}/${post.messageId}/${hash}.bin`;

    if (counters.imageDownloads < cfg.maxImageDownloads) {
      const uploaded = await putMediaToR2(env, key, imageUrl);
      if (!uploaded) {
        continue;
      }
      counters.imageDownloads += 1;
      imagesAdded += 1;
      await db.insertMedia(env.DB, {
        postId: upsert.id,
        kind: "image",
        sourceUrl: imageUrl,
        r2Key: key,
        contentType: uploaded.contentType,
        sizeBytes: uploaded.sizeBytes,
        expiresAt: null
      });
    }
  }

  for (const fileUrl of post.fileUrls) {
    const existing = await db.findMediaBySource(env.DB, upsert.id, fileUrl);
    if (existing) {
      continue;
    }

    const filename = fileUrl.split("/").pop()?.split("?")[0] ?? `${post.messageId}.pdf`;
    const key = `file/${channel.handle}/${postMonth}/${post.messageId}/${filename}`;

    if (counters.fileDownloads < cfg.maxFileDownloads) {
      const uploaded = await putMediaToR2(env, key, fileUrl);
      if (!uploaded) {
        continue;
      }
      counters.fileDownloads += 1;
      filesAdded += 1;
      const expiresAt = new Date(Date.now() + cfg.fileTtlDays * 24 * 60 * 60 * 1000).toISOString();
      await db.insertMedia(env.DB, {
        postId: upsert.id,
        kind: "file",
        sourceUrl: fileUrl,
        r2Key: key,
        contentType: uploaded.contentType,
        sizeBytes: uploaded.sizeBytes,
        expiresAt
      });
    }
  }

  await db.recalcMonthStats(env.DB, channel.id, postMonth);
  return { inserted: upsert.inserted, imagesAdded, filesAdded };
}

export async function runScrapeForChannel(
  env: Env,
  channel: Channel,
  cfg: Config,
  mode: "manual" | "backfill" | "incremental"
): Promise<{ pagesFetched: number; postsAdded: number; imagesAdded: number; filesAdded: number; error: string | null }> {
  const stats: RunStats = {
    pagesFetched: 0,
    postsAdded: 0,
    imagesAdded: 0,
    filesAdded: 0,
    newestMessageId: null,
    oldestMessageId: null,
    reachedStartDate: false
  };

  const counters = { imageDownloads: 0, fileDownloads: 0 };
  const actualMode = mode === "manual" ? getRunMode(channel) : mode;

  try {
    let before: number | undefined = actualMode === "backfill" ? channel.backfillCursorMsgId ?? undefined : undefined;

    for (let page = 0; page < cfg.maxPagesPerRun; page += 1) {
      const response = await fetchTelegramPage(channel.handle, before);
      if (response.status === 429 || response.status === 403 || response.status >= 500) {
        throw new Error(`Telegram temporary blocked request with status ${response.status}`);
      }
      if (!response.ok) {
        throw new Error(`Telegram page fetch failed with status ${response.status}`);
      }

      const html = await response.text();
      const posts = parsePostsFromHtml(html);
      if (posts.length === 0) {
        break;
      }

      stats.pagesFetched += 1;
      for (const post of posts) {
        if (!stats.newestMessageId || post.messageId > stats.newestMessageId) {
          stats.newestMessageId = post.messageId;
        }
        if (!stats.oldestMessageId || post.messageId < stats.oldestMessageId) {
          stats.oldestMessageId = post.messageId;
        }

        if (actualMode === "incremental" && channel.latestCursorMsgId && post.messageId <= channel.latestCursorMsgId) {
          continue;
        }

        if (post.postedAt <= TARGET_START_DATE) {
          stats.reachedStartDate = true;
        }

        const result = await processPost(env, channel, post, cfg, counters);
        if (result.inserted) {
          stats.postsAdded += 1;
        }
        stats.imagesAdded += result.imagesAdded;
        stats.filesAdded += result.filesAdded;
      }

      before = posts[posts.length - 1]?.messageId;
      await sleep(randomInt(cfg.requestDelayMinMs, cfg.requestDelayMaxMs));

      if (actualMode === "incremental") {
        break;
      }
      if (stats.reachedStartDate) {
        break;
      }
    }

    const updatePayload: { lastError: string | null; latestCursorMsgId?: number | null; backfillCursorMsgId?: number | null } = {
      lastError: null
    };

    if (stats.newestMessageId) {
      updatePayload.latestCursorMsgId = Math.max(channel.latestCursorMsgId ?? 0, stats.newestMessageId);
    }

    if (actualMode === "backfill" && stats.oldestMessageId) {
      updatePayload.backfillCursorMsgId = stats.oldestMessageId;
      if (stats.reachedStartDate) {
        const currentMonth = monthKey(nowIso());
        await db.markBackfillDone(env.DB, channel.id, currentMonth);
      }
    }

    await db.updateChannelRunStatus(env.DB, channel.id, updatePayload);

    return {
      pagesFetched: stats.pagesFetched,
      postsAdded: stats.postsAdded,
      imagesAdded: stats.imagesAdded,
      filesAdded: stats.filesAdded,
      error: null
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown scrape error";
    await db.updateChannelRunStatus(env.DB, channel.id, { lastError: message });
    return {
      pagesFetched: stats.pagesFetched,
      postsAdded: stats.postsAdded,
      imagesAdded: stats.imagesAdded,
      filesAdded: stats.filesAdded,
      error: message
    };
  }
}
