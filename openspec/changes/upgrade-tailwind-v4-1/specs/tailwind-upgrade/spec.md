# Tailwind CSS v4.1 Upgrade

## ADDED Requirements

### Requirement: TW41-001 - Standardize Tailwind v4.1 Across Workspaces
**Context**: Align on a single Tailwind version for consistent utilities and DX.

All relevant workspaces (at minimum `apps/web`, and `packages/ui` if directly using Tailwind) MUST use Tailwind CSS v4.1. PostCSS integration SHALL include `tailwindcss` followed by `autoprefixer` in the pipeline.

#### Scenario: Installing dependencies
**Given** a fresh install on the monorepo
**When** dependencies are installed
**Then** the Tailwind package version for `apps/web` MUST resolve to v4.1
**And** the PostCSS plugins order SHALL be tailwindcss → autoprefixer

### Requirement: TW41-002 - Monorepo Content Scanning
**Context**: Ensure utilities are generated for both app and shared UI code.

Tailwind content scanning MUST include app sources and shared UI sources, including (but not limited to): `apps/web/app/**/*.{ts,tsx}`, `apps/web/src/**/*.{ts,tsx}`, and `packages/ui/src/**/*.{ts,tsx}`.

#### Scenario: Building the app
**Given** components imported from `packages/ui`
**When** building `apps/web`
**Then** Tailwind SHALL generate classes used by those components (no missing styles)

### Requirement: TW41-003 - Preserve Dark Mode Strategy
**Context**: Maintain UX expectations and existing dark mode behavior.

The Tailwind configuration MUST retain `darkMode: 'class'` strategy for `apps/web`. No automatic media-query dark mode SHALL be introduced by the upgrade.

#### Scenario: Toggling theme
**Given** the app uses a class-based theme toggle
**When** toggling dark mode at the root element
**Then** dark styles SHALL apply consistently under Tailwind v4.1

### Requirement: TW41-004 - Theme Tokens Compatibility
**Context**: Avoid visual regressions due to default theme changes.

The theme tokens (colors, spacing, radius, etc.) used by `apps/web` and `packages/ui` MUST be preserved or explicitly overridden to match current visuals. Any new tokens required by v4.1 SHALL be added without breaking existing components.

#### Scenario: Rendering shared UI components
**Given** shared components rely on specific color tokens
**When** rendering after the upgrade
**Then** component styling SHALL match previous appearance (or an agreed delta)

## MODIFIED Requirements

### Requirement: TW41-005 - Build & Dev Consistency
**Context**: Ensure dev and production parity with the new Tailwind version.

Dev (`bun run dev:web`) and production builds (`bun run build:web`) SHALL complete without Tailwind-related errors under v4.1. The CSS output MUST include utilities referenced in the codebase and SHALL not exclude classes used by shared components.

#### Scenario: Production build after upgrade
**Given** Tailwind v4.1 is configured
**When** running a production build for `apps/web`
**Then** the build MUST succeed with no Tailwind errors
**And** the resulting CSS SHALL include required utilities

### Requirement: TW41-006 - Documentation Updates
**Context**: Keep team aligned on the new version and patterns.

The repository documentation (at minimum `docs/APPLICATION-DOCUMENTATION.md` and `apps/web/README.md`) MUST be updated to reflect Tailwind v4.1 usage, including content paths, dark mode strategy, and any config nuances for the monorepo.

#### Scenario: Developer onboarding
**Given** a new developer joins the project
**When** following the documentation to run the web app
**Then** they SHALL see Tailwind v4.1 instructions and accurate content path examples
