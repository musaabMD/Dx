import Link from "next/link";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "$0",
    body: "Explore Lnkbase products and keep a personal workspace.",
    features: ["All product previews", "Personal dashboard", "Community support"],
  },
  {
    name: "Pro",
    price: "$12",
    body: "A cleaner account for people using Lnkbase every day.",
    features: ["Unlimited products", "Shared workspaces", "Priority support"],
  },
  {
    name: "Team",
    price: "$29",
    body: "Simple product access and admin controls for small teams.",
    features: ["Team seats", "Admin controls", "Usage reporting"],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <SiteHeader />
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-20 text-center sm:pt-28">
        <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
          Simple pricing.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-xl leading-8 text-zinc-500">
          Start free, then choose the account that fits how you use Lnkbase.
        </p>

        <div className="mt-14 grid gap-4 text-left md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{plan.name}</h2>
              <div className="mt-5 flex items-end gap-1">
                <span className="text-4xl font-bold tracking-tight text-zinc-900">
                  {plan.price}
                </span>
                <span className="pb-1 text-sm text-zinc-500">/mo</span>
              </div>
              <p className="mt-4 min-h-12 text-sm leading-6 text-zinc-500">{plan.body}</p>
              <ul className="mt-6 flex flex-col gap-3 text-sm text-zinc-700">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-zinc-900" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button render={<Link href="/signup" />} nativeButton={false}>
            Sign up
          </Button>
        </div>
      </section>
    </main>
  );
}
