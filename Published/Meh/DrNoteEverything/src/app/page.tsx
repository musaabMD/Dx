"use client";

import { PublicHeader } from "@/components/site-header";
import { useEffect, useRef, useState, type DragEvent, type ElementType } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Layers,
  PenLine,
  Play,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  Zap,
} from "lucide-react";

const CYCLING_WORDS = [
  { text: "test prep", color: "#F97316" },
  { text: "a course", color: "#8B5CF6" },
  { text: "flashcards", color: "#0EA5E9" },
  { text: "a study guide", color: "#10B981" },
  { text: "a mock exam", color: "#F43F5E" },
  { text: "active recall", color: "#F59E0B" },
];

type WorkspaceItem = {
  icon: ElementType;
  name: string;
  sub: string;
};

function AnimatedWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % CYCLING_WORDS.length);
        setVisible(true);
      }, 350);
    }, 2000);

    return () => window.clearInterval(interval);
  }, []);

  const word = CYCLING_WORDS[index];

  return (
    <span
      style={{
        color: word.color,
        display: "inline-block",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(10px)",
        transition: "opacity 0.35s ease, transform 0.35s ease",
      }}
    >
      {word.text}
    </span>
  );
}

function UploadZone() {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;

    setFiles((current) => {
      const next = [...current];
      Array.from(fileList).forEach((file) => {
        if (!next.includes(file.name)) next.push(file.name);
      });
      return next;
    });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(event.dataTransfer.files);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragLeave={() => setDragging(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDrop={handleDrop}
      style={{
        background: dragging ? "#FFF7ED" : "#FAFAFA",
        border: `2px dashed ${dragging ? "#F97316" : "#E2E8F0"}`,
        borderRadius: 20,
        cursor: "pointer",
        padding: "48px 32px",
        textAlign: "center",
        transition: "all 0.25s ease",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: "none" }}
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div style={{ alignItems: "center", display: "flex", flexDirection: "column", gap: 14 }}>
        <div
          style={{
            alignItems: "center",
            background: dragging ? "#FED7AA" : "#F1F5F9",
            borderRadius: 16,
            display: "flex",
            height: 56,
            justifyContent: "center",
            transition: "all 0.25s",
            width: 56,
          }}
        >
          <Upload size={24} color={dragging ? "#F97316" : "#94A3B8"} strokeWidth={1.8} />
        </div>
        <div>
          <p style={{ color: "#1E293B", fontSize: 17, fontWeight: 700, margin: "0 0 4px" }}>
            {files.length ? `${files.length} file${files.length > 1 ? "s" : ""} ready` : "Upload your file"}
          </p>
          <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>
            {files.length ? "Add more files or start processing" : "Drag & drop or click to browse"}
          </p>
        </div>
        {files.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 4,
              maxWidth: 420,
              width: "100%",
            }}
          >
            {files.map((file) => (
              <div
                key={file}
                style={{
                  alignItems: "center",
                  background: "#fff",
                  border: "1px solid #E2E8F0",
                  borderRadius: 12,
                  display: "flex",
                  gap: 10,
                  padding: "10px 12px",
                  textAlign: "left",
                }}
              >
                <FileText size={16} color="#64748B" />
                <span
                  style={{
                    color: "#1E293B",
                    flex: 1,
                    fontSize: 13,
                    fontWeight: 700,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file}
                </span>
                <button
                  aria-label={`Remove ${file}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setFiles((current) => current.filter((name) => name !== file));
                  }}
                  style={{
                    alignItems: "center",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    color: "#64748B",
                    cursor: "pointer",
                    display: "flex",
                    height: 28,
                    justifyContent: "center",
                    width: 28,
                  }}
                  type="button"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          <button
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
            style={{
              alignItems: "center",
              background: files.length ? "#fff" : "#0F172A",
              border: files.length ? "1px solid #E2E8F0" : "none",
              borderRadius: 12,
              color: files.length ? "#0F172A" : "#fff",
              cursor: "pointer",
              display: "inline-flex",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 700,
              gap: 8,
              padding: "10px 22px",
            }}
            type="button"
          >
            {files.length ? <Plus size={16} /> : null}
            {files.length ? "Add more" : "Choose file"}
          </button>
          {files.length > 0 && (
            <button
              onClick={(event) => event.stopPropagation()}
              style={{
                alignItems: "center",
                background: "#0F172A",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                cursor: "pointer",
                display: "inline-flex",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 800,
                gap: 8,
                padding: "10px 24px",
              }}
              type="button"
            >
              Start <Play size={15} fill="#fff" />
            </button>
          )}
        </div>
        <p style={{ color: "#CBD5E1", fontSize: 12, margin: 0 }}>
          Supports PDF, DOCX, PPTX, TXT, MP4 and more
        </p>
      </div>
    </div>
  );
}

function WorkspaceCard({
  items,
  accentColor,
  badgeText,
  num,
}: {
  items: WorkspaceItem[];
  accentColor: string;
  badgeText: string;
  num: string;
}) {
  return (
    <div
      style={{
        background: accentColor,
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 24,
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: 8, marginBottom: 4 }}>
        <div
          style={{
            alignItems: "center",
            background: "#0F172A",
            borderRadius: "50%",
            color: "#fff",
            display: "flex",
            fontSize: 11,
            fontWeight: 800,
            height: 26,
            justifyContent: "center",
            width: 26,
          }}
        >
          {num}
        </div>
        <span style={{ color: "#64748B", fontSize: 13, fontWeight: 700 }}>DrNote</span>
      </div>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.name}
            style={{
              alignItems: "center",
              background: "#fff",
              border: "1px solid #F1F5F9",
              borderRadius: 14,
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 16px",
            }}
          >
            <div style={{ alignItems: "center", display: "flex", gap: 12 }}>
              <Icon size={16} color="#94A3B8" strokeWidth={1.8} />
              <div>
                <p style={{ color: "#1E293B", fontSize: 13, fontWeight: 700, margin: 0 }}>
                  {item.name}
                </p>
                <p style={{ color: "#94A3B8", fontSize: 11, margin: 0 }}>{item.sub}</p>
              </div>
            </div>
            <CheckCircle2 size={18} color={badgeText} strokeWidth={2} />
          </div>
        );
      })}
    </div>
  );
}

const STUDY_ITEMS = [
  { icon: Layers, name: "Chapter view", sub: "Ready from your upload" },
  { icon: FileText, name: "File view", sub: "Ready from your upload" },
  { icon: ClipboardList, name: "Mock exam", sub: "Ready from your upload" },
];

const PRACTICE_ITEMS = [
  { icon: ClipboardList, name: "Mock exam", sub: "Ready from your upload" },
  { icon: Search, name: "Review", sub: "Ready from your upload" },
  { icon: BookOpen, name: "Study guide", sub: "Ready from your upload" },
];

export default function DrNote() {
  return (
    <div
      style={{
        background: "#fff",
        color: "#1E293B",
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,900;1,400&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        .serif { font-family: 'DM Serif Display', serif; }
        a { text-decoration: none; }
        .nav-link { transition: color 0.15s; }
        .nav-link:hover { color: #0F172A !important; }
        @media (max-width: 980px) {
          .side-note { display: none; }
          .feature-grid, .testimonial-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 46px !important; }
        }
        @media (max-width: 700px) {
          .nav-center { display: none !important; }
          .hero-title { font-size: 38px !important; }
          .footer-row { flex-direction: column; gap: 16px; }
        }
      `}</style>

      <PublicHeader />

      <section style={{ background: "#fff", paddingBottom: 72, paddingTop: 88, position: "relative" }}>
        <div
          className="side-note"
          style={{
            position: "absolute",
            right: "max(56px, calc(50% - 520px))",
            textAlign: "left",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          <p
            style={{
              color: "#7C3AED",
              fontFamily: "'DM Serif Display', serif",
              fontSize: 18,
              fontStyle: "italic",
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            Try for free
          </p>
          <svg width="90" height="60" viewBox="0 0 90 60" fill="none" style={{ display: "block" }}>
            <path d="M82 8 C62 8, 22 8, 10 45" stroke="#7C3AED" strokeLinecap="round" strokeWidth="2" />
            <path d="M10 45 L20 40 M10 45 L6 34" stroke="#7C3AED" strokeLinecap="round" strokeWidth="2" />
          </svg>
        </div>

        <div style={{ margin: "0 auto", maxWidth: 840, padding: "0 24px", textAlign: "center" }}>
          <div
            style={{
              alignItems: "center",
              background: "#FFF7ED",
              border: "1px solid #FED7AA",
              borderRadius: 99,
              color: "#EA580C",
              display: "inline-flex",
              fontSize: 12,
              fontWeight: 700,
              gap: 6,
              letterSpacing: "0.2px",
              marginBottom: 32,
              padding: "5px 14px",
            }}
          >
            <Zap size={12} strokeWidth={2.5} />
            AI-powered study tools
          </div>

          <h1
            className="serif hero-title"
            style={{
              color: "#0F172A",
              fontSize: 54,
              fontWeight: 400,
              letterSpacing: "-1px",
              lineHeight: 1.1,
              margin: "0 0 48px",
              whiteSpace: "nowrap",
            }}
          >
            Turn any file into{" "}
            <AnimatedWord />
          </h1>

          <div
            style={{
              background: "#fff",
              border: "1.5px solid #E2E8F0",
              borderRadius: 28,
              boxShadow: "0 4px 40px rgba(0,0,0,0.05)",
              margin: "0 auto",
              maxWidth: 580,
              padding: 24,
            }}
          >
            <UploadZone />
          </div>
        </div>
      </section>

      <section style={{ margin: "0 auto", maxWidth: 1120, padding: "0 32px 80px" }}>
        <div className="feature-grid" style={{ alignItems: "center", display: "grid", gap: 72, gridTemplateColumns: "1fr 1fr" }}>
          <WorkspaceCard items={STUDY_ITEMS} accentColor="#FFF7ED" badgeText="#F97316" num="1" />
          <div>
            <FeatureBadge icon={BookOpen} label="Study workspace" color="#EA580C" bg="#FFF7ED" border="#FED7AA" />
            <h2 className="serif" style={{ color: "#0F172A", fontSize: 40, fontWeight: 400, lineHeight: 1.15, margin: "0 0 18px" }}>
              Navigate every source with structure
            </h2>
            <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.8, margin: "0 0 24px" }}>
              Break uploaded files into chapters, source views, notes, summaries, and a searchable knowledge library.
            </p>
            <FeatureList color="#F97316" items={["Chapter & file views", "Smart summaries", "Searchable notes"]} />
            <LearnMore color="#F97316" />
          </div>
        </div>
      </section>

      <section style={{ background: "#FAFBFC", borderBottom: "1px solid #F1F5F9", borderTop: "1px solid #F1F5F9" }}>
        <div style={{ margin: "0 auto", maxWidth: 1120, padding: "80px 32px" }}>
          <div className="feature-grid" style={{ alignItems: "center", display: "grid", gap: 72, gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <FeatureBadge icon={Zap} label="Practice modes" color="#7C3AED" bg="#F5F3FF" border="#DDD6FE" />
              <h2 className="serif" style={{ color: "#0F172A", fontSize: 40, fontWeight: 400, lineHeight: 1.15, margin: "0 0 18px" }}>
                Turn material into active recall
              </h2>
              <p style={{ color: "#64748B", fontSize: 15, lineHeight: 1.8, margin: "0 0 24px" }}>
                Generate mock exams, review flows, flashcards, study quizzes, and study guides from the same upload.
              </p>
              <FeatureList color="#8B5CF6" items={["Mock exams & quizzes", "Smart flashcards", "Review flows"]} />
              <LearnMore color="#8B5CF6" />
            </div>
            <WorkspaceCard items={PRACTICE_ITEMS} accentColor="#F5F3FF" badgeText="#8B5CF6" num="2" />
          </div>
        </div>
      </section>

      <section style={{ background: "#FAFBFC", borderTop: "1px solid #F1F5F9" }}>
        <div style={{ margin: "0 auto", maxWidth: 1120, padding: "80px 32px" }}>
          <div style={{ marginBottom: 56, textAlign: "center" }}>
            <h2 className="serif" style={{ color: "#0F172A", fontSize: 36, fontWeight: 400, margin: 0 }}>
              What students say
            </h2>
            <p style={{ color: "#94A3B8", fontSize: 15, marginTop: 10 }}>Trusted by 1 million+ learners worldwide</p>
          </div>

          <div className="testimonial-grid" style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(3,1fr)" }}>
            {[
              { quote: "Saved me 10+ hours preparing for finals. The mock exams are incredibly accurate.", name: "Sara M.", role: "Med student", color: "#6366F1", initials: "SM" },
              { quote: "I upload my lecture slides and get a full study guide in seconds. Game changer.", name: "James K.", role: "Law student", color: "#F59E0B", initials: "JK" },
              { quote: "The chapter view makes navigating dense textbooks so much easier.", name: "Priya L.", role: "PhD candidate", color: "#EC4899", initials: "PL" },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                style={{
                  background: "#fff",
                  border: "1px solid #F1F5F9",
                  borderRadius: 20,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  padding: "28px 24px",
                }}
              >
                <Stars />
                <p style={{ color: "#374151", fontSize: 14, fontStyle: "italic", lineHeight: 1.8, margin: "0 0 24px" }}>
                  &quot;{testimonial.quote}&quot;
                </p>
                <div style={{ alignItems: "center", display: "flex", gap: 10 }}>
                  <div
                    style={{
                      alignItems: "center",
                      background: testimonial.color,
                      borderRadius: "50%",
                      color: "#fff",
                      display: "flex",
                      flexShrink: 0,
                      fontSize: 11,
                      fontWeight: 800,
                      height: 36,
                      justifyContent: "center",
                      width: 36,
                    }}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p style={{ color: "#0F172A", fontSize: 13, fontWeight: 700, margin: 0 }}>{testimonial.name}</p>
                    <p style={{ color: "#94A3B8", fontSize: 11, margin: "2px 0 0" }}>{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ alignItems: "center", display: "flex", gap: 16, justifyContent: "center", marginTop: 48 }}>
            <div style={{ display: "flex" }}>
              {["#6366F1", "#F59E0B", "#EC4899", "#1E293B", "#10B981"].map((color, index) => (
                <div
                  key={color}
                  style={{
                    alignItems: "center",
                    background: color,
                    border: "2.5px solid #fff",
                    borderRadius: "50%",
                    color: "#fff",
                    display: "flex",
                    fontSize: 10,
                    fontWeight: 800,
                    height: 34,
                    justifyContent: "center",
                    marginLeft: index === 0 ? 0 : -10,
                    width: 34,
                  }}
                >
                  {["K", "A", "S", "R", "P"][index]}
                </div>
              ))}
            </div>
            <div>
              <Stars compact />
              <p style={{ color: "#374151", fontSize: 13, fontWeight: 600, margin: 0 }}>1 million+ happy users</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ margin: "0 auto 88px", maxWidth: 1120, padding: "0 32px" }}>
        <div
          style={{
            background: "linear-gradient(135deg, #FFF7ED 0%, #F5F3FF 48%, #ECFEFF 100%)",
            border: "1px solid #E2E8F0",
            borderRadius: 30,
            boxShadow: "0 24px 70px rgba(15,23,42,0.08)",
            display: "grid",
            gap: 28,
            gridTemplateColumns: "1.2fr 0.8fr",
            overflow: "hidden",
            padding: 48,
          }}
          className="feature-grid"
        >
          <div>
            <div
              style={{
                alignItems: "center",
                background: "#fff",
                border: "1px solid #FED7AA",
                borderRadius: 99,
                color: "#EA580C",
                display: "inline-flex",
                fontSize: 12,
                fontWeight: 800,
                gap: 7,
                marginBottom: 22,
                padding: "6px 14px",
              }}
            >
              <Zap size={13} strokeWidth={2.5} />
              Start in seconds
            </div>
            <h2 className="serif" style={{ color: "#0F172A", fontSize: 46, fontWeight: 400, lineHeight: 1.08, margin: "0 0 16px" }}>
              Ready to build your study workspace?
            </h2>
            <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.75, margin: "0 0 28px", maxWidth: 560 }}>
              Upload a file and generate study tools immediately, from structured notes to practice exams.
            </p>
            <button
              style={{
                alignItems: "center",
                background: "#0F172A",
                border: "none",
                borderRadius: 14,
                color: "#fff",
                cursor: "pointer",
                display: "inline-flex",
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 800,
                gap: 8,
                padding: "14px 28px",
              }}
              type="button"
            >
              Get started free <ChevronRight size={18} />
            </button>
          </div>
          <div
            style={{
              alignSelf: "center",
              background: "rgba(255,255,255,0.72)",
              border: "1px solid rgba(255,255,255,0.8)",
              borderRadius: 24,
              boxShadow: "0 14px 35px rgba(15,23,42,0.08)",
              padding: 22,
            }}
          >
            {["Upload file", "Choose outputs", "Start studying"].map((step, index) => (
              <div
                key={step}
                style={{
                  alignItems: "center",
                  borderBottom: index < 2 ? "1px solid #E2E8F0" : "none",
                  display: "flex",
                  gap: 12,
                  padding: "14px 0",
                }}
              >
                <span
                  style={{
                    alignItems: "center",
                    background: index === 2 ? "#0F172A" : "#FFF7ED",
                    borderRadius: "50%",
                    color: index === 2 ? "#fff" : "#EA580C",
                    display: "flex",
                    fontSize: 12,
                    fontWeight: 900,
                    height: 30,
                    justifyContent: "center",
                    width: 30,
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ color: "#0F172A", fontSize: 15, fontWeight: 800 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: "#fff", borderTop: "1px solid #F1F5F9" }}>
        <div
          className="footer-row"
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            margin: "0 auto",
            maxWidth: 1120,
            padding: "24px 32px",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: 7 }}>
            <div
              style={{
                alignItems: "center",
                background: "#0F172A",
                borderRadius: 8,
                display: "flex",
                height: 24,
                justifyContent: "center",
                width: 24,
              }}
            >
              <PenLine size={12} color="#fff" strokeWidth={2} />
            </div>
            <span style={{ color: "#0F172A", fontSize: 14, fontWeight: 800 }}>DrNote</span>
          </div>
          <p style={{ color: "#CBD5E1", fontSize: 12, margin: 0 }}>© 2026 DrNote. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map((label) => (
              <a key={label} href="#" style={{ color: "#94A3B8", fontSize: 12 }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureBadge({
  icon: Icon,
  label,
  color,
  bg,
  border,
}: {
  icon: ElementType;
  label: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      style={{
        alignItems: "center",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 99,
        color,
        display: "inline-flex",
        fontSize: 11,
        fontWeight: 700,
        gap: 6,
        marginBottom: 18,
        padding: "4px 12px",
      }}
    >
      <Icon size={11} strokeWidth={2.5} />
      {label}
    </div>
  );
}

function FeatureList({ items, color }: { items: string[]; color: string }) {
  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: 10, listStyle: "none", margin: "0 0 28px", padding: 0 }}>
      {items.map((item) => (
        <li key={item} style={{ alignItems: "center", color: "#334155", display: "flex", fontSize: 14, fontWeight: 500, gap: 8 }}>
          <CheckCircle2 size={16} color={color} strokeWidth={2} />
          {item}
        </li>
      ))}
    </ul>
  );
}

function LearnMore({ color }: { color: string }) {
  return (
    <a href="#" style={{ alignItems: "center", color, display: "inline-flex", fontSize: 14, fontWeight: 700, gap: 4 }}>
      Learn more <ArrowRight size={15} />
    </a>
  );
}

function Stars({ compact = false }: { compact?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: compact ? 3 : 18 }}>
      {[...Array(5)].map((_, index) => (
        <Star key={index} size={compact ? 12 : 13} color="#F97316" fill="#F97316" />
      ))}
    </div>
  );
}
