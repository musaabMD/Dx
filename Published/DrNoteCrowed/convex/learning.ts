import { query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./lib";

export const notes = query({
  args: { examId: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (user) {
      const mine = await ctx.db
        .query("notes")
        .withIndex("by_user_exam", q => q.eq("userId", user._id).eq("examId", args.examId))
        .collect();
      if (mine.length) return mine;
    }
    return await ctx.db
      .query("notes")
      .withIndex("by_exam", q => q.eq("examId", args.examId))
      .collect();
  },
});

export const library = query({
  args: { examId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("libraryItems")
      .withIndex("by_exam", q => q.eq("examId", args.examId))
      .collect();
  },
});
