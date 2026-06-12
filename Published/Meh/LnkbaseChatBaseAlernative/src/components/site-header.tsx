import Link from "next/link";
import { BrandLink } from "./brand";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  ["Pricing", "/pricing"],
  ["Dashboard", "/dashboard"],
];

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`sticky top-0 z-30 backdrop-blur-xl ${dark ? "bg-[#0e0e10]/90 border-b border-white/8" : "bg-white/90"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandLink light={dark} />
        <nav className={`hidden items-center gap-6 text-sm font-medium md:flex ${dark ? "text-[#71717a]" : "text-[#575760]"}`}>
          {nav.map(([label, href]) => (
            <Link key={label} href={href} className={`transition ${dark ? "hover:text-white" : "hover:text-[#111111]"}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/auth/sign-in"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              dark
                ? "rounded-lg px-4 text-white/60 hover:bg-white/8 hover:text-white"
                : "rounded-lg border-black/15 bg-white px-4 text-[#303039] shadow-sm hover:border-black/25 hover:bg-[#f7f7f4]"
            )}
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-up"
            className={cn(
              buttonVariants({ size: "lg" }),
              dark
                ? "min-h-11 rounded-lg bg-white px-5 text-[#0e0e10] hover:bg-white/90"
                : "min-h-11 rounded-lg bg-[#111111] px-5 text-white shadow-sm hover:bg-[#2b2b2b]"
            )}
          >
            <span className="sm:hidden">Start free</span>
            <span className="hidden sm:inline">Start for free</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
