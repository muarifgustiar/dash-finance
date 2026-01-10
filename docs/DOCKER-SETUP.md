# Docker Setup Guide

## Quick Start

### 1. Copy environment file
```bash
cp .env.example .env
```

### 2. Start all services
```bash
bun run docker:up
```

This starts:
- PostgreSQL (port 5432)
- API (port 3001)
- Web (port 3000)

### 3. Generate Prisma Client & Push Schema
```bash
bun run db:generate
bun run db:push
```

### 4. Access services
- Web: http://localhost:3000
- API: http://localhost:3001
- Database: localhost:5432

## Commands

### Docker
```bash
# Start services
bun run docker:up

# Stop services
bun run docker:down

# View logs
bun run docker:logs

# Rebuild and start
bun run docker:rebuild
```

### Database (Prisma)
```bash
# Generate Prisma Client
bun run db:generate

# Push schema to DB (dev)
bun run db:push

# Create migration
bun run db:migrate

# Open Prisma Studio
bun run db:studio
```

### Development
```bash
# Run all apps
bun run dev

# Run API only
bun run dev:api

# Run Web only
bun run dev:web
```

## Project Structure

```
dash_finance/
├── docker-compose.yml      # Multi-service setup
├── .env                     # Environment variables
├── apps/
│   ├── api/
│   │   ├── Dockerfile       # Bun API container
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── src/
│   └── web/
│       ├── Dockerfile       # Next.js container
│       └── src/
│           └── components/
│               ├── data-table.tsx        # TanStack Table
│               ├── tables/
│               │   └── user-columns.tsx  # Example columns
│               └── forms/
│                   ├── form-field.tsx    # Form wrapper
│                   └── create-user-form.tsx # Example form
└── packages/
    ├── schema/              # Zod validation schemas
    └── domain/              # Pure TS types
```

## Tech Stack

- **Runtime**: Bun
- **API**: Elysia.js + Prisma + PostgreSQL
- **Web**: Next.js 15 + TanStack Table + TanStack Form
- **Validation**: Zod (shared via @repo/schema)
- **Database**: PostgreSQL 16
- **Containerization**: Docker + Docker Compose

## Development Tips

1. **Hot Reload**: Both API and Web have hot reload enabled
2. **Database Changes**: Run `bun run db:push` after schema changes
3. **Type Safety**: Schemas are shared via `@repo/schema`
4. **Clean Architecture**: Domain → Application → Infrastructure
5. **Forms**: Use TanStack Form with Zod validator
6. **Tables**: Use TanStack Table for data display

## Troubleshooting

### Port already in use
```bash
# Stop existing services
bun run docker:down

# Or kill specific process
lsof -ti:3000 | xargs kill -9
```

### Database connection refused
```bash
# Check if DB is healthy
docker-compose ps

# Restart DB only
docker-compose restart db
```

### Prisma client issues
```bash
# Regenerate client
bun run db:generate
```

## Production Build

```bash
# Build all apps
bun run build

# Start production containers
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```
