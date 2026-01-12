# Code Conventions

## ADDED Requirements

### Requirement: CONV-001 - File and Directory Naming
**Context**: Consistent naming improves code navigation and reduces cognitive overhead.

File and directory names SHALL use kebab-case. TypeScript files SHALL use `.ts` extension for non-React, `.tsx` for React components. Test files SHALL use `.test.ts` or `.spec.ts` suffix. Module directories SHALL use singular nouns for entities, plural for collections.

#### Scenario: Domain entity file naming
**Given** a domain entity for User  
**When** creating the entity file  
**Then** file SHALL be named `user.ts` in `domain/entities/` directory  
**And** file path SHALL be: `apps/api/src/modules/user/domain/entities/user.ts`  
**And** file SHALL export class: `export class User { ... }`

#### Scenario: React component file naming
**Given** a presentation component for TransactionList  
**When** creating the component file  
**Then** file SHALL be named with PascalCase: `TransactionList.tsx`  
**And** file path SHALL be: `apps/web/src/features/transaction/components/TransactionList.tsx`  
**And** file SHALL export: `export function TransactionList({ ... }) { ... }`

#### Scenario: Use case file naming
**Given** a use case for creating category  
**When** creating the use case file  
**Then** file SHALL be named: `create-category.use-case.ts`  
**And** file path SHALL be: `apps/api/src/modules/category/application/use-cases/create-category.use-case.ts`  
**And** file SHALL export class: `export class CreateCategoryUseCase { ... }`

#### Scenario: Test file naming
**Given** tests for Budget entity  
**When** creating test file  
**Then** file SHALL be named: `budget.test.ts` or `budget.spec.ts`  
**And** file SHALL be colocated: `apps/api/src/modules/budget/domain/entities/__tests__/budget.test.ts`  
**And** test describes SHALL match entity name: `describe('Budget', () => { ... })`

---

### Requirement: CONV-002 - Code Identifier Naming
**Context**: TypeScript naming conventions improve code readability and follow language idioms.

Classes, interfaces, types SHALL use PascalCase. Functions, variables, parameters SHALL use camelCase. Constants SHALL use SCREAMING_SNAKE_CASE inside const objects. Private class members SHALL prefix with underscore. Boolean variables SHALL use is/has/can prefix.

#### Scenario: Class and interface naming
**Given** a domain entity and its repository interface  
**When** defining types  
**Then** entity SHALL be: `export class Transaction { ... }`  
**And** interface SHALL be: `export interface TransactionRepository { ... }`  
**And** type SHALL be: `export type TransactionId = string;`

#### Scenario: Function and variable naming
**Given** a use case method  
**When** defining method and variables  
**Then** method SHALL be camelCase: `async execute(command: CreateBudgetCommand): Promise<Budget> { ... }`  
**And** variables SHALL be camelCase: `const budgetEntity = await this.budgetRepository.save(budget);`  
**And** parameters SHALL be camelCase: `constructor(private readonly budgetRepository: BudgetRepository) { ... }`

#### Scenario: Constant object naming
**Given** category status constants  
**When** defining in `domain/constants.ts`  
**Then** object SHALL be PascalCase: `export const CategoryStatus = { ... } as const;`  
**And** keys SHALL be SCREAMING_SNAKE_CASE: `{ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" }`  
**And** type SHALL be: `export type CategoryStatusType = (typeof CategoryStatus)[keyof typeof CategoryStatus];`

#### Scenario: Boolean variable naming
**Given** variables representing state or capabilities  
**When** naming boolean variables  
**Then** variables SHALL use predicates: `const isValid = email.validate();`  
**And** flags SHALL use has/can: `const hasPermission = user.can('delete');`  
**And** component props SHALL follow same pattern: `interface Props { isLoading: boolean; hasError: boolean; }`

---

### Requirement: CONV-003 - Language Usage (English Identifiers, Bahasa UI)
**Context**: Code must be maintainable by international developers while UI serves Indonesian users.

All code identifiers (classes, functions, variables, types, file names) MUST use English. UI-facing text (labels, messages, placeholders) MUST use Bahasa Indonesia. Comments MAY use English or Bahasa Indonesia. Do NOT mix languages in identifiers.

#### Scenario: Domain entity with English identifiers
**Given** a domain entity for financial category  
**When** defining the entity  
**Then** class name SHALL be English: `export class Category { ... }`  
**And** properties SHALL be English: `public readonly name: string;`  
**And** methods SHALL be English: `markAsInactive(): void { ... }`  
**And** it SHALL NOT use: `export class Kategori { ... }`

#### Scenario: UI components with Bahasa text
**Given** a form for creating budget  
**When** rendering form fields  
**Then** component name SHALL be English: `export function BudgetForm() { ... }`  
**And** label text SHALL be Bahasa: `<Label htmlFor="amount">Jumlah Anggaran</Label>`  
**And** placeholder SHALL be Bahasa: `<Input placeholder="Masukkan jumlah..." />`  
**And** button text SHALL be Bahasa: `<Button>Simpan Anggaran</Button>`

