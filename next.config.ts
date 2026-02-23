import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  // When STATIC_EXPORT is set, build as a static site for GitHub Pages.
  // Otherwise use the default Next.js server (Cloudflare Workers via @opennextjs/cloudflare).
  output: process.env.STATIC_EXPORT ? "export" : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: !!process.env.STATIC_EXPORT },
  devIndicators: false,
  // Pin turbopack root to this directory (avoids parent lockfile confusion in worktrees)
  turbopack: { root: resolve(__dirname) },
};

export default nextConfig;
