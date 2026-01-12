## Overview

Next.js 15 (App Router) frontend for Dash Finance. Styling uses Tailwind CSS v4.1 with class-based dark mode.

**Architecture:** Clean Architecture + DDD (simplified for frontend)
- 📖 **[Architecture Compliance Report](./ARCHITECTURE-COMPLIANCE.md)** - Current architecture status & patterns

## Prerequisites
- Bun (see repo root `package.json` for version)

## Environment Configuration

Environment variables follow **Next.js best practices** with automatic loading based on `NODE_ENV`.

**Quick Start:**
1. Copy `.env.example` to `.env.local` (optional, for local overrides)
2. Run `bun run dev` (automatically loads `.env.development`)

**Documentation:**
- ⚡ **[Quick Reference](./ENV-QUICK-REF.md)** - Common commands and variables
- 📖 **[Complete Setup Guide](./ENVIRONMENT-SETUP.md)** - Full documentation
- 📖 **[Official Next.js Docs](https://nextjs.org/docs/app/guides/environment-variables)** - Reference

**Environment Files:**
- `.env.development` - Auto-loaded in development (`next dev`)
- `.env.production` - Auto-loaded in production (`next build`)
- `.env.staging` - Manual load for staging builds
- `.env.local` - Local overrides (gitignored)

## Scripts
- `bun run dev` – start dev server (port 3000)
- `bun run build` – production build
- `bun run build:staging` – staging build
- `bun run start` – start production server
- `bun run lint` – lint with ESLint
- `bun run check-types` – Next typegen + TypeScript noEmit

## Tailwind CSS (v4.1)

**Setup:** Following [official Next.js integration guide](https://tailwindcss.com/docs/installation/framework-guides/nextjs)

- **Configuration:** CSS-based via `@theme` directive in `app/globals.css` ([v4 uses CSS, not JS config](https://tailwindcss.com/docs/upgrade-guide#using-a-javascript-config-file))
- **Dark mode:** `darkMode: "class"`
- **Content detection:** Automatic scanning of `app/**/*.{ts,tsx,mdx}`, `src/**/*.{ts,tsx,mdx}`, `../../packages/ui/src/**/*.{ts,tsx,mdx}`
- **PostCSS:** `@tailwindcss/postcss` (replaces v3's `tailwindcss` plugin)
- **Customization:** Use `@theme` blocks in CSS to extend design tokens

## Notes
- Shared UI components live in `packages/ui` and rely on Tailwind classes; content globs above must include them.
- UI text is Bahasa Indonesia; code identifiers use English.
