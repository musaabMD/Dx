import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const dietValues = v.union(
  v.literal("keto"),
  v.literal("lowCarb"),
  v.literal("highProtein"),
  v.literal("diabetic"),
  v.literal("balanced"),
);

export const postMeal = mutation({
  args: {
    userId: v.id("users"),
    recipeId: v.optional(v.id("recipes")),
    mealName: v.string(),
    diet: dietValues,
    calories: v.number(),
    timeToMakeMinutes: v.number(),
    costCents: v.number(),
    caption: v.string(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("communityPosts", {
      ...args,
      likes: 0,
      createdAt: Date.now(),
    });
  },
});

export const likePost = mutation({
  args: { postId: v.id("communityPosts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found.");
    await ctx.db.patch(args.postId, { likes: post.likes + 1 });
    return post.likes + 1;
  },
});

export const feed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 30;
    const posts = await ctx.db
      .query("communityPosts")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);

    return await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        const recipe = post.recipeId ? await ctx.db.get(post.recipeId) : null;
        return {
          ...post,
          username: user?.username ?? "Unknown",
          userImageUrl: user?.imageUrl,
          recipeName: recipe?.name,
        };
      }),
    );
  },
});
