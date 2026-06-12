"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ExamRow = {
  slug: string;
  name: string;
  shortName: string;
  iconLabel: string;
  category: string;
  description: string;
  accent: string;
  members: number;
  membersLabel: string;
  live: number;
};

function formatMembers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000)
    return (n / 1_000).toFixed(n >= 10_000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function ExamGrid({ initial }: { initial: ExamRow[] }) {
  const [exams, setExams] = useState<ExamRow[]>(initial);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch("/api/exams", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { exams: ExamRow[] };
        if (cancelled) return;
        setExams((prev) =>
          json.exams.map((e) => ({
            ...e,
            membersLabel:
              prev.find((p) => p.slug === e.slug)?.membersLabel ??
              formatMembers(e.members),
          }))
        );
      } catch {
        // ignore network blips
      }
    };
    const id = setInterval(tick, 4500);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    initial.forEach((e) => set.add(e.category));
    return ["All", ...Array.from(set)];
  }, [initial]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exams.filter((e) => {
      const inCat = category === "All" || e.category === category;
      const inQuery =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q);
      return inCat && inQuery;
    });
  }, [exams, query, category]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exams…"
            className="w-full h-10 rounded-xl bg-[var(--input-bg)] border border-[var(--input-border)] text-[var(--input-fg)] pl-10 pr-3 text-sm placeholder:text-[var(--surface-subtle)] focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500/40"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--surface-subtle)]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </div>
      </div>

      <div className="mb-4 -mx-4 overflow-x-auto no-scrollbar px-4">
        <div className="flex gap-2 w-max mx-auto">
          {categories.map((c) => {
            const active = c === category;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={
                  "h-8 px-3 rounded-full text-xs font-medium transition border " +
                  (active
                    ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-fg)] border-[var(--pill-active-bg)]"
                    : "bg-[var(--pill-bg)] text-[var(--pill-fg)] border-[var(--pill-border)] hover:bg-[var(--menu-hover)]")
                }
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/exam/${e.slug}`}
              prefetch={false}
              className={`group relative block aspect-[5/3] rounded-xl overflow-hidden p-4 bg-gradient-to-br ${e.accent} shadow-lg shadow-black/10 dark:shadow-black/30 hover:brightness-110 active:scale-[0.985] transition`}
            >
              <h3 className="relative z-10 font-bold text-white text-base sm:text-lg tracking-tight drop-shadow-sm line-clamp-2 pr-2">
                {e.name}
              </h3>
              <p className="absolute bottom-3 left-4 z-10 inline-flex items-center gap-1.5 text-white/85 text-[11px] sm:text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 live-dot" />
                <span className="tabular-nums">{formatMembers(e.live)}</span>
                <span>online</span>
              </p>
              <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/15 blur-xl" />
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="col-span-full text-center py-10 text-[var(--surface-muted)] text-sm">
            No exams match &ldquo;{query}&rdquo;.
          </li>
        )}
      </ul>
    </div>
  );
}
