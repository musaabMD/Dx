import { AgentForm } from "../../components";
import { createAgentAction } from "@/lib/actions";

export default function NewAgentPage() {
  return (
    <main className="shell">
      <div className="page-head">
        <div>
          <h1 className="page-title">New Agent</h1>
          <p className="page-subtitle">Start with a text agent. PDF upload and extraction can be added after this base works.</p>
        </div>
      </div>
      <AgentForm action={createAgentAction} submitLabel="Create Agent" />
    </main>
  );
}
