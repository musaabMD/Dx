"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import config from "@/config";
import Header from "@/components/Header";
import { ChevronRight, Home, Mail, ShieldCheck } from "lucide-react";
import {
  createSupabaseBrowserClient,
  hasSupabaseBrowserConfig,
} from "@/lib/supabaseBrowser";

// This is a login/signup page for Supabase Auth.
// Successful login redirects to /api/auth/callback where the Code Exchange is processed (see app/api/auth/callback/route.js).
export default function Login() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSignup = async (e, options) => {
    e?.preventDefault();

    setIsLoading(true);

    try {
      if (!supabase) {
        toast.error("Supabase is not configured for this environment.");
        return;
      }

      const { type, provider } = options;
      const redirectURL = window.location.origin + "/api/auth/callback";

      if (type === "oauth") {
        await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectURL,
          },
        });
      } else if (type === "magic_link") {
        await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectURL,
          },
        });

        toast.success("Check your email!");

        setIsDisabled(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#3C3C3C]">
      <Header />
      <main className="px-4 py-10 md:py-16" data-theme={config.colors.theme}>
        <div className="mx-auto max-w-xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[#E5E5E5] bg-white px-4 py-2 text-sm font-extrabold text-[#777]"
            style={{ boxShadow: "0 3px 0 #E5E5E5" }}
          >
            <Home className="h-4 w-4" strokeWidth={2.5} />
            Home
          </Link>

          <section className="mt-6 rounded-2xl border-2 border-[#E5E5E5] bg-white p-6 md:p-8" style={{ boxShadow: "0 5px 0 #E5E5E5" }}>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#DDF4FE] bg-[#F2FBFF] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#1CB0F6]">
              <ShieldCheck className="h-4 w-4" strokeWidth={2.5} />
              Secure access
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
              Sign in to {config.appName}
            </h1>
            <p className="mt-2 text-sm font-bold leading-6 text-[#777]">
              Continue to your dashboard, self exams, bookmarks, and subscription.
            </p>

        {!hasSupabaseBrowserConfig && (
          <div className="mt-6 rounded-2xl border-2 border-[#FFBABA] bg-[#FFE3E3] p-4 text-sm font-bold text-[#CC3C3C]">
            <span>
              Supabase is not configured for this local environment. Add
              NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to
              .env.local to enable sign in.
            </span>
          </div>
        )}

        <div className="mt-8 space-y-8">
          <button
            className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-[#E5E5E5] bg-white px-5 py-4 text-sm font-extrabold uppercase tracking-wide text-[#3C3C3C] transition hover:border-[#AFAFAF]"
            style={{ boxShadow: "0 4px 0 #E5E5E5" }}
            onClick={(e) =>
              handleSignup(e, { type: "oauth", provider: "google" })
            }
            disabled={isLoading || !hasSupabaseBrowserConfig}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
            )}
            Sign up with Google
          </button>
        </div>

        <div className="my-8 flex items-center gap-3 text-xs font-extrabold uppercase tracking-wide text-[#AFAFAF]">
          <div className="h-0.5 flex-1 bg-[#E5E5E5]" />
          OR
          <div className="h-0.5 flex-1 bg-[#E5E5E5]" />
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => handleSignup(e, { type: "magic_link" })}
        >
          <input
            required
            type="email"
            value={email}
            autoComplete="email"
            placeholder="tom@cruise.com"
            className="w-full rounded-2xl border-2 border-[#E5E5E5] bg-white px-4 py-4 font-bold text-[#3C3C3C] placeholder:text-[#AFAFAF] focus:border-[#58CC02] focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#58CC02] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-[#AFAFAF]"
            style={{ boxShadow: "0 4px 0 #46A302" }}
            disabled={isLoading || isDisabled || !hasSupabaseBrowserConfig}
            type="submit"
          >
            {isLoading && (
              <span className="loading loading-spinner loading-xs"></span>
            )}
            <Mail className="h-4 w-4" strokeWidth={2.5} />
            Send Magic Link
            <ChevronRight className="h-4 w-4" strokeWidth={3} />
          </button>
        </form>
          </section>
        </div>
      </main>
    </div>
  );
}
