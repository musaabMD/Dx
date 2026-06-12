import Link from "next/link";

export default function NotConfigured() {
  return (
    <div className="flex-1 grid place-items-center bg-[var(--surface)] text-[var(--surface-fg)] px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 grid place-items-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="18" height="11" x="3" y="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          Sign-in isn&apos;t configured yet
        </h1>
        <p className="mt-2 text-sm text-[var(--surface-muted)] leading-relaxed">
          ExamChat uses WorkOS AuthKit. Set the WorkOS environment variables in{" "}
          <code className="px-1 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[12px]">
            .env.local
          </code>{" "}
          and restart the dev server. See{" "}
          <code className="px-1 py-0.5 rounded bg-[var(--card-bg)] border border-[var(--card-border)] text-[12px]">
            .env.example
          </code>{" "}
          for the required keys. You can keep chatting as a guest in the meantime.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 px-4 items-center rounded-lg bg-[var(--pill-active-bg)] text-[var(--pill-active-fg)] text-sm font-semibold"
        >
          Back to rooms
        </Link>
      </div>
    </div>
  );
}
