import Link from "next/link";
import { Bot, Check, Database, MessageSquareText, Rocket } from "lucide-react";
import { BrandLink } from "@/components/brand";

const workspaceItems = [
  {
    label: "Playground",
    text: "Test live replies before publishing.",
    icon: Bot,
  },
  {
    label: "Data sources",
    text: "Train from sites, docs, and Q&A.",
    icon: Database,
  },
  {
    label: "Conversations",
    text: "Review chats and capture leads.",
    icon: MessageSquareText,
  },
  {
    label: "Deploy",
    text: "Launch the widget on any site.",
    icon: Rocket,
  },
];

export default function SignInPage() {
  return (
    <main className="grid min-h-screen bg-white text-[#111111] lg:grid-cols-[0.92fr_1.08fr]">
      <section className="flex flex-col px-4 py-8 sm:px-8 lg:px-20">
        <BrandLink />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#6b5cff]">Sign in</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-3 text-[#666671]">Use email and password for this test build.</p>
          <form className="mt-8 space-y-4">
            <label className="block">
              <span className="text-sm font-semibold">Email</span>
              <input type="email" defaultValue="founder@lnkbase.ai" className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#6b5cff]" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Password</span>
              <input type="password" defaultValue="password" className="mt-2 h-12 w-full rounded-xl border border-black/10 px-4 outline-none focus:border-[#6b5cff]" />
            </label>
            <Link href="/dashboard" className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#111111] text-sm font-semibold text-white">
              Sign in
            </Link>
          </form>
          <p className="mt-6 text-sm text-[#686871]">
            No account?{" "}
            <Link href="/auth/sign-up" className="font-semibold text-[#111111] underline underline-offset-4">
              Start a free trial
            </Link>
          </p>
        </div>
      </section>
      <aside className="hidden bg-[#f7f7f4] p-10 lg:block">
        <div className="flex h-full flex-col justify-between overflow-hidden rounded-[32px] border border-white/10 bg-[#111111] p-10 text-white shadow-2xl shadow-black/20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
              <span className="grid size-5 place-items-center rounded-full bg-[#6b5cff]">
                <Check size={13} strokeWidth={3} />
              </span>
              Lnkbase workspace
            </div>
            <h2 className="mt-6 max-w-xl text-5xl font-semibold tracking-tight">
              Test, improve, and launch your agent from one workspace.
            </h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/62">
              Move from training content to live customer conversations without
              switching tools.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ["24", "Chats"],
              ["92%", "Answer rate"],
              ["1.4s", "Avg reply"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-2xl font-semibold">{value}</p>
                <p className="mt-1 text-xs font-medium text-white/55">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3">
            {workspaceItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#111111]">
                  <item.icon size={19} />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-sm text-white/55">{item.text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </main>
  );
}
