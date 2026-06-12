import { PublicHeader } from "@/components/site-header";
import { ArrowRight, Check } from "lucide-react";

const proFeatures = [
  "Unlimited uploads, pastes, and records",
  "Unlimited AI chats",
  "Unlimited quiz answers",
  "Unlimited exams",
  "12 podcasts / day",
  "4 AI videos / day",
  "5 lesson plans / day",
  "200K read-aloud characters / day",
  "Upload files, each up to 2000 pages / 300 MB in size",
];

const maxFeatures = [
  "Extended premium chat limits",
  "Unlimited podcast generations",
  "25 AI videos / day",
  "50 lesson plans / day",
  "Unlimited read-aloud characters",
  "Upload files, each up to 5000 pages / 500 MB in size",
  "Priority customer support",
];

const teamFeatures = [
  "Discounts scale with team size",
  "Centralized team billing",
  "Add, remove and set custom permissions for team members",
  "Shared spaces",
  "Minimum 3 seats required",
];

function Feature({ children, dark = false }: { children: string; dark?: boolean }) {
  return (
    <li style={{ alignItems: "flex-start", color: dark ? "#fff" : "#2b2b2b", display: "flex", fontSize: 14, fontWeight: 750, gap: 12, lineHeight: 1.45 }}>
      <Check size={20} strokeWidth={2.5} style={{ flex: "0 0 auto", marginTop: 2 }} />
      <span>{children}</span>
    </li>
  );
}

export default function PricingPage() {
  return (
    <>
      <PublicHeader />
      <main style={{ background: "#fff", color: "#2b2b2b", minHeight: "100vh", padding: "76px 24px 96px" }}>
        <section style={{ margin: "0 auto", maxWidth: 860 }}>
          <h1 style={{ color: "#111", fontSize: 46, fontWeight: 950, lineHeight: 1, margin: "0 0 42px", textAlign: "center" }}>Pricing</h1>
          <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <article style={{ background: "#1c1c1c", borderRadius: 22, color: "#fff", display: "flex", flexDirection: "column", minHeight: 640, padding: 28 }}>
              <div style={{ alignItems: "center", display: "flex", justifyContent: "space-between", marginBottom: 26 }}>
                <p style={{ fontSize: 16, fontWeight: 900, margin: 0 }}>Pro <span style={{ color: "#c7c7c7", fontSize: 13, fontWeight: 750 }}>Billed Monthly</span></p>
                <span style={{ background: "#174b2b", borderRadius: 999, color: "#4ade80", fontSize: 14, fontWeight: 900, padding: "8px 12px" }}>Popular</span>
              </div>
              <p style={{ fontSize: 42, fontWeight: 400, letterSpacing: "-1px", margin: "0 0 22px" }}>SR 75 <span style={{ color: "#c7c7c7", fontSize: 20 }}>/ month</span></p>
              <p style={{ fontSize: 16, fontWeight: 800, margin: "0 0 28px" }}>Learn faster and go deeper.</p>
              <div style={{ borderTop: "1px solid #8b8b8b", marginBottom: 28 }} />
              <ul style={{ display: "grid", gap: 12, listStyle: "none", margin: 0, padding: 0 }}>{proFeatures.map((feature) => <Feature key={feature} dark>{feature}</Feature>)}</ul>
              <a href="#" style={{ alignItems: "center", background: "#fff", borderRadius: 999, color: "#000", display: "flex", fontSize: 13, fontWeight: 900, gap: 12, justifyContent: "center", marginTop: "auto", padding: "14px", textDecoration: "none" }}>
                Select Plan <ArrowRight size={20} />
              </a>
            </article>
            <article style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 22, display: "flex", flexDirection: "column", minHeight: 640, padding: 28 }}>
              <p style={{ fontSize: 16, fontWeight: 900, margin: "0 0 26px" }}>Max <span style={{ color: "#666", fontSize: 13, fontWeight: 750 }}>Billed Monthly</span></p>
              <p style={{ fontSize: 42, fontWeight: 400, letterSpacing: "-1px", margin: "0 0 22px" }}>SR 230 <span style={{ color: "#666", fontSize: 20 }}>/ month</span></p>
              <p style={{ fontSize: 16, fontWeight: 500, margin: "0 0 28px" }}>Learn at the highest level.</p>
              <div style={{ borderTop: "1px solid #d6d6d6", marginBottom: 28 }} />
              <p style={{ fontSize: 14, fontWeight: 900, margin: "0 0 20px" }}>Everything in Pro +</p>
              <ul style={{ display: "grid", gap: 12, listStyle: "none", margin: 0, padding: 0 }}>{maxFeatures.map((feature) => <Feature key={feature}>{feature}</Feature>)}</ul>
              <a href="#" style={{ alignItems: "center", background: "#111", borderRadius: 999, color: "#fff", display: "flex", fontSize: 13, fontWeight: 900, justifyContent: "center", marginTop: "auto", padding: "14px", textDecoration: "none" }}>Select Plan</a>
            </article>
          </div>
          <article style={{ background: "#fff", border: "1px solid #e0e0e0", borderRadius: 22, marginTop: 42, padding: 28 }}>
            <div style={{ alignItems: "start", display: "flex", gap: 28, justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 26, fontWeight: 950, margin: "0 0 10px" }}>Teams <span style={{ color: "#666", fontSize: 13, fontWeight: 750 }}>Billed Monthly</span></p>
                <p style={{ color: "#666", fontSize: 19, margin: 0 }}>For study groups and teams.</p>
              </div>
              <p style={{ fontSize: 44, fontWeight: 400, margin: 0 }}>SR 55 <span style={{ color: "#666", fontSize: 20 }}>/ month / seat</span></p>
            </div>
            <div style={{ borderTop: "1px solid #d6d6d6", margin: "28px 0" }} />
            <p style={{ fontSize: 14, fontWeight: 900, margin: "0 0 24px" }}>Everything in Pro +</p>
            <ul style={{ display: "grid", gap: 23, gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", listStyle: "none", margin: "0 0 38px", padding: 0 }}>{teamFeatures.map((feature) => <Feature key={feature}>{feature}</Feature>)}</ul>
            <a href="#" style={{ alignItems: "center", background: "#111", borderRadius: 999, color: "#fff", display: "flex", fontSize: 13, fontWeight: 900, justifyContent: "center", padding: "14px", textDecoration: "none" }}>Choose Team</a>
          </article>
        </section>
      </main>
    </>
  );
}
