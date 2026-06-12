"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Briefcase,
  Calculator,
  Cpu,
  FlaskConical,
  Globe,
  GraduationCap,
  House,
  KeyRound,
  Landmark,
  Languages,
  Menu,
  PenTool,
  Scale,
  Search,
  Stethoscope,
  Sparkles,
  User,
  Crown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import styles from "./exam-browse.module.css";

type Category =
  | "All"
  | "Language"
  | "Graduate"
  | "Medical"
  | "Engineering"
  | "Business"
  | "Law"
  | "Civil Service";

type Exam = {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  color: string;
  icon: LucideIcon;
};

const EXAMS: Exam[] = [
  { id: "ielts", name: "IELTS", category: "Language", color: "#e8115b", icon: Languages },
  { id: "toefl", name: "TOEFL", category: "Language", color: "#006450", icon: Globe },
  { id: "duolingo", name: "Duolingo English Test", category: "Language", color: "#0d72ea", icon: Languages },
  { id: "sat", name: "SAT", category: "Graduate", color: "#1e3264", icon: GraduationCap },
  { id: "gre", name: "GRE", category: "Graduate", color: "#8400e7", icon: BookOpen },
  { id: "act", name: "ACT", category: "Graduate", color: "#148a08", icon: PenTool },
  { id: "mcat", name: "MCAT", category: "Medical", color: "#e91429", icon: Stethoscope },
  { id: "usmle", name: "USMLE", category: "Medical", color: "#608108", icon: FlaskConical },
  { id: "neet", name: "NEET", category: "Medical", color: "#d84000", icon: Stethoscope },
  { id: "fe", name: "FE Exam", category: "Engineering", color: "#27856a", icon: Calculator },
  { id: "pe", name: "PE Exam", category: "Engineering", color: "#503750", icon: Cpu },
  { id: "gmat", name: "GMAT", category: "Business", color: "#477d95", icon: Briefcase },
  { id: "cpa", name: "CPA", category: "Business", color: "#a56752", icon: Briefcase },
  { id: "lsat", name: "LSAT", category: "Law", color: "#ba5d07", icon: Scale },
  { id: "bar", name: "Bar Exam", category: "Law", color: "#509bf5", icon: Scale },
  { id: "upsc", name: "UPSC", category: "Civil Service", color: "#7358ff", icon: Landmark },
];

const CATEGORIES: Category[] = [
  "All",
  "Language",
  "Graduate",
  "Medical",
  "Engineering",
  "Business",
  "Law",
  "Civil Service",
];

function ExamCard({ exam }: { exam: Exam }) {
  const Icon = exam.icon;

  return (
    <Link
      href={`/exams/${encodeURIComponent(exam.id)}`}
      className={styles.examCard}
      style={{ backgroundColor: exam.color }}
      aria-label={exam.name}
    >
      <span className={styles.examName}>{exam.name}</span>
      <span className={styles.examIconTile}>
        <Icon className={styles.examIcon} strokeWidth={1.75} aria-hidden="true" />
      </span>
    </Link>
  );
}

export default function ExamBrowseClient() {
  const router = useRouter();
  const { openSignIn, openSignUp } = useClerk();
  const { isSignedIn } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("All");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return EXAMS.filter((exam) => {
      const matchesCategory = category === "All" || exam.category === category;
      const matchesQuery = exam.name.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

  const startHref = `/exams/${encodeURIComponent(filtered[0]?.id ?? "usmle")}`;
  const handleStartFree = () => {
    if (isSignedIn) {
      router.push(startHref);
      return;
    }

    openSignUp({
      forceRedirectUrl: startHref,
      fallbackRedirectUrl: startHref,
    });
  };
  const closeMenu = () => setMenuOpen(false);

  const navControls = (mobile = false) => (
    <>
      <Link href="/" className={`${styles.headerAction} ${styles.active}`} onClick={mobile ? closeMenu : undefined}>
        <House size={16} />
        <span>Home</span>
      </Link>
      <Link href="/features" className={styles.headerAction} onClick={mobile ? closeMenu : undefined}>
        <Sparkles size={16} />
        <span>Features</span>
      </Link>
      <Link href="/pricing" className={`${styles.headerAction} ${styles.pro}`} onClick={mobile ? closeMenu : undefined}>
        <Crown size={15} />
        <span>Upgrade</span>
      </Link>
      {isSignedIn ? (
        <Link href="/profile" className={styles.headerAction} aria-label="Profile" onClick={mobile ? closeMenu : undefined}>
          <User size={16} />
          <span>Profile</span>
        </Link>
      ) : (
        <>
          <button
            type="button"
            className={`${styles.headerAction} ${styles.compact}`}
            onClick={() => {
              closeMenu();
              openSignIn();
            }}
          >
            <KeyRound size={15} />
            <span>Login</span>
          </button>
          <button
            type="button"
            className={`${styles.headerAction} ${styles.compact}`}
            onClick={() => {
              closeMenu();
              openSignUp({ forceRedirectUrl: startHref, fallbackRedirectUrl: startHref });
            }}
          >
            <User size={15} />
            <span>Sign up</span>
          </button>
        </>
      )}
    </>
  );

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="DrNote home">
          <span className={styles.brandMark}>D</span>
          <span className={styles.brandName}>DrNote</span>
        </Link>

        <nav className={styles.headerNav} aria-label="Browse navigation">
          {navControls()}
        </nav>

        <button
          type="button"
          className={styles.menuButton}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(current => !current)}
        >
          <Menu size={20} />
        </button>
      </header>

      {menuOpen && (
        <nav className={styles.mobileMenu} aria-label="Mobile browse navigation">
          {navControls(true)}
          <button type="button" className={styles.mobilePrimary} onClick={handleStartFree}>
            {isSignedIn ? "Continue practicing" : "Start for free"}
          </button>
        </nav>
      )}

      <div className={styles.inner}>
        <div className={styles.heroCopy}>
          <h1 className={styles.headline}>Choose your exam</h1>
        </div>

        <div className={styles.searchWrap}>
          <Search className={styles.searchIcon} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="What exam are you preparing for?"
            className={styles.searchInput}
            aria-label="Search exams"
          />
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Exam categories">
          {CATEGORIES.map((currentCategory) => (
            <button
              key={currentCategory}
              type="button"
              role="tab"
              aria-selected={category === currentCategory}
              className={styles.tab}
              data-active={category === currentCategory}
              onClick={() => setCategory(currentCategory)}
            >
              {currentCategory}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <Search className={styles.emptyIcon} aria-hidden="true" />
            <p className={styles.emptyTitle}>No exams match your search</p>
            <p className={styles.emptyCopy}>Try a different name or switch to the All tab.</p>
          </div>
        )}
      </div>
    </main>
  );
}
