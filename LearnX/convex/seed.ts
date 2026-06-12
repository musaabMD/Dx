import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    const existingTasks = await ctx.db.query("tasks").collect();
    if (existingTasks.length === 0) {
      await ctx.db.insert("tasks", {
        text: "Buy groceries",
        isCompleted: true,
        priority: "low",
        category: "Personal",
      });
      await ctx.db.insert("tasks", {
        text: "Go for a swim",
        isCompleted: true,
        priority: "medium",
        category: "Health",
      });
      await ctx.db.insert("tasks", {
        text: "Integrate Convex",
        isCompleted: false,
        priority: "high",
        category: "Engineering",
      });
    }

    return { ok: true };
  },
});
