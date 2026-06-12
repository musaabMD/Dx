export default {
  providers: [
    {
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ??
        "https://charmed-shark-0.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};
