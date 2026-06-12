import Link from "next/link";
import { LayoutGrid, ListFilter, Plus, Search } from "lucide-react";
import { AgentList } from "../components";
import { getAgents } from "@/lib/agents";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const agents = await getAgents();

  return (
    <main className="shell">
      <div className="page-head">
        <div>
          <h1 className="page-title">My Agents</h1>
          <p className="page-subtitle">Create text agents, test prompts, and deploy each one as an API endpoint or public page.</p>
        </div>
        <Link className="button primary" href="/agents/new">
          <Plus size={18} /> Add New
        </Link>
      </div>

      <div className="toolbar">
        <div style={{ position: "relative" }}>
          <Search size={18} style={{ left: 14, position: "absolute", top: 14, color: "#777" }} />
          <input className="searchbox" placeholder="Search agents" style={{ paddingLeft: 42 }} />
        </div>
        <button className="button icon" title="Grid view">
          <LayoutGrid size={18} />
        </button>
        <button className="button icon" title="List filters">
          <ListFilter size={18} />
        </button>
      </div>

      <AgentList agents={agents} />
    </main>
  );
}
