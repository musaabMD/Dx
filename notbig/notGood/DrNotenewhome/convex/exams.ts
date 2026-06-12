import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const COLOR_PALETTE = [
  { color: "#E11D48", bg: "#F43F5E" },
  { color: "#047857", bg: "#059669" },
  { color: "#5B21B6", bg: "#6D28D9" },
  { color: "#7C3AED", bg: "#8B5CF6" },
  { color: "#0E7490", bg: "#0891B2" },
  { color: "#0F766E", bg: "#0D9488" },
  { color: "#A21CAF", bg: "#C026D3" },
  { color: "#C2410C", bg: "#EA580C" },
  { color: "#1D4ED8", bg: "#2563EB" },
];

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("exams").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    abbr: v.optional(v.string()),
    color: v.optional(v.string()),
    bg: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const palette = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
    await ctx.db.insert("exams", {
      name: args.name,
      abbr: args.abbr,
      color: args.color ?? palette.color,
      bg: args.bg ?? palette.bg,
    });
  },
});
