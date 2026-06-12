"use client";

import { PricingTable, useClerk, useUser } from "@clerk/nextjs";
import {
  BarChart3,
  BookOpenCheck,
  Check,
  ChevronLeft,
  Clock3,
  Crown,
  FileText,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import styles from "./upgrade-page-client.module.css";

type BillingPlan = "monthly" | "quarterly" | "yearly";
type BillingPlanMeta = {
  id: BillingPlan;
  name: string;
  price: string;
  cadence: string;
  detail: string;
  save: string | null;
  badge: string | null;
};

const PLANS: BillingPlanMeta[] = [
  { id: "monthly", name: "Monthly", price: "$20", cadence: "/mo", detail: "Pay as you go", save: null, badge: null },
  { id: "quarterly", name: "3 months", price: "$50", cadence: "/3 mo", detail: "Exam sprint", save: "Save 17%", badge: null },
  { id: "yearly", name: "Yearly", price: "$120", cadence: "/yr", detail: "Best for serious prep", save: "Save 50%", badge: "Best value" },
];

const PRODUCT_CARDS = [
  { icon: BookOpenCheck, title: "Practice blocks", text: "Unlimited questions by subject, tag, status, and timed mode." },
  { icon: MessageCircle, title: "Ask AI", text: "Explain answer choices, weak topics, and saved study history." },
  { icon: Clock3, title: "Mock exams", text: "Run full timed mocks and review pacing after every session." },
  { icon: BarChart3, title: "Analytics", text: "Track accuracy, streaks, topic gaps, and readiness signals." },
];

const COMPARE_ROWS = [
  ["Daily practice", "15 questions/day", "Unlimited"],
  ["Ask AI tutor", "Not included", "Included"],
  ["Mock exams", "Preview", "Full timed mocks"],
  ["Notes and review", "Basic", "Saved notes, reports, queues"],
];

export default function UpgradePageClient() {
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
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="DrNote home">
          <span className={styles.brandMark}>D</span>
          <span className={styles.brandName}>DrNote</span>
        </Link>
        <nav className={styles.nav} aria-label="Upgrade navigation">
          <Link href="/" className={styles.navLink}>
            <ChevronLeft size={17} />
            Exams
          </Link>
          <button type="button" className={styles.navCta} onClick={startUpgrade}>
            Start for free
          </button>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.proLabel}>
            <Crown size={16} />
            DrNote Pro
          </span>
          <h1>Upgrade when you need unlimited practice.</h1>
          <p>See the full study workspace before choosing a plan: questions, AI help, mocks, notes, and analytics in one exam prep flow.</p>
          <div className={styles.heroActions}>
            <button type="button" className={styles.primaryButton} onClick={startUpgrade}>
              Start free, upgrade later
            </button>
            <a href="#pricing" className={styles.secondaryButton}>
              View pricing
            </a>
          </div>
        </div>

        <div className={styles.productPreview} aria-label="DrNote Pro product preview">
          <div className={styles.previewTop}>
            <span>USMLE Step 1</span>
            <strong>Readiness 78%</strong>
          </div>
          <div className={styles.questionPanel}>
            <span>Practice block</span>
            <strong>Which finding best supports the diagnosis?</strong>
            <div className={styles.answerGrid}>
              <span>Pathology</span>
              <span>Pharmacology</span>
              <span className={styles.answerActive}>Physiology</span>
              <span>Biochemistry</span>
            </div>
          </div>
          <div className={styles.previewBottom}>
            <div>
              <MessageCircle size={18} />
              <span>Ask AI explanation ready</span>
            </div>
            <div>
              <FileText size={18} />
              <span>Saved to review queue</span>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.showcase} aria-label="DrNote Pro components">
        {PRODUCT_CARDS.map(({ icon: Icon, title, text }) => (
          <article className={styles.productCard} key={title}>
            <Icon size={22} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section id="pricing" className={styles.pricingSection}>
        <div className={styles.pricingIntro}>
          <span>Simple pricing</span>
          <h2>Pick the plan that matches your exam timeline.</h2>
        </div>

        <div className={styles.pricingGrid}>
          <section className={styles.planColumn} aria-label="Choose Pro plan">
            <div className={styles.selectedPlan}>
              <span>{selectedPlanInfo.name} Pro</span>
              <strong>{selectedPlanInfo.price}<small>{selectedPlanInfo.cadence}</small></strong>
              {selectedPlanInfo.save && <em>{selectedPlanInfo.save}</em>}
            </div>

            {isSignedIn ? (
              <div className={styles.clerkPricing}>
                <PricingTable />
              </div>
            ) : (
              <>
                <div className={styles.plans}>
                  {PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      className={styles.planCard}
                      data-active={selectedPlan === plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      {plan.badge && <span className={styles.planBadge}>{plan.badge}</span>}
                      <span>{plan.name}</span>
                      <strong>{plan.price}<small>{plan.cadence}</small></strong>
                      <em>{plan.detail}</em>
                      {plan.save && <b>{plan.save}</b>}
                    </button>
                  ))}
                </div>
                <button type="button" className={styles.checkoutButton} onClick={startUpgrade}>
                  <Check size={18} />
                  Create account and continue
                </button>
              </>
            )}
          </section>

          <section className={styles.compareColumn} aria-label="Free and Pro comparison">
            <div className={styles.compareHeader}>
              <span>Free</span>
              <span>Pro</span>
            </div>
            {COMPARE_ROWS.map(([feature, free, pro]) => (
              <div className={styles.compareRow} key={feature}>
                <strong>{feature}</strong>
                <span>{free}</span>
                <span>{pro}</span>
              </div>
            ))}
            <div className={styles.trustRow}>
              <span><ShieldCheck size={16} /> Secure checkout after signup</span>
              <span><Check size={16} /> Free access stays available</span>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
