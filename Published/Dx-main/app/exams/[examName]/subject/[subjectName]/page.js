import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import QuizComponent from "@/components/QuizComponent";
import { BookOpen, LockKeyhole } from "lucide-react";

export const dynamic = "force-dynamic";

const questionColumns = `
  id,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d,
  option_e,
  option_f,
  correct_choice,
  rationale,
  subject,
  examname,
  file_name,
  question_image_url,
  explanation_image_url
`;

async function getAccessAndUser(supabase, examName) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, hasAccess: false };
  }

  const { data } = await supabase
    .from("user_data")
    .select("subscription_status, remaining_days, disable, trial")
    .eq("user_id", user.id)
    .eq("examname", examName)
    .maybeSingle();

  const subscriptionStatus = data?.subscription_status?.toLowerCase();
  const hasAccess = Boolean(
    (subscriptionStatus === "active" && data?.remaining_days > 0 && !data?.disable) ||
      data?.trial
  );

  return { user, hasAccess };
}

function LockedSubject({ examName }) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#3C3C3C]">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section
          className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-8 text-center"
          style={{ boxShadow: "0 5px 0 #E5E5E5" }}
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFE3E3]">
            <LockKeyhole className="h-7 w-7 text-[#FF4B4B]" strokeWidth={2.5} />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold">Subscribe to open {examName}</h1>
          <p className="mx-auto mt-2 max-w-md text-sm font-bold leading-6 text-[#777]">
            Full subject practice is available with an active DrNote subscription.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#58CC02] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white hover:brightness-105"
            style={{ boxShadow: "0 4px 0 #46A302" }}
          >
            View Pricing
          </a>
        </section>
      </main>
    </div>
  );
}

export default async function SubjectQuizPage({ params }) {
  const examName = decodeURIComponent(params.examName);
  const subjectName = decodeURIComponent(params.subjectName);
  const supabase = createServerComponentClient({ cookies });
  const { user, hasAccess } = await getAccessAndUser(supabase, examName);

  if (!hasAccess) {
    return <LockedSubject examName={examName} />;
  }

  const { data: questions, error } = await supabase
    .from("qs")
    .select(questionColumns)
    .eq("examname", examName)
    .eq("subject", subjectName)
    .order("id", { ascending: true });

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#3C3C3C]">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border-2 border-[#FFBABA] bg-[#FFE3E3] p-6 font-extrabold text-[#CC3C3C]">
            Error loading questions. Please try again later.
          </div>
        </main>
      </div>
    );
  }

  if (!questions?.length) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#3C3C3C]">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-12">
          <div
            className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-8 text-center"
            style={{ boxShadow: "0 5px 0 #E5E5E5" }}
          >
            <BookOpen className="mx-auto h-8 w-8 text-[#58CC02]" strokeWidth={2.5} />
            <h1 className="mt-4 text-2xl font-extrabold">No questions found.</h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <QuizComponent
      questions={questions}
      quizName={`${subjectName} (${examName})`}
      examName={examName}
      testTaker={user?.user_metadata?.full_name || user?.email || "Subject Quiz"}
      isSelfExam={false}
    />
  );
}
