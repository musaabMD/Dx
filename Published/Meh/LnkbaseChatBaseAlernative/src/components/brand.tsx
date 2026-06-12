import Link from "next/link";

export function LnkbaseMark({ light = false }: { light?: boolean }) {
  return (
    <div
      className={`relative grid size-10 place-items-center rounded-[13px] ${
        light ? "bg-white" : "bg-[#111111]"
      } shadow-sm`}
    >
      <div className="relative size-6">
        <span className="absolute left-0 top-[6px] size-4 rounded-full border-[5px] border-[#7060ff] border-r-transparent" />
        <span
          className={`absolute right-0 top-[6px] size-4 rounded-full border-[5px] ${
            light ? "border-[#111111]" : "border-white"
          } border-l-transparent`}
        />
        <span
          className={`absolute left-[6px] top-[6px] size-3.5 rounded-full ${
            light ? "bg-white" : "bg-[#111111]"
          }`}
        />
      </div>
    </div>
  );
}

export function BrandLink({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <LnkbaseMark light={light} />
      <span className={`${compact ? "text-base" : "text-xl"} font-semibold ${light ? "text-white" : "text-[#111111]"}`}>
        Lnkbase
      </span>
    </Link>
  );
}
