# API Architecture - Bounded Context Pattern

This document explains the refactored API structure following Clean Architecture + DDD with strict bounded context separation.

## Key Principle: Two-Tier Domain

```
┌─────────────────────────────────────────────────────┐
│  @repo/domain (SHARED KERNEL)                       │
│  ✅ Universal, zero dependencies (except zod)      │
│  • ApiResponse<T>, ApiError types                   │
│  • Common schemas (Email, UUID, Pagination)        │
│  • Error codes (BAD_REQUEST, NOT_FOUND, etc.)      │
└─────────────────────────────────────────────────────┘
                         ▲
                         │ Used by all modules
                         │
┌─────────────────────────────────────────────────────┐
│  apps/api/modules/<module>/ (BOUNDED CONTEXT)      │
│  ✅ Independent, encapsulated per feature          │
│  • Domain: Entities, Value Objects, Rules          │
│  • Application: Use Cases, DTOs (combine schemas)  │
│  • Infrastructure: Repositories, Mappers           │
│  • Delivery: Routes, Handlers                       │
└─────────────────────────────────────────────────────┘
```

## Architectural Rules (NO EXCEPTIONS)

### ✅ BOLEH (Allowed)

1. **@repo/domain imports:**
   ```typescript
   // ✅ Can only import from zod
   import { z } from "zod";
   ```

2. **Module imports:**
   ```typescript
   // ✅ Module domain can use shared kernel
   import { EmailSchema } from "@repo/domain/schemas";
   
   // ✅ Application can use domain + shared kernel
   import { User } from "./domain/entities/user";
   import { ErrNotFound } from "../../../../shared/errors";
   
   // ✅ Delivery can use application + shared errors
   import { CreateUserUseCase } from "./application/use-cases/create-user.use-case";
   ```

3. **Dependency flow:**
   ```
   delivery/http → application/use-cases → domain/entities
                                         → @repo/domain
   infrastructure → domain entities, @repo/domain
   ```

### ❌ JANGAN (Forbidden)

1. **No cross-module imports:**
   ```typescript
   // ❌ BANNED: modules/user imports from modules/transaction
   import { TransactionEntity } from "../transaction/domain/entities";
   ```

2. **No reverse dependency:**
   ```typescript
   // ❌ BANNED: @repo/domain imports from modules
   import { User } from "apps/api/modules/user/domain/entities";
   ```

3. **No external deps in domain:**
   ```typescript
   // ❌ BANNED: Elysia, Prisma, Firebase in domain
   import { Elysia } from "elysia";
   import { prisma } from "@repo/api/db";
   ```

4. **No DB/server logic in @repo/domain:**
   ```typescript
   // ❌ BANNED: Database schema in shared kernel
   // ❌ BANNED: Prisma queries in shared kernel
   // ❌ BANNED: Firebase SDK in shared kernel
   ```

## Directory Structure

```
apps/api/src/
├── index.ts                          # Bootstrap only
├── delivery/http/
│   └── app.ts                        # Global app setup, route composition
├── modules/
│   └── user/                         # Bounded context: User
│       ├── domain/                   # PURE TS, business rules
│       │   ├── entities/
│       │   │   └── user.ts           # User entity with invariants
│       │   ├── repositories/
│       │   │   └── user-repository.interface.ts  # Port (interface)
│       │   ├── services/             # Domain services (optional)
│       │   └── errors/               # Module-specific errors
│       ├── application/              # Orchestration, DTOs
│       │   ├── use-cases/
│       │   │   ├── create-user.use-case.ts
│       │   │   └── get-user.use-case.ts
│       │   └── dtos/
│       │       └── user.dto.ts       # Combines @repo/domain/schemas
│       ├── infrastructure/           # Concrete implementations
│       │   ├── repositories/
│       │   │   └── user.repository.ts  # Adapter
│       │   └── mappers/              # Model mappers
│       ├── delivery/http/            # HTTP layer (thin)
│       │   └── routes.ts             # Elysia routes
│       └── module.container.ts       # DI wiring
│
└── shared/
    ├── errors/
    │   └── canonical.ts              # ErrInvalid, ErrNotFound, ErrDuplicate
    └── util/
        └── response.ts               # success() helper
```

## Module Template: Create a New Module

### Step 1: Create domain entities

