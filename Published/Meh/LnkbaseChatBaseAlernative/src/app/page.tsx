import { LandingHero } from "@/components/landing-hero";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-[#15161a]">
      <SiteHeader />
      <LandingHero />
    </main>
  );
}
