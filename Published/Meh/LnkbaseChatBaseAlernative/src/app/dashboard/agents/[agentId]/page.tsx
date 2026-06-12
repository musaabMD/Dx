import { DashboardShell } from "@/components/dashboard-shell";
import { AgentDetail } from "@/components/agent-detail";

export const dynamic = "force-dynamic";

export default async function AgentDetailsPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  return (
    <DashboardShell title="Chatbot" backHref="/dashboard">
      <AgentDetail agentId={agentId} />
    </DashboardShell>
  );
}
