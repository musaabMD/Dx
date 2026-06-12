import { DashboardGate } from "@/components/dashboard-gate";
import { DashboardInstalledApps } from "@/components/dashboard-installed-apps";
import { SiteHeader } from "@/components/site-header";

export default function DashboardPage() {
  return (
    <DashboardGate>
      <main className="min-h-screen bg-white">
        <SiteHeader />
        <section className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-16">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900">Dashboard</h1>
          </div>
          <DashboardInstalledApps />
        </section>
      </main>
    </DashboardGate>
  );
}
