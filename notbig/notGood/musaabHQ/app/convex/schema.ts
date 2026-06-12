import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
    urgency: v.boolean(),
    importance: v.boolean(),
    project: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    aiDetails: v.optional(v.string()),
  }),
  books: defineTable({
    name: v.string(),
    category: v.optional(v.string()),
    read: v.boolean(),
    aiSummary: v.optional(v.string()),
  }),
  articles: defineTable({
    title: v.string(),
    summary: v.optional(v.string()),
    url: v.optional(v.string()),
    read: v.boolean(),
  }),
  projects: defineTable({
    name: v.string(),
    percentage: v.number(),
    correct: v.number(),
    total: v.number(),
  }),
});
