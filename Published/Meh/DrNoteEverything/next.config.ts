import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "q648y7e0kt.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
