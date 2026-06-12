import Link from "next/link";
import { Check, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    detail: "50 message credits/month",
    cta: "Continue for free",
    href: "/new-agent",
    features: ["1 member", "400 KB per AI agent", "Embed on sites", "Quick prompts"],
  },
  {
    name: "Hobby",
    price: "$32",
    detail: "500 message credits/month",
    cta: "Subscribe",
    href: "/new-agent",
    features: ["2 members", "10 MB per AI agent", "Integrations", "Basic analytics"],
  },
  {
    name: "Standard",
    price: "$120",
    detail: "4,000 message credits/month",
    cta: "Subscribe",
    href: "/new-agent",
    popular: true,
    features: ["3 members", "20 MB per AI agent", "Help desk", "Voice", "API access", "Advanced integrations"],
  },
  {
    name: "Pro",
    price: "$400",
    detail: "15,000 message credits/month",
    cta: "Subscribe",
    href: "/new-agent",
    features: ["5 members", "40 MB per AI agent", "Advanced analytics", "12 AI actions"],
  },
];

export function PricingCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={`relative rounded-2xl bg-white p-2 shadow-sm ${
            plan.popular ? "border-[#6b5cff] ring-4 ring-[#6b5cff]/10" : "border-black/10"
          }`}
        >
          {plan.popular && (
            <Badge variant="secondary" className="absolute right-5 top-5 bg-[#efeaff] text-[#5a4cf4]">
              Popular
            </Badge>
          )}
          <CardHeader>
            <CardTitle className="text-xl font-semibold">{plan.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-tight">{plan.price}</span>
              <span className="pb-2 text-sm font-medium text-[#777781]">/month</span>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-[#565661]">
              <MessageSquare size={16} />
              {plan.detail}
            </p>
            <Link
              href={plan.href}
              className={cn(
                buttonVariants({ variant: plan.popular ? "default" : "outline", size: "lg" }),
                "mt-6 min-h-11 w-full rounded-full",
                plan.popular && "bg-[#111111] text-white hover:bg-[#2b2b2b]"
              )}
            >
              {plan.cta}
            </Link>
            <div className="mt-7 space-y-3 border-t border-black/10 pt-6">
              {plan.features.map((feature) => (
                <p key={feature} className="flex items-center gap-3 text-sm text-[#565661]">
                  <Check size={16} className="text-[#6b5cff]" />
                  {feature}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="rounded-2xl border-black/10 bg-[#111111] p-2 text-white shadow-sm lg:col-span-4">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <CardContent>
            <h2 className="text-xl font-semibold">Enterprise</h2>
            <p className="mt-4 text-5xl font-semibold tracking-tight">Let&apos;s talk</p>
            <p className="mt-4 text-white/65">Higher limits, SSO, white-labeling, audit logs, priority support, and HIPAA eligible workflows.</p>
          </CardContent>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {["Higher limits", "Custom roles", "SSO", "White-labeling", "Audit logs", "HIPAA eligible"].map((feature) => (
              <div key={feature} className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold">
                {feature === "SSO" ? <ShieldCheck size={16} /> : <Users size={16} />}
                {feature}
              </div>
            ))}
            <Link href="/auth/sign-up" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-4 text-sm font-semibold text-[#111111]">
              Contact us
            </Link>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
