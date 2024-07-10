
import Link from "next/link";
import Header from "@/components/Header";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import ExamHome from "@/components/ExamHome"; // Import the new component
import Features from "@/components/Features";

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <section className="flex flex-col items-center justify-center text-center gap-12 px-8 py-24">
          <h1 className="text-5xl font-sans font-bold">DrNote Qbank</h1>
          <p className="text-3xl opacity-80">
            The #1 Choice for SCFHS Exams
          </p>
          <Link href="/pricing">
            <span className="btn btn-error text-white btn-xl sm:btn-sm md:btn-md lg:btn-lg text-3xl">
              Subscribe 
            </span>
          </Link>
        </section>
        <ExamHome /> 
        <Features />
        <FAQ />
      </main>
    </>
  );
}

