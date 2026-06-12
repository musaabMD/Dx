import { PublicHeader } from "@/components/site-header";

const exams = [
  { name: "USMLE Step 1", category: "Medical", count: 18 },
  { name: "NCLEX-RN", category: "Medical", count: 14 },
  { name: "MCAT", category: "School", count: 16 },
  { name: "SAT", category: "School", count: 12 },
  { name: "IELTS", category: "Language", count: 9 },
  { name: "AWS Cloud Practitioner", category: "Tech", count: 11 },
];

const tabs = ["All", "Medical", "School", "Language", "Tech"];

type ExamsPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function ExamsPage({ searchParams }: ExamsPageProps) {
  const params = await searchParams;
  const activeTab = tabs.includes(params.category ?? "") ? params.category ?? "All" : "All";
  const query = params.q ?? "";

  const visibleExams = exams.filter((exam) => {
    const matchesTab = activeTab === "All" || exam.category === activeTab;
    const matchesSearch = exam.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <PublicHeader />
      <main style={{ minHeight: "100vh", padding: "72px 24px 96px", background: "#fff", color: "#0f172a" }}>
        <section style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: "0 0 28px", fontWeight: 900 }}>Exams</h1>
        <form action="/exams" style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <input name="category" type="hidden" value={activeTab} />
          <input
            aria-label="Search exams"
            name="q"
            placeholder="Search exams"
            defaultValue={query}
            style={{
              width: "min(520px, 100%)",
              border: "1px solid #e2e8f0",
              borderRadius: 999,
              padding: "14px 20px",
              fontSize: 15,
              outline: "none",
            }}
          />
        </form>
        <nav className="catalog-tabs">
          {tabs.map((tab) => (
            <a
              key={tab}
              className={activeTab === tab ? "is-active" : ""}
              href={`/exams?${new URLSearchParams({ category: tab, ...(query ? { q: query } : {}) }).toString()}`}
            >
              {tab}
            </a>
          ))}
        </nav>
        <div className="catalog-grid">
          {visibleExams.map((exam) => (
            <a key={exam.name} href={`/exams/${encodeURIComponent(exam.name.toLowerCase().replaceAll(" ", "-"))}`} className="catalog-card" data-initial={exam.name.charAt(0)}>
              <span>{exam.name}</span>
              <span className="catalog-count">{exam.count}</span>
            </a>
          ))}
        </div>
        </section>
      </main>
    </>
  );
}
