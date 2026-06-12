import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  introflow: defineTable({
    key: v.string(),
    text: v.optional(v.string()),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    position: v.optional(v.number()),
    isActive: v.boolean(),
  }).index("by_key", ["key"]),
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    isPremium: v.optional(v.boolean()),
    lastSeenAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),
});
