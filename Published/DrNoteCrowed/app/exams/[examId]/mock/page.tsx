import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ExamPageContent, metadataForExamPage } from "../exam-page";

type PageProps = { params: Promise<{ examId: string }> };
const screen = "mock";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { examId } = await params;
  return metadataForExamPage(examId, screen);
}

export default async function Page({ params }: PageProps) {
  const { examId } = await params;
  const { userId } = await auth();
  if (!userId) {
    redirect(`/exams/${encodeURIComponent(examId)}`);
  }
  return <ExamPageContent examId={examId} initialScreen={screen} />;
}
