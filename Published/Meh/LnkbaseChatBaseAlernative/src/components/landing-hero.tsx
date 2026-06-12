"use client";

import { useState, type ReactNode } from "react";
import {
  ArrowUp,
  AudioLines,
  BarChart3,
  BookOpen,
  Bug,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  Inbox,
  Link2,
  Lightbulb,
  Map,
  Megaphone,
  Mic,
  MoreHorizontal,
  Monitor,
  MousePointer2,
  Palette,
  Paperclip,
  Quote,
  Rewind,
  Search,
  Send,
  Share2,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

type ModuleKey =
  | "home"
  | "inbox"
  | "feedback"
  | "survey"
  | "knowledge"
  | "bug-report"
  | "testimonials"
  | "roadmap"
  | "updates"
  | "customers"
  | "insights"
  | "ui";

const meta: Record<ModuleKey, { icon: LucideIcon; name: string; color: string }> = {
  home: { icon: Home, name: "Home", color: "#15161a" },
  inbox: { icon: Inbox, name: "Inbox", color: "#2563eb" },
  feedback: { icon: Lightbulb, name: "Feedback", color: "#d97706" },
  survey: { icon: ClipboardList, name: "Surveys", color: "#6366f1" },
  knowledge: { icon: BookOpen, name: "Knowledge", color: "#7c3aed" },
  "bug-report": { icon: Bug, name: "Bug Reports", color: "#dc2626" },
  testimonials: { icon: Quote, name: "Testimonials", color: "#db2777" },
  roadmap: { icon: Map, name: "Roadmap", color: "#0d9488" },
  updates: { icon: Megaphone, name: "Updates", color: "#0ea5e9" },
  customers: { icon: Users, name: "Customers", color: "#2563eb" },
  insights: { icon: Sparkles, name: "Insights", color: "#d97706" },
  ui: { icon: Palette, name: "UI", color: "#059669" },
};

const order: ModuleKey[] = [
  "home",
  "inbox",
  "feedback",
  "survey",
  "knowledge",
  "bug-report",
  "testimonials",
  "roadmap",
  "updates",
  "customers",
  "insights",
  "ui",
];

const hero: Record<ModuleKey, { lead: string; hi: string }> = {
  home: { lead: "AI agents for ", hi: "your business." },
  inbox: { lead: "Every conversation, ", hi: "one inbox." },
  feedback: { lead: "Turn feedback into ", hi: "your roadmap." },
  survey: { lead: "Ask better questions, ", hi: "get clear answers." },
  knowledge: { lead: "A knowledge base that ", hi: "answers itself." },
  "bug-report": { lead: "Catch and triage ", hi: "bugs fast." },
  testimonials: { lead: "Proof your customers ", hi: "love it." },
  roadmap: { lead: "Show what's ", hi: "coming next." },
  updates: { lead: "Ship updates ", hi: "users notice." },
  customers: { lead: "Know ", hi: "every customer." },
  insights: { lead: "Insights your data ", hi: "was hiding." },
  ui: { lead: "Make the widget ", hi: "truly yours." },
};

const testimonials = [
  {
    q: "Our support volume dropped 40% in three weeks. The AI just handles it.",
    n: "Priya Shah",
    r: "Head of Support, Northwind",
    c: "#0d9488",
    s: 5,
  },
  {
    q: "Feedback, roadmap, and changelog finally live in one place our users trust.",
    n: "Marcus Lee",
    r: "PM, Acme Co",
    c: "#2563eb",
    s: 5,
  },
  {
    q: "Bug triage that used to take hours now takes minutes. A real game changer.",
    n: "Elena Ruiz",
    r: "Founder, Globex",
    c: "#d97706",
    s: 5,
  },
  {
    q: "Setup took an afternoon and it already feels like part of the team.",
    n: "Dan Owusu",
    r: "CTO, Initech",
    c: "#7c3aed",
    s: 5,
  },
];

const homePromptResponses = {
  help: {
    label: "How can Lnkbase help me?",
    answer:
      "Lnkbase turns one chat bubble into support, feedback, surveys, testimonials, bug reports, knowledge base search, roadmap updates, and customer insights.",
  },
  integrations: {
    label: "What integrations do you offer?",
    answer:
      "Connect website content, docs, PDFs, Q&A pairs, help centers, Slack-style alerts, webhooks, and embeddable widgets from the same agent workspace.",
  },
  free: {
    label: "Is there a free plan?",
    answer:
      "Yes. Start with a free agent, test the widget, collect real conversations, then upgrade when you need higher volume and team controls.",
  },
  demo: {
    label: "Can I see a demo?",
    answer:
      "You are using the demo now. Pick any card below to open that feature inside this same chat bubble.",
  },
  message: {
    label: "Send us a message",
    answer:
      "Message mode is ready. Ask a question, attach context, or route the conversation to the shared inbox without leaving the widget.",
  },
} as const;

type HomePromptKey = keyof typeof homePromptResponses;

export function LandingHero() {
  const [active, setActive] = useState<ModuleKey | null>(null);
  const current = active ?? "home";
  const currentMeta = meta[current];
  const currentHero = hero[current];
  const HeroIcon = currentMeta.icon;

  const isSelected = (key: ModuleKey) => (key === "home" ? active === null : active === key);
  const select = (key: ModuleKey) => {
    setActive(key === "home" ? null : active === key ? null : key);
  };

  return (
    <section className="overflow-hidden border-b border-black/[0.06] bg-white">
      <div className="mx-auto max-w-2xl px-6 pt-14 text-center">
        <div key={current} className="flex flex-col items-center animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
          <span
            className="mb-5 flex size-14 items-center justify-center rounded-2xl"
            style={{ background: `${currentMeta.color}1a` }}
          >
            <HeroIcon className="size-7" style={{ color: currentMeta.color }} strokeWidth={2.2} />
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-normal text-[#15161a] sm:text-5xl">
            {currentHero.lead}
            <span className="relative inline-block">
              <span className="relative z-10">{currentHero.hi}</span>
              <span className="absolute -bottom-1 left-0 h-3 w-full -rotate-1 rounded bg-[#fcdf9e]" />
            </span>
          </h1>
        </div>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#62626c]">
          Turn your website into a support, feedback, surveys, roadmap, and insights hub.
          One widget answers visitors, captures signals, and keeps every customer
          conversation connected to your product.
        </p>
      </div>

      <div className="px-4 pb-24 pt-12">
        <div className="mx-auto w-full max-w-md animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <Widget active={active} setActive={setActive} height={620} />
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-5 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          {[order.slice(0, 6), order.slice(6)].map((rowKeys, index) => (
            <div key={index} className="flex flex-wrap justify-center gap-3">
              {rowKeys.map((key) => (
                <AppIcon
                  key={key}
                  moduleKey={key}
                  selected={isSelected(key)}
                  onClick={() => select(key)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[#f4f5f7] px-3.5 py-3 text-sm">
      {children}
    </div>
  );
}

function PromptButton({
  children,
  onClick,
  selected,
}: {
  children: ReactNode;
  onClick: () => void;
  selected?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2.5 text-left text-sm font-semibold shadow-sm transition active:scale-[0.98] ${
        selected
          ? "border-[#15161a] bg-[#15161a] text-white"
          : "border-neutral-200 bg-white text-neutral-800 hover:border-neutral-300 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

function FeatureButton({
  icon: Icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.99]"
    >
      <span
        className="grid size-10 shrink-0 place-items-center rounded-xl"
        style={{ background: `${color}16`, color }}
      >
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-neutral-900">{title}</span>
        <span className="block truncate text-xs text-neutral-500">{description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-neutral-300" />
    </button>
  );
}

function Widget({
  active,
  setActive,
  height,
}: {
  active: ModuleKey | null;
  setActive: (active: ModuleKey | null) => void;
  height: number;
}) {
  const isHome = !active;
  const activeMeta = active ? meta[active] : meta.home;
  const [homePrompt, setHomePrompt] = useState<HomePromptKey>("help");

  return (
    <div
      className="flex w-full flex-col overflow-hidden rounded-3xl bg-white"
      style={{
        height,
        border: "1px solid #ececec",
        boxShadow: "0 40px 80px -30px rgba(20,22,26,.35), 0 4px 12px rgba(20,22,26,.05)",
      }}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 bg-white px-5 py-4 text-neutral-900">
        <div className="flex items-center gap-3">
          {isHome ? (
            <span className="flex size-8 items-center justify-center rounded-full bg-[#15161a] text-white">
              <Sparkles className="size-4" />
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setActive(null)}
              className="flex size-8 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100"
              aria-label="Back to home"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          <span className="text-[15px] font-bold tracking-normal">
            {isHome ? "Lnkbase AI Agent" : activeMeta.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-neutral-400">
          {isHome && <MoreHorizontal className="size-5" />}
          <button type="button" onClick={() => setActive(null)} aria-label="Reset widget">
            <X className="size-5 hover:text-neutral-700" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div key={active ?? "home"} className="h-full animate-in fade-in-0 slide-in-from-bottom-1 duration-200">
          <WidgetBody
            active={active}
            setActive={setActive}
            homePrompt={homePrompt}
            setHomePrompt={setHomePrompt}
          />
        </div>
      </div>
      {isHome ? (
        <div className="shrink-0 border-t border-neutral-100 px-4 py-4">
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-2">
            <Paperclip className="size-4 text-neutral-400" />
            <span className="flex-1 truncate text-sm text-neutral-400">
              Ask me anything about Lnkbase
            </span>
            <Mic className="size-4 text-neutral-400" />
            <button
              type="button"
              onClick={() => setHomePrompt("message")}
              className="flex size-8 items-center justify-center rounded-full bg-[#15161a]"
              aria-label="Send message"
            >
              <AudioLines className="size-4 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex shrink-0 items-center justify-center gap-1.5 border-t border-neutral-100 py-3 text-xs font-medium text-neutral-400">
          <span className="flex size-4 items-center justify-center rounded bg-neutral-200">
            <Sparkles className="size-2.5 text-neutral-500" />
          </span>
          Powered by Lnkbase
        </div>
      )}
    </div>
  );
}

function WidgetBody({
  active,
  setActive,
  homePrompt,
  setHomePrompt,
}: {
  active: ModuleKey | null;
  setActive: (active: ModuleKey | null) => void;
  homePrompt: HomePromptKey;
  setHomePrompt: (prompt: HomePromptKey) => void;
}) {
  if (!active) {
    const prompt = homePromptResponses[homePrompt];
    const homeFeatures: Array<{
      key: ModuleKey;
      title: string;
      description: string;
      icon: LucideIcon;
    }> = [
      { key: "feedback", title: "Leave feedback", description: "Ideas, votes, and product signals", icon: Lightbulb },
      { key: "survey", title: "Surveys", description: "Collect answers and segment users", icon: ClipboardList },
      { key: "knowledge", title: "Search for help", description: "Articles and answers inside chat", icon: Search },
      { key: "bug-report", title: "Submit ticket", description: "Bug report, screenshot, replay", icon: Bug },
      { key: "testimonials", title: "Testimonials", description: "Collect, analyze, manage, share", icon: Quote },
      { key: "inbox", title: "Inbox", description: "Every conversation in one place", icon: Inbox },
      { key: "roadmap", title: "Roadmap", description: "Public plans and shipped work", icon: Map },
      { key: "updates", title: "Updates", description: "Announcements users can read", icon: Megaphone },
      { key: "customers", title: "Customers", description: "Profiles and account context", icon: Users },
      { key: "insights", title: "Insights", description: "Trends from every interaction", icon: Sparkles },
      { key: "ui", title: "Widget UI", description: "Colors, launcher, and embed", icon: Palette },
    ];

    return (
      <div className="space-y-4 px-5 pb-5 pt-4">
        <div className="rounded-3xl border border-neutral-200 bg-[#fafafa] p-5 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#15161a] text-white">
            <Sparkles className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight text-neutral-950">
            Hey there. How can we help?
          </h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Everything opens inside this chat bubble.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => setHomePrompt("message")}
            className="flex w-full items-center justify-between rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-left text-base font-bold text-neutral-950 shadow-sm transition hover:bg-neutral-50"
          >
            Send us a message
            <Send className="size-5 text-neutral-400" />
          </button>
          <FeatureButton
            icon={Bug}
            title="Submit ticket"
            description="Bug Report"
            color={meta["bug-report"].color}
            onClick={() => setActive("bug-report")}
          />
          <FeatureButton
            icon={Lightbulb}
            title="Leave us feedback"
            description="Ideas, votes, and product feedback"
            color={meta.feedback.color}
            onClick={() => setActive("feedback")}
          />
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm">
          <button
            type="button"
            onClick={() => setActive("knowledge")}
            className="flex w-full items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-3 text-left text-base font-bold text-neutral-700"
          >
            <Search className="size-4 text-neutral-400" />
            Search for help
          </button>
          <div className="mt-3 space-y-1">
            {homeFeatures.map(({ key, title, description, icon: Icon }) => (
              <button
                type="button"
                key={key}
                onClick={() => setActive(key)}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-neutral-50"
              >
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-xl"
                  style={{ background: `${meta[key].color}14`, color: meta[key].color }}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-neutral-800">{title}</span>
                  <span className="block truncate text-xs text-neutral-500">{description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-neutral-100 px-4 py-3 text-[15px] leading-6 text-neutral-800">
            {prompt.answer}
          </div>
          <div className="flex flex-col items-end gap-2">
            {(Object.keys(homePromptResponses) as HomePromptKey[])
              .filter((key) => key !== "message")
              .map((key) => (
                <PromptButton
                  key={key}
                  selected={homePrompt === key}
                  onClick={() => setHomePrompt(key)}
                >
                  {homePromptResponses[key].label}
                </PromptButton>
              ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-neutral-400">
          <span className="flex size-4 items-center justify-center rounded bg-neutral-200">
            <Sparkles className="size-2.5 text-neutral-500" />
          </span>
          Powered by Lnkbase
        </div>
      </div>
    );
  }

  const c = meta[active].color;
  const wrap = "space-y-2.5 px-5 pb-5 pt-4";

  switch (active) {
    case "inbox":
      return (
        <div className={wrap}>
          {[
            ["Mara Lin", "Billing question", "2m", true],
            ["Tom Reyes", "Can't log in", "18m", true],
            ["Ava Cole", "Loving the update", "1h", false],
          ].map(([name, subject, time, unread]) => (
            <Row key={String(name)}>
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full" style={{ background: unread ? c : "transparent" }} />
                <div>
                  <div className="font-semibold text-neutral-800">{name}</div>
                  <div className="text-xs text-neutral-500">{subject}</div>
                </div>
              </div>
              <span className="text-xs text-neutral-400">{time}</span>
            </Row>
          ))}
        </div>
      );
    case "feedback":
      return (
        <div className={wrap}>
          <div className="rounded-xl border border-neutral-200 px-3.5 py-3 text-sm text-neutral-400">
            Share an idea...
          </div>
          {[
            ["Dark mode", 128],
            ["Slack integration", 94],
            ["Bulk export", 61],
          ].map(([title, votes]) => (
            <Row key={String(title)}>
              <span className="font-semibold text-neutral-800">{title}</span>
              <span
                className="flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-xs font-bold"
                style={{ color: c, border: `1px solid ${c}33` }}
              >
                <ArrowUp className="size-3" />
                {votes}
              </span>
            </Row>
          ))}
        </div>
      );
    case "survey":
      return (
        <div className="space-y-4 px-5 pb-5 pt-4">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
              <ClipboardList className="size-4" />
              Survey builder
            </div>
            <p className="mt-2 text-sm leading-6 text-indigo-700/80">
              Ask targeted questions in chat, collect structured answers, and turn responses into customer segments.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900">Active survey</span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">Live</span>
            </div>
            <div className="space-y-2.5">
              {[
                ["How satisfied are you today?", "Rating"],
                ["What should we improve first?", "Text"],
                ["Which plan are you considering?", "Choice"],
              ].map(([question, type], index) => (
                <div key={question} className="rounded-xl bg-[#f4f5f7] px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-neutral-800">{question}</span>
                    <span className="shrink-0 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-neutral-500">
                      {type}
                    </span>
                  </div>
                  {index === 0 && (
                    <div className="mt-3 flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <span
                          key={score}
                          className="grid size-8 place-items-center rounded-lg text-xs font-bold"
                          style={{
                            background: score <= 4 ? `${c}16` : "#fff",
                            color: score <= 4 ? c : "#a3a3a3",
                          }}
                        >
                          {score}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              ["184", "Responses"],
              ["62%", "Completion"],
              ["4.3", "Avg rating"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-3 text-center shadow-sm">
                <div className="text-lg font-extrabold text-neutral-950">{value}</div>
                <div className="mt-1 text-[11px] font-semibold text-neutral-500">{label}</div>
              </div>
            ))}
          </div>

          <button type="button" className="w-full rounded-xl py-3 text-sm font-semibold text-white" style={{ background: c }}>
            Create survey
          </button>
        </div>
      );
    case "knowledge":
      return (
        <div className={wrap}>
          <div className="flex items-center gap-2 rounded-xl bg-[#f4f5f7] px-3.5 py-3 text-sm">
            <Search className="size-4 text-neutral-400" />
            <span className="text-neutral-400">Search articles...</span>
          </div>
          {[
            "Getting started in 5 minutes",
            "Connecting your data sources",
            "Training the AI on your docs",
            "Setting up auto-replies",
          ].map((title) => (
            <Row key={title}>
              <span className="font-medium text-neutral-700">{title}</span>
              <ChevronRight className="size-4 text-neutral-300" />
            </Row>
          ))}
        </div>
      );
    case "bug-report":
      return (
        <div className="space-y-4 px-5 pb-5 pt-4">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-red-700">
              <Bug className="size-4" />
              Bug report capture
            </div>
            <p className="mt-2 text-sm leading-6 text-red-700/80">
              Users can capture the page, highlight the broken area, record context, and submit the whole report from the chat bubble.
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { icon: Camera, label: "Capture Screenshot", value: "Ready" },
              { icon: MousePointer2, label: "Highlight from page", value: "On" },
              { icon: Monitor, label: "Record Desktop", value: "Mic On" },
              { icon: Rewind, label: "Instant Replay", value: "Last 30s" },
            ].map(({ icon: Icon, label, value }) => (
              <button
                type="button"
                key={label}
                className="flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-neutral-50"
              >
                <Icon className="size-5 shrink-0 text-neutral-700" />
                <span className="flex-1 text-[15px] font-bold text-neutral-900">{label}</span>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{ background: `${c}14`, color: c }}
                >
                  {value}
                </span>
                <ChevronRight className="size-4 text-neutral-300" />
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-neutral-400">Page highlight</span>
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">Selected</span>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-neutral-200 bg-[#f8fafc] p-3">
              <div className="h-2 w-28 rounded-full bg-neutral-200" />
              <div className="mt-3 grid grid-cols-[1fr_72px] gap-3">
                <div className="space-y-2">
                  <div className="h-3 rounded bg-neutral-200" />
                  <div className="h-3 w-4/5 rounded bg-neutral-200" />
                  <div className="relative h-10 rounded-lg border-2 border-red-500 bg-white shadow-sm">
                    <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      1
                    </span>
                  </div>
                </div>
                <div className="rounded-lg bg-neutral-200" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
            <div className="flex-1 px-2 text-sm font-semibold text-neutral-400">Request a recording</div>
            <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-bold text-neutral-800">
              <Link2 className="size-4" />
              Create link
            </button>
          </div>

          <button type="button" className="w-full rounded-xl py-3 text-sm font-semibold text-white" style={{ background: c }}>
            Submit bug report
          </button>
        </div>
      );
    case "testimonials":
      return (
        <div className="space-y-4 px-5 pb-5 pt-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Quote, label: "Collect", value: "12 new" },
              { icon: BarChart3, label: "Analyze", value: "94% positive" },
              { icon: CheckCircle2, label: "Manage", value: "8 approved" },
              { icon: Share2, label: "Share", value: "Wall ready" },
            ].map(({ icon: Icon, label, value }) => (
              <button
                type="button"
                key={label}
                className="rounded-2xl border border-neutral-200 bg-white p-3 text-left shadow-sm transition hover:bg-neutral-50"
              >
                <span
                  className="mb-3 grid size-9 place-items-center rounded-xl"
                  style={{ background: `${c}14`, color: c }}
                >
                  <Icon className="size-4" />
                </span>
                <span className="block text-sm font-bold text-neutral-900">{label}</span>
                <span className="mt-1 block text-xs font-medium text-neutral-500">{value}</span>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-900">Share request</span>
              <button type="button" className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-bold text-neutral-700">
                Copy link
              </button>
            </div>
            <div className="rounded-xl bg-[#fafafa] px-3.5 py-3 text-sm leading-6 text-neutral-600">
              Ask happy customers for a quote after a resolved chat, then approve and publish it to a wall or website widget.
            </div>
          </div>

          {testimonials.slice(0, 3).map((item, index) => (
            <div key={item.n} className="rounded-2xl border border-neutral-100 bg-[#fafafa] p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[...Array(item.s)].map((_, starIndex) => (
                    <Star key={starIndex} className="size-3.5 fill-[#f5b301] text-[#f5b301]" />
                  ))}
                </div>
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{
                    background: index === 1 ? "#f4f5f7" : `${c}14`,
                    color: index === 1 ? "#73737d" : c,
                  }}
                >
                  {index === 1 ? "Needs review" : "Approved"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-700">{item.q}</p>
              <div className="mt-3 flex items-center gap-2.5">
                <span
                  className="flex size-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: item.c }}
                >
                  {item.n[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-neutral-900">{item.n}</div>
                  <div className="truncate text-xs text-neutral-500">{item.r}</div>
                </div>
                <button type="button" className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-bold text-neutral-700">
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    case "roadmap":
      return (
        <div className={wrap}>
          {[
            ["Mobile app", "Planned", "#94a3b8"],
            ["API v2", "In progress", "#d97706"],
            ["SSO login", "Shipped", "#0d9488"],
            ["Webhooks", "Shipped", "#0d9488"],
          ].map(([feature, stage, swatch]) => (
            <Row key={feature}>
              <span className="font-semibold text-neutral-800">{feature}</span>
              <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${swatch}1a`, color: swatch }}>
                {stage}
              </span>
            </Row>
          ))}
        </div>
      );
    case "updates":
      return (
        <div className={wrap}>
          {[
            ["Jun 2", "New AI summaries"],
            ["May 27", "Faster inbox search"],
            ["May 19", "Roadmap voting"],
          ].map(([date, title]) => (
            <div key={title} className="rounded-xl bg-[#f4f5f7] px-3.5 py-3">
              <div className="text-xs font-semibold" style={{ color: c }}>{date}</div>
              <div className="text-sm font-semibold text-neutral-800">{title}</div>
            </div>
          ))}
        </div>
      );
    case "customers":
      return (
        <div className={wrap}>
          {[
            ["Northwind", "Pro"],
            ["Acme Co", "Team"],
            ["Globex", "Free"],
            ["Initech", "Pro"],
          ].map(([name, plan]) => (
            <Row key={name}>
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: c }}>
                  {name[0]}
                </span>
                <span className="font-semibold text-neutral-800">{name}</span>
              </div>
              <span className="text-xs font-medium text-neutral-500">{plan}</span>
            </Row>
          ))}
        </div>
      );
    case "insights":
      return (
        <div className={wrap}>
          {[
            "+38% billing questions this week",
            "\"Export\" requested 24 times",
            "3 duplicate bugs merged",
            "Response time down 41%",
          ].map((title) => (
            <Row key={title}>
              <span className="font-medium text-neutral-700">{title}</span>
              <TrendingUp className="size-4" style={{ color: c }} />
            </Row>
          ))}
        </div>
      );
    case "ui":
      return (
        <div className="space-y-4 px-5 pb-5 pt-4">
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">Accent color</div>
            <div className="flex gap-2.5">
              {["#0d9488", "#2563eb", "#7c3aed", "#db2777", "#d97706", "#15161a"].map((swatch, index) => (
                <span
                  key={swatch}
                  className="size-8 rounded-full"
                  style={{
                    background: swatch,
                    boxShadow: index === 0 ? `0 0 0 3px #fff, 0 0 0 5px ${swatch}` : "none",
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">Launcher position</div>
            <div className="flex gap-2">
              <span
                className="flex-1 rounded-lg py-2 text-center text-xs font-bold"
                style={{ background: `${c}1a`, color: c, border: `1px solid ${c}55` }}
              >
                Bottom right
              </span>
              <span className="flex-1 rounded-lg bg-[#f4f5f7] py-2 text-center text-xs font-bold text-neutral-400">
                Bottom left
              </span>
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">Greeting</div>
            <div className="rounded-xl border border-neutral-200 px-3.5 py-3 text-sm text-neutral-700">
              Hey! How can we help?
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-400">Embed</div>
            <pre className="overflow-x-auto rounded-xl bg-neutral-900 px-3.5 py-3 text-[11px] leading-relaxed text-emerald-300">{`<script src="cdn.lnkbase.io/w.js"
  data-id="ws_91f2"></script>`}</pre>
          </div>
        </div>
      );
  }
}

const appIconStyles: Record<ModuleKey, { gradient: string; glow: string }> = {
  home: {
    gradient: "linear-gradient(145deg, #2b2d34 0%, #111318 48%, #050505 100%)",
    glow: "rgba(21,22,26,.34)",
  },
  inbox: {
    gradient: "linear-gradient(145deg, #78c7ff 0%, #2563eb 55%, #1740b7 100%)",
    glow: "rgba(37,99,235,.34)",
  },
  feedback: {
    gradient: "linear-gradient(145deg, #ffe7a8 0%, #f59e0b 48%, #d97706 100%)",
    glow: "rgba(217,119,6,.34)",
  },
  survey: {
    gradient: "linear-gradient(145deg, #c7d2fe 0%, #6366f1 52%, #4338ca 100%)",
    glow: "rgba(99,102,241,.34)",
  },
  knowledge: {
    gradient: "linear-gradient(145deg, #dbc8ff 0%, #7c3aed 52%, #4c1d95 100%)",
    glow: "rgba(124,58,237,.34)",
  },
  "bug-report": {
    gradient: "linear-gradient(145deg, #ffb3b3 0%, #ef4444 48%, #b91c1c 100%)",
    glow: "rgba(220,38,38,.34)",
  },
  testimonials: {
    gradient: "linear-gradient(145deg, #ffc2e6 0%, #db2777 50%, #9d174d 100%)",
    glow: "rgba(219,39,119,.34)",
  },
  roadmap: {
    gradient: "linear-gradient(145deg, #9ff5e4 0%, #14b8a6 48%, #0f766e 100%)",
    glow: "rgba(13,148,136,.34)",
  },
  updates: {
    gradient: "linear-gradient(145deg, #bae6fd 0%, #0ea5e9 52%, #0369a1 100%)",
    glow: "rgba(14,165,233,.34)",
  },
  customers: {
    gradient: "linear-gradient(145deg, #bfdbfe 0%, #3b82f6 52%, #1d4ed8 100%)",
    glow: "rgba(37,99,235,.34)",
  },
  insights: {
    gradient: "linear-gradient(145deg, #fed7aa 0%, #f97316 48%, #c2410c 100%)",
    glow: "rgba(217,119,6,.34)",
  },
  ui: {
    gradient: "linear-gradient(145deg, #bbf7d0 0%, #10b981 50%, #047857 100%)",
    glow: "rgba(5,150,105,.34)",
  },
};

function AppIcon({
  moduleKey,
  selected,
  onClick,
}: {
  moduleKey: ModuleKey;
  selected: boolean;
  onClick: () => void;
}) {
  const Icon = meta[moduleKey].icon;
  const { name } = meta[moduleKey];
  const style = appIconStyles[moduleKey];

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex shrink-0 flex-col items-center gap-2.5 rounded-2xl px-1 py-1 transition active:scale-95"
      style={{ width: 86 }}
      aria-pressed={selected}
    >
      <span
        className="relative flex items-center justify-center overflow-hidden transition-all duration-200"
        style={{
          width: 66,
          height: 66,
          borderRadius: 18,
          background: style.gradient,
          boxShadow: selected
            ? `0 14px 28px -12px ${style.glow}, 0 0 0 3px #fff, 0 0 0 5px rgba(21,22,26,.14)`
            : `0 12px 24px -14px ${style.glow}, 0 2px 7px rgba(17,24,39,.12)`,
          transform: selected ? "translateY(-3px) scale(1.03)" : "none",
        }}
      >
        <span className="absolute inset-x-1 top-1 h-7 rounded-t-[15px] bg-white/30 blur-[1px]" />
        <span className="absolute -bottom-5 -right-5 size-14 rounded-full bg-black/[0.16]" />
        <span className="absolute -left-5 -top-5 size-14 rounded-full bg-white/[0.18]" />
        <span className="relative grid size-10 place-items-center rounded-2xl bg-white/[0.18] text-white shadow-inner shadow-white/10 backdrop-blur-sm">
          <Icon className="size-6 drop-shadow-sm" strokeWidth={2.25} />
        </span>
      </span>
      <span
        className={`flex min-h-8 w-full items-start justify-center text-center text-[11px] font-semibold leading-4 tracking-normal transition ${
          selected ? "text-[#15161a]" : "text-[#52525b] group-hover:text-[#15161a]"
        }`}
      >
        {name}
      </span>
    </button>
  );
}
