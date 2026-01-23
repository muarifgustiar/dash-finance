---
applyTo: '**'
---
# API (Bun + Elysia) - Structure & Rules (Delivery per Module)

This document establishes best practices for:
- API folder structure per module (bounded context)
- How to write "thin" routes + handlers
- How modules use shared domain from `@repo/domain` without violating Clean Architecture
- Delivery (HTTP) **integrated into each module** (not centralized)

---

## Struktur Direktori (Final - Recommended)

```text
apps/api/src/
  main.ts                          # bootstrap: env load, DI container, server start

  delivery/http/
    app.ts                         # Elysia app setup global (middleware, plugins), compose module routes only

  modules/<module>/
    delivery/http/                 # Delivery layer milik module ini (outer layer untuk bounded context)
      routes.ts                    # route registration untuk module ini
      handler.ts                   # thin handler: validate → usecase → map error → respond
    domain/                        # Module domain (PURE TS, no deps)
      entities/
      value-objects/
      repositories/                # interfaces only (ports)
      services/
      errors/
      __tests__/
    application/                   # Use cases (no Elysia, no Firebase SDK)
      use-cases/
      dtos/
      __tests__/
    infrastructure/                # Implementations (Firebase/DB), mapping model ↔ domain
      repositories/
      mappers/
      __tests__/                   # integration tests
    module.container.ts            # DI wiring for this module

  shared/
    errors/
      canonical.ts                 # ErrInvalid/ErrDuplicate/ErrNotFound
      http-mapper.ts               # Error → HTTP mapping helper (delivery only)
    util/
      env.ts
      logger.ts

Kenapa delivery digabung ke module?
	•	Bounded context jadi “paket lengkap”: delivery + app + domain + infra ada dalam satu boundary.
	•	Mengurangi coupling antar module, dan memperjelas ownership.
	•	Tetap Clean Architecture: delivery adalah outer layer, tapi terlokalisasi per module.

⸻

Shared Domain: @repo/domain (Required for Shared Core)

Principles
	•	@repo/domain = core domain that is truly shared across apps (api/web/mobile).
	•	modules/<module>/domain = domain specific to that bounded context.

Import Rules (STRICT)

✅ Allowed:
	•	modules/<module>/domain → @repo/domain (only if shared concept is actually used)
	•	modules/<module>/application → modules/<module>/domain, @repo/domain, shared/errors
	•	modules/<module>/delivery/http/* → modules/<module>/application, shared/errors, @repo/schema
	•	modules/<module>/infrastructure/* → modules/<module>/domain, @repo/domain, shared/* (db/util)

❌ Not Allowed:
	•	Domain layer (modules/*/domain or @repo/domain) importing:
	•	Elysia
	•	Firebase SDK
	•	Zod
	•	DB clients
	•	Any external libraries
	•	modules/<module>/application importing from delivery or infrastructure
	•	Cross-module imports: modules/a ↔ modules/b (including delivery)

Note: Zod remains only for contracts/validation and is stored in @repo/schema.

⸻

Pola Delivery per Module (Wajib)

1) modules/<module>/delivery/http/routes.ts

Tugas file:
	•	Define base path untuk module (mis. /transactions)
	•	Pasang schema validation (body/query/params) dari @repo/schema
	•	Forward ke handler function (yang hanya memanggil use case)

Rules:
	•	Tidak boleh ada business logic
	•	Tidak boleh akses DB/Firebase SDK
	•	Tidak boleh melakukan mapping model persistence

2) modules/<module>/delivery/http/handler.ts

Tugas file:
	•	Ambil use case dari module container (dependency sudah ter-wire)
	•	Convert request → command/dto (application DTO)
	•	Call use case
	•	Catch error → map ke HTTP (via shared/errors/http-mapper.ts)
	•	Return response dengan format yang sudah ditetapkan (jangan ubah format)

Handler harus “thin”:
	•	No business logic
	•	No DB calls
	•	No Firebase SDK direct usage

⸻

Global App Composition (Minimal)

apps/api/src/delivery/http/app.ts only:
	•	setup Elysia global: middleware, plugin, request id, logger, CORS, etc.
	•	register routes from modules (without knowing business details)

Rules:
	•	delivery/http/app.ts must not import domain/application directly.
	•	It may only import register<Module>Routes() functions from each module delivery.

⸻

Validation (Delivery Only)
	•	All request validation performed in modules/<module>/delivery/http/routes.ts using schema from @repo/schema.
	•	Schema = HTTP contract (DTO), not domain entity.
	•	Domain invariants still enforced in domain entity/value object (pure TS).

⸻

Error Mapping (Delivery Only)
	•	Use case may throw canonical errors:
	•	ErrInvalid → 400
	•	ErrDuplicate → 409
	•	ErrNotFound → 404
	•	Unknown → 500
	•	Status code mapping only in delivery handler.

⸻

DI (Required) - Elysia Container Plugin (`.decorate()`)

**Principles (STRICT):**
  •	Use case **MUST** receive dependencies via constructor (ports/repo interface).
  •	Infrastructure (concrete repo/service) created in outer layer (container), then injected to use case.
  •	Each module has a **container plugin** (Elysia plugin) that `.decorate()` dependencies to context.
  •	Routes/handlers get dependencies from `context` (type-safe), not via manual args.

**Pattern (Recommended):**
1. Create concrete repo/service (infrastructure)
2. Create use case (application) with constructor injection
3. Export `Elysia` container plugin that `.decorate()` repo + use case to context
4. Routes/handlers access via context destructuring

**Elysia Plugin Pattern Benefits:**
	•	✅ Type-safe dependency access via context
	•	✅ No manual parameter passing
	•	✅ Idiomatic Elysia pattern
	•	✅ Better encapsulation
	•	✅ Easier testing (mock decorators)

⸻

Module Structure Example: user (container plugin)

apps/api/src/modules/user/
  infrastructure/
    adapters/
      user.repo.ts                 # makeUserRepo(): port implementation
  application/
    use-cases/
      list-users.use-case.ts       # ListUsersUseCase (constructor DI)
  delivery/http/
    container.ts                   # Elysia container plugin (.decorate)
    routes.ts                      # register routes (using context)
    handler.ts                     # thin handler (using context)

⸻

DI Implementation Example with Elysia Container Plugin

**1) delivery/http/container.ts - Container plugin (`.decorate()`)**
```typescript
// apps/api/src/modules/user/delivery/http/container.ts
import { Elysia } from "elysia";
import type { UserRepository } from "../../domain/repositories/user.repository";
import { makeUserRepo } from "../../infrastructure/adapters/user.repo";
import { ListUsersUseCase } from "../../application/use-cases/list-users.use-case";

