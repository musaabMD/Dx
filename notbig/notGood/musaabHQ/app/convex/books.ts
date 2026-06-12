import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("books").collect();
  },
});

export const getById = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.optional(v.string()),
    read: v.boolean(),
    aiSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("books", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("books"),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    read: v.optional(v.boolean()),
    aiSummary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
