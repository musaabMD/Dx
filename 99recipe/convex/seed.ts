import { mutation } from "./_generated/server";

export const fullDemo = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const existingRecipes = await ctx.db.query("recipes").take(1);
    if (existingRecipes.length > 0) {
      return "Seed skipped: recipes already exist.";
    }

    const userId = await ctx.db.insert("users", {
      clerkId: "demo_clerk_user_1",
      username: "mrr-r",
      imageUrl: undefined,
      selectedDiet: "keto",
      dailyCalorieGoal: 2500,
      dailyProteinGoal: 180,
      dailyCarbGoal: 180,
      dailyFatGoal: 90,
      createdAt: now,
      updatedAt: now,
    });

    const recipes = await Promise.all([
      ctx.db.insert("recipes", {
        name: "Apple Salmon Salad",
        description: "High protein salad with apple crunch.",
        diet: "balanced",
        calories: 500,
        protein: 42,
        carbs: 28,
        fat: 19,
        sugar: 7,
        costCents: 900,
        timeToMakeMinutes: 14,
        ratingAverage: 4.8,
        ratingCount: 102,
        trendScore: 94,
        isTrending: true,
        ingredients: ["Salmon", "Apple", "Greens", "Greek yogurt dressing"],
        steps: ["Cook salmon.", "Slice apple.", "Mix and serve."],
        imageUrl: undefined,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("recipes", {
        name: "Keto Chicken Bowl",
        description: "Low carb bowl with avocado and grilled chicken.",
        diet: "keto",
        calories: 540,
        protein: 44,
        carbs: 14,
        fat: 30,
        sugar: 3,
        costCents: 800,
        timeToMakeMinutes: 18,
        ratingAverage: 4.7,
        ratingCount: 88,
        trendScore: 90,
        isTrending: true,
        ingredients: ["Chicken breast", "Avocado", "Spinach", "Olive oil"],
        steps: ["Grill chicken.", "Assemble bowl.", "Drizzle oil."],
        imageUrl: undefined,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      }),
      ctx.db.insert("recipes", {
        name: "Protein Oats",
        description: "Fast breakfast with whey and berries.",
        diet: "highProtein",
        calories: 530,
        protein: 39,
        carbs: 52,
        fat: 15,
        sugar: 9,
        costCents: 450,
        timeToMakeMinutes: 8,
        ratingAverage: 4.6,
        ratingCount: 60,
        trendScore: 72,
        isTrending: true,
        ingredients: ["Oats", "Whey", "Berries", "Milk"],
        steps: ["Cook oats.", "Mix whey.", "Top with berries."],
        imageUrl: undefined,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      }),
    ]);

    await ctx.db.insert("mealEntries", {
      userId,
      recipeId: recipes[0],
      name: "Apple Salmon Salad",
      calories: 500,
      protein: 42,
      carbs: 28,
      fat: 19,
      sugar: 7,
      source: "recipe",
      loggedAt: now,
    });

    await ctx.db.insert("communityPosts", {
      userId,
      recipeId: recipes[0],
      mealName: "Apple Salmon Salad",
      diet: "balanced",
      calories: 500,
      timeToMakeMinutes: 14,
      costCents: 900,
      caption: "Fresh and quick lunch.",
      imageUrl: undefined,
      likes: 15,
      createdAt: now,
    });

    return "Full demo seed inserted.";
  },
});
