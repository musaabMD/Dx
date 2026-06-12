import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { usageWindowKey, ensureUsageDay, getCurrentUser, getPlanLimits, requireCurrentUser } from "./lib";

export const today = query({
  args: {},
  handler: async ctx => {
    const day = usageWindowKey();
    const user = await getCurrentUser(ctx);
    if (!user) {
      return {
        day,
        questionsAnswered: 0,
        aiAsks: 0,
        mockExamsStarted: 0,
      };
    }
    const usage = await ctx.db
      .query("usageDays")
      .withIndex("by_user_day", q => q.eq("userId", user._id).eq("day", day))
      .unique();
    return (
      usage ?? {
        day,
        questionsAnswered: 0,
        aiAsks: 0,
        mockExamsStarted: 0,
      }
    );
  },
});

export const consumeQuestion = mutation({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const usage = await ensureUsageDay(ctx, user._id, user.clerkUserId);
    if (!usage) throw new Error("Could not create usage record.");
    const planLimits = await getPlanLimits(ctx, user);
    const nextCount = usage.questionsAnswered + (args.count ?? 1);

    if (nextCount > planLimits.questionsPerDay) {
      throw new Error("Free daily question limit reached. Upgrade to unlock unlimited practice.");
    }

    await ctx.db.patch(usage._id, {
      questionsAnswered: usage.questionsAnswered + (args.count ?? 1),
      updatedAt: Date.now(),
    });
    return usage._id;
  },
});

export const consumeAiAsk = mutation({
  args: { count: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const usage = await ensureUsageDay(ctx, user._id, user.clerkUserId);
    if (!usage) throw new Error("Could not create usage record.");
    const planLimits = await getPlanLimits(ctx, user);
    const nextCount = usage.aiAsks + (args.count ?? 1);

    if (planLimits.aiAsksPerDay <= 0) {
      throw new Error("AI tutor is not available on your current plan.");
    }
    if (nextCount > planLimits.aiAsksPerDay) {
      throw new Error("You reached today's AI ask limit. Upgrade for a higher limit.");
    }

    await ctx.db.patch(usage._id, {
      aiAsks: usage.aiAsks + (args.count ?? 1),
      updatedAt: Date.now(),
    });
    return usage._id;
  },
});
