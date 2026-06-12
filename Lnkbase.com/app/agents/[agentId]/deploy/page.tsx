import { notFound } from "next/navigation";
import { AgentNav } from "../../../components";
import { getAgent } from "@/lib/agents";

export default async function DeployAgentPage({ params }: { params: { agentId: string } }) {
  const agent = await getAgent(params.agentId);

  if (!agent) {
    notFound();
  }

  const apiEndpoint = `/api/agents/${agent.id}/run`;
  const publicPage = `/a/${agent.id}`;
  const widget = `<script src="${process.env.NEXT_PUBLIC_APP_URL || "https://yourapp.com"}/widget.js" data-agent="${agent.id}"></script>`;

  return (
    <main className="shell">
      <div className="page-head">
        <div>
          <h1 className="page-title">Deploy {agent.name}</h1>
          <p className="page-subtitle">Each agent gets a local API route, a public page, and a placeholder widget snippet.</p>
        </div>
      </div>
      <AgentNav agent={agent} />
      <div className="grid">
        <section className="panel">
          <h2 style={{ marginTop: 0 }}>API Endpoint</h2>
          <pre className="code">POST {apiEndpoint}{`\n\n`}{`{ "input": "Your text here" }`}</pre>
        </section>
        <aside className="panel">
          <h2 style={{ marginTop: 0 }}>Public Page</h2>
          <pre className="code">{publicPage}</pre>
          <h2>Chat Widget</h2>
          <pre className="code">{widget}</pre>
        </aside>
      </div>
    </main>
  );
}
