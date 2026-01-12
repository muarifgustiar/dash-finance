/**
 * Next.js Configuration with Multi-stage Environment Support
 * 
 * Environment loading order (Next.js):
 * 1. .env.{environment}.local (highest priority, gitignored)
 * 2. .env.local (gitignored, not loaded in test)
 * 3. .env.{environment} (committed, environment-specific)
 * 4. .env (committed, base defaults)
 * 
 * For staging with production optimizations:
 * - Use .env.staging with NODE_ENV=production
 * - Set NEXT_PUBLIC_APP_ENV=staging to distinguish from production
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment info for debugging (non-sensitive only)
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Strict mode for better debugging in development
  reactStrictMode: true,

  // Output configuration
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,

  // Logging (development only)
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default nextConfig;
