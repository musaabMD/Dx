import Link from "next/link";
import { Bot, Code2, Database, MessageSquareText, Rocket } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { getConvexClient } from "@/lib/convex-http";

type AgentDetailsViewModel = {
  agent: {
    _id: string;
    name: string;
    slug?: string;
    status: string;
    websiteUrl?: string;
  };
  sources: Array<{
    _id: string;
    content: string;
    title: string;
    type: string;
  }>;
  conversations: unknown[];
  leads: unknown[];
};

type AgentDetailProps =
  | {
      agentId: string;
      agentSlug?: never;
    }
  | {
      agentId?: never;
      agentSlug: string;
    };

export async function AgentDetail({ agentId, agentSlug }: AgentDetailProps) {
  const convex = getConvexClient();
  let storedDetails: Awaited<ReturnType<typeof convex.query<typeof api.agents.getDetails>>> | null = null;

  try {
    const resolvedStoredAgentId = agentSlug
      ? String(
          (await convex.query(api.agents.list)).find(
            (agent) => agent.slug === agentSlug
          )?._id ?? ""
        )
      : agentId;

    storedDetails = resolvedStoredAgentId
      ? await convex.query(api.agents.getDetails, {
          agentId: resolvedStoredAgentId as Id<"agents">,
        })
      : null;
  } catch {
    storedDetails = null;
  }
  const details: AgentDetailsViewModel | null = storedDetails
    ? {
        agent: {
          _id: String(storedDetails.agent._id),
          name: storedDetails.agent.name,
          slug: storedDetails.agent.slug,
          status: storedDetails.agent.status,
          websiteUrl: storedDetails.agent.websiteUrl,
        },
        sources: storedDetails.sources.map((source) => ({
          _id: String(source._id),
          content: source.content,
          title: source.title,
          type: source.type,
        })),
        conversations: storedDetails.conversations,
        leads: storedDetails.leads,
      }
    : agentSlug
      ? getDemoAgentDetails(agentSlug)
      : null;
  const resolvedAgentId = details ? details.agent._id : agentId ?? agentSlug;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const embedCode = `<script src="${appUrl}/embed/${resolvedAgentId}" async></script>`;

  if (!details) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-black/[0.08] bg-white py-20 text-center">
        <h2 className="text-base font-semibold">Chatbot not found</h2>
        <Link href="/dashboard" className="mt-4 text-sm font-semibold text-[#5b4cf5] hover:underline">
          Back to chatbots
        </Link>
      </div>
    );
  }

  const { agent, sources, conversations, leads } = details;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-black/[0.08] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#111111]">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{agent.name}</h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                {agent.status}
              </span>
            </div>
            {agent.websiteUrl && (
              <p className="mt-0.5 text-sm text-[#888890]">{agent.websiteUrl}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/playground"
            className="inline-flex h-9 items-center rounded-lg border border-black/[0.1] px-4 text-sm font-semibold transition hover:bg-black/[0.03]"
          >
            Test in playground
          </Link>
          <a
            href={`/widget/${resolvedAgentId}`}
            target="_blank"
            className="inline-flex h-9 items-center rounded-lg bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-[#222222]"
          >
            Open widget
          </a>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={Database} label="Sources" value={sources.length} />
        <Metric icon={MessageSquareText} label="Conversations" value={conversations.length} />
        <Metric icon={Rocket} label="Leads" value={leads.length} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <div className="rounded-2xl border border-black/[0.08] bg-white">
          <div className="border-b border-black/[0.06] px-6 py-4">
            <h3 className="text-sm font-semibold">Training sources</h3>
          </div>
          <div className="divide-y divide-black/[0.06] p-4">
            {sources.length === 0 ? (
              <p className="py-6 text-center text-sm text-[#888890]">No sources attached yet.</p>
            ) : (
              sources.map((source) => (
                <div key={source._id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{source.title}</p>
                    <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 text-xs font-medium text-[#5c5c66]">
                      {source.type}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-[#888890]">{source.content}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-black/[0.08] bg-white">
          <div className="border-b border-black/[0.06] px-6 py-4">
            <h3 className="text-sm font-semibold">Embed on your site</h3>
          </div>
          <div className="p-6">
            <p className="text-sm leading-6 text-[#6c6c76]">
              Paste this script before the closing body tag. It injects a floating chat bubble connected to this chatbot.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-[#111111] p-4 text-xs leading-6 text-white">
              <code>{embedCode}</code>
            </pre>
            <div className="mt-4 rounded-xl border border-black/[0.08] p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5c5c66]">
                <Code2 size={14} />
                Public chat endpoint
              </div>
              <p className="mt-1.5 break-all text-xs text-[#888890]">
                {appUrl}/api/widget/{resolvedAgentId}/chat
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Database; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
      <Icon size={18} className="text-[#5b4cf5]" />
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-0.5 text-sm text-[#888890]">{label}</p>
    </div>
  );
}

function getDemoAgentDetails(slug: string): AgentDetailsViewModel | null {
  const demoAgents: Record<string, AgentDetailsViewModel> = {
    drnote: {
      agent: {
        _id: "drnote-demo",
        name: "Drnote",
        slug: "drnote",
        status: "ready",
        websiteUrl: "https://drnote.co",
      },
      sources: [
        {
          _id: "drnote-source",
          title: "Drnote website",
          type: "website",
          content:
            "Demo training source for a healthcare documentation assistant.",
        },
      ],
      conversations: [],
      leads: [],
    },
    example: {
      agent: {
        _id: "example-demo",
        name: "Example",
        slug: "example",
        status: "ready",
        websiteUrl: "https://example.com",
      },
      sources: [
        {
          _id: "example-source",
          title: "Example website",
          type: "website",
          content:
            "Demo training source for a general customer support assistant.",
        },
      ],
      conversations: [],
      leads: [],
    },
  };

  return (
    demoAgents[slug] ??
    Object.entries(demoAgents).find(([demoSlug]) =>
      slug.startsWith(`${demoSlug}-`)
    )?.[1] ??
    null
  );
}
