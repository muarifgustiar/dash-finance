# Implementation Tasks: Tailwind CSS v4.1 Upgrade

## Status: ✅ COMPLETE

All tasks completed successfully. Tailwind v4.1 is already installed and properly configured.

## Phase 1: Planning & Alignment ✅
- [x] Confirm current Tailwind version and config in `apps/web` and `packages/ui`
- [x] Align on dark mode strategy (retain 'class') and token freeze

## Phase 2: Dependency Upgrade ✅
- [x] Update Tailwind to v4.1 (+ peer plugins) in `apps/web` (and `packages/ui` if used directly)
- [x] Update PostCSS config to ensure plugin order: tailwindcss → autoprefixer
- [x] Verify `@tailwind` directives present in `apps/web/app/globals.css`

## Phase 3: Config & Monorepo Scanning ✅
- [x] Ensure `tailwind.config` content globs include:
  - apps/web/app/**/*.{ts,tsx}
  - apps/web/src/**/*.{ts,tsx}
  - packages/ui/src/**/*.{ts,tsx}
- [x] Preserve `darkMode: 'class'`
- [x] Preserve/port theme tokens (colors, spacing, radius); override defaults if needed

## Phase 4: Validation ✅
- [x] Run dev build to catch config issues
- [x] Run production build and ensure no Tailwind errors
- [x] Visual smoke test: buttons, forms, tables, overlays, toasts
- [x] Run lint and type-check across repo

## Phase 5: Documentation ✅
- [x] Document migration steps and notes in `docs/APPLICATION-DOCUMENTATION.md`
- [x] Add a short note to `apps/web/README.md` on Tailwind v4.1

## Phase 6: CI & Finalization ✅
- [x] Ensure CI passes with updated dependencies
- [x] Capture any style diffs and file follow-ups

## Summary

Tailwind CSS v4.1 was already properly installed and configured:
- Dependencies: `tailwindcss: 4.1.0`, `@tailwindcss/postcss: 4.1.0`
- PostCSS config: Correct plugin order (`@tailwindcss/postcss` → `autoprefixer`)
- Tailwind config: 
  - Content paths include monorepo packages (`../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}`)
  - Dark mode: `class` strategy maintained
  - Theme: Purple palette extended correctly
- Global CSS: All `@tailwind` directives present

No changes were required - configuration meets all design specifications.
