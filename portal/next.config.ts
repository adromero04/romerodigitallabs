import type { NextConfig } from "next";

/**
 * Client portal — separate Node deployable (e.g. Vercel) at portal.romerodigitallabs.com.
 * Excluded from Hostinger FTPS marketing deploy — see root `.github/workflows/deploy.yml`.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
