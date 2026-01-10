# Architecture Quick Reference

## Two-Tier Domain Model

### @repo/domain (Shared Kernel)
**What it is:** Universal building blocks used by all modules
**What it contains:**
- Type definitions (`ApiResponse<T>`, `ApiError`, `ApiResult<T>`)
- Reusable validation schemas (`EmailSchema`, `UuidSchema`, `PaginationQuerySchema`)
- Error codes (`ErrorCodes`, `ErrorCode` type)

**Dependency:**
```json
{
  "dependencies": {
    "zod": "latest"
  }
}
```

**Exports:**
```typescript
import type { ApiResponse, ApiError } from "@repo/domain/types";
import { EmailSchema, PaginationQuerySchema } from "@repo/domain/schemas";
import { ErrorCodes } from "@repo/domain/errors";
```

---

### modules/<module>/ (Bounded Context)
**What it is:** Independent, self-contained feature with complete architecture

**Layers:**
```
domain/
  ├── entities/           # Business logic, invariants
  ├── repositories/       # Ports (interfaces only)
  ├── services/          # Domain services (optional)
  └── errors/            # Module-specific errors

application/
  ├── use-cases/         # Orchestration, commands
  └── dtos/              # Schemas + types (uses @repo/domain)

infrastructure/
  ├── repositories/      # Adapters (implements port)
  └── mappers/          # Entity ↔ Persistence mapping

delivery/http/
  ├── routes.ts         # Elysia route registration
  └── handlers/         # Optional: separate handlers

module.container.ts     # DI wiring
```

---

## Dependency Flow

```
delivery/http/routes.ts
    ↓
application/use-cases/*
    ↓
domain/entities/*
domain/repositories/interface
@repo/domain (types, schemas, errors)

infrastructure/repositories/*
    ↓
domain/entities/*
@repo/domain
```

**Rule:** Dependencies point INWARD. Never outward.

---

## Strict Import Rules

### ✅ Allowed

```typescript
// 1. Module uses shared kernel
import { EmailSchema } from "@repo/domain/schemas";
import { ErrorCodes } from "@repo/domain/errors";

// 2. Delivery calls application
import { CreateUserUseCase } from "../application/use-cases";

// 3. Application calls domain
import { User } from "../domain/entities/user";

// 4. Infrastructure implements domain ports
import type { IUserRepository } from "../domain/repositories";

// 5. Infrastructure returns domain entities
export class FirestoreUserRepository implements IUserRepository {
  async create(user: User): Promise<User> { ... }
}

// 6. Shared errors across modules
import { ErrNotFound, ErrDuplicate } from "../../../../shared/errors";
```

### ❌ Banned

```typescript
// ❌ Module to module
import { Transaction } from "../transaction/domain";

// ❌ @repo/domain to module
import { CreateUserUseCase } from "apps/api/modules/user";

// ❌ External deps in domain
import { prisma } from "@/db";  // ❌
import { Elysia } from "elysia";  // ❌
import { z } from "zod";  // ❌

// ❌ Reverse dependency
// Repository returning persistence model instead of domain entity
async create(data): Promise<UserModel> { ... }  // ❌
async create(data): Promise<User> { ... }  // ✅

// ❌ Business logic in delivery/infrastructure
class UserRepository {
  async create(request) {
    if (request.password.length < 8) throw new Error(...);  // ❌
  }
}
```

---

## Creating a New Module

### 1. Copy template
```bash
cp -r modules/user modules/my-feature
```

### 2. Update names
- Rename `User` → `MyFeature`
- Rename `user.ts` → `my-feature.ts`
- Rename `user.dto.ts` → `my-feature.dto.ts`
- Update container class name

### 3. Define domain rules
```typescript
// domain/entities/my-feature.ts
export class MyFeature {
  constructor(...) {
    // Enforce invariants
    if (invalid) throw new Error(...);
  }
}
```

### 4. Create DTOs using shared schemas
```typescript
// application/dtos/my-feature.dto.ts
import { EmailSchema, PositiveIntSchema } from "@repo/domain/schemas";

export const CreateMyFeatureSchema = z.object({
  email: EmailSchema,
  amount: PositiveIntSchema,
});
```

### 5. Write use cases
```typescript
// application/use-cases/create-my-feature.use-case.ts
export class CreateMyFeatureUseCase {
  constructor(private repo: IMyFeatureRepository) {}
  
  async execute(request: CreateMyFeatureRequest) {
    const entity = MyFeature.create(...);
    return this.repo.create(entity);
  }
}
```

