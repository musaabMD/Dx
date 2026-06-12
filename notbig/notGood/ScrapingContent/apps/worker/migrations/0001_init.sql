CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  exam TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  start_date TEXT NOT NULL DEFAULT '2025-01-01',
  backfill_cursor_msg_id INTEGER NULL,
  latest_cursor_msg_id INTEGER NULL,
  last_run_at TEXT NULL,
  last_error TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  message_id INTEGER NOT NULL,
  posted_at TEXT NOT NULL,
  month_key TEXT NOT NULL,
  text_preview TEXT NOT NULL,
  text_r2_key TEXT NULL,
  has_text INTEGER NOT NULL DEFAULT 0,
  image_count INTEGER NOT NULL DEFAULT 0,
  file_count INTEGER NOT NULL DEFAULT 0,
  content_hash TEXT NOT NULL,
  raw_json_r2_key TEXT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(channel_id, message_id)
);

CREATE INDEX IF NOT EXISTS idx_posts_channel_month ON posts(channel_id, month_key);
CREATE INDEX IF NOT EXISTS idx_posts_channel_posted ON posts(channel_id, posted_at);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  source_url TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  content_type TEXT NULL,
  size_bytes INTEGER NULL,
  expires_at TEXT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_post_id ON media(post_id);
CREATE INDEX IF NOT EXISTS idx_media_expires_at ON media(expires_at);

CREATE TABLE IF NOT EXISTS scrape_runs (
  id TEXT PRIMARY KEY,
  channel_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT NULL,
  pages_fetched INTEGER NOT NULL DEFAULT 0,
  posts_added INTEGER NOT NULL DEFAULT 0,
  images_added INTEGER NOT NULL DEFAULT 0,
  files_added INTEGER NOT NULL DEFAULT 0,
  error TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_scrape_runs_channel_started ON scrape_runs(channel_id, started_at DESC);

CREATE TABLE IF NOT EXISTS month_stats (
  channel_id TEXT NOT NULL,
  month_key TEXT NOT NULL,
  total_posts INTEGER NOT NULL DEFAULT 0,
  text_posts INTEGER NOT NULL DEFAULT 0,
  images INTEGER NOT NULL DEFAULT 0,
  files INTEGER NOT NULL DEFAULT 0,
  min_posted_at TEXT NULL,
  max_posted_at TEXT NULL,
  backfill_done INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(channel_id, month_key)
);
