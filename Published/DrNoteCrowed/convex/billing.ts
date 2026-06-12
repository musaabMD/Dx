import { mutation } from "./_generated/server";
import { v } from "convex/values";

const plan = v.union(
  v.literal("free"),
  v.literal("monthly"),
  v.literal("quarterly"),
  v.literal("yearly")
);

export const syncClerkEvent = mutation({
  args: {
    eventId: v.string(),
    eventType: v.string(),
    clerkUserId: v.optional(v.string()),
    status: v.optional(v.string()),
    plan: v.optional(plan),
    subscriptionId: v.optional(v.string()),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingEvent = await ctx.db
      .query("billingEvents")
      .withIndex("by_event_id", q => q.eq("eventId", args.eventId))
      .unique();

    if (!existingEvent) {
      await ctx.db.insert("billingEvents", {
        eventId: args.eventId,
        eventType: args.eventType,
        clerkUserId: args.clerkUserId,
        status: args.status,
        plan: args.plan,
        subscriptionId: args.subscriptionId,
        payload: args.payload,
        createdAt: now,
      });
    }

    if (args.clerkUserId) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_user_id", q => q.eq("clerkUserId", args.clerkUserId!))
        .unique();

      if (user) {
        const payload = args.payload as Record<string, any>;
        const periodEnd = payload?.current_period_end ?? payload?.items?.[0]?.period_end;
        await ctx.db.patch(user._id, {
          plan: args.plan ?? (args.status === "canceled" || args.status === "cancelled" || args.status === "ended" || args.status === "expired" ? "free" : user.plan),
          billingStatus: args.status ?? user.billingStatus,
          clerkSubscriptionId: args.subscriptionId ?? user.clerkSubscriptionId,
          subscriptionStatus: (args.status as any) ?? user.subscriptionStatus,
          currentPeriodEnd: periodEnd ? Math.round(periodEnd) : user.currentPeriodEnd,
          cancelAtPeriodEnd: payload?.cancel_at_period_end ?? user.cancelAtPeriodEnd,
          updatedAt: now,
        });
      }
    }

    return existingEvent?._id ?? null;
  },
});
