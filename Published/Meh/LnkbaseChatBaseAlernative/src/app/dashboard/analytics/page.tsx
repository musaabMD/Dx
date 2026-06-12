import { DashboardShell } from "@/components/dashboard-shell";

const metrics = [
  { label: "Chats", value: "6,215", color: "bg-[#8fb1f4]" },
  { label: "Leads", value: "736", color: "bg-[#a78bfa]" },
  { label: "Resolutions", value: "91%", color: "bg-[#8dd7c8]" },
];

export default function AnalyticsPage() {
  const points = [62, 42, 54, 35, 58, 71, 34, 49, 66, 53, 74, 61, 39, 47, 68, 55, 52, 63];
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${(index / (points.length - 1)) * 100} ${100 - point}`)
    .join(" ");
  const areaPath = `${path} L 100 100 L 0 100 Z`;

  return (
    <DashboardShell title="Analytics">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-xl border border-black/[0.09] bg-white">
          <div className="grid md:grid-cols-3">
            {metrics.map((metric, index) => (
              <button
                key={metric.label}
                className={`min-h-32 border-b border-black/[0.07] p-6 text-left transition hover:bg-[#fafafa] md:border-b-0 ${
                  index !== 0 ? "md:border-l md:border-black/[0.07]" : "border-b-2 border-b-black"
                }`}
              >
                <span className="flex items-center gap-2 text-base font-medium text-[#5f6675]">
                  <span className={`size-2.5 rounded-sm ${metric.color}`} />
                  {metric.label}
                </span>
                <span className="mt-4 block text-4xl font-semibold">{metric.value}</span>
              </button>
            ))}
          </div>
          <div className="relative h-[430px] border-t border-black/[0.07] p-8">
            <div className="absolute inset-x-8 top-12 h-px border-t border-dashed border-black/[0.12]" />
            <div className="absolute inset-x-8 top-[38%] h-px border-t border-dashed border-black/[0.12]" />
            <div className="absolute inset-x-8 top-[64%] h-px border-t border-dashed border-black/[0.12]" />
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full overflow-visible">
              <defs>
                <linearGradient id="chat-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7ea6f2" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#7ea6f2" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#chat-area)" />
              <path d={path} fill="none" stroke="#6695ee" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
              <circle cx="58.8" cy="45" r="1.1" fill="#6695ee" vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="absolute left-[55%] top-[96px] w-44 rounded-xl border border-black/[0.12] bg-white shadow-sm">
              <div className="border-b border-black/[0.07] px-4 py-3 text-sm font-semibold">May 19, 2026</div>
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="flex items-center gap-2 text-[#5f6675]">
                  <span className="size-2.5 rounded-sm bg-[#8fb1f4]" />
                  Chats
                </span>
                <span className="font-semibold">4,293</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
