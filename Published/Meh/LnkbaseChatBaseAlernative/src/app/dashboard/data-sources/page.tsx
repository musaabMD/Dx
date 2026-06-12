import { DashboardShell } from "@/components/dashboard-shell";

const sources = ["Website", "Files", "Text snippets", "Q&A", "Notion", "Tickets", "Suggestions"];

export default function DataSourcesPage() {
  return (
    <DashboardShell title="Data sources" eyebrow="Knowledge base">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => (
          <section key={source} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold">{source}</h2>
            <p className="mt-3 text-sm leading-6 text-[#71717a]">Add, retrain, review, and remove {source.toLowerCase()} content from the agent knowledge base.</p>
            <button className="mt-6 rounded-full border border-black/10 px-4 py-2 text-sm font-semibold">Manage</button>
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}
