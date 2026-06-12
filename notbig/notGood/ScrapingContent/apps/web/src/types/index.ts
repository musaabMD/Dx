import type { Channel, ChannelProgressResponse, PaginatedPostsResponse } from "@tg-scraper/shared";

export type { Channel, ChannelProgressResponse, PaginatedPostsResponse };

export interface ListChannelsResponse {
  items: Channel[];
}
