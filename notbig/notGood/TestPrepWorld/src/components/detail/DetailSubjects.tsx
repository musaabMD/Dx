import type { Exam } from "@/types/exam";

interface DetailSubjectsProps {
  exam: Exam;
  t: {
    subtext: string;
    surface: string;
    border: string;
  };
}

export function DetailSubjects({ exam, t }: DetailSubjectsProps) {
  return (
    <div style={{ maxWidth: "720px", animation: "fadeUp 0.3s ease" }}>
      <div
        style={{
          fontSize: "22px",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "6px",
        }}
      >
        Subjects & Topics
      </div>
      <div
        style={{
          fontSize: "12px",
          color: t.subtext,
          fontFamily: "'DM Mono', monospace",
          marginBottom: "24px",
        }}
      >
        {exam.subjects.length} subject areas covered
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {exam.subjects.map((subj, i) => (
          <div
            key={subj}
            style={{
              background: t.surface,
              borderRadius: "10px",
              padding: "16px 20px",
              border: `1px solid ${t.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              animation: `fadeUp 0.3s ease ${i * 0.05}s both`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  background: `${exam.color}22`,
                  border: `1px solid ${exam.color}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Bebas Neue', cursive",
                  fontSize: "13px",
                  color: exam.color,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{subj}</div>
                <div
                  style={{
                    fontSize: "10px",
                    color: t.subtext,
                    fontFamily: "'DM Mono', monospace",
                    marginTop: "2px",
                  }}
                >
                  {Math.floor(Math.random() * 80 + 40)} questions
                </div>
              </div>
            </div>
            <div
              style={{
                padding: "4px 12px",
                borderRadius: "100px",
                background: `${exam.color}18`,
                color: exam.color,
                fontSize: "10px",
                fontWeight: 700,
                fontFamily: "'DM Mono', monospace",
              }}
            >
              STUDY →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
