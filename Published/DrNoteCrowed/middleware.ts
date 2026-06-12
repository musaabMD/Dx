import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();

export const config = {
  matcher: [
    "/exams/:examId/ask",
    "/exams/:examId/mock",
    "/exams/:examId/practice",
  ],
};
