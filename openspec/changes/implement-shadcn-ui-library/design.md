# Design: Shadcn Components in packages/ui

## Goals
- Provide a comprehensive Shadcn-based component set from `packages/ui`
- Keep components stateless/composable, with styling driven by Tailwind tokens
- Ensure accessibility parity with upstream Shadcn patterns

## Approach
1) **Use Shadcn patterns as reference**: replicate API and behavior; keep prop names stable.
2) **Theme/Tokens alignment**: ensure Tailwind theme matches design palette (colors, radius, spacing). Avoid one-off inline styles.
3) **Packaging**: export each component and re-export from a barrel. Keep files small and tree-shakeable; avoid side effects.
4) **A11y**: preserve ARIA passthrough, focus management, keyboard interactions; keep portal-based overlays where appropriate.
5) **Docs**: concise usage examples per component group; note required providers (e.g., toast provider).

## Component Groups (target)
- **Primitives**: button (existing), badge, alert, textarea, checkbox, radio-group, switch, slider, skeleton, separator, avatar
- **Overlay/Navigation**: dialog, drawer/sheet, popover, tooltip, dropdown-menu, hover-card, tabs, accordion, collapsible
- **Forms/Data**: select, combobox (if included), table, pagination controls, form primitives (FormField/FormItem/FormLabel/FormMessage)
- **Feedback**: toast provider/hook, progress, alert-dialog

## Non-Goals
- No bespoke design overhaul; follow Shadcn defaults tuned to existing palette.
- No app-specific layout components; only shared UI primitives.

## Open Questions
- Do we include dark mode tokens in this phase? (Default: support but do not customize heavily.)
- Do we include a Combobox variant now or defer until needed? (Lean to include if low effort.)

## Testing Strategy
- Type-check and lint in `packages/ui`
- Manual smoke page in `apps/web` rendering each component
- Optional: lightweight vitest for provider wiring (toast) if time permits
