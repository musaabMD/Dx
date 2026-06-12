import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const sourceType = v.union(
  v.literal("website"),
  v.literal("file"),
  v.literal("text"),
  v.literal("qa"),
  v.literal("notion"),
  v.literal("ticket")
);

export const list = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sources")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
  },
});

export const add = mutation({
  args: {
    agentId: v.id("agents"),
    type: sourceType,
    title: v.string(),
    url: v.optional(v.string()),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sources", {
      ...args,
      status: "ready",
      createdAt: Date.now(),
    });
  },
});
