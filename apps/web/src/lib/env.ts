/**
 * Environment Configuration
 * 
 * Simple type-safe getters for Next.js environment variables.
 * Next.js automatically loads env vars from .env files based on NODE_ENV.
 * 
 * Environment Loading Order (per Next.js docs):
 * 1. process.env
 * 2. .env.$(NODE_ENV).local
 * 3. .env.local (not loaded when NODE_ENV=test)
 * 4. .env.$(NODE_ENV)
 * 5. .env
 * 
 * @see https://nextjs.org/docs/app/guides/environment-variables
 * @module env
 */

type Environment = "development" | "staging" | "production";

interface EnvConfig {
  // API Configuration
  apiUrl: string;
  
  // App Configuration
  appName: string;
  appVersion: string;
  
  // Environment
  nodeEnv: Environment;
  isDevelopment: boolean;
  isStaging: boolean;
  isProduction: boolean;
  
  // Feature Flags
  enableDebug: boolean;
}

/**
 * Get environment variable with fallback
 */
function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];
  
  if (value === undefined || value === "") {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error(`Missing required environment variable: ${key}`);
  }
  
  return value;
}

/**
 * Get boolean environment variable
 */
function getBooleanEnvVar(key: string, fallback = false): boolean {
  const value = process.env[key];
  
  if (value === undefined || value === "") {
    return fallback;
  }
  
  return value.toLowerCase() === "true" || value === "1";
}

/**
 * Determine current environment
 * Uses NODE_ENV by default. For staging, use: NODE_ENV=production with custom logic.
 */
function getCurrentEnvironment(): Environment {
  const nodeEnv = process.env.NODE_ENV;
  
  // Check if staging via custom flag or API URL pattern
  if (process.env.NEXT_PUBLIC_API_URL?.includes("staging")) {
    return "staging";
  }
  
  if (nodeEnv === "production") return "production";
  
  return "development";
}

/**
 * Build environment configuration
 */
function buildEnvConfig(): EnvConfig {
  const currentEnv = getCurrentEnvironment();
  
  // Provide sensible defaults for development to prevent build failures
  const defaultApiUrl = currentEnv === "production" 
    ? undefined 
    : "http://localhost:3001";
  
  const config: EnvConfig = {
    // API Configuration
    apiUrl: getEnvVar("NEXT_PUBLIC_API_URL", defaultApiUrl),
    
    // App Configuration
    appName: getEnvVar("NEXT_PUBLIC_APP_NAME", "Dash Finance"),
    appVersion: getEnvVar("NEXT_PUBLIC_APP_VERSION", "0.1.0"),
    
    // Environment
    nodeEnv: currentEnv,
    isDevelopment: currentEnv === "development",
    isStaging: currentEnv === "staging",
    isProduction: currentEnv === "production",
    
    // Feature Flags
    enableDebug: getBooleanEnvVar("NEXT_PUBLIC_ENABLE_DEBUG", currentEnv === "development"),
  };
  
  // Validate API URL format (skip during build if URL is placeholder)
  if (config.apiUrl && config.apiUrl !== "placeholder") {
    try {
      new URL(config.apiUrl);
    } catch (error) {
      console.warn(`Invalid API URL: ${config.apiUrl}`, error);
      // Don't throw during build, just warn
      if (currentEnv === "production") {
        throw new Error(`Invalid API URL in production: ${config.apiUrl}`);
      }
    }
  }
  
  return config;
}

/**
 * Environment configuration singleton
 * Validates on module load to fail fast
 */
export const env = buildEnvConfig();

/**
 * Log environment info (development only)
 */
if (env.isDevelopment && typeof window !== "undefined") {
  console.log("🌍 Environment Configuration:", {
    environment: env.nodeEnv,
    apiUrl: env.apiUrl,
    appVersion: env.appVersion,
  });
}
