import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export type PlanId = "free" | "monthly" | "quarterly" | "yearly";

export const INVITE_TRIAL_DAYS = 3;
export const INVITE_TRIAL_MILLISECONDS = INVITE_TRIAL_DAYS * 24 * 60 * 60 * 1000;
const msPerDay = 24 * 60 * 60 * 1000;
const millis = (days: number) => days * msPerDay;

export type PlanLimits = {
  plan: PlanId;
  questionsPerDay: number;
  aiAsksPerDay: number;
  mockExamsPerDay: number;
  reviewQueueMax: number;
  canAccessLibrary: boolean;
  canExportNotes: boolean;
};

const defaultPlanLimits = {
  free: {
    questionsPerDay: 15,
    aiAsksPerDay: 0,
    mockExamsPerDay: 0,
    reviewQueueMax: 50,
    canAccessLibrary: false,
    canExportNotes: false,
  },
  monthly: {
    questionsPerDay: 500,
    aiAsksPerDay: 30,
    mockExamsPerDay: 3,
    reviewQueueMax: 1000,
    canAccessLibrary: true,
    canExportNotes: true,
  },
  quarterly: {
    questionsPerDay: 500,
    aiAsksPerDay: 50,
    mockExamsPerDay: 5,
    reviewQueueMax: 2000,
    canAccessLibrary: true,
    canExportNotes: true,
  },
  yearly: {
    questionsPerDay: 9999,
    aiAsksPerDay: 100,
    mockExamsPerDay: 10,
    reviewQueueMax: 9999,
    canAccessLibrary: true,
    canExportNotes: true,
  },
} satisfies Record<PlanId, Omit<PlanLimits, "plan">>;

export function resolvePlanLimits(plan: string): PlanLimits {
  const planId: PlanId = (plan === "monthly" || plan === "quarterly" || plan === "yearly" || plan === "free")
    ? plan
    : "free";
  const defaults = defaultPlanLimits[planId];
  return {
    plan: planId,
    ...defaults,
  };
}

export function isTrialActive(
  user: { plan: string; trialEndsAt?: number },
  now = Date.now()
) {
  return (
    user.plan === "free" &&
    typeof user.trialEndsAt === "number" &&
    user.trialEndsAt > now
  );
}

export function effectivePlanFromUser(user: { plan: string; trialEndsAt?: number }): PlanId {
  return isTrialActive(user) ? "monthly" : resolvePlanLimits(user.plan).plan;
}

export async function getPlanLimits(
  ctx: QueryCtx | MutationCtx,
  user: { plan: string }
) {
  const plan = effectivePlanFromUser(user);
  const fallback = resolvePlanLimits(plan);
  const planLimits = await ctx.db
    .query("planLimits")
    .withIndex("by_plan", q => q.eq("plan", plan))
    .unique();

  if (!planLimits) return fallback;
  return {
    plan: planLimits.plan,
    questionsPerDay: planLimits.questionsPerDay,
    aiAsksPerDay: planLimits.aiAsksPerDay,
    mockExamsPerDay: planLimits.mockExamsPerDay,
    reviewQueueMax: planLimits.reviewQueueMax,
    canAccessLibrary: planLimits.canAccessLibrary,
    canExportNotes: planLimits.canExportNotes,
  };
}

export function dayKey(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

export function usageWindowKey(now = Date.now()) {
  return String(Math.floor(now / msPerDay));
}

export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_clerk_user_id", q => q.eq("clerkUserId", identity.subject))
    .unique();
}

export function inviteTrialExpiresInDays(trialEndsAt?: number, now = Date.now()) {
  if (!trialEndsAt) return 0;
  const remaining = Math.ceil((trialEndsAt - now) / millis(1));
  return Math.max(0, remaining);
}

export async function requireCurrentUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Sign in required.");
  }
  return user;
}

export async function ensureUsageDay(
  ctx: MutationCtx,
  userId: Id<"users">,
  clerkUserId: string,
  day = usageWindowKey()
) {
  const existing = await ctx.db
    .query("usageDays")
    .withIndex("by_user_day", q => q.eq("userId", userId).eq("day", day))
    .unique();

  if (existing) return existing;

  const id = await ctx.db.insert("usageDays", {
    userId,
    clerkUserId,
    day,
    questionsAnswered: 0,
    aiAsks: 0,
    mockExamsStarted: 0,
    updatedAt: Date.now(),
  });

  return await ctx.db.get(id);
}
