# Architecture Checklist

## ✅ Refactoring Complete

### @repo/domain - Shared Kernel
- [x] Minimal, universal types/schemas only
- [x] No module-specific DTOs
- [x] Only dependency: zod
- [x] Error codes centralized
- [x] API response types standardized
- [x] Pagination types defined

### apps/api - Bounded Context Architecture
- [x] Modules directory with clear structure
- [x] User module as template
- [x] Clean separation:
  - [x] domain/ - Pure TS, no dependencies
  - [x] application/ - Use cases + DTOs
  - [x] infrastructure/ - Adapters (Firebase, DB)
  - [x] delivery/http/ - Thin Elysia routes
  - [x] module.container.ts - DI wiring
- [x] Global app.ts - Route composition only
- [x] Shared errors - Canonical error classes
- [x] Shared utils - Response helpers

### Dependency Rules
- [x] No cross-module imports (modules are independent)
- [x] All modules depend on @repo/domain (one direction)
- [x] Delivery → Application → Domain ← Infrastructure (layering)
- [x] No external deps in domain (except zod in @repo/domain)
- [x] No DB logic in @repo/domain

### Validation Hierarchy
- [x] @repo/domain/schemas - Building blocks
- [x] modules/*/application/dtos - Combines schemas
- [x] modules/*/domain/entities - Invariants in constructor

### Error Handling
- [x] Canonical errors (ErrNotFound, ErrDuplicate, ErrInvalid)
- [x] HTTP status mapping
- [x] Consistent response format
- [x] Error details in response

### Testing Ready
- [x] Domain entities testable (pure TS)
- [x] Use cases testable (DI-based)
- [x] Routes testable (Elysia in-memory)
- [x] Repository pattern (easy mocking)

### Documentation
- [x] API-ARCHITECTURE.md - Detailed guide
- [x] ARCHITECTURE-QUICK-REFERENCE.md - Cheat sheet
- [x] REFACTORING-SUMMARY.md - What changed
- [x] GOLDEN-RULES.md - 3 rules with anti-patterns

### TypeScript
- [x] All modules compile successfully
- [x] No circular dependencies
- [x] Type-safe imports
- [x] Module exports configured

---

## Module Template Checklist

When adding a new module (e.g., `transaction`), verify:

- [ ] `modules/transaction/domain/entities/transaction.ts` - Entity class
- [ ] `modules/transaction/domain/repositories/transaction-repository.interface.ts` - Port
- [ ] `modules/transaction/application/dtos/transaction.dto.ts` - DTOs (uses @repo/domain/schemas)
- [ ] `modules/transaction/application/use-cases/create-transaction.use-case.ts` - Use case
- [ ] `modules/transaction/infrastructure/repositories/firestore-transaction.repository.ts` - Adapter
- [ ] `modules/transaction/delivery/http/routes.ts` - Routes
- [ ] `modules/transaction/module.container.ts` - DI wiring
- [ ] `apps/api/src/delivery/http/app.ts` - Routes registered

**Import Verification:**
- [ ] Module imports from `@repo/domain` ✓
- [ ] Module imports from `../../../../shared/errors` ✓
- [ ] Module imports from same module only (relative paths) ✓
- [ ] NO imports from other modules ✓
- [ ] NO imports from delivery/infrastructure in domain ✓

---

## Common Tasks

### Add a new endpoint
1. Create use case in `modules/<module>/application/use-cases/`
2. Add DTO to `modules/<module>/application/dtos/`
3. Add route in `modules/<module>/delivery/http/routes.ts`
4. No changes needed to @repo/domain

### Change database implementation
1. Update `modules/<module>/infrastructure/repositories/` implementation
2. No changes to domain or application layer
3. Module container automatically uses new repo

### Add shared validation
1. Add schema to `@repo/domain/src/schemas/common.ts`
2. Use it in module DTOs with `import { MySchema } from "@repo/domain/schemas"`

### Add shared error
1. Canonical errors exist in `apps/api/src/shared/errors/canonical.ts`
2. Throw in use cases: `throw new ErrNotFound("message")`
3. Caught and mapped in routes

### Create new module
1. Copy user module structure
2. Rename all `User` → `MyFeature`
3. Rename all `user` → `my-feature`
4. Update domain logic
5. Update DTOs (use @repo/domain/schemas)
6. Implement repository
7. Register routes in app.ts

---

## Forbidden Patterns 🚫

```typescript
// ❌ BANNED: Module to module import
import { Transaction } from "../transaction/domain/entities";

// ❌ BANNED: @repo/domain from app
// (Only apps depend on packages, never reverse)

// ❌ BANNED: External lib in @repo/domain
import { prisma } from "@repo/api/db";  // WRONG
import { Elysia } from "elysia";        // WRONG

// ❌ BANNED: Business logic in delivery
routes.post("/create", async (body) => {
  if (body.password.length < 8) throw new Error(...);  // WRONG
});

// ❌ BANNED: Persistence model as return type
async create(user: User): Promise<UserModel> { ... }  // WRONG
async create(user: User): Promise<User> { ... }  // RIGHT

// ❌ BANNED: Zod in domain entity
export class User {
  private static schema = z.object(...);  // WRONG
}

// ❌ BANNED: Repository creating entities with new
// (Factory pattern or use case creates entities)
return new User(...);  // In repo ❌
return User.create(...);  // In repo ✓ if static method
```

---

## Verification Commands

```bash
# Type check (fails if imports are wrong)
bun run check-types

# Build
bun run build

# Dev server (test module routes)
bun run dev:api

# Test (when tests are added)
bun run test
```

---

## Red Flags 🚨

If you see these, architecture is breaking:

1. **Import errors in type check** - Likely cross-module import
2. **"Cannot find module"** - Path or naming issue
3. **Domain importing external lib** - Layer violation
4. **Module A importing Module B** - Boundary violation
5. **Business logic in routes** - Wrong layer
6. **DB query in entity** - Contract violation
7. **Zod validation in @repo/domain** - Mixed concern
8. **DTO in @repo/domain** - Shared kernel polluted

---

## Success Criteria

Architecture is correct when:

✅ `bun run check-types` succeeds with no errors
✅ All modules compile independently
✅ No circular dependencies detected
✅ Each module can be tested in isolation
✅ New modules follow existing pattern (copy-paste ready)
✅ Routes only call use cases (no business logic)
✅ Entities enforce invariants (constructor throws)
✅ Infrastructure returns domain entities, not models
✅ @repo/domain has zero knowledge of modules
✅ Type definitions flow through entire stack

---

## Documentation Map

| Document | Purpose | Audience |
|----------|---------|----------|
| [API-ARCHITECTURE.md](apps/api/API-ARCHITECTURE.md) | Detailed architecture, module examples | Developers |
| [ARCHITECTURE-QUICK-REFERENCE.md](ARCHITECTURE-QUICK-REFERENCE.md) | Quick lookup, import rules, cheat sheet | Developers (bookmark this) |
| [REFACTORING-SUMMARY.md](REFACTORING-SUMMARY.md) | What changed, before/after | Team leads, reviewers |
| [GOLDEN-RULES.md](packages/domain/GOLDEN-RULES.md) | 3 golden rules with anti-patterns | Everyone |

---

## Next Session Setup

When you come back to this project:

1. Read [ARCHITECTURE-QUICK-REFERENCE.md](ARCHITECTURE-QUICK-REFERENCE.md) (2 min)
2. Check module structure hasn't deviated
3. Run `bun run check-types` before committing
4. Refer to user module as template for new modules
5. Use shared errors and schemas from @repo/domain

Good luck! 🚀
