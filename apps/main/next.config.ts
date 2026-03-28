import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@luminbridge/ui", "@luminbridge/db", "@luminbridge/types"],
};

export default nextConfig;
