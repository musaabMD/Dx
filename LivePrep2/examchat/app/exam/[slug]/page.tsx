import { notFound } from "next/navigation";
import { getExam } from "@/lib/exams";
import { getLiveCount, getMessages } from "@/lib/store";
import { ChatRoom } from "@/components/ChatRoom";
import { getParticipantReadOnly, getSignInUrl, getSignUpUrl } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) return {};
  return {
    title: `${exam.name} — ExamChat`,
    description: `Live ${exam.name} chat room. ${exam.description}`,
  };
}

export default async function ExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const exam = getExam(slug);
  if (!exam) notFound();

  const initialMessages = getMessages(exam.slug);
  const initialLive = getLiveCount(exam.slug, exam.baseMembers);
  const participant = await getParticipantReadOnly();
  const [signInUrl, signUpUrl] = await Promise.all([
    participant?.kind === "user" ? Promise.resolve("") : getSignInUrl(),
    participant?.kind === "user" ? Promise.resolve("") : getSignUpUrl(),
  ]);

  return (
    <ChatRoom
      exam={{
        slug: exam.slug,
        name: exam.name,
        shortName: exam.shortName,
        iconLabel: exam.iconLabel,
        category: exam.category,
        description: exam.description,
        accent: exam.accent,
        baseMembers: exam.baseMembers,
      }}
      initialMessages={initialMessages}
      initialLive={initialLive}
      participant={participant}
      signInUrl={signInUrl}
      signUpUrl={signUpUrl}
    />
  );
}
