import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  exams: defineTable({
    name: v.string(),
    abbr: v.optional(v.string()),
    color: v.optional(v.string()),
    bg: v.optional(v.string()),
    slug: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
  }),
});
