import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ensureUsageDay, getCurrentUser, getPlanLimits, requireCurrentUser } from "./lib";

const scope = v.union(v.literal("exam"), v.literal("question"), v.literal("review"));

// --- Threaded AI chat (per question/exam) ---

export const getThread = query({
  args: {
    questionId: v.optional(v.id("questions")),
    examId: v.optional(v.string()),
    scope,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    if (args.questionId) {
      return await ctx.db
        .query("aiThreads")
        .withIndex("by_user_question", q =>
          q.eq("userId", user._id).eq("questionId", args.questionId!)
        )
        .unique();
    }
    return await ctx.db
      .query("aiThreads")
      .withIndex("by_user_exam", q =>
        q.eq("userId", user._id).eq("examId", args.examId!)
      )
      .first();
  },
});

export const threadMessages = query({
  args: { threadId: v.id("aiThreads") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("aiMessages")
      .withIndex("by_thread", q => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
  },
});

export const getOrCreateThread = mutation({
  args: {
    questionId: v.optional(v.id("questions")),
    examId: v.optional(v.string()),
    scope,
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    if (args.questionId) {
      const existing = await ctx.db
        .query("aiThreads")
        .withIndex("by_user_question", q =>
          q.eq("userId", user._id).eq("questionId", args.questionId!)
        )
        .unique();
      if (existing) return existing._id;
    } else if (args.examId) {
      const existing = await ctx.db
        .query("aiThreads")
        .withIndex("by_user_exam", q =>
          q.eq("userId", user._id).eq("examId", args.examId!)
        )
        .first();
      if (existing) return existing._id;
    }

    return await ctx.db.insert("aiThreads", {
      userId: user._id,
      clerkUserId: user.clerkUserId,
      questionId: args.questionId,
      examId: args.examId,
      scope: args.scope,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const addMessage = mutation({
  args: {
    threadId: v.id("aiThreads"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    tokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    const thread = await ctx.db.get(args.threadId);
    if (!thread || thread.userId !== user._id) throw new Error("Thread not found.");

    await ctx.db.patch(args.threadId, { updatedAt: now });

    if (args.role === "user") {
      const planLimits = await getPlanLimits(ctx, user);
      const usage = await ensureUsageDay(ctx, user._id, user.clerkUserId);
      if (!usage) throw new Error("Could not create usage record.");
      const nextCount = usage.aiAsks + 1;

      if (planLimits.aiAsksPerDay <= 0) {
        throw new Error("AI tutor is not available on your current plan.");
      }
      if (nextCount > planLimits.aiAsksPerDay) {
        throw new Error("You reached today's AI ask limit. Upgrade for a higher limit.");
      }
      await ctx.db.patch(usage._id, { aiAsks: usage.aiAsks + 1, updatedAt: now });
    }

    return await ctx.db.insert("aiMessages", {
      threadId: args.threadId,
      role: args.role,
      content: args.content,
      tokens: args.tokens,
      createdAt: now,
    });
  },
});

// --- Legacy flat log (kept for backwards compat) ---

export const listMine = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("aiUsages")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .order("desc")
      .take(Math.min(args.limit ?? 20, 100));
  },
});

export const logAsk = mutation({
  args: {
    examId: v.optional(v.string()),
    questionId: v.optional(v.id("questions")),
    scope,
    prompt: v.string(),
    answer: v.string(),
    tokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const planLimits = await getPlanLimits(ctx, user);
    const usage = await ensureUsageDay(ctx, user._id, user.clerkUserId);
    if (!usage) throw new Error("Could not create usage record.");
    const nextCount = usage.aiAsks + 1;

    if (planLimits.aiAsksPerDay <= 0) {
      throw new Error("AI tutor is not available on your current plan.");
    }
    if (nextCount > planLimits.aiAsksPerDay) {
      throw new Error("You reached today's AI ask limit. Upgrade for a higher limit.");
    }
    await ctx.db.patch(usage._id, { aiAsks: usage.aiAsks + 1, updatedAt: now });

    return await ctx.db.insert("aiUsages", {
      userId: user._id,
      clerkUserId: user.clerkUserId,
      examId: args.examId,
      questionId: args.questionId,
      scope: args.scope,
      prompt: args.prompt,
      answer: args.answer,
      tokens: args.tokens,
      createdAt: now,
    });
  },
});
