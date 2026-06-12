import { cookies } from "next/headers";

export const AUTH_COOKIE = "linkbase_session";

export function authEnabled() {
  return Boolean(process.env.LINKBASE_PASSWORD);
}

export function sessionToken() {
  const password = process.env.LINKBASE_PASSWORD || "dev";
  return Buffer.from(`linkbase:${password}`).toString("base64url");
}

export function isAuthenticated() {
  if (!authEnabled()) {
    return true;
  }

  return cookies().get(AUTH_COOKIE)?.value === sessionToken();
}
