export default {
  providers: [
    {
      domain:
        process.env.CLERK_FRONTEND_API_URL ??
        "https://national-mastodon-36.clerk.accounts.dev",
      applicationID: "convex",
    },
  ],
};

