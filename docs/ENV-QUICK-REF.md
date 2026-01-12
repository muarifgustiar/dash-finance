# Environment Variables Quick Reference

## 🚀 Quick Commands

```bash
# Development (auto-loads .env.development)
bun run dev

# Production build
bun run build

# Staging build (copies staging env to production.local)
bun run build:staging

# Start production server
bun run start
```

## 📋 Available Variables

All client-side variables use the `NEXT_PUBLIC_` prefix.

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | string | `http://localhost:3001` | API base URL |
| `NEXT_PUBLIC_API_TIMEOUT` | number | `30000` | API request timeout (ms) |
| `NEXT_PUBLIC_APP_NAME` | string | `"Finance Dashboard"` | Application name |
| `NEXT_PUBLIC_APP_VERSION` | string | `"1.0.0"` | Application version |
| `NEXT_PUBLIC_ENABLE_DEBUG` | boolean | `false` | Enable debug mode |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | boolean | `false` | Enable analytics |
| `NEXT_PUBLIC_FIREBASE_*` | string | - | Firebase configuration |

## 🐳 Docker Usage

### Development
```bash
docker-compose up
```

### Staging
```bash
# Set env vars in shell or .env file
export NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com

# Build with args
docker-compose -f docker-compose.yml -f docker-compose.staging.yml build

# Run
docker-compose -f docker-compose.yml -f docker-compose.staging.yml up
```

### Production
```bash
# Set env vars
export NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Build with args
docker-compose -f docker-compose.yml -f docker-compose.production.yml build

# Run
docker-compose -f docker-compose.yml -f docker-compose.production.yml up
```

## 🔍 Access in Code

```typescript
// Using the env module (recommended)
import { env } from "@/lib/env";

console.log(env.apiUrl);        // Type-safe
console.log(env.isDevelopment); // Boolean helper

// Direct access (less safe)
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

## 📚 Documentation

- **[Complete Setup Guide](./ENVIRONMENT-SETUP.md)** - Full documentation
- **[Next.js Env Vars](https://nextjs.org/docs/app/guides/environment-variables)** - Official docs
- **[Web README](./README.md)** - Project overview
