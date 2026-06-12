"use client";

import { useState } from "react";
import type { Exam } from "@/types/exam";

interface Note {
  id: number;
  text: string;
  time: string;
}

interface DetailNotesProps {
  exam: Exam;
  t: {
    subtext: string;
    surface: string;
    border: string;
    text: string;
    muted: string;
  };
}

export function DetailNotes({ exam, t }: DetailNotesProps) {
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  return (
    <div style={{ maxWidth: "680px", animation: "fadeUp 0.3s ease" }}>
      <div
        style={{
          fontSize: "22px",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          marginBottom: "6px",
        }}
      >
        Notes
      </div>
      <div
        style={{
          fontSize: "12px",
          color: t.subtext,
          fontFamily: "'DM Mono', monospace",
          marginBottom: "20px",
        }}
      >
        Your personal study notes for {exam.name}
      </div>

      <div
        style={{
          background: t.surface,
          borderRadius: "10px",
          border: `1px solid ${t.border}`,
          marginBottom: "20px",
          overflow: "hidden",
        }}
      >
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={`Add a note about ${exam.name}…`}
          rows={3}
          style={{
            width: "100%",
            padding: "16px",
            background: "none",
            border: "none",
            outline: "none",
            color: t.text,
            resize: "none",
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px 14px",
            borderTop: `1px solid ${t.border}`,
          }}
        >
          <button
            onClick={() => {
              if (!noteText.trim()) return;
              setNotes((prev) => [
                { id: Date.now(), text: noteText, time: "just now" },
                ...prev,
              ]);
              setNoteText("");
            }}
            style={{
              padding: "7px 18px",
              borderRadius: "100px",
              border: "none",
              background: exam.color,
              color: "white",
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.05em",
            }}
          >
            SAVE NOTE
          </button>
        </div>
      </div>

      {notes.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: t.muted,
            fontFamily: "'DM Mono', monospace",
            fontSize: "12px",
          }}
        >
          No notes yet. Add your first note above ↑
        </div>
      )}
      {notes.map((note) => (
        <div
          key={note.id}
          style={{
            background: t.surface,
            borderRadius: "10px",
            padding: "16px 18px",
            border: `1px solid ${t.border}`,
            marginBottom: "10px",
            borderLeft: `3px solid ${exam.color}`,
            animation: "fadeUp 0.25s ease both",
          }}
        >
          <div
            style={{ fontSize: "14px", lineHeight: 1.6, marginBottom: "8px" }}
          >
            {note.text}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: t.muted,
              fontFamily: "'DM Mono', monospace",
            }}
          >
            {note.time}
          </div>
        </div>
      ))}
    </div>
  );
}
