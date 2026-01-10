# Proposal: Implement Shadcn Component Library in packages/ui

## Why
The shared UI package currently contains a small, partial set of primitives. We need full Shadcn component coverage so apps can reuse consistent, accessible UI without duplicating work. A standardized set of components will reduce design drift, speed feature delivery, and align with the design system.

## Context
- Target: `packages/ui` workspace package
- Consumers: `apps/web`, `apps/api` (if any web UIs), future apps
- Current gap: only a handful of primitives (button, card, input, etc.) exist; many Shadcn components are missing (dialog, dropdown, tabs, table, toast, form primitives, etc.)
- Goal: deliver a coherent, tree-shakeable, typed Shadcn-based component set with consistent tokens and accessibility guarantees

## Objectives
- Add the agreed Shadcn component set to `packages/ui`
- Ensure theme/tokens align with existing Tailwind config and design palette
- Maintain accessibility (ARIA, focus management) and composability
- Provide clear exports and minimal usage docs for consumers

## Scope
In scope:
- Component implementations in `packages/ui`
- Theme/tokens alignment and Tailwind config updates (if needed for components)
- Barrel exports and type safety
- Minimal usage guidance/examples (docs/readme)

Out of scope:
- App-level page rewrites; only shared components
- Visual redesign beyond matching Shadcn defaults + existing palette
- Storybook setup (optional; only if needed for docs)

## Risks
- Token/theme mismatch causing visual inconsistency
- Tree-shaking issues if exports are misconfigured
- Accessibility regressions if patterns deviate from Shadcn

## Success Criteria
- All targeted Shadcn components available from `packages/ui`
- Components are typed, accessible, and tree-shakeable
- Exports are stable and documented
- Apps can replace local variants with shared components without breaking styling
