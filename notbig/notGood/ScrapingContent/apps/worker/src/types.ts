export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ADMIN_KEY: string;
  MAX_PAGES_PER_RUN?: string;
  MAX_IMAGE_DOWNLOADS?: string;
  MAX_FILE_DOWNLOADS?: string;
  REQUEST_DELAY_MIN_MS?: string;
  REQUEST_DELAY_MAX_MS?: string;
  FILE_TTL_DAYS?: string;
}

export interface Config {
  maxPagesPerRun: number;
  maxImageDownloads: number;
  maxFileDownloads: number;
  requestDelayMinMs: number;
  requestDelayMaxMs: number;
  fileTtlDays: number;
}
