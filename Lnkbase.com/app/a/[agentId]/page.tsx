import { notFound } from "next/navigation";
import { Bot } from "lucide-react";
import { getAgent } from "@/lib/agents";
import { PublicAgent } from "./public-agent";

export default async function PublicAgentPage({ params }: { params: { agentId: string } }) {
  const agent = await getAgent(params.agentId);

  if (!agent) {
    notFound();
  }

  return (
    <main className="shell">
      <section className="panel" style={{ maxWidth: 760, margin: "36px auto" }}>
        <div className="agent-main" style={{ marginBottom: 22 }}>
          <span className="agent-icon">
            <Bot size={25} />
          </span>
          <div>
            <h1 className="agent-name">{agent.name}</h1>
            <p className="agent-desc">{agent.description}</p>
          </div>
        </div>
        <PublicAgent agentId={agent.id} />
      </section>
    </main>
  );
}
