"use client";

import Link from "next/link";
import {
  ChevronRight,
  HeartPulse,
  Microscope,
  Pill,
  Smile,
  Stethoscope,
  Users,
} from "lucide-react";

const examStyles = {
  SMLE: {
    role: "Physician",
    icon: Stethoscope,
    color: "#58CC02",
    shadow: "#46A302",
    soft: "#E7F8D6",
  },
  SPLE: {
    role: "Pharmacist",
    icon: Pill,
    color: "#1CB0F6",
    shadow: "#1899D6",
    soft: "#DDF4FE",
  },
  SDLE: {
    role: "Dentist",
    icon: Smile,
    color: "#CE82FF",
    shadow: "#A568CC",
    soft: "#F6EBFF",
  },
  SLLE: {
    role: "Lab specialist",
    icon: Microscope,
    color: "#FF9600",
    shadow: "#CC7800",
    soft: "#FFEFD6",
  },
  SNLE: {
    role: "Nursing",
    icon: HeartPulse,
    color: "#FF4B4B",
    shadow: "#CC3C3C",
    soft: "#FFE3E3",
  },
  FM: {
    role: "Family Medicine",
    icon: Users,
    color: "#00CD9C",
    shadow: "#00A47D",
    soft: "#D6F7EF",
  },
};

const fallbackStyle = {
  role: "Exam bank",
  icon: Stethoscope,
  color: "#58CC02",
  shadow: "#46A302",
  soft: "#E7F8D6",
};

export default function ExamHomeClient({ exams = [], error }) {
  return (
    <section id="exams" className="border-t-2 border-[#E5E5E5] bg-[#FAFAFA]">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#58A700]">
            SCFHS question banks
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              Available Exams
          </h2>
          <p className="mt-2 text-base font-bold text-[#777]" dir="rtl">
            بنك أسئلة لاختبارات الهيئة السعودية للتخصصات الصحية
          </p>
          <span className="mt-3 inline-block rounded-full bg-[#E7F8D6] px-4 py-1 text-xs font-extrabold uppercase tracking-wide text-[#58A700]">
            {exams.length} exam{exams.length === 1 ? "" : "s"} ready
          </span>
        </div>

        {error ? (
          <div className="mt-8 rounded-2xl border-2 border-[#FFBABA] bg-[#FFE3E3] px-4 py-3 text-sm font-extrabold text-[#CC3C3C]">
            {error}
          </div>
        ) : null}

        {!error && exams.length === 0 ? (
          <div className="mt-8 rounded-2xl border-2 border-[#E5E5E5] bg-white px-4 py-8 text-center text-sm font-extrabold text-[#777]">
            No exams are available yet.
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const style = examStyles[exam.initials] || fallbackStyle;
            const Icon = style.icon;

            return (
              <Link
                key={exam.id}
                href={`/exams/${encodeURIComponent(exam.initials)}`}
                className="group rounded-2xl border-2 bg-white p-5 transition-transform hover:-translate-y-1"
                style={{
                  borderColor: style.color,
                  boxShadow: `0 5px 0 ${style.shadow}`,
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: style.soft }}
                  >
                    <Icon className="h-6 w-6" style={{ color: style.color }} strokeWidth={2.5} />
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-extrabold text-white"
                    style={{ backgroundColor: style.color }}
                  >
                    {style.role}
                  </span>
                </div>

                <h3 className="mt-4 text-2xl font-extrabold tracking-tight">
                  {exam.initials}
                </h3>
                <p className="mt-1 text-sm font-bold text-[#777]">
                  {Number(exam.total_questions || 0).toLocaleString()} questions
                </p>
                <p className="mt-1 text-sm font-bold text-[#AFAFAF]">
                  {exam.name}
                </p>

                <span
                  className="mt-4 inline-flex items-center gap-1 text-sm font-extrabold uppercase tracking-wide transition-transform group-hover:translate-x-1"
                  style={{ color: style.color }}
                >
                  Start practicing
                  <ChevronRight className="h-4 w-4" strokeWidth={3} />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
