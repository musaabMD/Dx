import { NextResponse } from "next/server";
import { EXAMS } from "@/lib/exams";
import { getLiveCount } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = EXAMS.map((e) => ({
    slug: e.slug,
    name: e.name,
    shortName: e.shortName,
    iconLabel: e.iconLabel,
    category: e.category,
    description: e.description,
    accent: e.accent,
    members: e.baseMembers,
    live: getLiveCount(e.slug, e.baseMembers),
  }));
  return NextResponse.json({ exams: data });
}
