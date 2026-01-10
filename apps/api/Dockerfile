# Dash Finance API - Bun Runtime
# Multi-stage build for optimized production image

FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies stage
FROM base AS deps
COPY package.json bun.lockb ./
COPY apps/api/package.json ./apps/api/
COPY packages/domain/package.json ./packages/domain/
COPY packages/schema/package.json ./packages/schema/
RUN bun install --frozen-lockfile

# Build stage
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build:api

# Production stage
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3001

# Create non-root user
RUN addgroup --system --gid 1001 bunjs
RUN adduser --system --uid 1001 bunjs
USER bunjs

COPY --from=builder --chown=bunjs:bunjs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=bunjs:bunjs /app/packages ./packages
COPY --from=deps --chown=bunjs:bunjs /app/node_modules ./node_modules

EXPOSE 3001

CMD ["bun", "run", "apps/api/dist/index.js"]

# Development stage
FROM base AS development
ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3001

CMD ["bun", "run", "dev:api"]
