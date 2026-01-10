# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     DASH FINANCE MONOREPO                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                                                    │
├─────────────────────────────────────────────────────────────┤
│  apps/web (Next.js)                                         │
│  ├── app/                                                   │
│  ├── components/                                            │
│  └── imports from: @repo/domain/types, @repo/domain/schemas│
└─────────────────────────────────────────────────────────────┘
              ↓ HTTP calls
┌─────────────────────────────────────────────────────────────┐
│  BACKEND API                                                 │
├─────────────────────────────────────────────────────────────┤
│  apps/api (Elysia)                                          │
│                                                             │
│  src/                                                       │
│  ├── index.ts (bootstrap)                                  │
│  │                                                          │
│  ├── delivery/http/app.ts (route composition)              │
│  │   └── registerUserRoutes(app)                           │
│  │   └── registerTransactionRoutes(app)                    │
│  │                                                          │
│  ├── modules/                                              │
│  │   ├── user/ (BOUNDED CONTEXT 1)                         │
│  │   │   ├── domain/ (business rules)                      │
│  │   │   │   ├── entities/user.ts                          │
│  │   │   │   └── repositories/interface.ts                 │
│  │   │   ├── application/ (use cases)                      │
│  │   │   │   ├── use-cases/create-user.use-case.ts        │
│  │   │   │   └── dtos/user.dto.ts                          │
│  │   │   ├── infrastructure/ (adapters)                    │
│  │   │   │   └── repositories/firestore-user.repository.ts│
│  │   │   ├── delivery/http/ (routes)                       │
│  │   │   │   └── routes.ts                                 │
│  │   │   └── module.container.ts (DI)                      │
│  │   │                                                     │
│  │   └── transaction/ (BOUNDED CONTEXT 2)                 │
│  │       └── [same structure as user]                      │
│  │                                                          │
│  └── shared/                                               │
│      ├── errors/canonical.ts (ErrNotFound, etc.)          │
│      └── util/response.ts (success() helper)               │
└─────────────────────────────────────────────────────────────┘
              ↓ imports from
┌─────────────────────────────────────────────────────────────┐
│  SHARED KERNEL                                               │
├─────────────────────────────────────────────────────────────┤
│  @repo/domain (Shared types & validation)                  │
│                                                             │
│  src/                                                       │
│  ├── types/                                                 │
│  │   ├── api-response.ts (ApiResponse, ApiError, ApiResult)│
│  │   └── pagination.ts (PaginatedResponse)                 │
│  │                                                          │
│  ├── schemas/                                               │
│  │   └── common.ts (Email, UUID, Pagination schemas)       │
│  │                                                          │
│  └── errors/                                                │
│      └── error-codes.ts (ErrorCodes, ErrorCode type)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Dependency Graph

```
apps/web (frontend)
    ↓
    uses ←── @repo/domain/types
    uses ←── @repo/domain/schemas

apps/api (backend)
    ↓
modules/user/delivery/http/routes.ts
    ↓
modules/user/application/use-cases/create-user.use-case.ts
    ↓
modules/user/domain/entities/user.ts
modules/user/domain/repositories/interface.ts
    ↓
modules/user/infrastructure/repositories/firestore-user.repository.ts
    ↓
@repo/domain/types/api-response.ts
@repo/domain/schemas/common.ts
@repo/domain/errors/error-codes.ts

apps/api/shared/errors/canonical.ts
    ↓
@repo/domain/errors/error-codes.ts

NEVER (BANNED):
❌ @repo/domain → modules
❌ modules/user → modules/transaction
❌ domain/* → (external lib)
```

---

## Request Flow

```
HTTP Request
    ↓
delivery/http/routes.ts (Elysia)
    │
    ├── Validate with DTO schema (@repo/domain/schemas)
    ├── Call use case from module.container
    │
    ↓
application/use-cases/create-user.use-case.ts
    │
    ├── Check business rules
    ├── Create domain entity (User.create())
    ├── Call repository method
    │
    ↓
infrastructure/repositories/firestore-user.repository.ts
    │
    ├── Query Firebase
    ├── Map Firestore doc → domain entity (User)
    ├── Return domain entity
    │
    ↓
Use case returns result to route
    │
    ├── If success: return success(data)
    ├── If error: catch and mapErrorToResponse()
    │
    ↓
HTTP Response (ApiResponse or ApiError format)
    │
    ├── { success: true, data: {...}, meta: {...} }
    ├── { success: false, error: {...}, meta: {...} }
```

---

## Module Dependency Isolation

```
Module: User
┌──────────────────────────────────────────┐
│ ISOLATED BOUNDED CONTEXT                 │
├──────────────────────────────────────────┤
│ ✓ Internal dependencies: User→user       │
│ ✓ External: @repo/domain, shared/errors │
│ ✗ Never touches: Transaction module     │
│ ✗ Never imports: Firebase SDK directly  │
│ ✗ Never returns: Persistence models     │
└──────────────────────────────────────────┘
                  ↕ (DI)
┌──────────────────────────────────────────┐
│ @repo/domain (SHARED KERNEL)             │
├──────────────────────────────────────────┤
│ ✓ Reusable types & schemas               │
│ ✓ Error codes                            │
│ ✓ Pure utilities                         │
└──────────────────────────────────────────┘

Module: Transaction
┌──────────────────────────────────────────┐
│ ISOLATED BOUNDED CONTEXT                 │
├──────────────────────────────────────────┤
│ ✓ Internal dependencies: Transaction→... │
│ ✓ External: @repo/domain, shared/errors │
│ ✗ Never touches: User module             │
│ ✗ Never imports: Firebase SDK directly   │
│ ✗ Never returns: Persistence models      │
└──────────────────────────────────────────┘
```

