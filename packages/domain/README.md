# @repo/domain - Shared Kernel

Universal types, schemas, and error codes for Dash Finance. This is a **minimal, stable foundation** used by all modules.

## 3 Golden Rules

1. **Apps are leaves**: Never import from `apps/*` to `packages/*`. Dependencies flow one way: apps depend on packages.

2. **Contract ≠ DB**: This package contains **contracts only** (types, schemas, error codes). Never put:
   - Prisma schemas
   - Database queries
   - ORM models
   - Module-specific DTOs (those belong in `apps/api/modules/<module>/application/dtos/`)

3. **No cross-feature imports**: Each module is independent. Share only through @repo/domain.

## Structure

```
src/
├── types/       # Generic API types (ApiResponse, ApiError, ApiResult)
├── schemas/     # Reusable validation schemas (Email, UUID, Pagination)
└── errors/      # Error codes (BAD_REQUEST, NOT_FOUND, etc.)
```

## Usage in Apps

```typescript
// ✅ In apps/api/modules/user/application/dtos/user.dto.ts
import { EmailSchema, NonEmptyStringSchema } from "@repo/domain/schemas";
import { ErrorCodes } from "@repo/domain/errors";
import type { ApiResponse } from "@repo/domain/types";

// Combine shared schemas to create module-specific DTOs
export const CreateUserRequestSchema = z.object({
  email: EmailSchema,  // ← Reuse from shared kernel
  name: NonEmptyStringSchema,
  password: z.string().min(8),
});
```

## What Belongs Here vs. Modules

| Belongs in @repo/domain | Belongs in modules/<module>/application |
|---|---|
| `ApiResponse<T>` type | `CreateUserRequest` DTO |
| `EmailSchema` | `UserResponseSchema` |
| `ErrorCodes` | `LoginRequest` DTO |
| `PaginationQuery` type | Module-specific validation |
| Error mapping utilities | Use cases & business logic |

## Key Principle

**@repo/domain is like a utility library.** It provides building blocks (schemas, types, error codes) that modules combine into their specific contracts. Think of it as the "standard library" every module imports, never the other way around.

