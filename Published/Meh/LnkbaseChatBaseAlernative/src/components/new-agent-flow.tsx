"use client";

import { useRouter } from "next/navigation";
import { Check, ChevronDown, Database, FileText, Headphones, LoaderCircle, MessageSquare, Upload, X, Zap } from "lucide-react";
import { useState } from "react";
import { BrandLink } from "./brand";

const sources = [
  ["File", "Upload PDFs, DOCX, and TXT files.", FileText],
  ["Text", "Add plain text sources to train your agent.", MessageSquare],
  ["Q&A", "Craft responses for important questions.", Headphones],
  ["Notion", "Import workspace pages and docs.", Database],
] as const;

const tools = {
  Actions: ["Stripe", "Shopify", "Cal", "Calendly", "Slack", "Twilio"],
  "Helpdesk tools": ["Lnkbase", "Zendesk", "Sunshine", "Salesforce", "Intercom", "HubSpot", "Freshdesk", "Zoho Desk", "Help Scout"],
};

const testimonials = [
  {
    name: "OpenAI",
    quote: "Lnkbase is a strong signal of how customer support will evolve into trusted, agentic software.",
    person: "Marc Manara, Head of Startups",
  },
  {
    name: "Sage",
    quote: "The chatbots are user-friendly, easy to customize, and have been serving our customers effectively.",
    person: "Ann Donie, Product Owner",
  },
  {
    name: "Blanko",
    quote: "We deploy Lnkbase agents across support sites to help residents access reliable information.",
    person: "Beverly St-Andre, AI and Data Science",
  },
];

