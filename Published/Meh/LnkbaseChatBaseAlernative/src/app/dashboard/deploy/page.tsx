import { DashboardShell } from "@/components/dashboard-shell";

export default function DeployPage() {
  return (
    <DashboardShell title="Deploy" eyebrow="Publish">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Website chat widget</h2>
          <p className="mt-2 text-sm text-[#71717a]">Paste this script before your closing body tag.</p>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-[#111111] p-5 text-sm text-white">
            {`<script src="https://cdn.lnkbase.ai/widget.js" data-agent-id="AGENT_ID"></script>`}
          </pre>
        </section>
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Agent page</h2>
          <p className="mt-2 text-sm text-[#71717a]">Share a hosted page when you do not want to embed a widget.</p>
          <div className="mt-5 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold">lnkbase.ai/agent/drnote</div>
        </section>
      </div>
    </DashboardShell>
  );
}
