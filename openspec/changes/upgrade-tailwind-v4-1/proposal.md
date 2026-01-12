# Proposal: Upgrade Tailwind CSS to v4.1

## Why
Standardize on Tailwind CSS v4.1 to unlock latest features and fixes, ensure long-term compatibility, and simplify configuration across the monorepo. This brings consistent, modern utilities to `apps/web` and `packages/ui`, reduces configuration drift, and improves DX.

## Context
- Current: Tailwind v3.x in `apps/web` (tailwind.config.js + postcss.config.js)
- Target: Tailwind v4.1 with updated plugin and config patterns
- Consumers: `apps/web` (primary), `packages/ui` (shared components)
- Constraints: Keep existing design tokens and dark mode strategy; avoid breaking class names; incremental migration where possible

## Objectives
- Upgrade Tailwind dependencies to v4.1 in relevant workspaces
- Align configuration (content paths, dark mode, theme tokens) for monorepo scanning (apps + packages)
- Validate build/dev flows and styling parity
- Document the migration steps and outcomes

## Non-Goals
- Redesign or token overhaul beyond compatibility alignments
- Changing class naming conventions in features/components

## Risks
- Build failures due to config incompatibilities
- Token regressions (colors, spacing) if theme defaults shift
- PostCSS pipeline mismatches if plugin order changes

## Success Criteria
- Dev server and production builds complete without Tailwind errors
- app/web renders correctly with expected styles
- Shared `packages/ui` components render as before (or improved) under v4.1
- Documentation updated; team can adopt new patterns confidently
