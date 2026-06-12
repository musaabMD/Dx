"use client";

import { useState } from "react";
import {
  BookOpen,
  Building2,
  FileText,
  Heart,
  LayoutGrid,
  List,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

const CARD_COLORS = [
  {
    bg: "bg-rose-50",
    icon: "border-rose-200 bg-white text-rose-600",
    border: "border-rose-100 hover:border-rose-300",
  },
  {
    bg: "bg-emerald-50",
    icon: "border-emerald-200 bg-white text-emerald-700",
    border: "border-emerald-100 hover:border-emerald-300",
  },
  {
    bg: "bg-amber-50",
    icon: "border-amber-200 bg-white text-amber-700",
    border: "border-amber-100 hover:border-amber-300",
  },
  {
    bg: "bg-sky-50",
    icon: "border-sky-200 bg-white text-sky-700",
    border: "border-sky-100 hover:border-sky-300",
  },
  {
    bg: "bg-fuchsia-50",
    icon: "border-fuchsia-200 bg-white text-fuchsia-700",
    border: "border-fuchsia-100 hover:border-fuchsia-300",
  },
  {
    bg: "bg-slate-50",
    icon: "border-slate-200 bg-white text-slate-700",
    border: "border-slate-200 hover:border-slate-300",
  },
];

const notebooks = [
  { id: 1, title: "Obstetrics and Gynecology SMLE", date: "May 9, 2026", sources: 1, icon: FileText },
  { id: 2, title: "Untitled notebook", date: "May 9, 2026", sources: 0, icon: FileText },
  { id: 3, title: "2021 ESC Guidelines for Heart Failure", date: "Mar 7, 2026", sources: 8, icon: Heart },
  { id: 4, title: "The Platform Delusion", date: "May 2, 2025", sources: 1, icon: BookOpen },
  { id: 5, title: "Syndromic Surveillance Hospital", date: "May 4, 2026", sources: 1, icon: Building2 },
  { id: 6, title: "Untitled notebook", date: "May 9, 2026", sources: 0, icon: FileText },
  { id: 7, title: "Untitled notebook", date: "May 9, 2026", sources: 0, icon: FileText },
  { id: 8, title: "OSCE Mastery: Clinical Case Studies", date: "Nov 21, 2025", sources: 1, icon: Stethoscope },
  { id: 9, title: "SMLE Clinical Case Reviews by Alhomrani", date: "Apr 3, 2026", sources: 1, icon: Stethoscope },
  { id: 10, title: "Untitled notebook", date: "Apr 3, 2026", sources: 0, icon: FileText },
  { id: 11, title: "Untitled notebook", date: "Dec 21, 2025", sources: 0, icon: FileText },
];

const tabs = ["All", "Library", "Featured"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Library");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = notebooks.filter((notebook) => notebook.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <main className="flex min-h-screen flex-col items-center bg-white px-4 pb-10 pt-14 font-sans">
      <div className="mb-8 flex w-full max-w-xl flex-col items-center">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">
          <BookOpen size={18} strokeWidth={2} />
        </div>
        <h1 className="mb-7 text-3xl font-semibold tracking-tight text-gray-800">Your library</h1>

        <div className="relative mb-6 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notebooks..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 transition-all focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex w-full max-w-5xl items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-gray-400">{filtered.length + 1} library items</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                viewMode === "grid" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"
              }`}
              type="button"
              aria-label="Grid view"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
                viewMode === "list" ? "bg-gray-100 text-gray-700" : "text-gray-400 hover:text-gray-600"
              }`}
              type="button"
              aria-label="List view"
            >
              <List size={13} />
            </button>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition-colors hover:bg-gray-50" type="button">
            <SlidersHorizontal size={12} />
            Most recent
          </button>
          <Link href="/dashboard/new" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700">
            <Plus size={13} />
            Add source
          </Link>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <div className={viewMode === "grid" ? "grid gap-2.5" : "flex flex-col gap-2"} style={viewMode === "grid" ? { gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))" } : {}}>
          {viewMode === "grid" ? (
            <button className="group flex h-[108px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50/40" type="button">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-400 transition-colors group-hover:border-indigo-400 group-hover:text-indigo-500">
                <Plus size={14} />
              </div>
              <span className="text-xs font-medium text-gray-400 transition-colors group-hover:text-indigo-500">New</span>
            </button>
          ) : (
            <button className="flex w-full items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-3 transition-all hover:border-indigo-300 hover:bg-indigo-50/40" type="button">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-gray-400">
                <Plus size={14} />
              </div>
              <span className="text-sm font-medium text-gray-400">New</span>
            </button>
          )}

          {filtered.map((notebook, index) => {
            const Icon = notebook.icon;
            const color = CARD_COLORS[index % CARD_COLORS.length];

            return viewMode === "grid" ? (
              <div key={notebook.id} className={`group relative flex h-[108px] cursor-pointer flex-col justify-between rounded-xl border p-3.5 transition-all ${color.bg} ${color.border}`}>
                <div className="flex items-start justify-between">
                  <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${color.icon}`}>
                    <Icon size={14} strokeWidth={1.8} />
                  </div>
                  <button className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 opacity-0 transition-all hover:bg-white/60 group-hover:opacity-100" type="button" aria-label="More options">
                    <MoreVertical size={12} />
                  </button>
                </div>
                <div>
                  <p className="mb-1 line-clamp-2 text-xs font-medium leading-snug text-gray-800">{notebook.title}</p>
                  <p className="text-[10px] text-gray-500">
                    {notebook.date} · {notebook.sources} {notebook.sources === 1 ? "source" : "sources"}
                  </p>
                </div>
              </div>
            ) : (
              <div key={notebook.id} className={`group flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all ${color.bg} ${color.border}`}>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${color.icon}`}>
                  <Icon size={15} strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-800">{notebook.title}</p>
                  <p className="text-xs text-gray-500">
                    {notebook.date} · {notebook.sources} {notebook.sources === 1 ? "source" : "sources"}
                  </p>
                </div>
                <button className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 opacity-0 transition-all hover:bg-white/60 group-hover:opacity-100" type="button" aria-label="More options">
                  <MoreVertical size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
