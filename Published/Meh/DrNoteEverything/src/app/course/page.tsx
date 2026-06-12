import { PublicHeader } from "@/components/site-header";

const courses = [
  { name: "Biology Foundations", category: "Science", count: 22 },
  { name: "Clinical Reasoning", category: "Medical", count: 17 },
  { name: "English Writing", category: "Language", count: 12 },
  { name: "Cloud Basics", category: "Tech", count: 15 },
  { name: "Math Review", category: "Science", count: 10 },
  { name: "Research Methods", category: "Medical", count: 13 },
];

const tabs = ["All", "Science", "Medical", "Language", "Tech"];

type CoursesPageProps = {
  searchParams: Promise<{ category?: string; q?: string }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const params = await searchParams;
  const activeTab = tabs.includes(params.category ?? "") ? params.category ?? "All" : "All";
  const query = params.q ?? "";

  const visibleCourses = courses.filter((course) => {
    const matchesTab = activeTab === "All" || course.category === activeTab;
    const matchesSearch = course.name.toLowerCase().includes(query.trim().toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <>
      <PublicHeader />
      <main style={{ minHeight: "100vh", padding: "72px 24px 96px", background: "#fff", color: "#0f172a" }}>
        <section style={{ maxWidth: 920, margin: "0 auto", textAlign: "center" }}>
        <h1 style={{ fontSize: 48, lineHeight: 1.1, margin: "0 0 28px", fontWeight: 900 }}>Courses</h1>
        <form action="/course" style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <input name="category" type="hidden" value={activeTab} />
          <input
            aria-label="Search courses"
            name="q"
            placeholder="Search courses"
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
        <nav className="catalog-tabs course-tabs">
          {tabs.map((tab) => (
            <a
              key={tab}
              className={activeTab === tab ? "is-active" : ""}
              href={`/course?${new URLSearchParams({ category: tab, ...(query ? { q: query } : {}) }).toString()}`}
            >
              {tab}
            </a>
          ))}
        </nav>
        <div className="catalog-grid">
          {visibleCourses.map((course) => (
            <a key={course.name} href={`/course/${encodeURIComponent(course.name.toLowerCase().replaceAll(" ", "-"))}`} className="catalog-card course-card" data-initial={course.name.charAt(0)}>
              <span>{course.name}</span>
              <span className="catalog-count">{course.count}</span>
            </a>
          ))}
        </div>
        </section>
      </main>
    </>
  );
}
