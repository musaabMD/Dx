import type { Env } from "../types";
import { badRequest, json } from "../lib/http";
import * as db from "../lib/db";

export async function handlePosts(req: Request, env: Env, url: URL, pathname: string): Promise<Response | null> {
  if (pathname === "/api/posts" && req.method === "GET") {
    const channelId = url.searchParams.get("channelId");
    const month = url.searchParams.get("month");
    const cursor = url.searchParams.get("cursor");

    if (!channelId || !month) {
      return badRequest("channelId and month are required");
    }

    const result = await db.listPosts(env.DB, {
      channelId,
      month,
      cursor
    });

    return json(result);
  }

  const postMatch = pathname.match(/^\/api\/posts\/([^/]+)$/);
  if (postMatch && req.method === "GET") {
    const data = await db.getPostWithMedia(env.DB, postMatch[1]);
    if (!data) {
      return json({ error: "Post not found" }, { status: 404 });
    }
    return json(data);
  }

  return null;
}
