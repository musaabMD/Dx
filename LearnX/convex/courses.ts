import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listCourses = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("courses").collect();
  },
});

export const getCourseBundle = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .collect();

    const lessonsWithExercises = await Promise.all(
      lessons
        .sort((a, b) => a.order - b.order)
        .map(async (lesson) => {
          const exercises = await ctx.db
            .query("exercises")
            .withIndex("by_lesson", (q) => q.eq("lessonId", lesson._id))
            .collect();
          return { ...lesson, exercises };
        })
    );

    return { course, lessons: lessonsWithExercises };
  },
});

export const seedLearnXData = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("courses").collect();
    if (existing.length > 0) {
      return { seeded: false, reason: "courses already exist" };
    }

    const courseId = await ctx.db.insert("courses", {
      title: "Spanish in 30 Days",
      emoji: "🇪🇸",
      style: "duolingo",
      audience: "me",
      isPublic: true,
      estimatedMinutes: 30,
      progress: 0.8,
      averageScore: 84,
      views: 1284,
    });

    const lesson1 = await ctx.db.insert("lessons", {
      courseId,
      title: "Foundations",
      content: "Basics of vocabulary and sentence structure.",
      keyPoints: ["Greetings", "Pronouns", "Present tense basics"],
      order: 1,
    });

    const lesson2 = await ctx.db.insert("lessons", {
      courseId,
      title: "Application",
      content: "Apply vocabulary in practical real-world contexts.",
      keyPoints: ["Travel phrases", "Restaurant phrases", "Small talk"],
      order: 2,
    });

    await ctx.db.insert("exercises", {
      lessonId: lesson1,
      type: "mcq",
      question: "How do you say 'Hello' in Spanish?",
      options: ["Hola", "Adios", "Gracias", "Por favor"],
      correctIndex: 0,
      answer: "Hola",
      explanation: "Hola means Hello.",
    });

    await ctx.db.insert("exercises", {
      lessonId: lesson2,
      type: "flashcard",
      question: "Translate: 'Gracias'",
      options: [],
      answer: "Thank you",
      explanation: "Gracias is a common appreciation phrase.",
    });

    await ctx.db.insert("userProfiles", {
      externalId: "local-user",
      name: "Alex Rivera",
      email: "alex@example.com",
      streakDays: 7,
      totalXP: 420,
      creditsRemaining: 100,
    });

    return { seeded: true };
  },
});
