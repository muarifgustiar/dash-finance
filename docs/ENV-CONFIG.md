# Multi-Stage Environment Configuration

## Overview

The web application supports three deployment environments:
- **Development** (`development`): Local development with debugging enabled
- **Staging** (`staging`): Pre-production testing environment
- **Production** (`production`): Live production environment

## Environment Files

### File Structure
```
apps/web/
├── .env.development          # Development defaults (committed)
├── .env.staging              # Staging configuration (committed)
├── .env.production           # Production configuration (committed)
├── .env.local.example        # Template for local overrides (committed)
├── .env.local                # Local overrides (gitignored)
├── .env.development.local    # Local dev overrides (gitignored)
├── .env.staging.local        # Local staging overrides (gitignored)
└── .env.production.local     # Local prod overrides (gitignored)
```

### Loading Priority (Next.js)
1. `.env.{environment}.local` - Highest priority, gitignored
2. `.env.local` - Gitignored, not loaded in test
3. `.env.{environment}` - Committed, environment-specific
4. `.env` - Base defaults (if exists)

## Configuration Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.example.com` |
| `NEXT_PUBLIC_APP_NAME` | Application display name | `"Dash Finance"` |
| `NEXT_PUBLIC_APP_VERSION` | Application version | `"0.1.0"` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_DEBUG` | Enable debug features | `true` (dev), `false` (staging/prod) |
| `NODE_ENV` | Node environment | Auto-detected |
| `NEXT_PUBLIC_APP_ENV` | Override environment detection | - |

## Usage

### Local Development

**Default (uses .env.development):**
```bash
bun run dev
```

**With staging environment:**
```bash
bun run dev:staging
```

**With custom local overrides:**
1. Copy `.env.local.example` to `.env.local`
2. Customize values in `.env.local`
3. Run `bun run dev`

### Building

**Development build:**
```bash
bun run build
```

**Staging build:**
```bash
bun run build:staging
```

**Production build:**
```bash
bun run build:production
```

### Validate Environment

Validate environment configuration before deployment:
```bash
bun run env:validate
```

## Type-Safe Environment Access

All environment variables should be accessed through `src/lib/env.ts`:

```typescript
import { env } from "@/lib/env";

// ✅ Correct: Type-safe with validation
const apiUrl = env.apiUrl;
const isProduction = env.isProduction;

// ❌ Incorrect: Direct access (avoid)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Available Properties

```typescript
env.apiUrl           // string - API base URL
env.appName          // string - Application name
env.appVersion       // string - Application version
env.nodeEnv          // "development" | "staging" | "production"
env.isDevelopment    // boolean
env.isStaging        // boolean
env.isProduction     // boolean
env.enableDebug      // boolean
```

## Docker Deployment

### Build Arguments

The Dockerfile supports build-time environment selection:

```bash
# Staging build
docker build \
  --build-arg BUILD_ENV=staging \
  --build-arg NEXT_PUBLIC_API_URL=https://api-staging.example.com \
  -t web:staging \
  -f apps/web/Dockerfile .

# Production build
docker build \
  --build-arg BUILD_ENV=production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  -t web:production \
  -f apps/web/Dockerfile .
```

### Docker Compose

Update `docker-compose.yml` for environment-specific deployments:

```yaml
services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
      args:
        BUILD_ENV: ${BUILD_ENV:-production}
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    environment:
      - NODE_ENV=production
```

Run with environment file:
```bash
# Staging
BUILD_ENV=staging docker-compose up

# Production
BUILD_ENV=production docker-compose up
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Web (Staging)

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: bun install --frozen-lockfile
        
      - name: Validate environment
        run: cd apps/web && bun run env:validate
        working-directory: .
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.STAGING_API_URL }}
          NEXT_PUBLIC_APP_NAME: "Dash Finance (Staging)"
          
      - name: Build
        run: bun run build:staging
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.STAGING_API_URL }}
          
      - name: Deploy
        run: # Your deployment script
```

## Environment-Specific Features

