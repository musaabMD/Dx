import { authkitProxy } from "@workos-inc/authkit-nextjs";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

const configured = Boolean(
  process.env.WORKOS_CLIENT_ID &&
    process.env.WORKOS_API_KEY &&
    process.env.WORKOS_COOKIE_PASSWORD
);

// Build the real proxy lazily so we don't instantiate the WorkOS client when
// the env vars are missing (e.g. first-time setup before the user fills in
// .env.local). When unconfigured we just pass requests through.
const realProxy = configured ? authkitProxy() : null;

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  if (!realProxy) return NextResponse.next();
  return realProxy(req, event);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|callback|api/exam/.*/stream).*)",
  ],
};
