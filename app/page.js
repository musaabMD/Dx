'use client';

import Header from "@/components/Header";
import ExamHome from "@/components/ExamHome";
import { Suspense } from 'react';
import FAQ from "@/components/FAQ"; 
import Features from "@/components/Features";
import TimerBanner from "@/components/TimerBanner";
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/react';

export default function Page() {
  return (
    <>
      <Suspense>
        <TimerBanner />
        <Header />
        <main>
          <section className="relative isolate overflow-hidden bg-slate-100 items-center justify-center text-center gap-12 px-8 py-24">
            <h1 className="text-5xl font-sans font-bold text-black">DrNote Qbank</h1>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-blue-800 sm:text-6xl">
              Pass with Confidence. The First Time.
            </h1>
            <p className="mt-6 text-3xl opacity-80 text-black">
              The #1 Choice for SCFHS Exams
            </p>
            <div className="mt-8 text-2xl text-gray-600">
              Trusted by over 20,000 medical professionals
            </div>
            <div className="mt-8 flex justify-center gap-4">
              <a href="/sigin" className="rounded-md bg-blue-600 px-8 py-4 text-xl font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                Start Free Trial
              </a>
             
            </div>
          </section>
          <ExamHome />
          <Features />
          <FAQ /> 
        </main>
        <SpeedInsights />
        <Analytics />
      </Suspense>
    </>
  );
}
