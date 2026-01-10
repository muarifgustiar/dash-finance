# UI Shadcn Components

## ADDED Requirements

### Requirement: UI-SHADCN-001 - Component Coverage
**Context**: `packages/ui` must provide a comprehensive set of Shadcn-aligned components for reuse across apps.

`packages/ui` SHALL export the following component groups: primitives (badge, alert, textarea, checkbox, radio-group, switch, slider, avatar, skeleton, separator), overlay/navigation (dialog, sheet/drawer, popover, tooltip, dropdown-menu, hover-card, tabs, accordion, collapsible), forms/data (select, table, pagination controls, form primitives), and feedback (toast provider/hook, progress, alert-dialog). Where a component already exists (e.g., button, card, input), it MUST remain available and consistent.

#### Scenario: Consuming a missing component
**Given** a web feature needs a Shadcn component (e.g., dialog or dropdown-menu)
**When** it imports from `packages/ui`
**Then** the component MUST be available and functionally equivalent to Shadcn defaults
**And** it SHALL include styling aligned to shared tokens

### Requirement: UI-SHADCN-002 - Theming and Tokens
**Context**: Components must align with the shared design palette.

Components MUST use shared Tailwind theme tokens (colors, radius, spacing, typography) defined for the design system. Any palette extensions SHALL be added centrally (not per component). Components SHOULD support light/dark mode if tokens exist.

#### Scenario: Adding a new component that needs custom color
**Given** a new component variant needs a color not yet in the palette
**When** implementing the component
**Then** the color SHALL be added to the shared Tailwind theme
**And** the component SHALL consume the theme token instead of hardcoding values

### Requirement: UI-SHADCN-003 - Accessibility and API Parity
**Context**: Accessibility and API parity with Shadcn is required.

Components MUST preserve Shadcn accessibility patterns (ARIA attributes, keyboard navigation, focus trapping/return). Public props SHOULD match Shadcn defaults unless a documented deviation is required. ARIA/`className`/`style` props SHALL be forwarded where applicable.

#### Scenario: Overlay keyboard navigation
**Given** a user opens a dialog or dropdown
**When** navigating with keyboard
**Then** focus MUST be trapped within the overlay
**And** ESC MUST close where Shadcn does
**And** focus MUST return to the trigger on close

### Requirement: UI-SHADCN-004 - Packaging and Tree-Shaking
**Context**: Components must be easy to import and tree-shake.

Each component MUST be exported individually and via a barrel. The package SHALL avoid side-effectful imports so bundlers can tree-shake unused components. Type declarations MUST be emitted for all exports.

#### Scenario: Importing a single component
**Given** a consumer imports only `Button` and `Dialog`
**When** bundling the app
**Then** other unused components SHALL NOT be included in the bundle (assuming bundler supports tree-shaking)

### Requirement: UI-SHADCN-005 - Usage Guidance
**Context**: Minimal docs/examples are needed for adoption.

`packages/ui` MUST include concise usage notes for each component group (primitives, overlay/nav, forms/data, feedback). Guidance SHALL cover required providers (e.g., toast), common props, and example imports. Docs MAY live in README or per-group markdown in the package.

#### Scenario: Developer adopting toast
**Given** a developer wants to use toast
**When** reading the package docs
**Then** they SHOULD see how to wrap the app with the toast provider
**And** how to call the toast hook with a minimal example

## MODIFIED Requirements

### Requirement: UI-SHADCN-006 - UI Package Structure
**Context**: Ensure the UI package structure supports the expanded component set.

The UI package structure SHALL organize components by group (primitives, overlay, data/forms, feedback) and provide a single barrel export. Build and config files MUST support emitting types and ESM/CJS (as currently used) without breaking consumers.

#### Scenario: Adding a new component file
**Given** a new component is added
**When** placing the file
**Then** it SHALL reside in the appropriate group folder (e.g., `primitives/`, `overlay/`)
**And** it MUST be exported from the barrel
