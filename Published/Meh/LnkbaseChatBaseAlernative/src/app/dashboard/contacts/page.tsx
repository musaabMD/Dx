import { DashboardShell } from "@/components/dashboard-shell";
import { Button } from "@/components/ui/button";
import { Bot, Filter, Globe2, Link2, MessageCircle, Search, Settings, Sparkles, TrendingUp, Users } from "lucide-react";

const audience = [
  { name: "Musaab R", country: "Saudi Arabia", agent: "Drnote", created: "May 19, 2026", chats: 4, source: "drnote.co", visits: 5 },
  {
    name: "Emma Carter",
    country: "United States",
    agent: "Example",
    created: "May 13, 2026",
    chats: 2,
    source: "google.com",
    visits: 2,
  },
  {
    name: "Isabella Garcia",
    country: "Spain",
    agent: "Drnote",
    created: "May 11, 2026",
    chats: 1,
    source: "(direct)",
    visits: 1,
  },
];

export default function ContactsPage() {
  const totalChats = audience.reduce((sum, visitor) => sum + visitor.chats, 0);
  const totalVisits = audience.reduce((sum, visitor) => sum + visitor.visits, 0);
  const returningVisitors = audience.filter((visitor) => visitor.visits > 1).length;
  const topCountry = audience[0].country;
  const topAgent = audience[0].agent;
  const sourceBreakdown = audience.map((visitor) => ({
    source: visitor.source,
    visitors: 1,
    visits: visitor.visits,
    percentage: Math.round((visitor.visits / totalVisits) * 100),
  }));
  const insightCards = [
    { label: "Top source", value: sourceBreakdown[0].source, detail: `${sourceBreakdown[0].percentage}% of visits`, icon: Link2 },
    { label: "Returning", value: `${returningVisitors}/${audience.length}`, detail: "visitors came back", icon: TrendingUp },
    { label: "Avg. chats", value: (totalChats / audience.length).toFixed(1), detail: "per visitor", icon: MessageCircle },
  ];
  const stats = [
    { label: "Visitors", value: audience.length.toString(), detail: "tracked audience", icon: Users },
    { label: "Chats", value: totalChats.toString(), detail: "across all visitors", icon: MessageCircle },
    { label: "Top country", value: topCountry, detail: "highest activity", icon: Globe2 },
    { label: "Top agent", value: topAgent, detail: "most conversations", icon: Bot },
  ];

  return (
    <DashboardShell title="Audience">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-black/[0.08] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-[#777780]">{stat.label}</span>
                <span className="grid size-8 place-items-center rounded-lg bg-[#f4f4f2] text-[#4c4c55]">
                  <stat.icon size={16} />
                </span>
              </div>
              <div className="mt-3 truncate text-2xl font-semibold tracking-normal text-[#111111]">{stat.value}</div>
              <div className="mt-1 text-sm text-[#8b8b93]">{stat.detail}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" className="h-9 gap-2 bg-white px-3">
            <Filter size={16} />
            Filter
          </Button>
          <label className="relative block w-full sm:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9a9aa2]" />
            <input
              className="h-9 w-full rounded-lg border border-black/[0.1] bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-[#9a9aa2] focus:border-black/25 focus:ring-3 focus:ring-black/[0.05]"
              placeholder="Search by visitor or agent"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-xl border border-black/[0.09] bg-white">
          <div className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr_44px] border-b border-black/[0.07] text-sm font-semibold text-[#8b8b93]">
            <div className="px-4 py-3">Audience</div>
            <div className="px-4 py-3">Country</div>
            <div className="px-4 py-3">Agent</div>
            <div className="px-4 py-3">Created</div>
            <div className="px-4 py-3">Activity</div>
            <div className="grid place-items-center py-3">
              <Settings size={16} />
            </div>
          </div>
          <div className="divide-y divide-black/[0.05]">
            {audience.map(({ name, country, agent, created, chats }) => (
              <div key={name} className="grid grid-cols-[1.3fr_1fr_1fr_1fr_1fr_44px] items-center text-sm">
                <div className="flex items-center gap-3 px-4 py-3 font-medium">
                  <div className="grid size-7 place-items-center rounded-full bg-[#f3f5f7] text-xs">
                    {name.charAt(0)}
                  </div>
                  {name}
                </div>
                <div className="px-4 py-3 text-[#66666e]">{country}</div>
                <div className="flex items-center gap-2 px-4 py-3 text-[#3f3f46]">
                  <Sparkles size={15} className="text-[#9a9aa2]" />
                  {agent}
                </div>
                <div className="px-4 py-3 text-[#777780]">{created}</div>
                <div className="px-4 py-3 text-[#3f3f46]">
                  {chats} {chats === 1 ? "chat" : "chats"}
                </div>
                <div className="px-4 py-3 text-center text-[#b0b0b8]">...</div>
              </div>
            ))}
          </div>
          <div className="border-t border-black/[0.06] px-4 py-5 sm:px-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Audience insights</h2>
                <p className="mt-1 text-sm leading-6 text-[#777780]">
                  Understand who is talking to your agents, which sites they came from, and how often they return.
                </p>
              </div>
              <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Available
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {insightCards.map((insight) => (
                <div key={insight.label} className="rounded-lg border border-black/[0.08] bg-[#fbfbfa] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[#777780]">{insight.label}</span>
                    <span className="grid size-8 place-items-center rounded-lg bg-white text-[#4c4c55]">
                      <insight.icon size={16} />
                    </span>
                  </div>
                  <div className="mt-3 truncate text-2xl font-semibold tracking-normal text-[#111111]">{insight.value}</div>
                  <div className="mt-1 text-sm text-[#8b8b93]">{insight.detail}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="mb-3 text-sm font-semibold text-[#3f3f46]">Site sources</div>
                <div className="space-y-3">
                  {sourceBreakdown.map((source) => (
                    <div key={source.source}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-[#3f3f46]">{source.source}</span>
                        <span className="text-[#777780]">
                          {source.visits} {source.visits === 1 ? "visit" : "visits"}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#eeeeec]">
                        <div className="h-full rounded-full bg-[#111111]" style={{ width: `${source.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-sm font-semibold text-[#3f3f46]">Visitor frequency</div>
                <div className="divide-y divide-black/[0.06] rounded-lg border border-black/[0.08]">
                  {audience.map((visitor) => (
                    <div key={visitor.name} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                      <span className="font-medium text-[#3f3f46]">{visitor.name}</span>
                      <span className="text-[#777780]">
                        {visitor.visits} {visitor.visits === 1 ? "visit" : "visits"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
