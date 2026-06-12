import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ExamNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0e0e10] text-white">
      <h1 className="text-2xl font-bold">Exam not found</h1>
      <p className="text-muted-foreground">
        The exam you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
        <Link href="/">Back to exams</Link>
      </Button>
    </div>
  );
}
