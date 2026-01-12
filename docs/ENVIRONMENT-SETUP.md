# Environment Configuration Guide

This guide explains how environment variables work in this Next.js application, following official Next.js best practices.

## 📚 Official Documentation

**Read this first:** https://nextjs.org/docs/app/guides/environment-variables

## 🔑 Key Concepts

### 1. Automatic Environment Loading

Next.js automatically loads environment variables from `.env*` files in this order:

1. `process.env` (system environment variables)
2. `.env.$(NODE_ENV).local` (local overrides, gitignored)
3. `.env.local` (local overrides, gitignored, not loaded in test)
4. `.env.$(NODE_ENV)` (environment-specific)
5. `.env` (defaults for all environments)

### 2. Client vs Server Variables

| Type | Prefix | Available Where | Inlined at Build Time |
|------|--------|----------------|----------------------|
| Server-only | None | Server components, API routes | No |
| Client-side | `NEXT_PUBLIC_` | Browser, Client components | **Yes** |

**Important:** `NEXT_PUBLIC_*` variables are **baked into the JavaScript bundle** at build time. They **cannot** be changed after build without rebuilding.

## 📁 Environment Files

### `.env.development` (Development)
Loaded automatically when running `next dev`:
```bash
bun run dev
# or
next dev
```

### `.env.production` (Production)
Loaded automatically when running `next build` in production:
```bash
NODE_ENV=production next build
next start
```

### `.env.staging` (Staging)
For staging environment, you need to use special handling since Next.js only recognizes `development` and `production`:

**Option 1: Use .env.production.local**
```bash
# Copy staging values to .env.production.local before build
cp .env.staging .env.production.local
NODE_ENV=production next build
```

**Option 2: Detect via API URL pattern**
The app automatically detects staging if `NEXT_PUBLIC_API_URL` contains "staging":
```bash
# .env.production.local
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
```

### `.env.local` (Local Overrides)
Create this file for local development overrides. **It's gitignored** and takes precedence over other files:

```bash
# .env.local (never committed)
NEXT_PUBLIC_API_URL=http://192.168.1.100:3001
NEXT_PUBLIC_ENABLE_DEBUG=true
```

## 🚀 Usage Examples

### In Server Components (No prefix needed)
```tsx
// app/page.tsx
export default function Page() {
  // Can access any env var (including non-NEXT_PUBLIC_)
  const dbUrl = process.env.DATABASE_URL;
  
  return <div>Server Component</div>;
}
```

### In Client Components (Must use NEXT_PUBLIC_)
```tsx
"use client";

// Can only access NEXT_PUBLIC_* variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export function ClientComponent() {
  return <div>API: {apiUrl}</div>;
}
```

### Using the `env` Module (Recommended)
```tsx
import { env } from "@/lib/env";

// Type-safe, validated access
console.log(env.apiUrl);        // NEXT_PUBLIC_API_URL
console.log(env.appName);       // NEXT_PUBLIC_APP_NAME
console.log(env.isDevelopment); // Computed from NODE_ENV
console.log(env.enableDebug);   // NEXT_PUBLIC_ENABLE_DEBUG
```

## 🛠️ Development Workflow

### 1. Initial Setup
```bash
# Copy example file
cp .env.example .env.local

# Edit with your local values
code .env.local

# Start development
bun run dev
```

### 2. Adding New Variables

**For client-side variables:**
```bash
# .env.development
NEXT_PUBLIC_NEW_FEATURE_FLAG=true
```

**For server-only variables:**
```bash
# .env.development
DATABASE_URL=postgresql://localhost/db
API_SECRET_KEY=secret123
```

**Update type definitions:**
```typescript
// src/lib/env.ts
interface EnvConfig {
  // Add new property
  newFeatureFlag: boolean;
}

function buildEnvConfig(): EnvConfig {
  return {
    // ...
    newFeatureFlag: getBooleanEnvVar("NEXT_PUBLIC_NEW_FEATURE_FLAG"),
  };
}
```

### 3. Testing Different Environments Locally

```bash
# Test production build locally
NODE_ENV=production bun run build
bun run start

# Test staging configuration
cp .env.staging .env.production.local
NODE_ENV=production bun run build
bun run start
```

## 🐳 Docker Integration

### Build Arguments
Pass environment variables at build time:

```bash
# Development
docker build --target development -t app:dev .

# Staging
docker build \
  --target production \
  --build-arg NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com \
  -t app:staging .

# Production
docker build \
  --target production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  -t app:prod .
```

### Docker Compose
```yaml
services:
  web:
    build:
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    environment:
      - NODE_ENV=production
```

## 🔒 Security Best Practices

### DO ✅

- Use `NEXT_PUBLIC_` prefix **only** for variables needed in the browser
- Store sensitive keys (API secrets, database URLs) **without** `NEXT_PUBLIC_` prefix
- Add `.env.local` and `.env*.local` to `.gitignore`
- Commit `.env.example` with placeholder values
- Commit `.env.development` and `.env.production` with safe defaults
- Use environment variables from your CI/CD platform for production
- Validate required variables at build time (via `src/lib/env.ts`)

### DON'T ❌

- **Never** commit `.env.local` files
- **Never** put secrets in `NEXT_PUBLIC_*` variables (they're in the browser bundle!)
- **Never** put production secrets in committed `.env` files
- Don't use dynamic lookups: `process.env[varName]` (Next.js won't inline these)
- Don't destructure: `const { NEXT_PUBLIC_API_URL } = process.env` (won't work)

## 🔍 Debugging

### Check Loaded Variables
```typescript
// src/lib/env.ts
console.log("Environment loaded:", {
  NODE_ENV: process.env.NODE_ENV,
  API_URL: process.env.NEXT_PUBLIC_API_URL,
});
```

### Verify Build-Time Inlining
After build, check the bundle:
```bash
bun run build
grep -r "your-api-url" .next/static/chunks/
```

### Common Issues

**Problem:** Variables not loading
```bash
# Solution: Check file name and NODE_ENV
echo $NODE_ENV
ls -la .env*
```

**Problem:** Client component can't access variable
```bash
# Solution: Add NEXT_PUBLIC_ prefix and rebuild
# Before: API_URL=...
# After:  NEXT_PUBLIC_API_URL=...
bun run build
```

**Problem:** Variable changes not reflected
```bash
# Solution: Restart dev server or rebuild
bun run dev
# or
bun run build && bun run start
```

## 📋 Checklist

- [ ] Committed `.env.example` with all required variables
- [ ] Created `.env.local` for local overrides (gitignored)
- [ ] Used `NEXT_PUBLIC_` prefix only for client-side variables
- [ ] No secrets in `NEXT_PUBLIC_*` variables
- [ ] Validated all required variables in `src/lib/env.ts`
- [ ] Tested build with production environment variables
- [ ] Configured CI/CD to inject environment variables
- [ ] Documented custom environment variables in this file

## 🔗 References

- [Next.js Environment Variables Docs](https://nextjs.org/docs/app/guides/environment-variables)
- [Next.js Config: env](https://nextjs.org/docs/app/api-reference/config/next-config-js/env)
- [Next.js Deployment](https://nextjs.org/docs/app/getting-started/deploying)
