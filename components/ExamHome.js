import { createClient } from "@supabase/supabase-js";
import ExamHomeClient from "@/components/ExamHomeClient";

async function getExams() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { exams: [], error: "Supabase is not configured for this environment." };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const [examsResult, summariesResult] = await Promise.all([
    supabase.from("exams").select("id, name, initials, clicks"),
    supabase.from("exam_summary").select("exam_id, total_questions"),
  ]);

  if (examsResult.error) {
    return { exams: [], error: examsResult.error.message };
  }

  if (summariesResult.error) {
    return { exams: [], error: summariesResult.error.message };
  }

  const summariesByExamId = new Map(
    (summariesResult.data || []).map((summary) => [
      summary.exam_id,
      summary.total_questions || 0,
    ])
  );

  const exams = (examsResult.data || []).map((exam) => ({
    ...exam,
    total_questions: summariesByExamId.get(exam.id) || 0,
  }));

  return { exams, error: null };
}

export default async function ExamHome() {
  const { exams, error } = await getExams();

  return <ExamHomeClient exams={exams} error={error} />;
}
