import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    slug: v.string(),
    websiteUrl: v.optional(v.string()),
    instructions: v.string(),
    summary: v.string(),
    model: v.optional(v.string()),
    status: v.union(
      v.literal("training"),
      v.literal("ready"),
      v.literal("failed")
    ),
    themeColor: v.string(),
    welcomeMessage: v.string(),
    suggestedQuestions: v.array(v.string()),
    tools: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_updatedAt", ["updatedAt"]),

  sources: defineTable({
    agentId: v.id("agents"),
    type: v.union(
      v.literal("website"),
      v.literal("file"),
      v.literal("text"),
      v.literal("qa"),
      v.literal("notion"),
      v.literal("ticket")
    ),
    title: v.string(),
    url: v.optional(v.string()),
    content: v.string(),
    status: v.union(
      v.literal("processing"),
      v.literal("ready"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  }).index("by_agent", ["agentId"]),

  conversations: defineTable({
    agentId: v.id("agents"),
    visitorId: v.string(),
    pageUrl: v.optional(v.string()),
    leadEmail: v.optional(v.string()),
    leadName: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_visitor", ["visitorId"]),

  messages: defineTable({
    agentId: v.id("agents"),
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_agent", ["agentId"])
    .index("by_conversation", ["conversationId"]),

  leads: defineTable({
    agentId: v.id("agents"),
    conversationId: v.optional(v.id("conversations")),
    name: v.optional(v.string()),
    email: v.string(),
    company: v.optional(v.string()),
    message: v.optional(v.string()),
    pageUrl: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_agent", ["agentId"]),
});
