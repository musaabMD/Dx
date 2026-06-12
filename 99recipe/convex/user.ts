import { query } from "./_generated/server";

/** Returns Convex auth identity when signed in (via Clerk + ClerkConvex on the client). */
export const me = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});
