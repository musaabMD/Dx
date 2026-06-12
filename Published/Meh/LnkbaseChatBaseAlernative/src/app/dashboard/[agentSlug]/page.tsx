import { DashboardShell } from "@/components/dashboard-shell";
import { AgentDetail } from "@/components/agent-detail";

export const dynamic = "force-dynamic";

export default async function AgentWorkspacePage({
  params,
}: {
  params: Promise<{ agentSlug: string }>;
}) {
  const { agentSlug } = await params;

  return (
    <DashboardShell title="Chatbot" backHref="/dashboard">
      <AgentDetail agentSlug={agentSlug} />
    </DashboardShell>
  );
}
