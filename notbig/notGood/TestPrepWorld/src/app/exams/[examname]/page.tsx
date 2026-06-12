import { notFound } from "next/navigation";
import { getExamBySlug, getAllExamSlugs } from "@/lib/exams";
import { ExamDetailPage } from "@/components/detail/ExamDetailPage";

interface PageProps {
  params: Promise<{ examname: string }>;
}

export async function generateStaticParams() {
  return getAllExamSlugs().map((examname) => ({ examname }));
}

export default async function ExamPage({ params }: PageProps) {
  const { examname } = await params;
  const exam = getExamBySlug(decodeURIComponent(examname));

  if (!exam) {
    notFound();
  }

  return <ExamDetailPage exam={exam} />;
}
