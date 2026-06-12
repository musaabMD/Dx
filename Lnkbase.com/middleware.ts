import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, sessionToken } from "./lib/auth";

const protectedPrefixes = ["/dashboard", "/agents", "/api/agents"];

export function middleware(request: NextRequest) {
  if (!process.env.LINKBASE_PASSWORD) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  const isPublicRunEndpoint = /^\/api\/agents\/[^/]+\/run$/.test(pathname);
  if (isPublicRunEndpoint) {
    return NextResponse.next();
  }

  if (request.cookies.get(AUTH_COOKIE)?.value === sessionToken()) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/agents/:path*", "/api/agents/:path*"]
};
