import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./lib";
import { INVITE_TRIAL_MILLISECONDS } from "./lib";

export const current = query({
  args: {},
  handler: async ctx => {
    return await getCurrentUser(ctx);
  },
});

export const syncCurrentUser = mutation({
  args: {
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    invitedByClerkUserId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Sign in required.");

    const now = Date.now();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_user_id", q => q.eq("clerkUserId", identity.subject))
      .unique();

    const email = args.email ?? (identity.email as string | undefined);
    const name = args.name ?? identity.name;
    const imageUrl = args.imageUrl ?? identity.pictureUrl;
    const inviteCode = args.invitedByClerkUserId?.trim();
    const validInvite = inviteCode
      ? await ctx.db
          .query("users")
          .withIndex("by_clerk_user_id", q => q.eq("clerkUserId", inviteCode))
          .unique()
      : null;

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        name,
        imageUrl,
        updatedAt: now,
        lastSeenAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkUserId: identity.subject,
      email,
      name,
      imageUrl,
      plan: "free",
      billingStatus: "free",
      subscriptionStatus: "active",
      invitedByClerkUserId: validInvite && validInvite.clerkUserId !== identity.subject ? validInvite.clerkUserId : undefined,
      trialEndsAt: validInvite && validInvite.clerkUserId !== identity.subject
        ? now + INVITE_TRIAL_MILLISECONDS
        : undefined,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
    });
  },
});
