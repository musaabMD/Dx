import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const addManual = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    sugar: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mealEntries", {
      ...args,
      source: "manual",
      loggedAt: Date.now(),
    });
  },
});

export const addFromScan = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    sugar: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("mealEntries", {
      ...args,
      source: "scan",
      loggedAt: Date.now(),
    });
  },
});

export const addFromRecipe = mutation({
  args: {
    userId: v.id("users"),
    recipeId: v.id("recipes"),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) throw new Error("Recipe not found.");
    return await ctx.db.insert("mealEntries", {
      userId: args.userId,
      recipeId: args.recipeId,
      name: recipe.name,
      calories: recipe.calories,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
      sugar: recipe.sugar,
      source: "recipe",
      loggedAt: Date.now(),
    });
  },
});

export const listForDay = query({
  args: {
    userId: v.id("users"),
    dayStart: v.number(),
    dayEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("mealEntries")
      .withIndex("by_user_loggedAt", (q) =>
        q
          .eq("userId", args.userId)
          .gte("loggedAt", args.dayStart)
          .lt("loggedAt", args.dayEnd),
      )
      .collect();
    return rows.sort((a, b) => b.loggedAt - a.loggedAt);
  },
});

export const dashboard = query({
  args: {
    userId: v.id("users"),
    dayStart: v.number(),
    dayEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found.");

    const entries = await ctx.db
      .query("mealEntries")
      .withIndex("by_user_loggedAt", (q) =>
        q
          .eq("userId", args.userId)
          .gte("loggedAt", args.dayStart)
          .lt("loggedAt", args.dayEnd),
      )
      .collect();

    const totals = entries.reduce(
      (acc, item) => {
        acc.calories += item.calories;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    return {
      entries,
      totals,
      goals: {
        calories: user.dailyCalorieGoal,
        protein: user.dailyProteinGoal,
        carbs: user.dailyCarbGoal,
        fat: user.dailyFatGoal,
      },
      left: {
        calories: Math.max(0, user.dailyCalorieGoal - totals.calories),
        protein: Math.max(0, user.dailyProteinGoal - totals.protein),
        carbs: Math.max(0, user.dailyCarbGoal - totals.carbs),
        fat: Math.max(0, user.dailyFatGoal - totals.fat),
      },
    };
  },
});
