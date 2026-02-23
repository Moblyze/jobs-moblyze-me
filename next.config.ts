import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // When STATIC_EXPORT is set, build as a static site for GitHub Pages.
  // Otherwise use the default Next.js server (Cloudflare Workers via @opennextjs/cloudflare).
  output: process.env.STATIC_EXPORT ? "export" : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: !!process.env.STATIC_EXPORT },
  devIndicators: false,
};

export default nextConfig;