#### Scenario: Error messages in Bahasa
**Given** validation errors displayed to users  
**When** defining error messages in domain or application layer  
**Then** error class SHALL be English: `throw new DomainError(ErrorCodes.INVALID_INPUT, message);`  
**And** message for UI SHALL be Bahasa: `"Jumlah anggaran harus lebih besar dari 0"`  
**And** internal logs MAY be English: `logger.error("Budget amount validation failed")`

#### Scenario: Schema with English keys, Bahasa messages
**Given** Zod schema in @repo/schema for form validation  
**When** defining schema  
**Then** schema name SHALL be English: `export const BudgetCreateSchema = z.object({ ... });`  
**And** field names SHALL be English: `amount: z.number().positive(), ...`  
**And** error messages SHALL be Bahasa: `amount: z.number().positive({ message: "Jumlah harus positif" })`

---

### Requirement: CONV-004 - Testing Priorities and Structure
**Context**: Testing strategy focuses on high-value tests with fast feedback and maintainability.

Testing SHALL follow this priority: 1) Domain unit tests (target 100% coverage), 2) Application/use-case unit tests (mock repos via DI), 3) Handler tests (in-memory requests), 4) Repository integration tests (in-memory DB/mocked service). Use Vitest for Web, bun:test for API. MSW for network mocking in Web.

#### Scenario: Domain unit tests have highest priority
**Given** a domain entity Budget with business rules  
**When** writing tests  
**Then** test file SHALL be: `apps/api/src/modules/budget/domain/entities/__tests__/budget.test.ts`  
**And** tests SHALL cover all invariants: positive amounts, valid date ranges, status transitions  
**And** tests SHALL be pure: no DB, no network, no framework dependencies  
**And** coverage target SHALL be 100%

#### Scenario: Use case tests with mocked repository
**Given** a use case CreateTransactionUseCase  
**When** writing tests  
**Then** test file SHALL be: `apps/api/src/modules/transaction/application/use-cases/__tests__/create-transaction.use-case.test.ts`  
**And** tests SHALL mock TransactionRepository: `const mockRepo: TransactionRepository = { save: vi.fn(), ... };`  
**And** tests SHALL verify use case orchestration and error handling  
**And** tests SHALL NOT use real database

#### Scenario: API handler tests with in-memory requests
**Given** a handler for category endpoints  
**When** writing integration tests  
**Then** test SHALL use Elysia's `app.handle()`: `const response = await app.handle(new Request('http://localhost/categories', { method: 'POST', body: JSON.stringify(payload) }));`  
**And** test SHALL verify HTTP status codes and response format  
**And** test MAY use in-memory DB or mocked repositories

#### Scenario: Web component tests with MSW
**Given** a React component fetching data from API  
**When** writing tests  
**Then** test SHALL use MSW to mock API: `server.use(http.get('/api/categories', () => HttpResponse.json({ data: mockCategories })));`  
**And** test SHALL use Testing Library: `render(<CategoryList />); await screen.findByText('Category 1');`  
**And** test SHALL focus on user-visible behavior, not implementation details

---

### Requirement: CONV-005 - Module and Package Organization
**Context**: Consistent module structure improves navigation and enforces architectural boundaries.

API modules SHALL follow structure: `modules/<module>/` with subdirectories `delivery/http/`, `domain/`, `application/`, `infrastructure/`, `module.container.ts`. Web features SHALL follow: `features/<feature>/` with subdirectories `domain/`, `application/`, `components/`, `hooks/`, `types/`. Shared packages SHALL be in `packages/` at repo root.

#### Scenario: API module structure
**Given** a new module for budget management  
**When** creating module structure  
**Then** directory SHALL be: `apps/api/src/modules/budget/`  
**And** subdirectories SHALL be: `delivery/http/`, `domain/entities/`, `domain/repositories/`, `application/use-cases/`, `infrastructure/repositories/`  
**And** container SHALL be: `apps/api/src/modules/budget/module.container.ts`  
**And** delivery routes SHALL be: `apps/api/src/modules/budget/delivery/http/routes.ts`

#### Scenario: Web feature structure
**Given** a new feature for transaction management  
**When** creating feature structure  
**Then** directory SHALL be: `apps/web/src/features/transaction/`  
**And** subdirectories SHALL be: `domain/entities/`, `domain/repositories/`, `application/use-cases/`, `components/`, `hooks/`  
**And** container component SHALL be: `apps/web/src/features/transaction/components/TransactionPageContainer.tsx`

#### Scenario: Shared package structure
**Given** shared validation schemas used by both apps  
**When** organizing schemas  
**Then** package SHALL be: `packages/schema/` with `package.json`, `tsconfig.json`, `src/`  
**And** schemas SHALL be organized by domain: `packages/schema/src/category/index.ts`, `packages/schema/src/budget/index.ts`  
**And** package.json SHALL have name: `"@repo/schema"`  
**And** apps SHALL import: `import { CategoryCreateSchema } from "@repo/schema/category";`

