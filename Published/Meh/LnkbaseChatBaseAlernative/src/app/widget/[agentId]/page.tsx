import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { getConvexClient } from "@/lib/convex-http";
import { PublicWidget } from "@/components/public-widget";

export const dynamic = "force-dynamic";

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;
  const convex = getConvexClient();
  const agent = await convex.query(api.agents.get, {
    agentId: agentId as Id<"agents">,
  });

  return <PublicWidget agentId={agentId} title={agent?.name ?? "AI Assistant"} />;
}
