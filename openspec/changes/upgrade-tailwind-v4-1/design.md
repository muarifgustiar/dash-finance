# Design: Tailwind CSS v4.1 Upgrade

## Scope & Impact
Upgrade Tailwind to v4.1 for `apps/web` and ensure `packages/ui` is compatible. Align monorepo scanning patterns so UI package classes are included during app builds. Keep dark mode strategy (class) and existing tokens unless explicitly adjusted.

## Configuration Principles
- Centralize content scanning to include app and shared UI sources
- Preserve `darkMode: 'class'` unless design dictates otherwise
- Keep `@tailwind base; @tailwind components; @tailwind utilities;` imports in app global CSS
- PostCSS: ensure `tailwindcss` runs before `autoprefixer`

## Monorepo Content Paths (Illustrative)
- apps/web/app/**/*.{ts,tsx}
- apps/web/src/**/*.{ts,tsx}
- packages/ui/src/**/*.{ts,tsx}

## Tokens & Theming
- Maintain existing palette and radius via Tailwind theme or CSS variables
- If v4.1 introduces new defaults, override to keep current visuals
- Leave room for future theme consolidation across apps/packages

## Validation Strategy
- Local dev boot (no Tailwind errors)
- Production build passes
- Visual smoke across key pages/components (buttons, forms, tables, overlays)
- CI job(s) run lint/type-check/build as usual
