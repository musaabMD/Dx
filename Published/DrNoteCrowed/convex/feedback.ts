import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireCurrentUser } from "./lib";

export const commentsForQuestion = query({
  args: { questionKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("questionComments")
      .withIndex("by_question_key", q => q.eq("questionKey", args.questionKey))
      .order("desc")
      .take(50);
  },
});

export const addComment = mutation({
  args: {
    questionKey: v.string(),
    questionId: v.optional(v.id("questions")),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db.insert("questionComments", {
      userId: user._id,
      clerkUserId: user.clerkUserId,
      questionKey: args.questionKey,
      questionId: args.questionId,
      text: args.text,
      createdAt: Date.now(),
    });
  },
});

export const rateQuestion = mutation({
  args: {
    questionKey: v.string(),
    questionId: v.optional(v.id("questions")),
    rating: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Sign in required.");
    const existing = await ctx.db
      .query("questionRatings")
      .withIndex("by_user_question_key", q =>
        q.eq("userId", user._id).eq("questionKey", args.questionKey)
      )
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { rating: args.rating, updatedAt: Date.now() });
      return existing._id;
    }
    return await ctx.db.insert("questionRatings", {
      userId: user._id,
      clerkUserId: user.clerkUserId,
      questionKey: args.questionKey,
      questionId: args.questionId,
      rating: args.rating,
      updatedAt: Date.now(),
    });
  },
});

export const reportQuestion = mutation({
  args: {
    questionKey: v.string(),
    questionId: v.optional(v.id("questions")),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    return await ctx.db.insert("questionReports", {
      userId: user._id,
      clerkUserId: user.clerkUserId,
      questionKey: args.questionKey,
      questionId: args.questionId,
      reason: args.reason,
      status: "open",
      createdAt: Date.now(),
    });
  },
});
