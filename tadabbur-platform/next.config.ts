import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // تحذير: هذا يسمح بإكمال البناء حتى لو وجدت أخطاء ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // تحذير: هذا يسمح بإكمال البناء حتى لو وجدت أخطاء TypeScript
    ignoreBuildErrors: true,
  },
};

export default nextConfig;