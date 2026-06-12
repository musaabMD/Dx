import type { AuthConfig } from "convex/server";

export default {
  // Required for production auth. Set CLERK_JWT_ISSUER_DOMAIN in Convex env vars.
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN ?? "",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
