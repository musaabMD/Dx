import type { Metadata } from "next";
import { metadataForPath } from "@/lib/seo";
import PricingPageClient from "@/components/pricing-page-client";

export const metadata: Metadata = metadataForPath({
  title: "DrNote Pro Pricing",
  description: "See Pro plans for unlimited practice questions, AI tutor access, and full mock exams for medical exam preparation.",
  path: "/pricing",
  keywords: ["DrNote Pro", "medical exam prep", "pricing", "upgrade"],
});

export default function Page() {
  return <PricingPageClient />;
}
