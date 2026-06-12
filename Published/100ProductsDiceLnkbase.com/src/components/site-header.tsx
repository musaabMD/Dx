import { AuthNav } from "@/components/auth-nav";
import { Brand } from "@/components/brand";

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-3 z-50 px-3">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl border border-zinc-200/80 bg-white/90 px-3 shadow-[0_12px_40px_rgba(24,24,27,0.08)] backdrop-blur-xl sm:px-4">
        <Brand />
        <AuthNav />
      </div>
    </header>
  );
}
