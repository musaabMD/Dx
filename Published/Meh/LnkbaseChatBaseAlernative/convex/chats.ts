import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getContext = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const agent = await ctx.db.get(args.agentId);
    if (!agent) return null;

    const sources = await ctx.db
      .query("sources")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    return { agent, sources };
  },
});

export const createConversation = mutation({
  args: {
    agentId: v.id("agents"),
    visitorId: v.string(),
    pageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("conversations", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const addMessage = mutation({
  args: {
    agentId: v.id("agents"),
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });
    return await ctx.db.insert("messages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const listMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();
  },
});

export const addLead = mutation({
  args: {
    agentId: v.id("agents"),
    conversationId: v.optional(v.id("conversations")),
    name: v.optional(v.string()),
    email: v.string(),
    company: v.optional(v.string()),
    message: v.optional(v.string()),
    pageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.conversationId) {
      await ctx.db.patch(args.conversationId, {
        leadEmail: args.email,
        leadName: args.name,
        updatedAt: Date.now(),
      });
    }

    return await ctx.db.insert("leads", {
      ...args,
      createdAt: Date.now(),
    });
  },
});
