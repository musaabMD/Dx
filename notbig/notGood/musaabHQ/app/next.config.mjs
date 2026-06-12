import createNextPWA from 'next-pwa';

const withPWA = createNextPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Use webpack instead of Turbopack for PWA support
  webpack: (config, { isServer }) => {
    // Return config as-is, next-pwa will modify it
    return config;
  },
};

// Note: next-remote-refresh is installed but temporarily disabled due to compatibility issues with Next.js 16
// To enable it, uncomment the following:
// import createRemoteRefresh from "next-remote-refresh";
// const withRemoteRefresh = createRemoteRefresh();
// export default withRemoteRefresh(nextConfig);

export default withPWA(nextConfig);
