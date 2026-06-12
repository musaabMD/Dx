import { createClient } from "@supabase/supabase-js";
import ExamOverviewClient from "./ExamOverviewClient";

export const revalidate = 300;

function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getExamOverview(examName) {
  const decodedExamName = decodeURIComponent(examName);
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return {
      examName: decodedExamName,
      overview: null,
      error: "Supabase is not configured for this environment.",
    };
  }

  const [examSummaryResult, fileSummaryResult, subjectSummaryResult] = await Promise.all([
    supabase
      .from("exam_summary")
      .select("total_questions, total_file_names")
      .eq("exam_initials", decodedExamName)
      .maybeSingle(),
    supabase
      .from("file_name_summary")
      .select("file_name, file_name_count")
      .eq("exam_initials", decodedExamName),
    supabase
      .from("subject_summary")
      .select("subject, subject_count")
      .eq("exam_initials", decodedExamName),
  ]);

  const firstError =
    examSummaryResult.error || fileSummaryResult.error || subjectSummaryResult.error;

  if (firstError) {
    return {
      examName: decodedExamName,
      overview: null,
      error: firstError.message || "Error fetching exam summary.",
    };
  }

  const quizzes = (fileSummaryResult.data || [])
    .filter((file) => file.file_name)
    .map((file) => ({
      file_name: file.file_name,
      question_count: file.file_name_count || 0,
    }))
    .sort((a, b) => a.file_name.localeCompare(b.file_name));

  const subjectsMap = (subjectSummaryResult.data || []).reduce((acc, item) => {
    const subjectName = item.subject?.trim() || "Other";
    acc.set(subjectName, (acc.get(subjectName) || 0) + (item.subject_count || 0));
    return acc;
  }, new Map());

  const subjects = Array.from(subjectsMap.entries())
    .filter(([, count]) => count >= 30)
    .map(([name, question_count]) => ({ name, question_count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    examName: decodedExamName,
    overview: {
      quizzes,
      subjects,
      fileCount: quizzes.length || examSummaryResult.data?.total_file_names || 0,
      totalQuestions: examSummaryResult.data?.total_questions || 0,
      totalSubjects: subjects.length,
    },
    error: null,
  };
}

export default async function ExamOverviewPage({ params }) {
  const { examName, overview, error } = await getExamOverview(params.examName);

  return <ExamOverviewClient examName={examName} overview={overview} error={error} />;
}
