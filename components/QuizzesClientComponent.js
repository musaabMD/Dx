'use client';

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
          <section className="relative isolate overflow-hidden bg-slate-100 items-center justify-center text-center gap-12 px-8 py-24">
            <br />
            <br />
            <h1 className="text-5xl font-sans font-bold text-black">DrNote Qbank </h1>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-blue-800 sm:text-6xl">
              Pass with Confidence...
              The First Time
            </h1>
            <br />
            <br />
            <p className="text-3xl opacity-80 text-black">
              The #1 Choice for SCFHS Exams
            </p>
            <br />
            <br />
            <br />
            <br />
          </section>
          <ExamHome />
          <Features />
          <FAQ /> {/* Correctly using FAQ */}
        </main>
        <SpeedInsights />
        <Analytics />
      </Suspense>
    </>
  );
}
