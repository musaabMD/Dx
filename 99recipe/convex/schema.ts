import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    text: v.string(),
    isCompleted: v.boolean(),
  }),

  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    imageUrl: v.optional(v.string()),
    dailyCalorieGoal: v.number(),
    dailyProteinGoal: v.number(),
    dailyCarbGoal: v.number(),
    dailyFatGoal: v.number(),
    selectedDiet: v.union(
      v.literal("keto"),
      v.literal("lowCarb"),
      v.literal("highProtein"),
      v.literal("diabetic"),
      v.literal("balanced"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  recipes: defineTable({
    name: v.string(),
    description: v.string(),
    diet: v.union(
      v.literal("keto"),
      v.literal("lowCarb"),
      v.literal("highProtein"),
      v.literal("diabetic"),
      v.literal("balanced"),
    ),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    sugar: v.number(),
    costCents: v.number(),
    timeToMakeMinutes: v.number(),
    ratingAverage: v.number(),
    ratingCount: v.number(),
    trendScore: v.number(),
    isTrending: v.boolean(),
    ingredients: v.array(v.string()),
    steps: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    createdBy: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_diet", ["diet"])
    .index("by_trending", ["isTrending", "trendScore"]),

  recipeReviews: defineTable({
    recipeId: v.id("recipes"),
    userId: v.id("users"),
    rating: v.number(),
    reviewText: v.string(),
    createdAt: v.number(),
  })
    .index("by_recipe", ["recipeId"])
    .index("by_recipe_user", ["recipeId", "userId"]),

  mealEntries: defineTable({
    userId: v.id("users"),
    recipeId: v.optional(v.id("recipes")),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    sugar: v.number(),
    source: v.union(v.literal("manual"), v.literal("scan"), v.literal("recipe")),
    imageUrl: v.optional(v.string()),
    loggedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_loggedAt", ["userId", "loggedAt"]),

  favoriteRecipes: defineTable({
    userId: v.id("users"),
    recipeId: v.id("recipes"),
    createdAt: v.number(),
  }).index("by_user_recipe", ["userId", "recipeId"]),

  communityPosts: defineTable({
    userId: v.id("users"),
    recipeId: v.optional(v.id("recipes")),
    mealName: v.string(),
    diet: v.union(
      v.literal("keto"),
      v.literal("lowCarb"),
      v.literal("highProtein"),
      v.literal("diabetic"),
      v.literal("balanced"),
    ),
    calories: v.number(),
    timeToMakeMinutes: v.number(),
    costCents: v.number(),
    caption: v.string(),
    imageUrl: v.optional(v.string()),
    likes: v.number(),
    createdAt: v.number(),
  }).index("by_createdAt", ["createdAt"]),
});
