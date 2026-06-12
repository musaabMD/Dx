import { DashboardShell } from "@/components/dashboard-shell";

const actions = ["Collect leads", "Escalations", "Custom actions", "Suggested messages", "Stripe", "Shopify", "Slack", "Cal"];

export default function ActionsPage() {
  return (
    <DashboardShell title="Actions" eyebrow="Automation">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <section key={action} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{action}</h2>
            <p className="mt-3 text-sm leading-6 text-[#71717a]">Let the chatbot collect data or trigger workflows when visitors need help.</p>
            <button className="mt-6 rounded-full bg-[#111111] px-4 py-2 text-sm font-semibold text-white">Configure</button>
          </section>
        ))}
      </div>
    </DashboardShell>
  );
}
