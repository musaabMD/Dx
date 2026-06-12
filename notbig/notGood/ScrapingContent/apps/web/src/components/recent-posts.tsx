import type { PaginatedPostsResponse } from "../types";

export function RecentPosts({ posts }: { posts: PaginatedPostsResponse }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 text-base font-semibold">Recent posts</h3>
      <div className="space-y-3">
        {posts.items.map((item) => (
          <article key={item.id} className="rounded-lg border border-amber-100 bg-amber-50/30 p-3">
            <p className="mb-1 text-xs text-slate-600">#{item.messageId} • {new Date(item.postedAt).toLocaleString()}</p>
            <p className="text-sm text-slate-800">{item.textPreview || "(No text)"}</p>
            <p className="mt-1 text-xs text-slate-600">Images: {item.imageCount} • Files: {item.fileCount}</p>
          </article>
        ))}
        {posts.items.length === 0 ? <p className="text-sm text-slate-500">No posts yet for this month.</p> : null}
      </div>
    </div>
  );
}
