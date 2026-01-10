# README: Remove Web Repositories Layer

## Change ID
`remove-web-repositories-layer`

## Status
🟡 **PROPOSED** - Awaiting review and approval

## Quick Summary
Remove the repository pattern from the web application (`apps/web`) and simplify to direct API calls in TanStack Query hooks. This change eliminates unnecessary architectural layers that don't provide value in a frontend context.

## Problem
The web application currently uses a backend-style repository pattern (domain interface → infrastructure implementation → use case → hook) which is over-engineered for frontend HTTP calls. This adds complexity without benefits.

## Solution
Simplify to: `Component → Hook (TanStack Query) → API Client → HTTP`

Remove:
- Domain repository interfaces
- Infrastructure repository implementations  
- Application use cases (frontend-specific)

Keep:
- Domain entities (for type safety)
- Direct API calls via `apiRequest`
- TanStack Query for caching/synchronization

## Impact
- **Category feature**: Remove ~12 files, simplify to ~3 files
- **Auth feature**: Remove ~7 files, simplify to ~2 files
- **Documentation**: Update architecture docs to reflect correct pattern
- **No functional changes**: Same behavior, simpler code

## Files
- `proposal.md` - Full context and rationale
- `tasks.md` - Ordered implementation checklist
- `design.md` - Architectural design and patterns

## Next Steps
1. Review proposal
2. Discuss with team
3. Get approval
4. Execute tasks in order
5. Validate with `openspec validate remove-web-repositories-layer --strict`

## Questions?
See `design.md` for detailed architectural explanation and examples.
