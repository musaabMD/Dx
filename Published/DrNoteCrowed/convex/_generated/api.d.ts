/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as billing from "../billing.js";
import type * as dashboard from "../dashboard.js";
import type * as feedback from "../feedback.js";
import type * as learning from "../learning.js";
import type * as lib from "../lib.js";
import type * as limits from "../limits.js";
import type * as practice from "../practice.js";
import type * as questions from "../questions.js";
import type * as reviews from "../reviews.js";
import type * as seed from "../seed.js";
import type * as support from "../support.js";
import type * as usage from "../usage.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  billing: typeof billing;
  dashboard: typeof dashboard;
  feedback: typeof feedback;
  learning: typeof learning;
  lib: typeof lib;
  limits: typeof limits;
  practice: typeof practice;
  questions: typeof questions;
  reviews: typeof reviews;
  seed: typeof seed;
  support: typeof support;
  usage: typeof usage;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
  actionCache: import("@convex-dev/action-cache/_generated/component.js").ComponentApi<"actionCache">;
  posthog: import("@posthog/convex/_generated/component.js").ComponentApi<"posthog">;
  resend: import("@convex-dev/resend/_generated/component.js").ComponentApi<"resend">;
  workpool: import("@convex-dev/workpool/_generated/component.js").ComponentApi<"workpool">;
  workflow: import("@convex-dev/workflow/_generated/component.js").ComponentApi<"workflow">;
};
