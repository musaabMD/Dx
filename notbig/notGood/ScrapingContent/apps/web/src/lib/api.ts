import type { ChannelProgressResponse, ListChannelsResponse, PaginatedPostsResponse } from "../types";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const base =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_APP_ORIGIN ?? "http://localhost:3000"
      : "";

  const response = await fetch(`${base}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export const api = {
  listChannels: () => apiFetch<ListChannelsResponse>("/api/channels"),
  createChannel: (body: { handle: string; label: string; exam: string }) =>
    apiFetch("/api/channels", { method: "POST", body: JSON.stringify(body) }),
  toggleChannel: (id: string, enabled: number) =>
    apiFetch(`/api/channels/${id}/toggle`, { method: "POST", body: JSON.stringify({ enabled }) }),
  runChannel: (id: string) => apiFetch(`/api/channels/${id}/run`, { method: "POST" }),
  channelProgress: (id: string) => apiFetch<ChannelProgressResponse>(`/api/channels/${id}/progress`),
  listPosts: (channelId: string, month: string, cursor?: string) =>
    apiFetch<PaginatedPostsResponse>(
      `/api/posts?channelId=${encodeURIComponent(channelId)}&month=${encodeURIComponent(month)}${
        cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""
      }`
    ),
  getPost: (id: string) => apiFetch(`/api/posts/${id}`)
};
