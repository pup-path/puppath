import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Internal CRM: every page is per-user and dynamic. Cache Components adds
  // Suspense/static-shell rules that buy nothing here, so leave them off.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
};

export default nextConfig;
