import Link from "next/link";
import {
  Bot,
  CheckCircle2,
  Copy,
  ExternalLink,
  Filter,
  MoreVertical,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { Doc } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { AgentRowActions } from "@/components/agent-row-actions";

type AgentListItem =
  | Doc<"agents">
  | {
      _id: string;
      name: string;
      slug: string;
      websiteUrl: string;
      status: "ready";
    };

const demoAgents: AgentListItem[] = [
  {
    _id: "drnote-demo",
    name: "Drnote",
    slug: "drnote",
    websiteUrl: "https://drnote.co",
    status: "ready",
  },
  {
    _id: "example-demo",
    name: "Example",
    slug: "example",
    websiteUrl: "https://example.com",
    status: "ready",
  },
];

export function AgentsDashboard({ agents: storedAgents }: { agents: Doc<"agents">[] }) {
  const agents = storedAgents.length > 0 ? storedAgents : demoAgents;

  return (
    <div className="mx-auto w-full max-w-[1180px] overflow-x-hidden">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-[#111111]">Agents</h1>
          <p className="mt-1.5 max-w-[calc(100vw-2rem)] text-sm text-[#777780] sm:max-w-none">
            Monitor the AI agents embedded across your sites.
          </p>
        </div>
        <Link
          href="/new-agent"
          className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-[#111111] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#222222]"
        >
          <Plus size={15} strokeWidth={2.5} />
          New agent
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-10 gap-2 rounded-xl bg-white px-3 shadow-sm">
            <Filter size={16} />
            Filter
          </Button>
          <Button variant="outline" className="h-10 gap-2 rounded-xl bg-white px-3 shadow-sm">
            <SlidersHorizontal size={16} />
            Display
          </Button>
        </div>
        <div className="flex gap-2 sm:min-w-[360px]">
          <label className="relative block w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9a9aa2]" />
            <input
              className="h-10 w-full rounded-xl border border-black/[0.1] bg-white pl-9 pr-3 text-sm shadow-sm outline-none transition placeholder:text-[#9a9aa2] focus:border-black/25 focus:ring-3 focus:ring-black/[0.05]"
              placeholder="Search by agent or URL"
            />
          </label>
          <Button variant="outline" size="icon" className="size-10 rounded-xl bg-white shadow-sm">
            <MoreVertical size={17} />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {agents.map((agent, index) => {
          const id = String(agent._id);
          const href = `/dashboard/${agent.slug}`;
          const createdLabel = getCreatedLabel(agent, index);

          return (
            <article
              key={id}
              className="grid min-h-[112px] grid-cols-1 gap-4 rounded-2xl border border-black/[0.08] bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,17,17,0.04)] transition hover:border-black/[0.14] hover:shadow-[0_14px_40px_rgba(17,17,17,0.07)] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6"
            >
              <Link href={href} className="flex min-w-0 items-center gap-4">
                <div className="grid size-16 shrink-0 place-items-center rounded-full border border-black/[0.12] bg-white shadow-[0_0_0_4px_rgba(17,17,17,0.02)]">
                  <Bot size={22} className="text-[#33333a]" />
                </div>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-lg font-semibold tracking-normal text-[#222226]">
                      {agent.name}
                    </p>
                    <Copy size={16} className="shrink-0 text-[#6f6f76]" />
                  </div>
                  <div className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#777780]">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <ExternalLink size={14} className="shrink-0" />
                      <span className="truncate">
                        {agent.websiteUrl ?? "No website connected"}
                      </span>
                    </span>
                    <span className="hidden text-[#c2c2c8] sm:inline">/</span>
                    <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                      <CheckCircle2 size={14} />
                      Live
                    </span>
                    <span className="hidden text-[#c2c2c8] sm:inline">/</span>
                    <span>{createdLabel}</span>
                  </div>
                </div>
              </Link>

              <div className="flex shrink-0 items-center gap-2 pl-20 sm:pl-0">
                <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/[0.08] bg-white px-3 text-sm font-semibold text-[#5f5f68] shadow-sm">
                  <Sparkles size={16} />
                  0 chats
                </span>
                <AgentRowActions />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function getCreatedLabel(agent: AgentListItem, fallbackIndex: number) {
  if ("_creationTime" in agent && typeof agent._creationTime === "number") {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
    }).format(agent._creationTime);
  }

  return fallbackIndex === 0 ? "May 11" : "May 13";
}