function SidePanel({ step }: { step: number }) {
  const item = testimonials[Math.min(step, testimonials.length - 1)];
  return (
    <aside className="hidden min-h-screen bg-[#2758f6] bg-[radial-gradient(circle_at_35%_18%,rgba(255,255,255,0.18),transparent_26%),linear-gradient(135deg,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[length:100%_100%,120px_120px] p-10 text-white lg:flex lg:flex-col lg:justify-center">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 text-[#111111] shadow-2xl shadow-black/25">
        <p className="text-3xl font-semibold text-[#70707a]">{item.name}</p>
        <p className="mt-8 text-xl font-semibold leading-7">&quot;{item.quote}&quot;</p>
        <p className="mt-8 text-sm font-semibold text-[#74747d]">{item.person}</p>
      </div>
      <div className="mx-auto mt-24 grid w-full max-w-2xl grid-cols-3 border border-white/20 text-center text-lg font-semibold text-white/80">
        {["Bridgestone", "Miele", "Sage", "NationalGrid", "IHG", "Noon"].map((logo) => (
          <div key={logo} className="border border-white/15 px-4 py-4">
            {logo}
          </div>
        ))}
      </div>
    </aside>
  );
}

function AddSourceDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/45">
      <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col rounded-l-[28px] bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Add source</h2>
            <p className="mt-1 text-sm text-[#6c6c76]">Choose the type of knowledge source you want to add.</p>
          </div>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-black/5" aria-label="Close add source">
            <X size={18} />
          </button>
        </div>
        <div className="mt-7 overflow-hidden rounded-2xl border border-black/10">
          {sources.map(([title, text, Icon]) => (
            <button key={title} className="flex w-full items-center gap-4 border-b border-black/10 px-5 py-5 text-left last:border-b-0 hover:bg-[#fafaf7]">
              <span className="grid size-11 place-items-center rounded-xl border border-black/10">
                <Icon size={19} />
              </span>
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="mt-1 block text-sm text-[#777781]">{text}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="mt-auto hidden space-y-3 sm:block">
          <div className="ml-auto w-fit rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold shadow-xl shadow-black/10">
            Want to deploy a conversational AI agent?
          </div>
          <div className="ml-auto w-fit rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm shadow-xl shadow-black/10">
            Let me help you figure out if Lnkbase is the right fit.
          </div>
        </div>
      </div>
    </div>
  );
}

export function NewAgentFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sourceDrawer, setSourceDrawer] = useState(false);
  const [website, setWebsite] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>(["Slack", "Zendesk"]);
  const [agentType, setAgentType] = useState("Customer support");
  const [menuOpen, setMenuOpen] = useState(false);
  const [instructions, setInstructions] = useState(
    "Answer customer questions clearly and concisely. Stay polite and professional. Escalate billing or account issues to a human agent when unsure."
  );
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  async function next() {
    setError("");

    if (step < 3) {
      if (step === 0 && !website.trim() && !sourceDrawer) {
        setError("Add a website URL to create the first training source.");
        return;
      }
      setStep(step + 1);
      return;
    }

    if (!website.trim()) {
      setStep(0);
      setError("Add a website URL to create the first training source.");
      return;
    }

    setStep(4);
    setCreating(true);

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          websiteUrl: website,
          instructions,
          tools: selectedTools,
        }),
      });
      const data = (await response.json()) as {
        agentId?: string;
        slug?: string;
        error?: string;
      };

      if (!response.ok || !data.agentId) {
        throw new Error(data.error ?? "Failed to create agent");
      }

      router.push(`/dashboard/${data.slug ?? data.agentId}`);
    } catch (createError) {
      setStep(0);
      setError(
        createError instanceof Error
          ? createError.message
          : "Failed to create agent"
      );
    } finally {
      setCreating(false);
    }
  }

  function toggleTool(tool: string) {
    setSelectedTools((current) => (current.includes(tool) ? current.filter((item) => item !== tool) : [...current, tool]));
  }

  if (step === 4) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 text-center">
        <div>
          <LoaderCircle className="mx-auto animate-spin text-[#6b5cff]" size={40} />
          <h1 className="mt-8 text-3xl font-semibold tracking-tight">We are creating your agent</h1>
          <p className="mt-3 text-[#74747d]">Configuring your agent settings...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#111111] lg:grid lg:grid-cols-[1fr_0.86fr]">
      <section className="flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:px-20">
        <div className="flex items-center justify-between">
          <BrandLink />
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((dot) => (
              <span key={dot} className={`size-2.5 rotate-45 ${dot <= step ? "bg-[#111111]" : "bg-[#e4e4e7]"}`} />
            ))}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-12">
          {step === 0 && (
            <>
              <h1 className="text-4xl font-semibold tracking-tight">How would you like to train your AI agent?</h1>
              <div className="mt-10">
                <label className="text-sm font-semibold">Your website (recommended)</label>
                <div className="mt-3 flex overflow-hidden rounded-xl border border-black/10 bg-white focus-within:border-[#6b5cff]">
                  <span className="border-r border-black/10 bg-[#f7f7f4] px-4 py-3 text-[#73737d]">https://</span>
                  <input
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                    placeholder="www.example.com"
                    className="min-w-0 flex-1 px-4 outline-none"
                  />
                </div>
                <p className="mt-2 rounded-xl bg-[#f7f7f4] px-4 py-3 text-sm text-[#777781]">
                  We will extract info from public pages in this domain to train your AI agent.
                </p>
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold">Other sources</p>
                <button
                  onClick={() => setSourceDrawer(true)}
                  className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-black/20 text-sm font-semibold hover:bg-black/5"
                >
                  <Upload size={17} />
                  Add Notion, Files, Text and more
                </button>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-4xl font-semibold tracking-tight">Customize your agent&apos;s personality</h1>
              <div className="mt-10">
                <label className="text-sm font-semibold">What will your agent do?</label>
                <textarea
                  className="mt-3 h-80 w-full resize-none rounded-2xl border border-black/10 p-4 outline-none focus:border-[#6b5cff]"
                  value={instructions}
                  onChange={(event) => setInstructions(event.target.value)}
                />
              </div>
              <div className="relative ml-auto mt-3 w-64">
                {menuOpen && (
                  <div className="absolute bottom-14 w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl">
                    {["Customer support", "Sales agent", "Shopping assistant"].map((item) => (
                      <button key={item} onClick={() => { setAgentType(item); setMenuOpen(false); }} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-black/5">
                        {item}
                        {agentType === item && <Check size={15} />}
                      </button>
                    ))}
                  </div>
                )}
                <button onClick={() => setMenuOpen(!menuOpen)} className="flex min-h-11 w-full items-center justify-between rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold">
                  {agentType}
                  <ChevronDown size={16} />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-4xl font-semibold tracking-tight">Select the tools in your tech stack</h1>
              <p className="mt-3 text-[#686871]">We will note it down and walk you through how to integrate them later.</p>
              <div className="mt-9 space-y-8">
                {Object.entries(tools).map(([group, items]) => (
                  <div key={group}>
                    <p className="text-sm font-semibold">{group}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {items.map((tool) => (
                        <button
                          key={tool}
                          onClick={() => toggleTool(tool)}
                          className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                            selectedTools.includes(tool)
                              ? "border-[#6b5cff] bg-[#f2efff] text-[#5143df]"
                              : "border-black/10 bg-white text-[#303039] hover:bg-black/5"
                          }`}
                        >
                          <Zap size={15} />
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-4xl font-semibold tracking-tight">Choose your plan</h1>
              <p className="mt-3 text-[#686871]">Start free, then upgrade when you need more credits, members, and integrations.</p>
              <div className="mt-9 grid gap-3">
                {["Free", "Hobby", "Standard", "Pro", "Enterprise"].map((plan) => (
                  <button key={plan} className="flex min-h-16 items-center justify-between rounded-2xl border border-black/10 bg-white px-5 text-left font-semibold hover:border-[#6b5cff]/40 hover:bg-[#faf9ff]">
                    <span>{plan}</span>
                    <span className="text-sm text-[#777781]">{plan === "Free" ? "Continue for free" : plan === "Enterprise" ? "Let's talk" : "Start trial"}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {error && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="mx-auto flex w-full max-w-xl gap-3">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="min-h-12 rounded-xl border border-black/10 px-5 text-sm font-semibold disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={next}
            disabled={creating}
            className="min-h-12 flex-1 rounded-xl bg-[#111111] text-sm font-semibold text-white disabled:opacity-60"
          >
            {creating
              ? "Creating..."
              : step === 3
                ? "Create agent"
                : "Continue"}
          </button>
        </div>
      </section>
      <SidePanel step={step} />
      <AddSourceDrawer open={sourceDrawer} onClose={() => setSourceDrawer(false)} />
    </main>
  );
}
