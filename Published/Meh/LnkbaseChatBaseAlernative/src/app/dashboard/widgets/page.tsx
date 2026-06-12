import { DashboardShell } from "@/components/dashboard-shell";

const widgets = ["Pricing table", "Order tracker", "Product card", "Contact form", "Lead capture form", "Demo booking form"];

export default function WidgetsPage() {
  return (
    <DashboardShell title="Integrations">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-[#6c6c76]">Connect your chatbot to tools and embed it anywhere.</p>
        <button className="h-9 rounded-lg bg-[#111111] px-4 text-sm font-semibold text-white transition hover:bg-[#222222]">
          Create widget
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {widgets.map((widget) => (
          <button key={widget} className="min-h-24 rounded-2xl border border-black/[0.08] bg-white p-5 text-left text-sm font-semibold transition hover:border-[#5b4cf5]/30 hover:bg-[#f9f7ff]">
            {widget}
          </button>
        ))}
      </div>
    </DashboardShell>
  );
}
