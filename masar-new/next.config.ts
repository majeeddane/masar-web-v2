import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },

  /* إعدادات رفع حجم البيانات المسموح بها */
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // رفع الحد من 1MB إلى 5MB لحل مشكلة رفع الصور
    },
  },

  /* config options here */
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;