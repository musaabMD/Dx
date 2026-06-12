import type { Config, Env } from "../types";

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getConfig(env: Env): Config {
  return {
    maxPagesPerRun: toInt(env.MAX_PAGES_PER_RUN, 6),
    maxImageDownloads: toInt(env.MAX_IMAGE_DOWNLOADS, 20),
    maxFileDownloads: toInt(env.MAX_FILE_DOWNLOADS, 5),
    requestDelayMinMs: toInt(env.REQUEST_DELAY_MIN_MS, 800),
    requestDelayMaxMs: toInt(env.REQUEST_DELAY_MAX_MS, 1500),
    fileTtlDays: toInt(env.FILE_TTL_DAYS, 14)
  };
}
