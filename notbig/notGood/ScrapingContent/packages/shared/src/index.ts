export type ScrapeMode = "backfill" | "incremental" | "manual";

export interface Channel {
  id: string;
  handle: string;
  label: string;
  exam: string;
  enabled: number;
  startDate: string;
  backfillCursorMsgId: number | null;
  latestCursorMsgId: number | null;
  lastRunAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MonthStat {
  channelId: string;
  monthKey: string;
  totalPosts: number;
  textPosts: number;
  images: number;
  files: number;
  minPostedAt: string | null;
  maxPostedAt: string | null;
  backfillDone: number;
  coveragePct: number;
}

export interface ChannelProgressResponse {
  channel: Channel;
  months: MonthStat[];
  lastRun: {
    startedAt: string | null;
    finishedAt: string | null;
    mode: ScrapeMode | null;
    error: string | null;
  };
}

export interface PostRecord {
  id: string;
  channelId: string;
  messageId: number;
  postedAt: string;
  monthKey: string;
  textPreview: string;
  textR2Key: string | null;
  hasText: number;
  imageCount: number;
  fileCount: number;
  contentHash: string;
  rawJsonR2Key: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaRecord {
  id: string;
  postId: string;
  kind: "image" | "file";
  sourceUrl: string;
  r2Key: string;
  contentType: string | null;
  sizeBytes: number | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface PaginatedPostsResponse {
  items: PostRecord[];
  nextCursor: string | null;
}
