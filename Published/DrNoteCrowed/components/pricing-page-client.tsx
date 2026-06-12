"use client";

import { PricingTable, useClerk, useUser } from "@clerk/nextjs";
import { ArrowLeft, Check, Crown, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import styles from "./pricing-page-client.module.css";

type BillingPlan = "monthly" | "quarterly" | "yearly";
type BillingPlanMeta = {
  id: BillingPlan;
  name: string;
  price: string;
  cadence: string;
  save: string | null;
};

const PLANS: BillingPlanMeta[] = [
  { id: "monthly", name: "Monthly", price: "$20", cadence: "/mo", save: null },
  { id: "quarterly", name: "3 months", price: "$50", cadence: "/3 mo", save: "Save 17%" },
  { id: "yearly", name: "Yearly", price: "$120", cadence: "/yr", save: "Save 50%" },
];

const FEATURES = [
  "Unlimited practice questions",
  "Ask AI for explanations when you are stuck",
  "Full timed mock exams with score reports",
  "Saved review, notes, and analytics",
];

export default function PricingPageClient() {
  const { isSignedIn } = useUser();
  const clerk = useClerk();
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan>("yearly");
  const selectedPlanInfo = PLANS.find((plan) => plan.id === selectedPlan) ?? PLANS[2];

  const startUpgrade = () => {
    clerk.openSignUp({
      fallbackRedirectUrl: "/pricing",
      forceRedirectUrl: "/pricing",
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="DrNote home">
            <span className={styles.brandMark}>D</span>
            <span className={styles.brandName}>DrNote</span>
          </Link>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={17} />
            Back home
          </Link>
        </header>

        <section className={styles.hero}>
          <h1>Upgrade to DrNote Pro</h1>
          <p>Go from 15 free questions a day to unlimited practice, AI help, and full mock exams.</p>
        </section>

        <section className={styles.card} aria-label="Choose DrNote Pro plan">
          <div className={styles.cardHead}>
            <span className={styles.proLabel}>
              <Crown size={15} />
              Pro
            </span>
            <div className={styles.priceLine}>
              <strong>{selectedPlanInfo.price}</strong>
              <span>{selectedPlanInfo.cadence}</span>
              <em>{selectedPlanInfo.name}</em>
            </div>
            {selectedPlanInfo.save && <p>{selectedPlanInfo.save}</p>}
          </div>

          <div className={styles.plans} role="radiogroup" aria-label="Billing period">
            {PLANS.map((plan) => (
              <button
                key={plan.id}
                type="button"
                role="radio"
                aria-checked={selectedPlan === plan.id}
                className={styles.planCard}
                data-active={selectedPlan === plan.id}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <span>
                  {selectedPlan === plan.id && <Check size={15} />}
                  {plan.name}
                </span>
                <strong>{plan.price}</strong>
                {plan.save && <em>{plan.save}</em>}
              </button>
            ))}
          </div>

          {isSignedIn ? (
            <div className={styles.clerkPricing}>
              <PricingTable />
            </div>
          ) : (
            <button type="button" className={styles.checkoutButton} onClick={startUpgrade}>
              <Check size={18} />
              Start Pro
            </button>
          )}

          <ul className={styles.featureList}>
            {FEATURES.map((feature) => (
              <li key={feature}>
                <Check size={17} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className={styles.trustRow}>
            <span>
              <ShieldCheck size={15} />
              Secure checkout
            </span>
            <span>Cancel anytime</span>
          </div>
        </section>
      </div>
    </main>
  );
}
