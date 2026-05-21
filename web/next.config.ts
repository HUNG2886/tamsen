import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "statics.pancake.vn",
        pathname: "/web-media-262/**",
      },
    ],
  },
};

export default nextConfig;
