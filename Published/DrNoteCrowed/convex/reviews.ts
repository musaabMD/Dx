import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireCurrentUser } from "./lib";

const status = v.union(
  v.literal("flagged"),
  v.literal("incorrect"),
  v.literal("correct"),
  v.literal("unanswered")
);

export const mine = query({
  args: {
    examId: v.optional(v.string()),
    status: v.optional(status),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const limit = Math.min(args.limit ?? 20, 100);
    const base = args.status
      ? args.examId
        ? ctx.db
            .query("reviews")
            .withIndex("by_user_status_exam", q =>
              q
                .eq("userId", user._id)
                .eq("status", args.status!)
                .eq("examId", args.examId)
            )
        : ctx.db
            .query("reviews")
            .withIndex("by_user_status", q =>
              q.eq("userId", user._id).eq("status", args.status!)
            )
      : args.examId
      ? ctx.db
          .query("reviews")
          .withIndex("by_user_exam", q => q.eq("userId", user._id).eq("examId", args.examId))
      : ctx.db.query("reviews").withIndex("by_user", q => q.eq("userId", user._id));
    const reviews = await base.order("desc").take(limit);
    const rows = await Promise.all(
      reviews.map(async review => ({
        ...review,
        question: await ctx.db.get(review.questionId),
      }))
    );
    return args.examId ? rows.filter(row => row.examId === args.examId || row.question?.examId === args.examId) : rows;
  },
});

export const upsert = mutation({
  args: {
    questionId: v.id("questions"),
    status,
    note: v.optional(v.string()),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const question = await ctx.db.get(args.questionId);
    if (!question) {
      throw new Error("Question not found.");
    }
    const existing = await ctx.db
      .query("reviews")
      .withIndex("by_user_question", q =>
        q.eq("userId", user._id).eq("questionId", args.questionId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        note: args.note,
        dueAt: args.dueAt,
        examId: question.examId,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("reviews", {
      userId: user._id,
      clerkUserId: user.clerkUserId,
      examId: question.examId,
      questionId: args.questionId,
      status: args.status,
      note: args.note,
      dueAt: args.dueAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});
