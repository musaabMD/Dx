// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { NextResponse } from "next/server";
// import config from "@/config";

// export const dynamic = "force-dynamic";

// // This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
// export async function GET(req) {
//   const requestUrl = new URL(req.url);
//   const code = requestUrl.searchParams.get("code");

//   if (code) {
//     const supabase = createRouteHandlerClient({ cookies });
//     await supabase.auth.exchangeCodeForSession(code);
//   }

//   // URL to redirect to after sign in process completes
//   return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
// }// app/api/auth/callback/route.js
// app/api/auth/callback/route.js

// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { NextResponse } from "next/server";
// import config from "@/config";

// export const dynamic = "force-dynamic";

// // This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
// export async function GET(req) {
//   const requestUrl = new URL(req.url);
//   const code = requestUrl.searchParams.get("code");

//   if (code) {
//     const supabase = createRouteHandlerClient({ cookies });
//     await supabase.auth.exchangeCodeForSession(code);
//   }

//   // URL to redirect to after sign in process completes
//   return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
// }
// app/api/auth/callback/route.js

// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { NextResponse } from "next/server";
// import config from "@/config";

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   const requestUrl = new URL(req.url);
//   const code = requestUrl.searchParams.get("code");

//   if (code) {
//     const supabase = createRouteHandlerClient({ cookies });
//     await supabase.auth.exchangeCodeForSession(code);
//   }

//   return NextResponse.redirect(config.auth.callbackUrl);
// }
// app/api/auth/callback/route.js
// app/api/auth/callback/route.js

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import config from "@/config";

export const dynamic = "force-dynamic";

// This route is called after a successful login. It exchanges the code for a session and redirects to the callback URL (see config.js).
export async function GET(req) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin + config.auth.callbackUrl);
}
