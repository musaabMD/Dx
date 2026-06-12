import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2.5 no-underline">
      <span className="flex size-9 items-center justify-center rounded-[9px] border border-zinc-950 bg-white font-serif text-lg font-black leading-none text-zinc-950 shadow-[2px_2px_0_0_#18181b]">
        L
      </span>
      <span className="hidden text-lg font-semibold tracking-tight text-zinc-950 sm:inline">
        Lnkbase
      </span>
    </Link>
  );
}
