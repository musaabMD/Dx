import { PublicHeader } from "@/components/site-header";
import { ArrowRight, FileText, Mic, Search, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";

const cards = [
  {
    accent: "#ef776b",
    eyebrow: "File intelligence",
    title: "One workspace for every study file.",
    type: "search",
  },
  {
    accent: "#72a8e8",
    eyebrow: "Lecture capture",
    title: "Clean notes after every class.",
    type: "meeting",
  },
];

function SearchMockup() {
  return (
    <div className="feature-mock feature-mock-search">
      <div className="feature-query">respiratory formulas</div>
      <div className="feature-result-line">
        <Search aria-hidden="true" size={15} />
        <span>42 results</span>
        <i />
        <i />
        <i />
      </div>
      <h3>High-yield formulas</h3>
      <p>Find answers across notes, PDFs, slides, and handouts without opening every file.</p>
      <ol>
        <li>Alveolar ventilation equation</li>
        <li>A-a gradient interpretation</li>
        <li>Oxygen content calculation</li>
      </ol>
      <div className="feature-app-row">
        <span>PDF</span>
        <span>PPT</span>
        <span>DOC</span>
        <span>+</span>
      </div>
    </div>
  );
}

function MeetingMockup() {
  return (
    <div className="feature-mock feature-mock-meeting">
      <div className="feature-meeting-head">
        <strong>Biology lecture</strong>
        <span>Today</span>
      </div>
      <div className="feature-meeting-tabs">
        <span>Summary</span>
        <span>Notes</span>
        <span>Transcript</span>
      </div>
      <h3>Current progress</h3>
      <p>DrNote grouped the lecture into concepts, recall prompts, and follow-up tasks.</p>
      <h3>Next review</h3>
      <ul>
        <li>Practice osmosis questions</li>
        <li>Review cell transport slides</li>
        <li>Create flashcards from weak points</li>
      </ul>
      <div className="feature-video-stack">
        <span />
        <span />
      </div>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <PublicHeader />
      <main className="feature-page">
        <section className="feature-hero">
          <p>DrNote features</p>
          <h1>Study tools that feel built into your workflow.</h1>
        </section>
        <section className="feature-showcase-grid">
          {cards.map((card) => (
            <article key={card.eyebrow} className="feature-showcase-card" style={{ "--feature-accent": card.accent } as CSSProperties}>
              <div className="feature-showcase-top">
                <div>
                  <p>{card.eyebrow}</p>
                  <h2>{card.title}</h2>
                </div>
                <span aria-hidden="true">
                  <ArrowRight size={24} strokeWidth={2.5} />
                </span>
              </div>
              <div className="feature-showcase-bottom">{card.type === "search" ? <SearchMockup /> : <MeetingMockup />}</div>
            </article>
          ))}
        </section>
        <section className="feature-mini-grid" aria-label="More features">
          {[
            ["Exam practice", "Generate quizzes and explanations from your own material.", Sparkles],
            ["Resource library", "Keep course files, qbanks, slides, notes, and references in one place.", FileText],
            ["Audio review", "Turn recordings and transcripts into structured study notes.", Mic],
          ].map(([title, text, Icon]) => {
            const FeatureIcon = Icon as typeof Sparkles;
            return (
            <article key={title as string}>
              <FeatureIcon aria-hidden="true" size={22} />
              <h2>{title as string}</h2>
              <p>{text as string}</p>
            </article>
            );
          })}
        </section>
      </main>
    </>
  );
}
