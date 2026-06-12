import { api } from "@convex/_generated/api";
import { DashboardShell } from "@/components/dashboard-shell";
import { PlaygroundWorkspace } from "@/components/playground-workspace";
import { getConvexClient } from "@/lib/convex-http";

export const dynamic = "force-dynamic";

export default async function AdminPlaygroundPage() {
  const agents = await getConvexClient().query(api.agents.list);
  const currentAgent = agents[0];
  const agentName = currentAgent?.name ?? "Lnkbase Assistant";
  const agentStatus = currentAgent?.status ?? "ready";
  const trainingSize = currentAgent?.summary
    ? `${Math.max(5, Math.round(currentAgent.summary.length / 12))} KB`
    : "5 KB";
  const instructions =
    currentAgent?.instructions ??
    "Create an agent to test live replies trained on your website, uploaded files, text, and Q&A sources.";

  return (
    <DashboardShell title="Admin Playground" agentCount={agents.length}>
      <PlaygroundWorkspace
        agentId={currentAgent?._id ? String(currentAgent._id) : undefined}
        agentName={agentName}
        agentStatus={agentStatus}
        currentModel={currentAgent?.model}
        instructions={instructions}
        suggestedQuestions={currentAgent?.suggestedQuestions}
        themeColor={currentAgent?.themeColor}
        trainingSize={trainingSize}
        welcomeMessage={currentAgent?.welcomeMessage}
      />
    </DashboardShell>
  );
}
