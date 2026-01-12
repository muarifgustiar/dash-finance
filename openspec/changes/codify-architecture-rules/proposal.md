# Proposal: Codify Architecture Rules

## What

Formalize the tech architecture patterns, boundary rules, and layering principles currently documented in `.github/instructions/*.instructions.md` files into structured OpenSpec requirements. This ensures architectural constraints are machine-readable, testable, and enforceable across the codebase.

## Why

Currently, architecture rules exist only as instruction files for AI agents and developers. This creates several issues:

1. **No enforcement**: Rules can be violated without detection
2. **No testability**: Cannot validate compliance automatically
3. **No discoverability**: New developers must read scattered instruction files
4. **No evolution tracking**: Changes to architecture aren't versioned with code
5. **No tooling integration**: Linters and analyzers cannot reference these rules

By codifying these rules as OpenSpec requirements with scenarios, we enable:
- Automated compliance validation
- Clear, testable architecture boundaries
- Integration with CI/CD for architecture governance
- Single source of truth for technical decisions
- Better onboarding experience

## Goals

- Document Clean Architecture + DDD layering rules (Presentation → Application → Domain ← Infrastructure)
- Codify boundary rules for API (modules) and Web (features)
- Specify dependency constraints (no cross-feature/module imports, pure domain layer)
- Define shared package responsibilities (@repo/schema for DTOs, @repo/domain for universal constants)
- Establish naming conventions and language usage (English identifiers, Bahasa Indonesia UI)
- Document testing priorities and command patterns

## Non-Goals

- Change existing architecture or introduce new patterns
- Migrate current code to comply with rules (separate effort)
- Create runtime enforcement mechanisms
- Document business domain concepts (that's application-level documentation)

## Risks & Mitigations

**Risk**: Over-specification makes future refactoring difficult  
**Mitigation**: Keep requirements focused on high-level constraints, not implementation details

**Risk**: Rules become stale as codebase evolves  
**Mitigation**: Version control changes alongside code changes; require spec updates for architecture shifts

**Risk**: Developers bypass rules as "documentation only"  
**Mitigation**: Integrate validation tools in CI/CD; make specs machine-readable

## Success Criteria

- All architecture principles from instruction files captured as OpenSpec requirements
- Each requirement has at least one testable scenario
- Validation passes: `openspec validate codify-architecture-rules --strict`
- No behavioral changes to existing codebase
- Future changes can reference these specs for compliance checks
