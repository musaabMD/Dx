import { DashboardShell } from "@/components/dashboard-shell";

const fields = ["Agent name", "Welcome message", "Fallback message", "Language", "Tone", "Widget color"];

export default function SettingsPage() {
  return (
    <DashboardShell title="Settings">
      <div className="max-w-2xl rounded-2xl border border-black/[0.08] bg-white">
        <div className="border-b border-black/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold">Agent settings</h2>
        </div>
        <div className="space-y-5 p-6">
          {fields.map((field) => (
            <label key={field} className="block">
              <span className="text-sm font-semibold">{field}</span>
              <input
                className="mt-1.5 h-10 w-full rounded-xl border border-black/[0.1] px-4 text-sm outline-none focus:border-[#5b4cf5] focus:ring-2 focus:ring-[#5b4cf5]/10"
                defaultValue={field === "Agent name" ? "DrNote" : ""}
              />
            </label>
          ))}
          <button className="h-9 rounded-lg bg-[#111111] px-5 text-sm font-semibold text-white transition hover:bg-[#222222]">
            Save settings
          </button>
        </div>
      </div>
    </DashboardShell>
  );
}
