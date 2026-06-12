import Link from "next/link";
import { BrandLink } from "@/components/brand";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen bg-white text-[#111111] lg:grid-cols-[0.92fr_1.08fr]">
      <section className="flex flex-col px-4 py-8 sm:px-8 lg:px-20">
        <BrandLink />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6b5cff]">Start free</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-3 text-[#666671]">Email-only auth for the MVP. The next screen creates your first AI agent.</p>
          <form className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">Email</span>
              <input type="email" placeholder="you@company.com" className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#6b5cff]" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Password</span>
              <input type="password" placeholder="Create a password" className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#6b5cff]" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Confirm password</span>
              <input type="password" placeholder="Confirm password" className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#6b5cff]" />
            </label>
            <Link href="/new-agent" className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#111111] text-sm font-semibold text-white">
              Create account
            </Link>
          </form>
          <p className="mt-6 text-sm text-[#686871]">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-semibold text-[#111111] underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </section>
      <aside className="hidden bg-[#2758f6] p-10 text-white lg:block">
        <div className="flex h-full flex-col justify-end rounded-[32px] border border-white/20 bg-white/10 p-10">
          <h2 className="max-w-xl text-5xl font-semibold tracking-tight">Train from your website in minutes.</h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-white/70">Then test the agent in a real playground, configure actions, and deploy the widget.</p>
        </div>
      </aside>
    </main>
  );
}
