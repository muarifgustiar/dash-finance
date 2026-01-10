# Implementation Tasks: Implement Shadcn Component Library in packages/ui

## Phase 1: Discovery & Design Lock
1) Inventory current `packages/ui` components and Tailwind tokens
2) Confirm target Shadcn component list and token alignment with design team
3) Decide on optional theming (light/dark) support for this phase

## Phase 2: Foundation
4) Update Tailwind config/theme tokens if needed (colors, radius, spacing) to support Shadcn defaults
5) Ensure build config supports tree-shaking and type exports (tsconfig/build entrypoints)

## Phase 3: Component Implementation
6) Implement core primitives: badge, alert, textarea, checkbox, radio group, switch, slider, avatar, skeleton, separator
7) Implement overlay & navigation: dialog, drawer/sheet, popover, tooltip, dropdown-menu, hover-card, tabs, accordion, collapsible
8) Implement data display & form helpers: table, form primitives (FormField, FormLabel, FormMessage), select, combobox (if included), pagination controls
9) Implement feedback: toast provider & hook, progress, alert dialog
10) Export all components via barrel in `packages/ui/src/index.ts` (or equivalent)

## Phase 4: Docs & Examples
11) Add minimal usage examples/readme for each component group (links, prop hints)
12) Note accessibility expectations (aria props pass-through, focus management)

## Phase 5: Validation
13) Run type-check/lint on `packages/ui` and consumers
14) Verify tree-shaking by building the package and inspecting bundle size (optional smoke)
15) Manual UI smoke test in `apps/web` using a sample page to render each component

## Phase 6: Cleanup
16) Remove any duplicate local UI variants in `packages/ui` if superseded
17) Ensure version bump/changeset (if repo uses changesets) and update README
