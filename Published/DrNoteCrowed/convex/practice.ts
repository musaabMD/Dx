import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ensureUsageDay, getCurrentUser, getPlanLimits, requireCurrentUser } from "./lib";

export const mySessions = query({
  args: { examId: v.optional(v.string()), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const { examId } = args;
    const base = examId
      ? ctx.db
          .query("sessions")
          .withIndex("by_user_exam", q => q.eq("userId", user._id).eq("examId", examId))
      : ctx.db.query("sessions").withIndex("by_user", q => q.eq("userId", user._id));
    return await base.order("desc").take(Math.min(args.limit ?? 20, 100));
  },
});

export const startSession = mutation({
  args: {
    examId: v.string(),
    title: v.string(),
    mode: v.union(v.literal("practice"), v.literal("mock")),
    source: v.optional(v.string()),
    totalQuestions: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const planLimits = await getPlanLimits(ctx, user);

    if (args.mode === "mock") {
      if (planLimits.mockExamsPerDay <= 0) {
        throw new Error("Mock exams are a Pro feature.");
      }
      const usageToday = await ensureUsageDay(ctx, user._id, user.clerkUserId);
      if (!usageToday) {
        throw new Error("Could not read usage for today.");
      }
      const mockStarted = usageToday?.mockExamsStarted ?? 0;
      if (mockStarted >= planLimits.mockExamsPerDay) {
        throw new Error("You reached today's mock exam limit. Upgrade for more.");
      }
      await ctx.db.patch(usageToday._id, {
        mockExamsStarted: mockStarted + 1,
        updatedAt: now,
      });
    }

    return await ctx.db.insert("sessions", {
      userId: user._id,
      clerkUserId: user.clerkUserId,
      examId: args.examId,
      title: args.title,
      mode: args.mode,
      source: args.source,
      status: "active",
      totalQuestions: args.totalQuestions,
      answered: 0,
      correct: 0,
      incorrect: 0,
      flagged: 0,
      startedAt: now,
      updatedAt: now,
    });
  },
});

export const recordAnswer = mutation({
  args: {
    sessionId: v.optional(v.id("sessions")),
    questionId: v.id("questions"),
    selectedOptionId: v.string(),
    correct: v.boolean(),
    timeMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found.");
    }
    if (args.sessionId) {
      const session = await ctx.db.get(args.sessionId);
      if (!session || session.userId !== user._id) {
        throw new Error("Session not found.");
      }
      if (session.examId !== question.examId) {
        throw new Error("Session exam mismatch.");
      }
    }
    const answerId = await ctx.db.insert("answers", {
      userId: user._id,
      clerkUserId: user.clerkUserId,
      sessionId: args.sessionId,
      examId: question.examId,
      questionId: args.questionId,
      selectedOptionId: args.selectedOptionId,
      correct: args.correct,
      timeMs: args.timeMs,
      answeredAt: now,
    });

    if (args.sessionId) {
      const session = await ctx.db.get(args.sessionId);
      if (session && session.userId === user._id) {
        await ctx.db.patch(session._id, {
          answered: session.answered + 1,
          correct: session.correct + (args.correct ? 1 : 0),
          incorrect: session.incorrect + (args.correct ? 0 : 1),
          updatedAt: now,
        });
      }
    }

    return answerId;
  },
});

export const finishSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    flagged: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== user._id) {
      throw new Error("Session not found.");
    }
    await ctx.db.patch(session._id, {
      status: "completed",
      flagged: args.flagged ?? session.flagged,
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });
    return session._id;
  },
});
