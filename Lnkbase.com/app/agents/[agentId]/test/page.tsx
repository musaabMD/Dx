import { notFound } from "next/navigation";
import { AgentNav } from "../../../components";
import { getAgent } from "@/lib/agents";
import { RunTester } from "./run-tester";

export default async function TestAgentPage({ params }: { params: { agentId: string } }) {
  const agent = await getAgent(params.agentId);

  if (!agent) {
    notFound();
  }

  return (
    <main className="shell">
      <div className="page-head">
        <div>
          <h1 className="page-title">Test {agent.name}</h1>
          <p className="page-subtitle">Run a sample message through the current prompt and model.</p>
        </div>
      </div>
      <AgentNav agent={agent} />
      <RunTester agentId={agent.id} />
    </main>
  );
}
