import type { Env } from "../types";

export function isAdminAuthorized(req: Request, env: Env): boolean {
  const key = req.headers.get("x-admin-key");
  return Boolean(key && env.ADMIN_KEY && key === env.ADMIN_KEY);
}
