import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    incomingRequests: true,
    fetches: { fullUrl: true, hmrRefreshes: true },
  },
  experimental: {
    useCache: true,
  },
};

export default nextConfig;
