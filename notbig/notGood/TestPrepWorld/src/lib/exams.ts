import { exams } from "@/data/exams";

/** Convert exam name to URL slug (e.g. "Bar Exam" -> "bar-exam") */
export function examNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/** Get exam by slug, or undefined if not found */
export function getExamBySlug(slug: string) {
  return exams.find((e) => examNameToSlug(e.name) === slug);
}

/** All exam slugs for static generation */
export function getAllExamSlugs(): string[] {
  return exams.map((e) => examNameToSlug(e.name));
}
