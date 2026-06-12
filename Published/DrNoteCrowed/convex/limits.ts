import { query } from "./_generated/server";
import { getCurrentUser, getPlanLimits, resolvePlanLimits } from "./lib";

export const forCurrentUser = query({
  args: {},
  handler: async ctx => {
    const user = await getCurrentUser(ctx);
    if (!user) return resolvePlanLimits("free");

    return await getPlanLimits(ctx, user);
  },
});
