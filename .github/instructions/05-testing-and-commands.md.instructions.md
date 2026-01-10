---
applyTo: '**'
---
# Testing

## Prioritas
1. Domain unit tests (pure logic) — target 100%
2. Application/use-case unit tests (mock repo via DI)
3. Handler tests (in-memory request)
4. Repository integration tests (in-memory DB / mocked service)

## Web
- Vitest + Testing Library
- MSW untuk mock network
- Fokus behavior, bukan snapshot besar

## API
- `bun:test` untuk unit tests di modules/*
- Handler tests via `app.handle(new Request(...))` bila perlu
- No real network/no real Firebase pada unit test

# Commands (Bun + Turborepo)

## Install Dependencies
- Jalankan dari repo root:
  - `bun install`

## Development
- `bun run dev`           # Run all apps (via turbo)
- `bun run dev:web`       # Next.js web
- `bun run dev:api`       # Elysia API

## Build
- `bun run build`
- `bun run build:web`
- `bun run build:api`

## Testing
- `bun run test`
- `bun run lint`
- `bun run type-check`
- `bun run format`

## API-only (optional)
- `cd apps/api`
- `bun test`
- `bun run dev`