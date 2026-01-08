import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.beehiiv.com",
      },
      {
        protocol: "https",
        hostname: "**.workspaces.xyz",
      },
      {
        protocol: "https",
        hostname: "**.substack.com",
      },
      {
        protocol: "https",
        hostname: "media.beehiiv.com",
      },
    ],
  },
};

export default nextConfig;
