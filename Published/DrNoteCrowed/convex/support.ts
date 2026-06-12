import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, requireCurrentUser } from "./lib";

export const myTickets = query({
  args: {},
  handler: async ctx => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("supportTickets")
      .withIndex("by_user", q => q.eq("userId", user._id))
      .order("desc")
      .take(20);
  },
});

export const ticketMessages = query({
  args: { ticketId: v.id("supportTickets") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== user._id) {
      return [];
    }
    return await ctx.db
      .query("supportMessages")
      .withIndex("by_ticket", q => q.eq("ticketId", args.ticketId))
      .order("asc")
      .collect();
  },
});

// Admin: all open/needs_human tickets
export const pendingTickets = query({
  args: {},
  handler: async ctx => {
    const open = await ctx.db
      .query("supportTickets")
      .withIndex("by_status", q => q.eq("status", "open"))
      .order("desc")
      .take(50);
    const needsHuman = await ctx.db
      .query("supportTickets")
      .withIndex("by_status", q => q.eq("status", "needs_human"))
      .order("desc")
      .take(50);
    return [...needsHuman, ...open];
  },
});

export const openTicket = mutation({
  args: {
    message: v.string(),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();

    const ticketId = await ctx.db.insert("supportTickets", {
      userId: user._id,
      clerkUserId: user.clerkUserId,
      email: user.email,
      status: "open",
      category: args.category,
      aiHandled: true,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("supportMessages", {
      ticketId,
      role: "user",
      content: args.message,
      createdAt: now,
    });

    return ticketId;
  },
});

export const addSupportMessage = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("admin")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const now = Date.now();
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket) throw new Error("Ticket not found.");
    if (ticket.userId !== user._id) {
      throw new Error("Unauthorized.");
    }
    if (args.role !== "user") {
      throw new Error("Invalid message role.");
    }

    await ctx.db.patch(args.ticketId, { updatedAt: now });

    return await ctx.db.insert("supportMessages", {
      ticketId: args.ticketId,
      role: "user",
      content: args.content,
      createdAt: now,
    });
  },
});

export const updateTicketStatus = mutation({
  args: {
    ticketId: v.id("supportTickets"),
    status: v.union(
      v.literal("open"),
      v.literal("ai_resolved"),
      v.literal("needs_human"),
      v.literal("closed")
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireCurrentUser(ctx);
    const ticket = await ctx.db.get(args.ticketId);
    if (!ticket || ticket.userId !== user._id) {
      throw new Error("Unauthorized.");
    }
    await ctx.db.patch(args.ticketId, {
      status: args.status,
      updatedAt: Date.now(),
    });
  },
});
