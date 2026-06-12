import { CourseContent } from "@/components/course-content";
import { PublicHeader } from "@/components/site-header";

type CoursePageProps = {
  params: Promise<{ courseName: string }>;
};

function toTitle(value: string) {
  return decodeURIComponent(value)
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseName } = await params;

  return (
    <>
      <PublicHeader />
      <CourseContent kicker="Course" title={toTitle(courseName)} />
    </>
  );
}