**`modules/transaction/domain/entities/transaction.ts`**
```typescript
// ✅ PURE TS, no dependencies
export class Transaction {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly userId: string,
    public readonly createdAt: Date,
  ) {
    if (amount <= 0) throw new Error("Amount must be positive");
  }

  static create(id: string, amount: number, userId: string): Transaction {
    return new Transaction(id, amount, userId, new Date());
  }
}
```

### Step 2: Define repository interface (port)

**`modules/transaction/domain/repositories/transaction-repository.interface.ts`**
```typescript
import type { Transaction } from "../entities/transaction";

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  create(transaction: Transaction): Promise<Transaction>;
}
```

### Step 3: Create DTOs combining shared schemas

**`modules/transaction/application/dtos/transaction.dto.ts`**
```typescript
import { z } from "zod";
import { PositiveIntSchema, UuidSchema } from "@repo/domain/schemas";

// Combine shared schemas for module-specific contracts
export const CreateTransactionRequestSchema = z.object({
  amount: PositiveIntSchema,
  userId: UuidSchema,
  description: z.string().optional(),
});

export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>;
```

### Step 4: Write use cases (application layer)

**`modules/transaction/application/use-cases/create-transaction.use-case.ts`**
```typescript
import type { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";
import { Transaction } from "../../domain/entities/transaction";
import { ErrInvalid } from "../../../../shared/errors";
import type { CreateTransactionRequest } from "../dtos/transaction.dto";

export class CreateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(request: CreateTransactionRequest) {
    // Business logic enforced by domain
    const transaction = Transaction.create(
      crypto.randomUUID(),
      request.amount,
      request.userId
    );

    return this.transactionRepository.create(transaction);
  }
}
```

### Step 5: Implement repository (infrastructure layer)

**`modules/transaction/infrastructure/repositories/firestore-transaction.repository.ts`**
```typescript
import type { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";
import type { Transaction } from "../../domain/entities/transaction";
import { db } from "../../../../lib/firebase"; // Firestore client

export class FirestoreTransactionRepository implements ITransactionRepository {
  async findById(id: string): Promise<Transaction | null> {
    const doc = await db.collection("transactions").doc(id).get();
    if (!doc.exists) return null;
    // Map Firestore doc to Transaction entity
    return this.toDomain(doc.data()!);
  }

  async create(transaction: Transaction): Promise<Transaction> {
    await db.collection("transactions").doc(transaction.id).set(
      this.toPersistence(transaction)
    );
    return transaction;
  }

  private toDomain(data: any): Transaction {
    return new Transaction(data.id, data.amount, data.userId, new Date(data.createdAt));
  }

  private toPersistence(transaction: Transaction) {
    return {
      id: transaction.id,
      amount: transaction.amount,
      userId: transaction.userId,
      createdAt: transaction.createdAt.toISOString(),
    };
  }
}
```

### Step 6: Setup DI container

**`modules/transaction/module.container.ts`**
```typescript
import type { ITransactionRepository } from "./domain/repositories/transaction-repository.interface";
import { CreateTransactionUseCase } from "./application/use-cases/create-transaction.use-case";
import { FirestoreTransactionRepository } from "./infrastructure/repositories/firestore-transaction.repository";

export class TransactionModuleContainer {
  private static instance: TransactionModuleContainer;
  private repository: ITransactionRepository;

  private constructor() {
    this.repository = new FirestoreTransactionRepository();
  }

  static getInstance(): TransactionModuleContainer {
    if (!TransactionModuleContainer.instance) {
      TransactionModuleContainer.instance = new TransactionModuleContainer();
    }
    return TransactionModuleContainer.instance;
  }

  getCreateTransactionUseCase(): CreateTransactionUseCase {
    return new CreateTransactionUseCase(this.repository);
  }
}
```

### Step 7: Create routes (delivery layer)

**`modules/transaction/delivery/http/routes.ts`**
```typescript
import { Elysia, t } from "elysia";
import { TransactionModuleContainer } from "../module.container";
import { CreateTransactionRequestSchema } from "../application/dtos/transaction.dto";
import { success } from "../../../../shared/util";
import { mapErrorToResponse, getHttpStatus } from "../../../../shared/errors";
import type { DomainError } from "../../../../shared/errors";

const container = TransactionModuleContainer.getInstance();

export const registerTransactionRoutes = (app: Elysia) => {
  return app.group("/transactions", (app) =>
    app.post(
      "/",
      async ({ body, set }) => {
        try {
          const useCase = container.getCreateTransactionUseCase();
          const result = await useCase.execute(body);
          return success({ id: result.id, amount: result.amount });
        } catch (error) {
          const domainError = error as DomainError;
          set.status = getHttpStatus(domainError);
          return mapErrorToResponse(error);
        }
      },
      {
        body: t.Object({
          amount: t.Number({ minimum: 0 }),
          userId: t.String(),
          description: t.Optional(t.String()),
        }),
      }
    )
  );
};
```

