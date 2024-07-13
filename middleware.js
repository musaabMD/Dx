// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import { NextResponse } from "next/server";

// // The middleware is used to refresh the user's session before loading Server Component routes
// export async function middleware(req) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req, res });
//   await supabase.auth.getSession();
//   return res;
// }
// middleware.js
// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import { NextResponse } from "next/server";

// // The middleware is used to refresh the user's session before loading Server Component routes
// export async function middleware(req) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req, res });
//   await supabase.auth.getSession();
//   return res;
// }

// middleware.js
import { createMiddlewareSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient({ req, res });
  await supabase.auth.getSession();
  return res;
}

export const config = {
  matcher: ["/quiz/:path*"], // Apply this middleware to the quiz pages
};

