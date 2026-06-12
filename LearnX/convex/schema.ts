import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    category: v.optional(v.string()),
  }).index("by_completed", ["isCompleted"]),

  userProfiles: defineTable({
    externalId: v.string(),
    name: v.string(),
    email: v.string(),
    streakDays: v.number(),
    totalXP: v.number(),
    creditsRemaining: v.number(),
  }).index("by_external_id", ["externalId"]),

  courses: defineTable({
    title: v.string(),
    emoji: v.string(),
    style: v.union(v.literal("duolingo"), v.literal("lecture"), v.literal("bootcamp"), v.literal("custom")),
    audience: v.union(v.literal("me"), v.literal("students"), v.literal("kids"), v.literal("team")),
    isPublic: v.boolean(),
    estimatedMinutes: v.number(),
    progress: v.number(),
    averageScore: v.optional(v.number()),
    views: v.optional(v.number()),
  }).index("by_progress", ["progress"]),

  lessons: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    content: v.string(),
    keyPoints: v.array(v.string()),
    order: v.number(),
  }).index("by_course", ["courseId"]),

  exercises: defineTable({
    lessonId: v.id("lessons"),
    type: v.union(
      v.literal("mcq"),
      v.literal("flashcard"),
      v.literal("fillIn"),
      v.literal("speaking"),
      v.literal("image"),
      v.literal("mixed")
    ),
    question: v.string(),
    options: v.array(v.string()),
    correctIndex: v.optional(v.number()),
    answer: v.string(),
    explanation: v.string(),
  }).index("by_lesson", ["lessonId"]),
});
