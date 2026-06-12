import Header from "@/components/Header";
import { Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#3C3C3C]">
      <Header />
      <main>
        <section className="border-b-2 border-[#E5E5E5] bg-white px-4 py-10 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#E7F8D6] bg-[#F3FBE9] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#58A700]">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            Choose your access
          </span>
          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-tight md:text-5xl">
            DrNote plans
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base font-bold leading-7 text-[#777]">
            Secure checkout for SCFHS question banks and exam preparation access.
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8">
          <div
            className="overflow-hidden rounded-2xl border-2 border-[#E5E5E5] bg-white"
            style={{ boxShadow: "0 5px 0 #E5E5E5" }}
          >
            <iframe
              src="https://app.payhere.co/drnote"
              className="block h-[calc(100vh-220px)] min-h-[680px] w-full"
              title="DrNote pricing checkout"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
