import Link from "next/link";
import { PricingCards } from "@/components/pricing-cards";
import { SiteHeader } from "@/components/site-header";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white text-[#111111]">
      <SiteHeader />
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6b5cff]">Pricing</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-tight">Choose your plan</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#62626b]">
              Start free, then upgrade when you need more message credits, integrations, analytics, and team controls.
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-black/10 bg-[#f7f7f4] p-1">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-sm">Yearly</span>
            <span className="px-4 py-2 text-sm font-semibold text-[#ef6a45]">20% off</span>
          </div>
        </div>
        <div className="mt-10">
          <PricingCards />
        </div>
        <div className="mt-12 rounded-2xl border border-black/10 bg-[#fafaf7] p-6 sm:flex sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold">Not ready for a paid plan?</h2>
            <p className="mt-2 text-sm text-[#686871]">Create an agent with the free plan and test the full setup flow.</p>
          </div>
          <Link href="/new-agent" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-[#111111] px-5 text-sm font-semibold text-white sm:mt-0">
            Continue for free
          </Link>
        </div>
      </section>
    </main>
  );
}
