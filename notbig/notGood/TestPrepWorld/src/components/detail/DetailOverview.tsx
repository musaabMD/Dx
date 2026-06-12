import type { Exam } from "@/types/exam";
import { Tag } from "@/components/ui/Tag";

interface DetailOverviewProps {
  exam: Exam;
  t: {
    muted: string;
  };
}

export function DetailOverview({ exam, t }: DetailOverviewProps) {
  return (
    <div style={{ maxWidth: "900px" }}>
      <div style={{ animation: "fadeUp 0.3s ease" }}>
        <div
          style={{
            borderRadius: "16px",
            padding: "32px 36px",
            marginBottom: "32px",
            background: `linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 45%), linear-gradient(150deg, ${exam.color} 0%, ${exam.color}dd 100%)`,
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 32px ${exam.color}45, inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.06,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "42px",
              color: "white",
              lineHeight: 1,
              letterSpacing: "0.03em",
            }}
          >
            {exam.name}
          </div>
          <div
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.92)",
              marginTop: "10px",
              maxWidth: "560px",
              lineHeight: 1.65,
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            {exam.description}
          </div>
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Questions", val: exam.questions.toLocaleString() },
              { label: "Duration", val: exam.duration },
              { label: "Pass Rate", val: exam.passRate + "%" },
              { label: "Difficulty", val: exam.difficulty },
              { label: "Members", val: exam.members },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 900,
                    color: "white",
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                  }}
                >
                  {stat.val}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.78)",
                    fontFamily: "'DM Mono', monospace",
                    letterSpacing: "0.08em",
                  }}
                >
                  {stat.label.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: t.muted,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.1em",
              marginBottom: "12px",
            }}
          >
            TAGS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {exam.tags.map((tag) => (
              <Tag key={tag} label={tag} color={exam.color} />
            ))}
          </div>
        </div>

        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: t.muted,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: "0.1em",
              marginBottom: "12px",
            }}
          >
            SUBJECTS
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {exam.subjects.map((s) => (
              <Tag key={s} label={s} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