---

## Layer Responsibilities

### Domain Layer (@repo/domain + modules/*/domain)
```
RESPONSIBILITY: Define contracts, not implementations
INPUT: None (pure interfaces & types)
OUTPUT: Entities, Value Objects, Interfaces
KNOWS: Business rules, invariants
DOESN'T KNOW: HTTP, Databases, Frameworks

Example:
class User {
  constructor(email, name) {
    if (!email.includes("@")) throw new Error(...);  ← Invariant
  }
}
```

### Application Layer (modules/*/application)
```
RESPONSIBILITY: Orchestrate business logic
INPUT: DTOs (from validation)
OUTPUT: Domain entities, results
KNOWS: Use cases, commands, queries
DOESN'T KNOW: HTTP, Databases, Frameworks

Example:
class CreateUserUseCase {
  execute(request: CreateUserRequest) {
    const user = User.create(...);  ← Call domain
    return this.repo.create(user);  ← Call infra port
  }
}
```

### Infrastructure Layer (modules/*/infrastructure)
```
RESPONSIBILITY: Implement domain ports
INPUT: Domain entities
OUTPUT: Domain entities (mapped from persistence)
KNOWS: Databases, APIs, external services
DOESN'T KNOW: HTTP, other modules

Example:
class FirestoreUserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    await db.collection("users").doc(user.id).set({...});
    return user;  ← Always return domain entity
  }
}
```

### Delivery Layer (modules/*/delivery/http)
```
RESPONSIBILITY: Handle HTTP, call use cases, map errors
INPUT: HTTP requests (validated with DTO schema)
OUTPUT: HTTP responses (ApiResponse | ApiError)
KNOWS: Elysia, HTTP status codes
DOESN'T KNOW: Business logic (that's use case's job)

Example:
app.post("/users", async (body) => {
  try {
    const result = await useCase.execute(body);  ← Use case
    return success(result);  ← Format response
  } catch (error) {
    return mapErrorToResponse(error);  ← Map error
  }
});
```

---

## Data Flow Through Layers

```
HTTP Request
   ↓
[DELIVERY] Validate with @repo/domain/schemas DTO
   ↓
Create DTO object (type-safe)
   ↓
[APPLICATION] Call use case with DTO
   ↓
[DOMAIN] Create entity, enforce invariants
   ↓
[APPLICATION] Call repository method with entity
   ↓
[INFRASTRUCTURE] Query database
   ↓
Map database row → domain entity
   ↓
Return entity (NOT raw data)
   ↓
[APPLICATION] Process result
   ↓
[DELIVERY] Format response with success()/error()
   ↓
HTTP Response with consistent format
```

---

## Error Flow

```
Use Case throws
   ↓
throw new ErrNotFound("User not found")
   ↓
Route catches
   ↓
const status = getHttpStatus(error)  ← 404
const response = mapErrorToResponse(error)
   ↓
{
  success: false,
  error: {
    code: "NOT_FOUND",
    message: "User not found"
  },
  meta: { timestamp, requestId }
}
   ↓
HTTP 404 Response
```

---

## Key Principles Visualized

### 1. Dependency Inversion (Points Inward)
```
Delivery
    ↓
Application
    ↓
Domain ← Infrastructure
    ↓
@repo/domain
```

### 2. Separation of Concerns (Per Module)
```
User Module ────────┐
                    ├─→ @repo/domain (shared)
Transaction Module ─┤
                    ├─→ shared/errors (shared)
Payment Module ─────┤
                    └─→ shared/util (shared)
```

### 3. Single Responsibility (Per Layer)
```
Domain    → Define rules
Application → Execute rules
Infrastructure → Persist/retrieve
Delivery → Communicate
```

---

## Anti-Patterns Visualized

### ❌ Bad: Module imports module
```
User Module ──┐
              ├─→ ❌ creates circular dependency
Transaction ──┘
```

### ❌ Bad: Domain knows about Framework
```
Domain ──→ Elysia, Prisma, Firebase
         (🚫 BANNED)
```

### ❌ Bad: Delivery has business logic
```
Route:
  if (body.age < 18) throw new Error(...)  ← ❌ Belongs in domain
```

### ❌ Bad: Repository returns raw DB model
```
class UserRepository {
  async create(user: User): Promise<UserModel> {  ← ❌ Returns model
    return db.users.create(...);
  }
}

// RIGHT ✅
class UserRepository {
  async create(user: User): Promise<User> {  ← Returns entity
    await db.users.create(...);
    return user;  ← Mapped back to domain
  }
}
```

---

## File Naming Convention

```
Entities:
  user.ts                          (singular, class name)
  transaction.ts

Repositories:
  user-repository.interface.ts     (interface/port)
  firestore-user.repository.ts     (concrete)
  user.repository.ts     (for testing)

Use Cases:
  create-user.use-case.ts
  get-user.use-case.ts
  update-user.use-case.ts

DTOs:
  user.dto.ts

Routes:
  routes.ts (or user.routes.ts)

Containers:
  module.container.ts
```

---

## Testing Pyramid

```
           E2E Tests (Browser → API)
              /        \
         /                  \
      Integration Tests (API → DB Mock)
        /                    \
     /                           \
  Application Tests (Use Cases)
    /                        \
 /                              \
Unit Tests (Entities) ← Focus here (easiest to test)
```

Each layer should be independently testable ✓
