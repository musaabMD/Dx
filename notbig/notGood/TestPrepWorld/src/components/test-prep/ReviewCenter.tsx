"use client";

import { useThemedColors } from "./useThemedColors";
import { Card } from "./Card";

export interface CompletedBlock {
  id: string;
  title: string;
  date: string;
  correct: number;
  total: number;
  timeUsed: string;
}

const MOCK_BLOCKS: CompletedBlock[] = [
 {
   id: "1",
   title: "Hematology & Immunology",
   date: "Today, 2:34 PM",
   correct: 30,
   total: 40,
   timeUsed: "24:37",
 },
 {
   id: "2",
   title: "Cardiology · Tutor Mode",
   date: "Yesterday",
   correct: 28,
   total: 35,
   timeUsed: "18:12",
 },
 {
   id: "3",
   title: "Quick 10 · Mixed",
   date: "Mar 5",
   correct: 8,
   total: 10,
   timeUsed: "4:22",
 },
];

interface ReviewCenterProps {
  blocks?: CompletedBlock[];
  onSelectBlock?: (block: CompletedBlock) => void;
}

export function ReviewCenter({
  blocks = MOCK_BLOCKS,
  onSelectBlock,
}: ReviewCenterProps) {
  const c = useThemedColors();
  return (
    <Card>
      <div
        style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: c.text,
            fontFamily: "Georgia, serif",
          }}
        >
          📋 Review Center
        </div>
        <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
          Completed blocks · Review explanations
        </div>
      </div>
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        {blocks.map((block) => (
          <button
            key={block.id}
            onClick={() => onSelectBlock?.(block)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 18px",
              borderRadius: 10,
              border: `1.5px solid ${c.border}`,
              background: c.white,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: c.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
              }}
            >
              📄
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: c.text }}>
                {block.title}
              </div>
              <div style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>
                {block.date} · {block.timeUsed}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 15,
                  color:
                    block.correct / block.total >= 0.7 ? c.success : c.warning,
                }}
              >
                {block.correct}/{block.total}
              </div>
              <div style={{ fontSize: 11, color: c.textMuted }}>correct</div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
