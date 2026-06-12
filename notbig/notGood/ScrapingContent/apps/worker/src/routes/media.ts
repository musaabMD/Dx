import type { Env } from "../types";
import { json } from "../lib/http";
import * as db from "../lib/db";

export async function handleMedia(req: Request, env: Env, pathname: string): Promise<Response | null> {
  const mediaMatch = pathname.match(/^\/api\/media\/([^/]+)$/);
  if (!mediaMatch || req.method !== "GET") {
    return null;
  }

  const media = await db.getMediaById(env.DB, mediaMatch[1]);
  if (!media) {
    return json({ error: "Media not found" }, { status: 404 });
  }

  const object = await env.BUCKET.get(media.r2_key);
  if (!object) {
    return json({ error: "R2 object missing" }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=300");

  return new Response(object.body, { headers });
}
