import type { NextConfig } from "next";

/**
 * Admin app is a separate deployable (Node server or Vercel-style host).
 * It is excluded from the static FTPS deploy of the marketing site — see root README
 * and `.github/workflows/deploy.yml`.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
