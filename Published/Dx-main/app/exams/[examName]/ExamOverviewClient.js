"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Header from "@/components/Header";
import UpgradeModal from "@/components/UpgradeModal";
import {
  BookOpen,
  ChevronRight,
  FileText,
  FolderOpen,
  Layers,
  LockKeyhole,
} from "lucide-react";

export default function ExamOverviewClient({ examName, overview, error }) {
  const [accessState, setAccessState] = useState("checking");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = useMemo(() => createClientComponentClient(), []);
  const hasInactiveSubscription = accessState === "inactive";

  useEffect(() => {
    let isMounted = true;

    async function checkSubscriptionStatus() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (isMounted) {
            setAccessState("inactive");
          }
          return;
        }

        const { data, error: subscriptionError } = await supabase
          .from("user_data")
          .select("subscription_status, remaining_days, disable, trial")
          .eq("user_id", session.user.id)
          .eq("examname", examName)
          .maybeSingle();

        if (subscriptionError || !data || !isMounted) {
          if (isMounted) {
            setAccessState("inactive");
          }
          return;
        }

        const subscriptionStatus = data.subscription_status?.toLowerCase();
        const isActive =
          (subscriptionStatus === "active" && data.remaining_days > 0 && !data.disable) ||
          data.trial;

        setAccessState(isActive ? "active" : "inactive");
      } catch (subscriptionCheckError) {
        console.error("Error checking subscription status:", subscriptionCheckError);
        if (isMounted) {
          setAccessState("inactive");
        }
      }
    }

    checkSubscriptionStatus();

    return () => {
      isMounted = false;
    };
  }, [examName, supabase]);

  const handleQuizAccess = (event) => {
    if (hasInactiveSubscription) {
      event.preventDefault();
      setIsModalOpen(true);
    }
  };

  const stats = [
    {
      label: "Study Questions",
      value: overview?.totalQuestions?.toLocaleString() || "0",
      icon: BookOpen,
      color: "#58CC02",
      soft: "#E7F8D6",
    },
    {
      label: "Subjects",
      value: overview?.totalSubjects?.toLocaleString() || "0",
      icon: Layers,
      color: "#1CB0F6",
      soft: "#DDF4FE",
    },
    {
      label: "Files",
      value: overview?.fileCount?.toLocaleString() || "0",
      icon: FolderOpen,
      color: "#FF9600",
      soft: "#FFEFD6",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#3C3C3C]">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <section
          className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6 text-center md:p-8"
          style={{ boxShadow: "0 5px 0 #E5E5E5" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#E7F8D6] bg-[#F3FBE9] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#58A700]">
            <BookOpen className="h-4 w-4" strokeWidth={2.5} />
            SCFHS qbank
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">
            Qbank for {examName}
          </h1>

          {hasInactiveSubscription ? (
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-2xl bg-[#FF4B4B] px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-white transition hover:brightness-105"
                style={{ boxShadow: "0 4px 0 #CC3C3C" }}
              >
                <LockKeyhole className="h-4 w-4" strokeWidth={2.5} />
                Subscribe
              </a>
              <p className="text-sm font-bold text-[#777]">
                Subscribe to open files and subject quizzes.
              </p>
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border-2 border-[#FFBABA] bg-[#FFE3E3] p-4 text-sm font-extrabold text-[#CC3C3C]">
              {error}
            </div>
          ) : null}

          {!error ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-5 text-left"
                    style={{ boxShadow: "0 4px 0 #E5E5E5" }}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: stat.soft }}
                    >
                      <Icon className="h-6 w-6" style={{ color: stat.color }} strokeWidth={2.5} />
                    </span>
                    <div className="mt-4 text-3xl font-extrabold">{stat.value}</div>
                    <div className="mt-1 text-sm font-bold text-[#777]">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>

        {!error ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold">Files</h2>
                  <p className="mt-1 text-sm font-bold text-[#777]">
                    Practice by source file.
                  </p>
                </div>
                <span className="rounded-full bg-[#E7F8D6] px-3 py-1 text-xs font-extrabold text-[#58A700]">
                  {overview?.quizzes?.length || 0}
                </span>
              </div>

              <div className="space-y-3">
                {overview?.quizzes?.length ? (
                  overview.quizzes.map((quiz) => (
                    <Link
                      key={quiz.file_name}
                      href={`/exams/${encodeURIComponent(examName)}/${encodeURIComponent(quiz.file_name)}`}
                      onClick={handleQuizAccess}
                      className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-[#E5E5E5] bg-white p-4 transition-transform hover:-translate-y-0.5"
                      style={{ boxShadow: "0 3px 0 #E5E5E5" }}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#DDF4FE]">
                          <FileText className="h-5 w-5 text-[#1CB0F6]" strokeWidth={2.5} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-extrabold">
                            {quiz.file_name.replace(/%20/g, " ")}
                          </span>
                          <span className="text-xs font-bold text-[#777]">
                            {quiz.question_count.toLocaleString()} questions
                          </span>
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-[#58CC02] transition group-hover:translate-x-1" strokeWidth={3} />
                    </Link>
                  ))
                ) : (
                  <p className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-5 text-sm font-bold text-[#777]">
                    No quizzes available for this exam.
                  </p>
                )}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold">Subjects</h2>
                  <p className="mt-1 text-sm font-bold text-[#777]">
                    Practice by topic area.
                  </p>
                </div>
                <span className="rounded-full bg-[#DDF4FE] px-3 py-1 text-xs font-extrabold text-[#1CB0F6]">
                  {overview?.subjects?.length || 0}
                </span>
              </div>

              <div className="space-y-3">
                {overview?.subjects?.length ? (
                  overview.subjects.map((subject) => (
                    <Link
                      key={subject.name}
                      href={`/exams/${encodeURIComponent(examName)}/subject/${encodeURIComponent(subject.name)}`}
                      onClick={handleQuizAccess}
                      className="group flex items-center justify-between gap-4 rounded-2xl border-2 border-[#E5E5E5] bg-white p-4 transition-transform hover:-translate-y-0.5"
                      style={{ boxShadow: "0 3px 0 #E5E5E5" }}
                    >
                      <span>
                        <span className="block text-sm font-extrabold">{subject.name}</span>
                        <span className="text-xs font-bold text-[#777]">
                          {subject.question_count.toLocaleString()} questions
                        </span>
                      </span>
                      <ChevronRight className="h-5 w-5 shrink-0 text-[#58CC02] transition group-hover:translate-x-1" strokeWidth={3} />
                    </Link>
                  ))
                ) : (
                  <p className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-5 text-sm font-bold text-[#777]">
                    No subjects available for this exam.
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </main>

      <UpgradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