interface UserUseCases {
  listUsersUseCase: ListUsersUseCase;
}

export const userContainer = new Elysia({ name: "container:user" })
  .decorate<"userRepo", UserRepository>("userRepo", makeUserRepo())
  .decorate<"userUseCases", UserUseCases>(
    "userUseCases",
    (() => {
      const userRepo = makeUserRepo();
      return {
        listUsersUseCase: new ListUsersUseCase(userRepo),
      };
    })()
  );
```

Notes:
	•	The example above shows `.decorate()` style common in Elysia.
	•	To avoid double instantiation of repo, ideally create repo once and re-use for other `.decorate()` calls.
	•	Important: use case still uses constructor DI (repo injected), not `new ListUsersUseCase()` without dependency.

**2) delivery/http/routes.ts - Routes access dependencies from context**
```typescript
// apps/api/src/modules/user/delivery/http/routes.ts
import { Elysia } from "elysia";
import { userContainer } from "./container";
import { listUsersHandler } from "./handler";

export const userRoutes = new Elysia({ name: "routes:user" })
  .use(userContainer)
  .group("/users", (app) => app.get("/", listUsersHandler));
```

**3) delivery/http/handler.ts - Handler accesses dependencies from context**
```typescript
// apps/api/src/modules/user/delivery/http/handler.ts
import type { Context } from "elysia";
import type { ListUsersUseCase } from "../../application/use-cases/list-users.use-case";
import type { User } from "../../domain/entities/user";
import { mapHttpError } from "../../../shared/errors/http-mapper";

interface UserContext {
  userUseCases: {
    listUsersUseCase: ListUsersUseCase;
  };
}

interface ApiResponse<T> {
  success: true;
  data: T;
}

export async function listUsersHandler(
  { userUseCases }: Context & UserContext
): Promise<ApiResponse<User[]>> {
  try {
    const result = await userUseCases.listUsersUseCase.execute();
    return { success: true, data: result };
  } catch (error) {
    throw mapHttpError(error);
  }
}
```

**4) index.ts - Bootstrap with plugin composition**
```typescript
// apps/api/src/index.ts
import { createApp } from "./delivery/http/app";
import { prisma } from "./shared/db/prisma";

// Module containers
import { createTransactionModule } from "./modules/transaction/module.container";
import { createCategoryModule } from "./modules/category/module.container";

// Routes (each routes module already .use(container) internally)
import { userRoutes } from "./modules/user/delivery/http/routes";

async function bootstrap(): Promise<void> {
  await prisma.$connect();

  // 1. Initialize modules (DI wiring)
  const transactionModule = createTransactionModule(prisma);
  const categoryModule = createCategoryModule(prisma);

  // 2. Create app with global middleware
  const app = createApp();

  // 3. Register module routes
  app.use(userRoutes);

  // 4. Start server
  app.listen(3001);
}

