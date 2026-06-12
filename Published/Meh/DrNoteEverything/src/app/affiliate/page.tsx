import { PublicHeader } from "@/components/site-header";
import { ArrowRight, BadgeDollarSign, Check, Megaphone, PenLine } from "lucide-react";

const steps = [
  {
    icon: PenLine,
    title: "Join the program",
    text: "Apply to become a DrNote affiliate and get your unique partner link.",
  },
  {
    icon: Megaphone,
    title: "Promote DrNote",
    text: "Share DrNote with students, educators, creators, and learning communities.",
  },
  {
    icon: BadgeDollarSign,
    title: "Earn rewards",
    text: "Earn recurring rewards when your referred users become paying customers.",
  },
];

const applicants = [
  "Bloggers and writers",
  "Entrepreneurs",
  "Educators",
  "Media networks (news, podcasts)",
  "Email newsletters",
  "Content creators & influencers",
  "Notion community leaders, ambassadors, and template creators",
  "AI influencers & content creators",
];

const faqs = [
  "What is the DrNote Affiliate Program?",
  "What qualifies as a successful conversion?",
  "How can I create, track, and promote my affiliate link?",
  "What if a user adds additional seats to their workspace after their first invoice?",
  "What if a user downgrades?",
  "Can I refer myself?",
  "What terms apply to the DrNote Affiliate Program?",
  "Have more questions?",
];

export default function AffiliatePage() {
  return (
    <>
      <PublicHeader />
      <main className="affiliate-page">
        <section className="affiliate-hero">
          <p>DrNote affiliates</p>
          <h1>Earn by helping learners study better.</h1>
          <a href="/pricing">
            Start earning <ArrowRight aria-hidden="true" size={18} />
          </a>
        </section>
        <section className="affiliate-how">
          <h2>How it works.</h2>
          <div className="affiliate-step-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article key={step.title}>
                  <Icon aria-hidden="true" size={28} />
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                  <span aria-hidden="true" className={`affiliate-doodle affiliate-doodle-${index + 1}`} />
                </article>
              );
            })}
          </div>
        </section>
        <section className="affiliate-two-col">
          <article className="affiliate-apply">
            <h2>Who can apply?</h2>
            <div>
              {applicants.map((item) => (
                <p key={item}>
                  <span>{item}</span>
                  <Check aria-hidden="true" size={18} />
                </p>
              ))}
            </div>
          </article>
          <article className="affiliate-faq">
            <h2>FAQs</h2>
            {faqs.map((item) => (
              <details key={item}>
                <summary>{item}</summary>
                <p>Affiliate terms, tracking, and reward details are provided during partner onboarding.</p>
              </details>
            ))}
          </article>
        </section>
      </main>
    </>
  );
}