#### Scenario: Monorepo workspace configuration
**Given** monorepo root package.json  
**When** configuring workspaces  
**Then** workspaces SHALL be defined: `"workspaces": ["apps/*", "packages/*"]`  
**And** turbo.json SHALL define pipeline: `{ "pipeline": { "build": { "dependsOn": ["^build"] }, ... } }`  
**And** apps SHALL reference shared packages: `"dependencies": { "@repo/schema": "workspace:*" }`

---

### Requirement: CONV-006 - Import Statement Conventions
**Context**: Consistent imports improve code readability and enable automated refactoring.

Import statements SHALL be organized in groups: 1) External libraries (React, Zod, etc.), 2) Shared packages (@repo/*), 3) Internal absolute imports (@/*), 4) Relative imports (./*, ../). Each group SHALL be separated by blank line. Imports SHALL use named exports when possible. Type-only imports SHALL use `import type` syntax.

#### Scenario: API module import organization
**Given** a use case file in API  
**When** organizing imports  
**Then** imports SHALL be grouped:
```typescript
// External libraries
import { PrismaClient } from "@prisma/client";

// Shared packages
import { ErrorCodes } from "@repo/domain/errors";

// Internal absolute (shared within app)
import { ErrInvalid } from "@/shared/errors/canonical";

// Relative imports (same module)
import { Transaction } from "../../domain/entities/transaction.js";
import type { TransactionRepository } from "../../domain/repositories/transaction-repository.js";
```

#### Scenario: Web component import organization
**Given** a React component  
**When** organizing imports  
**Then** imports SHALL be grouped:
```typescript
// External libraries
import { useQuery } from "@tanstack/react-query";

// Shared packages
import { Button } from "@repo/ui/button";
import { CategoryListSchema } from "@repo/schema/category";

// Internal absolute
import { Header } from "@/components/layouts/header";

// Relative imports
import { useCategories } from "../hooks/useCategories";
import type { Category } from "../domain/entities/category";
```

#### Scenario: Type-only imports
**Given** a file importing types for annotations only  
**When** the imported symbols are used only as types  
**Then** import SHALL use type-only syntax: `import type { User } from "../domain/entities/user.js";`  
**And** it SHALL NOT use: `import { User } from "../domain/entities/user.js";` when User is only used in type positions  
**And** this enables tree-shaking and clearer intent

#### Scenario: ESM module resolution with .js extensions
**Given** TypeScript configured with "moduleResolution": "Bundler"  
**When** using relative imports  
**Then** imports SHALL include .js extension: `import { Transaction } from "../../domain/entities/transaction.js";`  
**And** .js extension is required even though source file is .ts  
**And** this follows Node.js ESM specification

---

### Requirement: CONV-007 - Comment and Documentation Standards
**Context**: Code should be self-documenting, but complex logic requires explanation.

Code SHALL be self-explanatory through clear naming. Comments SHALL explain WHY, not WHAT. Complex algorithms and business rules SHALL have explanation comments. Public APIs (use cases, repositories) SHALL have JSDoc comments. Domain entities SHALL document business constraints. Comments MAY use English or Bahasa Indonesia.

#### Scenario: Domain entity with JSDoc
**Given** a domain entity Budget with business constraints  
**When** documenting the entity  
**Then** class SHALL have JSDoc:
```typescript
/**
 * Budget represents a financial allocation for a category within a specific period.
 * Invariants:
 * - Amount must be positive
 * - Start date must be before end date
 * - Cannot modify archived budgets
 */
export class Budget { ... }
```

#### Scenario: Use case with JSDoc
**Given** a public use case CreateCategoryUseCase  
**When** documenting the use case  
**Then** execute method SHALL have JSDoc:
```typescript
/**
 * Creates a new category with validation and duplication check.
 * @param command - Category creation data with name, type, and optional parent
 * @returns Created category entity
 * @throws {ErrDuplicate} - When category with same name already exists
 * @throws {ErrInvalid} - When validation fails
 */
async execute(command: CreateCategoryCommand): Promise<Category> { ... }
```

#### Scenario: Complex logic with explanation comment
**Given** a complex business rule in domain service  
**When** implementing budget calculation algorithm  
**Then** code SHALL have explanation comment:
```typescript
// Calculate proportional allocation based on priority weights.
// Higher priority categories receive exponentially more allocation
// using formula: allocation = (weight^2 / sum(weights^2)) * totalBudget
const allocation = this.calculateProportionalAllocation(categories, totalBudget);
```

#### Scenario: No redundant comments
**Given** self-explanatory code  
**When** reviewing comments  
**Then** redundant comments SHALL be removed:
```typescript
// BAD - comment states the obvious
// Get user by ID
const user = await this.userRepository.findById(userId);

// GOOD - no comment needed, code is clear
const user = await this.userRepository.findById(userId);
```
