import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // The CPSC snapshot is read from disk at runtime by the API routes.
  outputFileTracingIncludes: {
    "/api/*": ["./data/recalls.json"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "www.cpsc.gov" }],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
