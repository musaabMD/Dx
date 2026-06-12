"use client";

import { ArrowLeft, Check, FileUp, Link as LinkIcon, Palette, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const PALETTES = [
  { name: "Mint", bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-800", swatch: "bg-emerald-400" },
  { name: "Rose", bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-800", swatch: "bg-rose-400" },
  { name: "Sky", bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-800", swatch: "bg-sky-400" },
  { name: "Amber", bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", swatch: "bg-amber-400" },
  { name: "Violet", bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-800", swatch: "bg-violet-400" },
  { name: "Slate", bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-800", swatch: "bg-slate-500" },
];

const VIEWS = ["Cards", "List", "Compact", "Board"];

export default function NewLibraryItemPage() {
  const [palette, setPalette] = useState(PALETTES[0].name);
  const [view, setView] = useState(VIEWS[0]);

  return (
    <main className="min-h-screen bg-white px-4 pb-16 pt-12 font-sans text-slate-950">
      <section className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-black text-slate-500 transition hover:text-slate-950">
          <ArrowLeft size={16} />
          Library
        </Link>

        <div className="mb-10 grid gap-3 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-indigo-600">New library item</p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">Add sources</h1>
        </div>

        <div className="grid gap-5">
          <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">1</span>
              <h2 className="text-xl font-black">Choose source type</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="group flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50">
                <FileUp size={26} />
                <span className="text-base font-black">Upload files</span>
                <span className="text-xs font-semibold text-slate-500">PDFs, slides, notes, images</span>
                <input className="hidden" type="file" multiple />
              </label>
              <button className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-3xl border border-slate-200 bg-white p-6 text-center transition hover:border-indigo-300 hover:bg-indigo-50" type="button">
                <LinkIcon size={26} />
                <span className="text-base font-black">Add link</span>
                <span className="text-xs font-semibold text-slate-500">Paste a web page, video, or document URL</span>
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">2</span>
              <h2 className="text-xl font-black">Pick content view</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {VIEWS.map((item) => (
                <button
                  key={item}
                  className={`min-h-20 rounded-2xl border px-4 text-sm font-black transition ${
                    view === item ? "border-indigo-300 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                  onClick={() => setView(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">3</span>
              <h2 className="flex items-center gap-2 text-xl font-black">
                <Palette size={20} />
                Choose palette
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {PALETTES.map((item) => (
                <button
                  key={item.name}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${item.bg} ${item.text} ${
                    palette === item.name ? `${item.border} ring-2 ring-indigo-200` : "border-transparent hover:border-slate-200"
                  }`}
                  onClick={() => setPalette(item.name)}
                  type="button"
                >
                  <span className="flex items-center gap-3 text-sm font-black">
                    <span className={`h-7 w-7 rounded-full ${item.swatch}`} />
                    {item.name}
                  </span>
                  {palette === item.name ? <Check size={17} /> : null}
                </button>
              ))}
            </div>
          </section>

          <div className="sticky bottom-4 flex justify-center">
            <Link href="/dashboard" className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-2xl shadow-slate-950/15 transition hover:bg-slate-800">
              <Plus size={17} />
              Create library item
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
