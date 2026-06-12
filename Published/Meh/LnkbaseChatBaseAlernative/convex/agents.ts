import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("agents").order("desc").collect();
  },
});

export const get = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.agentId);
  },
});

export const getDetails = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return null;

    const sources = await ctx.db
      .query("sources")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    return { agent, sources, conversations, leads };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    websiteUrl: v.optional(v.string()),
    instructions: v.string(),
    summary: v.string(),
    model: v.optional(v.string()),
    themeColor: v.string(),
    welcomeMessage: v.string(),
    suggestedQuestions: v.array(v.string()),
    tools: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("agents", {
      ...args,
      status: "ready",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    agentId: v.id("agents"),
    name: v.optional(v.string()),
    instructions: v.optional(v.string()),
    summary: v.optional(v.string()),
    model: v.optional(v.string()),
    themeColor: v.optional(v.string()),
    welcomeMessage: v.optional(v.string()),
    suggestedQuestions: v.optional(v.array(v.string())),
    status: v.optional(
      v.union(v.literal("training"), v.literal("ready"), v.literal("failed"))
    ),
  },
  handler: async (ctx, args) => {
    const { agentId, ...updates } = args;
    await ctx.db.patch(agentId, {
      ...updates,
      updatedAt: Date.now(),
    });
    return agentId;
  },
});
