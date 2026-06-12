import { notFound } from "next/navigation";
import { AgentForm, AgentNav } from "../../components";
import { updateAgentAction } from "@/lib/actions";
import { getAgent } from "@/lib/agents";

export default async function AgentBuilderPage({ params }: { params: { agentId: string } }) {
  const agent = await getAgent(params.agentId);

  if (!agent) {
    notFound();
  }

  return (
    <main className="shell">
      <div className="page-head">
        <div>
          <h1 className="page-title">{agent.name}</h1>
          <p className="page-subtitle">{agent.description || "Configure this agent's behavior, model, rules, input, and output shape."}</p>
        </div>
      </div>
      <AgentNav agent={agent} />
      <AgentForm action={updateAgentAction.bind(null, agent.id)} agent={agent} />
    </main>
  );
}
