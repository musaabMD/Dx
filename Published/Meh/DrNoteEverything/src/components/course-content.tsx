"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronDown,
  FileText,
  HelpCircle,
  Play,
  Presentation,
  Search,
  Zap,
} from "lucide-react";

const TYPES = {
  video: { label: "Video", Icon: Play, bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-100" },
  ppt: { label: "Slides", Icon: Presentation, bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-100" },
  qbank: { label: "Q Bank", Icon: HelpCircle, bg: "bg-green-50", text: "text-green-700", border: "border-green-100" },
  flash: { label: "Flashcards", Icon: Zap, bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-100" },
  lib: { label: "Library", Icon: BookOpen, bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-100" },
  pdf: { label: "PDF", Icon: FileText, bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-100" },
} as const;

type ItemType = keyof typeof TYPES;

interface Item {
  id: string;
  title: string;
  type: ItemType;
  dur?: string;
}

interface Section {
  id: number;
  title: string;
  meta: string;
  items: Item[];
}

const SECTIONS: Section[] = [
  {
    id: 1,
    title: "NEW Week 1 - Build Your First LLM Product: Exploring Top Models",
    meta: "36 lectures - 5hr 44min",
    items: [
      { id: "1-1", title: "Introduction to LLMs and the landscape", type: "video", dur: "18min" },
      { id: "1-2", title: "GPT-4, Claude, Gemini - comparative overview", type: "video", dur: "32min" },
      { id: "1-3", title: "Setting up your dev environment", type: "video", dur: "24min" },
      { id: "1-4", title: "Your first API call - hands on", type: "video", dur: "41min" },
      { id: "1-5", title: "Week 1 slides deck", type: "ppt" },
      { id: "1-6", title: "Model evaluation quiz - 50 questions", type: "qbank" },
      { id: "1-7", title: "Key terms flashcard set", type: "flash" },
      { id: "1-8", title: "OpenAI API documentation", type: "lib" },
      { id: "1-9", title: "Prompting best practices guide", type: "pdf" },
      { id: "1-10", title: "Model parameter tuning cheatsheet", type: "pdf" },
    ],
  },
  {
    id: 2,
    title: "NEW Week 2 - Build a Multi-Modal Chatbot: LLMs, Gradio UI, and Agents",
    meta: "24 lectures - 3hr 41min",
    items: [
      { id: "2-1", title: "Gradio UI fundamentals", type: "video", dur: "28min" },
      { id: "2-2", title: "Building a chat interface from scratch", type: "video", dur: "35min" },
      { id: "2-3", title: "Multi-modal inputs - images + text", type: "video", dur: "22min" },
      { id: "2-4", title: "Agent design patterns", type: "video", dur: "40min" },
      { id: "2-5", title: "Week 2 slides deck", type: "ppt" },
      { id: "2-6", title: "Chatbot quiz bank - 40 questions", type: "qbank" },
      { id: "2-7", title: "Agent concepts flashcards", type: "flash" },
      { id: "2-8", title: "Gradio documentation library", type: "lib" },
      { id: "2-9", title: "Multi-modal chatbot reference PDF", type: "pdf" },
    ],
  },
  {
    id: 3,
    title: "NEW Week 3 - Open-Source Gen AI: Automated Solutions with HuggingFace",
    meta: "23 lectures - 3hr 36min",
    items: [
      { id: "3-1", title: "HuggingFace Hub walkthrough", type: "video", dur: "20min" },
      { id: "3-2", title: "Loading and running open-source models", type: "video", dur: "38min" },
      { id: "3-3", title: "Transformers library deep dive", type: "video", dur: "45min" },
      { id: "3-4", title: "Week 3 slides deck", type: "ppt" },
      { id: "3-5", title: "Open-source model quiz - 45 questions", type: "qbank" },
      { id: "3-6", title: "HuggingFace flashcard set", type: "flash" },
      { id: "3-7", title: "Transformers documentation library", type: "lib" },
      { id: "3-8", title: "Model card reading guide", type: "pdf" },
    ],
  },
  {
    id: 4,
    title: "New Week 4 - LLM Showdown: Evaluating Models for Code Gen & Business Tasks",
    meta: "21 lectures - 3hr 9min",
    items: [
      { id: "4-1", title: "Evaluation frameworks overview", type: "video", dur: "30min" },
      { id: "4-2", title: "Code generation benchmarks", type: "video", dur: "42min" },
      { id: "4-3", title: "Week 4 slides deck", type: "ppt" },
      { id: "4-4", title: "Business task evaluation quiz - 35 questions", type: "qbank" },
      { id: "4-5", title: "Evaluation metrics flashcards", type: "flash" },
      { id: "4-6", title: "Benchmark papers library", type: "lib" },
      { id: "4-7", title: "LLM eval cheat sheet PDF", type: "pdf" },
    ],
  },
  {
    id: 5,
    title: "New Week 5 - Mastering RAG: Build Advanced Solutions with Vector Embeddings",
    meta: "32 lectures - 5hr 25min",
    items: [
      { id: "5-1", title: "What is RAG? Core concepts", type: "video", dur: "25min" },
      { id: "5-2", title: "Vector embeddings explained", type: "video", dur: "34min" },
      { id: "5-3", title: "Building a RAG pipeline end-to-end", type: "video", dur: "58min" },
      { id: "5-4", title: "Vector databases comparison", type: "video", dur: "28min" },
      { id: "5-5", title: "Week 5 slides deck", type: "ppt" },
      { id: "5-6", title: "RAG quiz bank - 60 questions", type: "qbank" },
      { id: "5-7", title: "Embeddings flashcards", type: "flash" },
      { id: "5-8", title: "Pinecone + Chroma documentation", type: "lib" },
      { id: "5-9", title: "RAG architecture reference PDF", type: "pdf" },
    ],
  },
  {
    id: 6,
    title: "New Week 6 - From Traditional ML to DL to Fine-tuning a Frontier Model",
    meta: "27 lectures - 4hr 47min",
    items: [
      { id: "6-1", title: "ML to DL transition overview", type: "video", dur: "35min" },
      { id: "6-2", title: "Fine-tuning fundamentals", type: "video", dur: "50min" },
      { id: "6-3", title: "LoRA and QLoRA walkthrough", type: "video", dur: "44min" },
      { id: "6-4", title: "Week 6 slides deck", type: "ppt" },
      { id: "6-5", title: "Fine-tuning quiz - 50 questions", type: "qbank" },
      { id: "6-6", title: "Fine-tuning concepts flashcards", type: "flash" },
      { id: "6-7", title: "PEFT library documentation", type: "lib" },
      { id: "6-8", title: "Fine-tuning checklist PDF", type: "pdf" },
    ],
  },
  {
    id: 7,
    title: "New Week 7 - Fine-tuned Open-Source Model to Compete with Frontier Model",
    meta: "24 lectures - 4hr",
    items: [
      { id: "7-1", title: "Dataset preparation strategies", type: "video", dur: "32min" },
      { id: "7-2", title: "Training run walkthrough", type: "video", dur: "55min" },
      { id: "7-3", title: "Evaluation vs frontier models", type: "video", dur: "40min" },
      { id: "7-4", title: "Week 7 slides deck", type: "ppt" },
      { id: "7-5", title: "Advanced fine-tuning quiz - 45 questions", type: "qbank" },
      { id: "7-6", title: "Model comparison flashcards", type: "flash" },
      { id: "7-7", title: "Weights & Biases docs library", type: "lib" },
      { id: "7-8", title: "Training run analysis PDF", type: "pdf" },
    ],
  },
  {
    id: 8,
    title: "New Week 8 - Build Autonomous Multi Agent System",
    meta: "21 lectures - 3hr 3min",
    items: [
      { id: "8-1", title: "Multi-agent architecture overview", type: "video", dur: "28min" },
      { id: "8-2", title: "Agent communication patterns", type: "video", dur: "35min" },
      { id: "8-3", title: "Tool use and function calling", type: "video", dur: "42min" },
      { id: "8-4", title: "Building a crew of agents", type: "video", dur: "50min" },
      { id: "8-5", title: "Week 8 slides deck", type: "ppt" },
      { id: "8-6", title: "Multi-agent quiz bank - 40 questions", type: "qbank" },
      { id: "8-7", title: "Agent design flashcards", type: "flash" },
      { id: "8-8", title: "LangChain / CrewAI documentation", type: "lib" },
      { id: "8-9", title: "Multi-agent system PDF guide", type: "pdf" },
    ],
  },
];

function TypeBadge({ type }: { type: ItemType }) {
  const T = TYPES[type];
  const Icon = T.Icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${T.bg} ${T.text} ${T.border}`}>
      <Icon size={10} />
      {T.label}
    </span>
  );
}

function CheckItem({ item, done, onToggle }: { item: Item; done: boolean; onToggle: () => void }) {
  return (
    <li
      className="group flex cursor-pointer items-start gap-3 border-b border-slate-100 py-2.5 last:border-0"
      onClick={onToggle}
      role="checkbox"
      aria-checked={done}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div
        className={`mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded border transition-all duration-150 ${
          done ? "border-violet-600 bg-violet-600" : "border-slate-300 group-hover:border-violet-400"
        }`}
      >
        {done && <Check size={11} color="white" strokeWidth={3} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug transition-colors duration-150 ${done ? "text-slate-400 line-through" : "text-slate-700 group-hover:text-violet-700"}`}>
          {item.title}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <TypeBadge type={item.type} />
          {item.dur && <span className="text-[11px] text-slate-400">{item.dur}</span>}
        </div>
      </div>
    </li>
  );
}

function SectionCard({
  section,
  completed,
  onToggle,
  forceOpen,
}: {
  section: Section;
  completed: Set<string>;
  onToggle: (id: string) => void;
  forceOpen: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isOpen = open || forceOpen;
  const done = section.items.filter((it) => completed.has(it.id)).length;
  const total = section.items.length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const simpleTitle = section.title
    .replace(/^NEW\s+/i, "")
    .replace(/^Week (\d+) - /i, "Week $1: ");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <button
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-slate-50"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={isOpen}
      >
        <ChevronDown size={16} className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="min-w-0 text-[13px] font-semibold leading-snug text-slate-800 sm:truncate">{simpleTitle}</p>
          <div className="flex flex-shrink-0 items-center gap-2 text-[11px] font-medium text-slate-400">
            <span>{total} items</span>
            <span aria-hidden="true">·</span>
            <span>
              {done}/{total}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-violet-600">{pct}%</span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-slate-100 px-5 pb-2 pt-1">
          <ul>
            {section.items.map((item) => (
              <CheckItem key={item.id} item={item} done={completed.has(item.id)} onToggle={() => onToggle(item.id)} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CourseContent({
  kicker = "LLM Engineering",
  title = "Master AI & LLMs: From Foundations to Frontier Systems",
}: {
  kicker?: string;
  title?: string;
}) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const q = search.toLowerCase().trim();

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredSections = useMemo(() => {
    if (!q) return SECTIONS;
    return SECTIONS.map((s) => ({
      ...s,
      items: s.items.filter((it) => it.title.toLowerCase().includes(q)),
    })).filter((s) => s.items.length > 0);
  }, [q]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-violet-500">{kicker}</p>
          <h1 className="mx-auto max-w-2xl text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{title}</h1>
        </div>

        <div className="relative mb-5">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search lectures and resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 transition placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-300"
          />
        </div>

        <div className="flex flex-col gap-3">
          {filteredSections.length === 0 ? (
            <div className="py-16 text-center text-sm text-slate-400">No results for &ldquo;{search}&rdquo;</div>
          ) : (
            filteredSections.map((section) => (
              <SectionCard key={section.id} section={section} completed={completed} onToggle={toggle} forceOpen={!!q} />
            ))
          )}
        </div>

        <div className="course-library-bar">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-4">
            <a className="flex w-full max-w-[420px] items-center justify-center rounded-full bg-slate-950 px-6 py-4 text-sm font-black text-white transition hover:bg-slate-800" href="/dashboard">
              Add to your library
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
