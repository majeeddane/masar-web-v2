import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },

  /* config options here */
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
