import Link from "next/link";
import Header from "@/components/Header";
import ExamHome from "@/components/ExamHome";
import { Suspense } from 'react';
import FAQ from "@/components/FAQ"; // Correctly importing FAQ
import Features from "@/components/Features";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function Page() {
  return (
    <>
      <Suspense>
        <Header />
        <main>
          <section className="flex flex-col items-center justify-center text-center gap-12 px-8 py-24">
            <h1 className="text-5xl font-sans font-bold">DrNote Qbank</h1>
            <p className="text-3xl opacity-80">
              The #1 Choice for SCFHS Exams
            </p>
          </section>
          <ExamHome />
          <Features/>
          <FAQ /> {/* Correctly using FAQ */}
        </main>
        <SpeedInsights />
        <Analytics />
      </Suspense>
    </>
  );
}
