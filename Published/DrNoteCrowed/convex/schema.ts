import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const plan = v.union(
  v.literal("free"),
  v.literal("monthly"),
  v.literal("quarterly"),
  v.literal("yearly")
);

const reviewStatus = v.union(
  v.literal("flagged"),
  v.literal("incorrect"),
  v.literal("correct"),
  v.literal("unanswered")
);

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    plan,
    billingStatus: v.optional(v.string()),
    clerkSubscriptionId: v.optional(v.string()),
    // Subscription state for grace periods / gating
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("past_due"),
        v.literal("canceled"),
        v.literal("trialing"),
        v.literal("paused")
      )
    ),
    currentPeriodEnd: v.optional(v.number()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
    trialEndsAt: v.optional(v.number()),
    invitedByClerkUserId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_invited_by", ["invitedByClerkUserId"])
    .index("by_email", ["email"]),

  questions: defineTable({
    externalId: v.string(),
    examId: v.string(),
    subject: v.string(),
    topic: v.string(),
    subtopic: v.optional(v.string()),
    tags: v.array(v.string()),
    prompt: v.string(),
    options: v.array(v.object({ id: v.string(), label: v.string() })),
    correctOptionId: v.string(),
    explanation: v.string(),
    objective: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    source: v.optional(v.string()),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_external_id", ["externalId"])
    .index("by_exam", ["examId"])
    .index("by_exam_subject", ["examId", "subject"])
    .index("by_exam_topic", ["examId", "topic"])
    .index("by_exam_active", ["examId", "active"]),

  usageDays: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    day: v.string(),
    questionsAnswered: v.number(),
    aiAsks: v.number(),
    mockExamsStarted: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_day", ["userId", "day"])
    .index("by_clerk_day", ["clerkUserId", "day"]),

  sessions: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    examId: v.string(),
    title: v.string(),
    mode: v.union(v.literal("practice"), v.literal("mock")),
    source: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("abandoned")),
    totalQuestions: v.number(),
    answered: v.number(),
    correct: v.number(),
    incorrect: v.number(),
    flagged: v.number(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_exam", ["userId", "examId"])
    .index("by_exam", ["examId"]),

  answers: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    sessionId: v.optional(v.id("sessions")),
    examId: v.optional(v.string()),
    questionId: v.id("questions"),
    selectedOptionId: v.string(),
    correct: v.boolean(),
    timeMs: v.optional(v.number()),
    answeredAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_exam", ["userId", "examId"])
    .index("by_session", ["sessionId"])
    .index("by_user_question", ["userId", "questionId"])
    .index("by_question", ["questionId"]),

  reviews: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    examId: v.optional(v.string()),
    questionId: v.id("questions"),
    status: reviewStatus,
    note: v.optional(v.string()),
    dueAt: v.optional(v.number()),
    // SRS fields for proper spaced repetition
    interval: v.optional(v.number()),
    easeFactor: v.optional(v.number()),
    lapses: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_exam", ["userId", "examId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_status_exam", ["userId", "status", "examId"])
    .index("by_user_question", ["userId", "questionId"]),

  questionComments: defineTable({
    userId: v.optional(v.id("users")),
    clerkUserId: v.optional(v.string()),
    questionKey: v.string(),
    questionId: v.optional(v.id("questions")),
    text: v.string(),
    createdAt: v.number(),
  })
    .index("by_question_key", ["questionKey"])
    .index("by_user", ["userId"]),

  questionRatings: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    questionKey: v.string(),
    questionId: v.optional(v.id("questions")),
    rating: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_question_key", ["userId", "questionKey"])
    .index("by_question_key", ["questionKey"]),

  questionReports: defineTable({
    userId: v.optional(v.id("users")),
    clerkUserId: v.optional(v.string()),
    questionKey: v.string(),
    questionId: v.optional(v.id("questions")),
    reason: v.string(),
    status: v.union(v.literal("open"), v.literal("reviewed"), v.literal("closed")),
    createdAt: v.number(),
  })
    .index("by_question_key", ["questionKey"])
    .index("by_status", ["status"]),

  // Per-question aggregate stats for AI auto-review at scale
  questionStats: defineTable({
    questionId: v.id("questions"),
    externalId: v.string(),
    totalAnswers: v.number(),
    correctCount: v.number(),
    incorrectCount: v.number(),
    avgRating: v.number(),
    reportCount: v.number(),
    flagCount: v.number(),
    aiReviewStatus: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("fixed")
    ),
    lastComputedAt: v.number(),
  })
    .index("by_question", ["questionId"])
    .index("by_review_status", ["aiReviewStatus"])
    .index("by_external_id", ["externalId"]),

  // Pre-computed user performance snapshot per exam
  userExamStats: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    examId: v.string(),
    totalAnswered: v.number(),
    correct: v.number(),
    incorrect: v.number(),
    bySubject: v.any(),
    byDifficulty: v.any(),
    weakTopics: v.array(v.string()),
    updatedAt: v.number(),
  })
    .index("by_user_exam", ["userId", "examId"])
    .index("by_user", ["userId"]),

  notes: defineTable({
    userId: v.optional(v.id("users")),
    clerkUserId: v.optional(v.string()),
    examId: v.string(),
    title: v.string(),
    kind: v.string(),
    category: v.string(),
    text: v.string(),
    tags: v.array(v.string()),
    bookmarked: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_exam", ["userId", "examId"])
    .index("by_exam", ["examId"]),

  libraryItems: defineTable({
    externalId: v.string(),
    examId: v.string(),
    type: v.string(),
    title: v.string(),
    summary: v.string(),
    tags: v.array(v.string()),
    sections: v.array(v.object({ heading: v.string(), body: v.string() })),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_external_id", ["externalId"])
    .index("by_exam", ["examId"]),

  // AI conversation threads — one per user+question
  aiThreads: defineTable({
    userId: v.id("users"),
    clerkUserId: v.string(),
    questionId: v.optional(v.id("questions")),
    examId: v.optional(v.string()),
    scope: v.union(v.literal("exam"), v.literal("question"), v.literal("review")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_question", ["userId", "questionId"])
    .index("by_user_exam", ["userId", "examId"]),

  // Individual messages inside a thread
  aiMessages: defineTable({
    threadId: v.id("aiThreads"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    tokens: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_thread", ["threadId"]),

  // Legacy flat AI log (kept for compatibility)
  aiUsages: defineTable({
    userId: v.optional(v.id("users")),
    clerkUserId: v.optional(v.string()),
    examId: v.optional(v.string()),
    questionId: v.optional(v.id("questions")),
    scope: v.union(v.literal("exam"), v.literal("question"), v.literal("review")),
    prompt: v.string(),
    answer: v.string(),
    tokens: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_user_exam", ["userId", "examId"]),

  billingEvents: defineTable({
    clerkUserId: v.optional(v.string()),
    eventId: v.string(),
    eventType: v.string(),
    status: v.optional(v.string()),
    plan: v.optional(plan),
    subscriptionId: v.optional(v.string()),
    payload: v.any(),
    createdAt: v.number(),
  })
    .index("by_event_id", ["eventId"])
    .index("by_clerk_user", ["clerkUserId"]),

  // Config-driven plan limits — change here, no code deploy needed
  planLimits: defineTable({
    plan,
    questionsPerDay: v.number(),
    aiAsksPerDay: v.number(),
    mockExamsPerDay: v.number(),
    reviewQueueMax: v.number(),
    canAccessLibrary: v.boolean(),
    canExportNotes: v.boolean(),
    updatedAt: v.number(),
  }).index("by_plan", ["plan"]),

  // Support chat — AI automated, logs everything, escalates to human
  supportTickets: defineTable({
    userId: v.optional(v.id("users")),
    clerkUserId: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("ai_resolved"),
      v.literal("needs_human"),
      v.literal("closed")
    ),
    category: v.optional(v.string()),
    aiHandled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  supportMessages: defineTable({
    ticketId: v.id("supportTickets"),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("admin")
    ),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_ticket", ["ticketId"]),
});