### 6. Implement repository
```typescript
// infrastructure/repositories/firestore-my-feature.repository.ts
export class FirestoreMyFeatureRepository implements IMyFeatureRepository {
  // Implementation details
}
```

### 7. Register routes
```typescript
// delivery/http/routes.ts
export const registerMyFeatureRoutes = (app: Elysia) => {
  return app.group("/my-feature", (app) => { ... });
};

// src/delivery/http/app.ts
registerMyFeatureRoutes(app);
```

---

## Validation Layers

### @repo/domain/schemas (Building blocks)
```typescript
// Reusable across all modules
export const EmailSchema = z.string().email().toLowerCase();
export const PositiveIntSchema = z.number().int().positive();
```

### modules/<module>/application/dtos (Feature contracts)
```typescript
// Combines building blocks for endpoint contracts
export const CreateUserRequestSchema = z.object({
  email: EmailSchema,  // ← Reuses
  name: NonEmptyStringSchema,  // ← Reuses
  password: z.string().min(8),  // ← Module-specific
});
```

### modules/<module>/domain/entities (Invariants)
```typescript
// Pure TS, enforced in constructor
export class User {
  constructor(email: string, name: string) {
    if (!email.includes("@")) throw new Error(...);
    if (name.trim().length === 0) throw new Error(...);
  }
}
```

**Hierarchy:** Schema validation → DTO type safety → Domain invariants

---

## Error Handling

### Canonical errors (@repo/api/shared/errors)
```typescript
// Domain throws these
throw new ErrNotFound("User not found");
throw new ErrDuplicate("Email already exists");
throw new ErrInvalid("Invalid password");
throw new ErrUnauthorized("Access denied");
```

### HTTP mapping (delivery layer)
```typescript
// routes.ts
try {
  const result = await useCase.execute(body);
  return success(result);
} catch (error) {
  set.status = getHttpStatus(error);  // 404, 409, 400, 401, etc.
  return mapErrorToResponse(error);   // ApiError format
}
```

### Response format (universal)
```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "...", "requestId": "..." }
}

// Error
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": null
  },
  "meta": { "timestamp": "...", "requestId": "..." }
}
```

---

## Testing Cheat Sheet

### Domain tests (entities)
```typescript
describe("User", () => {
  it("should reject invalid email", () => {
    expect(() => new User("id", "bad", "name", "hash", d1, d2))
      .toThrow();
  });
});
```

### Application tests (use cases)
```typescript
describe("CreateUserUseCase", () => {
  it("should create user", async () => {
    const mockRepo = { 
      findByEmail: async () => null,
      create: async (u) => u 
    };
    const uc = new CreateUserUseCase(mockRepo);
    const result = await uc.execute(request);
    expect(result.id).toBeDefined();
  });
});
```

### Delivery tests (routes)
```typescript
describe("User Routes", () => {
  it("should create user", async () => {
    const app = createApp();
    const response = await app.handle(
      new Request("http://localhost/users", { 
        method: "POST", 
        body: JSON.stringify(request) 
      })
    );
    expect(response.status).toBe(200);
  });
});
```

---

## Red Flags 🚨

1. ❌ Import from one module to another (except @repo/domain)
2. ❌ Any external lib in domain layer
3. ❌ Database logic outside infrastructure/
4. ❌ Use case returning persistence models
5. ❌ Zod in @repo/domain for entity validation (only for DTO)
6. ❌ Routes with business logic
7. ❌ Repository returning raw DB objects

---

## File Tree View

```
dash_finance/
├── packages/domain/
│   ├── src/
│   │   ├── types/              # ApiResponse, ApiError, ApiResult
│   │   ├── schemas/            # EmailSchema, UuidSchema, Pagination
│   │   └── errors/             # ErrorCodes, ErrorCode type
│   └── package.json            # Only zod dependency
│
└── apps/api/
    └── src/
        ├── index.ts            # Bootstrap
        ├── delivery/http/
        │   └── app.ts          # Route composition
        ├── modules/
        │   ├── user/           # 👈 Module template
        │   │   ├── domain/
        │   │   │   ├── entities/user.ts
        │   │   │   └── repositories/user-repository.interface.ts
        │   │   ├── application/
        │   │   │   ├── use-cases/create-user.use-case.ts
        │   │   │   └── dtos/user.dto.ts
        │   │   ├── infrastructure/
        │   │   │   └── repositories/user.repository.ts
        │   │   ├── delivery/http/
        │   │   │   └── routes.ts
        │   │   └── module.container.ts
        │   └── transaction/    # Repeat pattern
        └── shared/
            ├── errors/         # ErrNotFound, ErrDuplicate, etc.
            └── util/          # success() helper
```
