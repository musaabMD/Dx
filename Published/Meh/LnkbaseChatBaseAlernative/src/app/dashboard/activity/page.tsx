import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, Filter, Laptop, Link2, Settings, Sparkles } from "lucide-react";

const events = [
  ["Jun 2, 11:49 AM", "Drnote", "(direct)", "United States", "Desktop"],
  ["Jun 2, 11:46 AM", "Example", "drnote.co", "Saudi Arabia", "Mobile"],
  ["Jun 2, 11:42 AM", "Drnote", "google.com", "United Kingdom", "Desktop"],
];

export default function ActivityPage() {
  return (
    <DashboardShell title="Conversations">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            <Button variant="outline" className="h-9 gap-2 bg-white px-3">
              <Filter size={16} />
              Filter
            </Button>
            <Button variant="outline" className="h-9 gap-2 bg-white px-3">
              <Calendar size={16} />
              Last 24 hours
            </Button>
          </div>
          <Button variant="outline" className="h-9 gap-2 bg-white px-3">
            <BarChart3 size={16} />
            View Analytics
          </Button>
        </div>

        <div className="mb-5 grid gap-3 lg:grid-cols-3">
          {[
            ["Chats", "0"],
            ["Leads", "0"],
            ["Resolved", "0"],
          ].map(([label, value], index) => (
            <div
              key={label}
              className={`flex min-h-24 items-center justify-between rounded-xl border bg-white p-5 ${
                index === 0 ? "border-black ring-1 ring-black" : "border-black/[0.09]"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-[#5f6675]">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
              <div className="h-10 w-32 bg-linear-to-r from-[#8b5cf6]/20 to-[#ec4899]/20" />
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-black/[0.09] bg-white">
          <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_44px] border-b border-black/[0.07] text-sm font-semibold text-[#8b8b93]">
            <div className="px-4 py-3">Date</div>
            <div className="px-4 py-3">Agent</div>
            <div className="px-4 py-3">Referrer</div>
            <div className="px-4 py-3">Country</div>
            <div className="px-4 py-3">Device</div>
            <div className="grid place-items-center py-3">
              <Settings size={16} />
            </div>
          </div>
          <div className="divide-y divide-black/[0.05]">
            {events.map(([date, agent, referrer, country, device]) => (
              <div
                key={`${date}-${agent}`}
                className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_44px] items-center text-sm text-[#3f3f46]"
              >
                <div className="px-4 py-3 text-[#9a9aa2]">{date}</div>
                <div className="flex items-center gap-2 px-4 py-3 font-medium">
                  <Sparkles size={15} className="text-[#9a9aa2]" />
                  {agent}
                </div>
                <div className="flex items-center gap-2 px-4 py-3 text-[#7a7a82]">
                  <Link2 size={14} />
                  {referrer}
                </div>
                <div className="px-4 py-3">{country}</div>
                <div className="flex items-center gap-2 px-4 py-3 text-[#7a7a82]">
                  <Laptop size={15} />
                  {device}
                </div>
                <div className="px-4 py-3 text-center text-[#b0b0b8]">...</div>
              </div>
            ))}
          </div>
          <div className="flex min-h-[360px] flex-col items-center justify-center border-t border-black/[0.06] px-6 text-center">
            <div className="grid size-16 place-items-center rounded-xl border border-black/[0.08] bg-white shadow-sm">
              <Filter size={24} className="text-[#33333a]" />
            </div>
            <h2 className="mt-5 text-lg font-semibold">Real-time conversation stream</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-[#777780]">
              Watch live agent conversations, lead captures, and handoffs as they happen across your workspace.
            </p>
            <Button className="mt-5 bg-[#111111] text-white hover:bg-[#2b2b2b]">Upgrade to Business</Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
