import { Avatar } from "@/components/ui/Avatar";
import type { Exam } from "@/types/exam";

interface OnlineMembersPanelProps {
  exam: Exam;
  t: {
    sidebar: string;
    border: string;
    subtext: string;
    muted: string;
  };
}

const ONLINE_NAMES = [
  "Alex M.",
  "Priya K.",
  "Jordan T.",
  "Sam R.",
  "Mei L.",
  "Dev P.",
  "Nadia S.",
  "Chris W.",
  "Rohan M.",
];

const OFFLINE_NAMES = ["Rachel H.", "Marcus T.", "Sofia L."];

export function OnlineMembersPanel({ exam, t }: OnlineMembersPanelProps) {
  return (
    <div
      style={{
        width: "200px",
        flexShrink: 0,
        background: t.sidebar,
        borderLeft: `1px solid ${t.border}`,
        padding: "16px 12px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: t.muted,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.1em",
          marginBottom: "10px",
          padding: "0 4px",
        }}
      >
        ONLINE — {exam.online.toLocaleString()}
      </div>
      {ONLINE_NAMES.map((name, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 4px",
            borderRadius: "6px",
          }}
        >
          <div style={{ position: "relative" }}>
            <Avatar
              initials={name
                .split(" ")
                .map((w) => w[0])
                .join("")}
              color={exam.color}
              size={28}
            />
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#1ed760",
                border: `2px solid ${t.sidebar}`,
              }}
            />
          </div>
          <span
            style={{
              fontSize: "14px",
              fontWeight: 600,
              color: t.subtext,
            }}
          >
            {name}
          </span>
        </div>
      ))}
      <div
        style={{
          margin: "12px 0 8px",
          fontSize: "11px",
          fontWeight: 700,
          color: t.muted,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.1em",
          padding: "0 4px",
        }}
      >
        OFFLINE
      </div>
      {OFFLINE_NAMES.map((name, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 4px",
          }}
        >
          <div style={{ position: "relative", opacity: 0.45 }}>
            <Avatar
              initials={name
                .split(" ")
                .map((w) => w[0])
                .join("")}
              color="#888"
              size={28}
            />
            <span
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#888",
                border: `2px solid ${t.sidebar}`,
              }}
            />
          </div>
          <span style={{ fontSize: "14px", color: t.muted }}>{name}</span>
        </div>
      ))}
    </div>
  );
}