### Step 8: Register in global app

**`src/delivery/http/app.ts`**
```typescript
import { registerUserRoutes } from "../../modules/user/delivery/http/routes";
import { registerTransactionRoutes } from "../../modules/transaction/delivery/http/routes";

export const createApp = () => {
  const app = new Elysia();
  
  // Register all module routes
  registerUserRoutes(app);
  registerTransactionRoutes(app);
  
  // ...
  return app;
};
```

## Testing Strategy

### Domain Tests (100% target)

```typescript
// ✅ Pure unit tests, no mocks needed
describe("User Entity", () => {
  it("should throw on invalid email", () => {
    expect(() => new User("id", "invalid", "name", "hash", new Date(), new Date()))
      .toThrow("Invalid email");
  });
});
```

### Use Case Tests (80% target)

```typescript
// ✅ Mock repository via DI
describe("CreateUserUseCase", () => {
  it("should create user", async () => {
    const mockRepo: IUserRepository = {
      findByEmail: async () => null,
      create: async (user) => user,
      // ...
    };

    const useCase = new CreateUserUseCase(mockRepo);
    const result = await useCase.execute({ email: "test@example.com", name: "Test", password: "password123" });
    
    expect(result.email).toBe("test@example.com");
  });
});
```

### Route Tests (50% target, sample coverage)

```typescript
// ✅ In-memory app testing
describe("User Routes", () => {
  it("POST /users should create user", async () => {
    const app = createApp();
    const response = await app.handle(
      new Request("http://localhost/users", {
        method: "POST",
        body: JSON.stringify({ email: "test@example.com", name: "Test", password: "password123" }),
      })
    );
    
    expect(response.status).toBe(200);
  });
});
```

## Common Pitfalls & Solutions

### ❌ Pitfall 1: Putting DTO in @repo/domain

```typescript
// WRONG ❌
// packages/domain/dtos/user.dto.ts
export type CreateUserRequest = { email: string; };
```

**Fix:**
```typescript
// RIGHT ✅
// apps/api/modules/user/application/dtos/user.dto.ts
// Combine shared schemas there
```

### ❌ Pitfall 2: Cross-module imports

```typescript
// WRONG ❌
// modules/payment/application/use-cases/process.ts
import { User } from "../user/domain/entities/user";  // ❌ BANNED
```

**Fix:** Use shared types via @repo/domain
```typescript
// RIGHT ✅
// If you need user info, pass userId (primitive)
// Domain entities should only know their own boundary
```

### ❌ Pitfall 3: Business logic in repository

```typescript
// WRONG ❌
// infrastructure/repositories/user.repository.ts
export class UserRepository {
  async create(request: CreateUserRequest) {
    if (request.password.length < 8) throw new Error(...);  // ❌ Domain logic in infra
    const hash = bcrypt.hash(request.password);
    // ...
  }
}
```

**Fix:** Business logic in domain/application
```typescript
// RIGHT ✅
// application/use-cases/create-user.use-case.ts
export class CreateUserUseCase {
  async execute(request: CreateUserRequest) {
    // Validation + business rules here
    const user = User.create(...);  // Domain entity enforces rules
    return this.repository.create(user);  // Repository just persists
  }
}
```

## Checklist for New Features

- [ ] Define domain entity in `modules/<feature>/domain/entities/`
- [ ] Define repository interface (port) in `modules/<feature>/domain/repositories/`
- [ ] Create DTOs combining shared schemas in `modules/<feature>/application/dtos/`
- [ ] Write use case in `modules/<feature>/application/use-cases/`
- [ ] Implement repository in `modules/<feature>/infrastructure/repositories/`
- [ ] Setup DI in `modules/<feature>/module.container.ts`
- [ ] Create routes in `modules/<feature>/delivery/http/routes.ts`
- [ ] Register routes in `src/delivery/http/app.ts`
- [ ] NO imports from other modules (except @repo/domain and shared/)
- [ ] NO external deps in domain layer
