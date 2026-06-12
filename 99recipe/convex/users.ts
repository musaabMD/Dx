import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const dietValues = v.union(
  v.literal("keto"),
  v.literal("lowCarb"),
  v.literal("highProtein"),
  v.literal("diabetic"),
  v.literal("balanced"),
);

export const upsert = mutation({
  args: {
    clerkId: v.string(),
    username: v.string(),
    imageUrl: v.optional(v.string()),
    selectedDiet: dietValues,
    dailyCalorieGoal: v.number(),
    dailyProteinGoal: v.number(),
    dailyCarbGoal: v.number(),
    dailyFatGoal: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        username: args.username,
        imageUrl: args.imageUrl,
        selectedDiet: args.selectedDiet,
        dailyCalorieGoal: args.dailyCalorieGoal,
        dailyProteinGoal: args.dailyProteinGoal,
        dailyCarbGoal: args.dailyCarbGoal,
        dailyFatGoal: args.dailyFatGoal,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const me = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});
