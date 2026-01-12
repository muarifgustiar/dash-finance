#!/usr/bin/env bun
/**
 * Environment Validation Script
 * 
 * Validates that all required environment variables are set
 * and properly formatted. Run this before deployment.
 * 
 * Usage:
 *   bun run env:validate
 *   bun run src/scripts/validate-env.ts
 */

import { env } from "../lib/env";

console.log("🔍 Validating environment configuration...\n");

try {
  console.log("✅ Environment Configuration Valid\n");
  console.log("📋 Configuration Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`Environment:     ${env.nodeEnv}`);
  console.log(`API URL:         ${env.apiUrl}`);
  console.log(`App Name:        ${env.appName}`);
  console.log(`App Version:     ${env.appVersion}`);
  console.log(`Debug Enabled:   ${env.enableDebug}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("🎯 Environment Flags:");
  console.log(`  • Development:  ${env.isDevelopment}`);
  console.log(`  • Staging:      ${env.isStaging}`);
  console.log(`  • Production:   ${env.isProduction}`);
  console.log();
  
  // Additional validations
  const warnings: string[] = [];
  
  // Check API URL protocol
  if (env.apiUrl.startsWith("http://") && env.isProduction) {
    warnings.push("⚠️  Production is using HTTP instead of HTTPS");
  }
  
  // Check debug mode in production
  if (env.enableDebug && env.isProduction) {
    warnings.push("⚠️  Debug mode is enabled in production");
  }
  
  // Check localhost in non-development
  if (env.apiUrl.includes("localhost") && !env.isDevelopment) {
    warnings.push("⚠️  Using localhost URL in non-development environment");
  }
  
  if (warnings.length > 0) {
    console.log("⚠️  Warnings:");
    warnings.forEach((warning) => console.log(`  ${warning}`));
    console.log();
  }
  
  console.log("✨ Ready to deploy!\n");
  process.exit(0);
} catch (error) {
  console.error("❌ Environment validation failed:\n");
  
  if (error instanceof Error) {
    console.error(`  ${error.message}\n`);
    
    // Provide helpful suggestions
    console.log("💡 Suggestions:");
    if (error.message.includes("Missing required environment variable")) {
      console.log("  • Check that all required variables are set in your .env file");
      console.log("  • Copy .env.local.example to .env.local and customize");
      console.log("  • Ensure you're in the correct directory (apps/web)");
    } else if (error.message.includes("Invalid API URL")) {
      console.log("  • Check that NEXT_PUBLIC_API_URL is a valid URL");
      console.log("  • Include protocol (http:// or https://)");
      console.log("  • Verify there are no typos");
    }
    console.log();
  } else {
    console.error(error);
  }
  
  process.exit(1);
}
