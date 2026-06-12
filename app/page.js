import ExamHome from "@/components/ExamHome";
import Header from "@/components/Header";
import {
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  GraduationCap,
  Layers,
  RefreshCw,
  Repeat,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

export const revalidate = 300;

const proofPoints = [
  { icon: CheckCircle2, label: "SCFHS-focused Qbanks", color: "#58CC02" },
  { icon: Users, label: "20,000+ professionals", color: "#1CB0F6" },
  { icon: Zap, label: "Fast exam access", color: "#FF9600" },
];

const stats = [
  { icon: CheckCircle2, value: "500,000+", label: "Questions answered", color: "#58CC02" },
  { icon: TrendingUp, value: "94%", label: "Pass rate", color: "#1CB0F6" },
  { icon: Users, value: "20,000+", label: "Active users", color: "#FF9600" },
];

const features = [
  {
    icon: Target,
    color: "#58CC02",
    soft: "#E7F8D6",
    title: "اختبر نفسك وحدد مستواك",
    text: "اختبر نفسك وحدد مستواك قبل الاختبار الفعلي",
  },
  {
    icon: RefreshCw,
    color: "#1CB0F6",
    soft: "#DDF4FE",
    title: "تحديث مستمر",
    text: "تحديث مستمر للبنك",
  },
  {
    icon: Repeat,
    color: "#FF9600",
    soft: "#FFEFD6",
    title: "الأسئلة المتكررة",
    text: "تعرف على الاسئلة التي تتكرر بشكل مستمر",
  },
  {
    icon: FileText,
    color: "#CE82FF",
    soft: "#F6EBFF",
    title: "شرح مفصل",
    text: "شرح مفصل لكل سؤال",
  },
  {
    icon: Layers,
    color: "#FF4B4B",
    soft: "#FFE3E3",
    title: "كل التجميعات",
    text: "جميع التجميعات في مكان واحد",
  },
  {
    icon: Bookmark,
    color: "#00CD9C",
    soft: "#D6F7EF",
    title: "علّم وارجع لاحقًا",
    text: "حدد السؤال لتعود له لاحقا",
  },
];

const faqs = [
  {
    q: "ماهو مصدر الاسئلة؟",
    a: "أسئلتنا مبنية على تجميعات حقيقية من اختبارات الهيئة السعودية للتخصصات الصحية، تتم مراجعتها وتحديثها باستمرار مع شرح مفصل لكل سؤال.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes. If DrNote is not the right fit, contact us within 7 days of purchase and we will process a full refund.",
  },
  {
    q: "I have another question",
    a: "We are happy to help. Reach out to our support team from your dashboard or by email and we will get back to you within 24 hours.",
  },
];

function Logo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#58CC02] text-xl font-extrabold text-white"
        style={{ boxShadow: "0 4px 0 #46A302" }}
      >
        D
      </span>
      <span className="text-xl font-extrabold tracking-tight text-[#3C3C3C]">
        DrNote
      </span>
    </a>
  );
}

function GetStartedButton({ className = "" }) {
  return (
    <a
      href="/signin"
      className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-[#58CC02] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:brightness-105 active:translate-y-1 ${className}`}
      style={{ boxShadow: "0 4px 0 #46A302" }}
    >
      Get started
      <ChevronRight className="h-5 w-5" strokeWidth={3} />
    </a>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#3C3C3C] antialiased">
      <Header />

      <main>
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#E7F8D6] bg-[#F3FBE9] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#58A700]">
              <GraduationCap className="h-4 w-4" strokeWidth={2.5} />
              Built for SCFHS exam prep
            </span>

            <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
              Pass with confidence.{" "}
              <span className="text-[#58CC02]">The first time.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg font-semibold leading-relaxed text-[#777]">
              Practice with focused question banks for Saudi Commission for
              Health Specialties exams and jump straight into the exam you need.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <GetStartedButton />
              <a
                href="#exams"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#E5E5E5] bg-white px-8 py-4 text-base font-extrabold uppercase tracking-wide text-[#3C3C3C] transition hover:border-[#AFAFAF]"
                style={{ boxShadow: "0 4px 0 #E5E5E5" }}
              >
                Browse exams
                <ChevronRight className="h-5 w-5" strokeWidth={3} />
              </a>
            </div>

            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-[#777]">
              {proofPoints.map((point) => {
                const Icon = point.icon;
                return (
                  <span key={point.label} className="inline-flex items-center gap-1.5">
                    <Icon className="h-4 w-4" style={{ color: point.color }} strokeWidth={2.5} />
                    {point.label}
                  </span>
                );
              })}
            </div>
          </div>
        </section>

        <ExamHome />

        <section className="border-t-2 border-[#E5E5E5]">
          <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-2xl border-2 border-[#E5E5E5] bg-white p-5"
                  style={{ boxShadow: "0 4px 0 #E5E5E5" }}
                >
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${stat.color}1A` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: stat.color }} strokeWidth={2.5} />
                  </span>
                  <div>
                    <p className="text-2xl font-extrabold">{stat.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#AFAFAF]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t-2 border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">
                Why choose DrNote?
              </h2>
              <p className="mt-2 text-base font-bold text-[#777]">
                Everything you need to excel in your SCFHS exam
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" dir="rtl">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-5 transition-transform hover:-translate-y-1"
                    style={{ boxShadow: "0 4px 0 #E5E5E5" }}
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: feature.soft }}
                    >
                      <Icon className="h-6 w-6" style={{ color: feature.color }} strokeWidth={2.5} />
                    </span>
                    <h3 className="mt-4 text-lg font-extrabold">{feature.title}</h3>
                    <p className="mt-1 text-sm font-bold leading-relaxed text-[#777]">
                      {feature.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="faq" className="border-t-2 border-[#E5E5E5]">
          <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
            <div className="text-center">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#58A700]">
                FAQ
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="mt-10 space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={faq.q}
                  className="group rounded-2xl border-2 border-[#E5E5E5] bg-white p-0 open:pb-5"
                  style={{ boxShadow: "0 4px 0 #E5E5E5" }}
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="text-base font-extrabold">{faq.q}</span>
                    <ChevronDown
                      className="h-5 w-5 shrink-0 text-[#58CC02] transition-transform group-open:rotate-180"
                      strokeWidth={3}
                    />
                  </summary>
                  <p className="px-6 text-sm font-bold leading-relaxed text-[#777]">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-12 text-center">
          <Logo />
          <p className="max-w-sm text-sm font-bold text-[#777]">
            Focused question banks for every SCFHS exam. Practice smarter and
            pass the first time.
          </p>
          <p className="text-xs font-bold text-[#AFAFAF]">
            &copy; {new Date().getFullYear()} DrNote. All rights reserved.
          </p>
        </div>
      </footer>

      <SpeedInsights />
      <Analytics />
    </div>
  );
}