bootstrap();
```

⸻

Naming Conventions
  •	delivery/http/container.ts: export `userContainer` (Elysia plugin) with name `container:<module>`
  •	delivery/http/routes.ts: export `<module>Routes` that `.use(<module>Container)`
	•	delivery/http/handler.ts: export handler functions with context destructuring
	•	Use case instance suffix: `UseCase`
	•	Concrete repo: `PrismaTransactionRepository`, `FirestoreTransactionRepository`

⸻

## Testing & Test Coverage (Required)

### Unit Test Principles (STRICT)

**Critical Rules:**
	•	✅ **No production code until failing tests exist** - Write tests first (TDD approach). Tests must fail before implementation.
	•	✅ **Each spec requirement maps to ≥1 test** - Every requirement in spec must have at least 1 test case.
	•	✅ **Never edit unrelated packages** - Only edit files within the module boundary being worked on.
	•	✅ **Update spec when ambiguity is found** - If requirement is unclear during implementation, update spec.md first before continuing coding.
	•	✅ **Code coverage minimum 80%** - Domain and Application layers must have ≥80% coverage.

### Test Organization per Module

```text
modules/<module>/
  domain/__tests__/
    entities/*.test.ts          # Entity logic, invariants, validation
    value-objects/*.test.ts     # Value object immutability, equality
    services/*.test.ts          # Domain service business logic
  application/__tests__/
    use-cases/*.test.ts         # Use case orchestration (mock repositories)
  infrastructure/__tests__/
    repositories/*.test.ts      # Integration tests (in-memory DB/mocked services)
    mappers/*.test.ts           # Data transformation accuracy
  delivery/http/__tests__/
    handler.test.ts             # HTTP handler response mapping (in-memory Elysia)
```

### Test Coverage Requirements

**Domain Layer (Target: 90-100%)**
	•	Entity constructors & factory methods
	•	Business rule validation
	•	Value object equality & immutability
	•	Domain service logic
	•	Edge cases & error conditions

**Application Layer (Target: 85-95%)**
	•	Use case happy path
	•	Use case error scenarios
	•	DTO validation & transformation
	•	Repository interaction (mocked)
	•	Transaction boundaries

**Infrastructure Layer (Target: 70-85%)**
	•	Repository CRUD operations (integration tests)
	•	Data mapping accuracy (model ↔ domain)
	•	Error handling (DB constraints, connection issues)
	•	Query correctness

**Delivery Layer (Target: 75-85%)**
	•	Handler request/response mapping
	•	Error → HTTP status code mapping
	•	Schema validation at boundary
	•	In-memory request tests via `app.handle(new Request(...))`

### Testing Tools & Commands

**Framework**: `bun:test` (built-in Bun test runner)

**Commands**:
	•	Run all tests: `bun test`
	•	Run module tests: `bun test modules/transaction`
	•	Watch mode: `bun test --watch`
	•	Coverage report: `bun test --coverage`

**Mocking**:
	•	Mock repositories in use case tests (interface-based DI)
	•	Use in-memory database for infrastructure tests
	•	Mock external services (Firebase, HTTP clients)
	•	No real network/database calls in unit tests

### Test-First Workflow (TDD)

1. **Red**: Write failing test for spec requirement
2. **Green**: Write minimal code to make test pass
3. **Refactor**: Improve code while keeping tests green
4. **Repeat**: Next requirement

**Example**:
```typescript
// 1. RED: Test fails (use case doesn't exist yet)
import { describe, it, expect, beforeEach } from "bun:test";
import type { TransactionRepository } from "../domain/repositories/transaction.repository";
import type { Transaction } from "../domain/entities/transaction";
import { CreateTransactionUseCase } from "./create-transaction.use-case";

interface MockRepository extends TransactionRepository {
  save: jest.Mock<Promise<Transaction>, [Transaction]>;
}

function createMockRepository(): MockRepository {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
  } as MockRepository;
}

describe('CreateTransactionUseCase', () => {
  it('should create transaction with valid data', async () => {
    const mockRepo = createMockRepository();
    const useCase = new CreateTransactionUseCase(mockRepo);
    
    const command = { amount: 1000, categoryId: "cat-1", userId: "user-1" };
    const result = await useCase.execute(command);
    
    expect(result.amount).toBe(1000);
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
  });
});

// 2. GREEN: Implement minimal code to pass
// 3. REFACTOR: Clean up implementation
```

### Coverage Enforcement

**Pre-commit Hook** (recommended):
	•	Run tests before commit
	•	Block commit if coverage < 80%
	•	Format: `bun test --coverage --coverage-threshold=80`

**CI/CD Pipeline** (required):
	•	Run full test suite
	•	Generate coverage report
	•	Fail build if coverage drops below threshold
	•	Report coverage to team dashboard

⸻

Verify Compliance
	•	Delivery (routes + handlers) located within each module ✅
	•	Dependency remains inward: delivery → application → domain ← infrastructure ✅
	•	Domain remains pure TS, and shared core domain via @repo/domain without external dependencies ✅
	•	Validation still uses @repo/schema (Zod) only in delivery ✅

