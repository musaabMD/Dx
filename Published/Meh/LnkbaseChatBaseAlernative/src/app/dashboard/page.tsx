import { AgentsDashboard } from "@/components/agents-dashboard";
import { DashboardShell } from "@/components/dashboard-shell";
import { api } from "@convex/_generated/api";
import { getConvexClient } from "@/lib/convex-http";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const agents = await getConvexClient().query(api.agents.list);

  return (
    <DashboardShell title="Lnkbase" agentCount={agents.length} showSidebar={false}>
      <AgentsDashboard agents={agents} />
    </DashboardShell>
  );
}
