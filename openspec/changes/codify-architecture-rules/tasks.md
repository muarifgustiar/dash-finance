# Tasks: Codify Architecture Rules

## Phase 1: Specification Authoring

- [x] **Create clean-architecture-layering spec**
  - Document Presentation/Delivery → Application → Domain ← Infrastructure layering
  - Specify layer responsibilities (validation in delivery, orchestration in application, pure logic in domain, persistence in infrastructure)
  - Define inward-only dependency rule
  - Scenarios: valid layering, forbidden imports (domain → framework), use case DI pattern

- [x] **Create boundary-constraints spec**
  - Document no cross-feature/module imports rule
  - Specify allowed import patterns (feature → feature domain/application, module → module domain)
  - Define forbidden patterns (features/a → features/b, modules/transaction → modules/user)
  - Scenarios: valid feature composition, cross-feature violation detection, shared kernel usage

- [x] **Create dependency-management spec**
  - Document pure domain layer (zero external deps: no Zod, React, Elysia, Firebase, DB clients)
  - Specify @repo/schema role (DTO/contract validation at boundaries only)
  - Specify @repo/domain role (universal constants: error codes, API types; NOT business constants)
  - Document business constants location (module/feature domain)
  - Scenarios: domain purity check, schema usage in handlers/forms, constant placement

- [x] **Create code-conventions spec**
  - Document naming conventions (files: kebab-case, classes: PascalCase, constants: SCREAMING_SNAKE_CASE in objects)
  - Specify language usage (English identifiers, Bahasa Indonesia UI text)
  - Document testing priorities (domain unit → application unit → handler → integration)
  - Document command patterns (bun run dev/build/test/lint/type-check)
  - Scenarios: correct naming, language separation, test hierarchy

## Phase 2: Validation

- [x] **Run strict validation**
  - Execute: `openspec validate codify-architecture-rules --strict`
  - Fix any validation errors (missing SHALL/MUST, missing scenarios, format issues)
  - Ensure all requirements have unique IDs
  - Verify scenarios have Given/When/Then structure

- [x] **Cross-reference with instruction files**
  - Compare spec requirements against .github/instructions/*.instructions.md
  - Ensure no rules are missing
  - Verify context explanations match original intent
  - Check scenarios align with actual codebase structure

## Phase 3: Documentation Updates

- [x] **Update README references**
  - Add link to openspec/specs/ in main README
  - Note that architecture specs are source of truth
  - Keep instruction files as AI agent prompts (aligned with specs)

- [x] **Update ARCHITECTURE-QUICK-REFERENCE**
  - Add pointers to formal specs
  - Summarize key spec IDs for quick lookup

## Validation Checkpoints

After each spec:
- [x] Requirement has "Requirement:" heading
- [x] Requirement includes "Context:" explanation
- [x] Requirement uses SHALL or MUST
- [x] At least one scenario per requirement
- [x] Scenario follows Given/When/Then format
- [x] Scenario references actual project paths

After all specs:
- [x] No duplicate requirement IDs
- [x] All instruction file rules captured
- [x] Specs validate with --strict mode
- [x] Design.md trade-offs documented
- [x] Tasks.md is actionable and ordered
