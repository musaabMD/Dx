import type { Metadata } from "next";
import { ExamPageContent, metadataForExamPage } from "../exam-page";

type PageProps = { params: Promise<{ examId: string }> };
const screen = "subjects";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId } = await params;
  return metadataForExamPage(examId, screen);
}

export default async function Page({ params }: PageProps) {
  const { examId } = await params;
  return <ExamPageContent examId={examId} initialScreen={screen} />;
}
