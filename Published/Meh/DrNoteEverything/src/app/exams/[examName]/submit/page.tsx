import { ResourceSubmitForm } from "@/components/resource-submit-form";
import { PublicHeader } from "@/components/site-header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const resourceTypes = ["Qbank", "Flashcards", "Files", "Study plans", "PPT", "Library", "Notes"];

const examTitles: Record<string, string> = {
  "aws-cloud-practitioner": "AWS Cloud Practitioner",
  ielts: "IELTS",
  mcat: "MCAT",
  "nclex-rn": "NCLEX-RN",
  sat: "SAT",
  "usmle-step-1": "USMLE Step 1",
};

type SubmitResourcePageProps = {
  params: Promise<{ examName: string }>;
};

function toTitle(value: string) {
  if (examTitles[value]) {
    return examTitles[value];
  }

  return decodeURIComponent(value)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function SubmitResourcePage({ params }: SubmitResourcePageProps) {
  const { examName } = await params;
  const title = toTitle(examName);
  const backHref = `/exams/${examName}`;

  return (
    <>
      <PublicHeader />
      <main className="resource-submit-page">
        <section>
          <Link className="detail-back-link" href={backHref}>
            <ArrowLeft aria-hidden="true" size={14} strokeWidth={2.3} />
            {title}
          </Link>
          <p className="resource-submit-kicker">Submit resource</p>
          <h1>Add to {title}</h1>
          <ResourceSubmitForm backHref={backHref} contextTitle={title} resourceTypes={resourceTypes} />
        </section>
      </main>
    </>
  );
}
