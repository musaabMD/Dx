import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const dietValues = v.union(
  v.literal("keto"),
  v.literal("lowCarb"),
  v.literal("highProtein"),
  v.literal("diabetic"),
  v.literal("balanced"),
);

export const listByDiet = query({
  args: { diet: dietValues },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("recipes")
      .withIndex("by_diet", (q) => q.eq("diet", args.diet))
      .collect();
  },
});

export const getById = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.recipeId);
  },
});

export const listTrending = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("recipes")
      .withIndex("by_trending", (q) => q.eq("isTrending", true))
      .collect();
    return rows.sort((a, b) => b.trendScore - a.trendScore).slice(0, 20);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    diet: dietValues,
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    sugar: v.number(),
    costCents: v.number(),
    timeToMakeMinutes: v.number(),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("recipes", {
      ...args,
      ratingAverage: 0,
      ratingCount: 0,
      trendScore: 0,
      isTrending: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const addReview = mutation({
  args: {
    recipeId: v.id("recipes"),
    userId: v.id("users"),
    rating: v.number(),
    reviewText: v.string(),
  },
  handler: async (ctx, args) => {
    const existingReview = await ctx.db
      .query("recipeReviews")
      .withIndex("by_recipe_user", (q) =>
        q.eq("recipeId", args.recipeId).eq("userId", args.userId),
      )
      .first();
    if (existingReview) {
      throw new Error("You already reviewed this recipe.");
    }

    await ctx.db.insert("recipeReviews", {
      ...args,
      createdAt: Date.now(),
    });

    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) throw new Error("Recipe not found.");

    const nextCount = recipe.ratingCount + 1;
    const nextAverage =
      (recipe.ratingAverage * recipe.ratingCount + args.rating) / nextCount;

    await ctx.db.patch(args.recipeId, {
      ratingAverage: Number(nextAverage.toFixed(2)),
      ratingCount: nextCount,
      trendScore: recipe.trendScore + 1,
      updatedAt: Date.now(),
    });
  },
});

export const listReviews = query({
  args: { recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("recipeReviews")
      .withIndex("by_recipe", (q) => q.eq("recipeId", args.recipeId))
      .collect();
  },
});

export const toggleFavorite = mutation({
  args: { userId: v.id("users"), recipeId: v.id("recipes") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favoriteRecipes")
      .withIndex("by_user_recipe", (q) =>
        q.eq("userId", args.userId).eq("recipeId", args.recipeId),
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { isFavorite: false };
    }
    await ctx.db.insert("favoriteRecipes", {
      ...args,
      createdAt: Date.now(),
    });
    return { isFavorite: true };
  },
});

export const listFavorites = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("favoriteRecipes")
      .withIndex("by_user_recipe", (q) => q.eq("userId", args.userId))
      .collect();

    const recipes = await Promise.all(rows.map((row) => ctx.db.get(row.recipeId)));
    return recipes.filter((recipe): recipe is NonNullable<typeof recipe> => !!recipe);
  },
});

export const incrementTrend = mutation({
  args: { recipeId: v.id("recipes"), amount: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.recipeId);
    if (!recipe) throw new Error("Recipe not found.");

    const amount = args.amount ?? 1;
    const nextScore = recipe.trendScore + amount;
    await ctx.db.patch(args.recipeId as Id<"recipes">, {
      trendScore: nextScore,
      isTrending: nextScore >= 50,
      updatedAt: Date.now(),
    });
    return nextScore;
  },
});