### Development
- Full error stack traces
- Debug logging enabled
- Source maps included
- React Strict Mode
- Hot Module Replacement

### Staging
- Production optimizations
- Minified bundles
- Limited debug info
- Performance monitoring
- Staging API endpoint
- Can use production data snapshots

### Production
- Full optimizations
- Error tracking only
- No debug features
- Security headers
- Production API endpoint
- Performance monitoring

## Troubleshooting

### Environment Variables Not Loading

**Check loading priority:**
```bash
# View which files are loaded
bun run env:validate
```

**Common issues:**
1. `.env.local` overriding expected values → Remove or rename
2. Wrong environment detected → Set `NEXT_PUBLIC_APP_ENV` explicitly
3. Missing required variables → Check `.env.{environment}` file exists

### Build Failures

**Validation errors during build:**
```bash
# Validate before building
bun run env:validate

# Check specific environment
NEXT_PUBLIC_API_URL=https://api.example.com bun run env:validate
```

### Docker Build Issues

**Environment variables not available in container:**
- Ensure `NEXT_PUBLIC_*` prefix for client-side variables
- Pass build args: `--build-arg NEXT_PUBLIC_API_URL=...`
- Check `.env.{environment}` file is copied in Dockerfile

## Best Practices

### DO ✅
- Use `env` module for all environment access
- Commit `.env.{environment}` files with safe defaults
- Use `.env.local` for local development secrets
- Validate environment before deployment
- Document all new environment variables
- Use `NEXT_PUBLIC_` prefix for client-side variables

### DON'T ❌
- Commit `.env.local` or `.env.*.local` files (gitignored)
- Store secrets in committed `.env` files
- Access `process.env` directly in application code
- Use different variable names across environments
- Deploy without validating environment first

## Security Notes

### Sensitive Data
- Never commit API keys, passwords, or tokens
- Use `.env.local` or `.env.{environment}.local` for secrets
- Use secret management in CI/CD (GitHub Secrets, AWS Secrets Manager)
- Rotate credentials regularly

### Client-Side Exposure
Variables with `NEXT_PUBLIC_` prefix are exposed to the browser:
```typescript
// ⚠️ Exposed to client (safe for API URLs, app names)
NEXT_PUBLIC_API_URL=https://api.example.com

// ✅ Server-only (use for secrets)
API_SECRET_KEY=secret123
DATABASE_URL=postgresql://...
```

## Adding New Variables

1. **Add to all environment files:**
   - `.env.development`
   - `.env.staging`
   - `.env.production`
   - `.env.local.example`

2. **Update `src/lib/env.ts`:**
   ```typescript
   interface EnvConfig {
     // ... existing
     newVariable: string;
   }
   
   function buildEnvConfig(): EnvConfig {
     return {
       // ... existing
       newVariable: getEnvVar("NEXT_PUBLIC_NEW_VARIABLE"),
     };
   }
   ```

3. **Update documentation:**
   - Add to variable table in this file
   - Update `.env.local.example` with description
   - Document usage in relevant feature docs

4. **Validate:**
   ```bash
   bun run env:validate
   ```

## Migration from Single Environment

If migrating from single `.env` file:

1. **Backup existing `.env`:**
   ```bash
   cp .env .env.backup
   ```

2. **Create environment-specific files:**
   ```bash
   cp .env .env.development
   cp .env .env.staging
   cp .env .env.production
   ```

3. **Customize each environment:**
   - Update API URLs
   - Adjust feature flags
   - Set appropriate app names

4. **Update code:**
   - Replace `process.env.*` with `env.*` from `src/lib/env.ts`

5. **Test each environment:**
   ```bash
   bun run env:validate
   bun run dev
   bun run build:staging
   bun run build:production
   ```

6. **Remove old `.env`:**
   ```bash
   rm .env .env.backup
   ```

## Support

For questions or issues with environment configuration:
1. Check this documentation
2. Run `bun run env:validate` for diagnostics
3. Review `.env.local.example` for variable reference
4. Check Next.js environment documentation: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables
