# Dependency Management

## ADDED Requirements

### Requirement: DEP-001 - Pure Domain Layer (Zero External Dependencies)
**Context**: Domain layer must remain framework-agnostic and portable across any infrastructure or presentation framework.

Domain layer (entities, value objects, domain services) MUST be written in pure TypeScript with ZERO external dependencies. Domain code SHALL NOT import from Zod, React, Next.js, Elysia, Firebase SDK, Prisma, TanStack libraries, or any other framework/library except @repo/domain for universal constants.

#### Scenario: Domain entity uses only TypeScript primitives
**Given** a domain entity in `apps/web/src/features/transaction/domain/entities/transaction.ts`  
**When** reviewing all import statements  
**Then** it SHALL only use TypeScript language features (types, interfaces, classes)  
**And** it SHALL NOT have any import from node_modules except @repo/domain  
**And** invariants SHALL be enforced via constructor or factory method

#### Scenario: Domain value object enforces rules without Zod
**Given** a value object `Email` in `apps/api/src/modules/user/domain/value-objects/email.ts`  
**When** validating email format  
**Then** it SHALL use regex or native string methods for validation  
**And** it SHALL throw domain error if validation fails  
**And** it SHALL NOT import Zod schema for validation

#### Scenario: Domain service performs pure business logic
**Given** a domain service in `apps/api/src/modules/budget/domain/services/budget-calculator.service.ts`  
**When** calculating budget allocations  
**Then** it SHALL only depend on domain entities and value objects  
**And** it SHALL NOT import from Prisma, Firebase, or external APIs  
**And** it SHALL return domain types only

#### Scenario: Linting enforces domain purity
**Given** ESLint rules or import-lint configuration  
**When** domain files are checked  
**Then** linter SHALL error on any external library imports in domain layer  
**And** only @repo/domain imports SHALL be allowed

---

### Requirement: DEP-002 - Zod for Boundary Validation Only
**Context**: Zod schemas are contracts for boundary validation (HTTP requests, form inputs), not domain invariants.

Zod schemas from @repo/schema SHALL be used ONLY at architectural boundaries: delivery layer (API handlers), presentation layer (form validation). Zod SHALL NOT be used in domain or application layers. Domain invariants SHALL be enforced via pure TypeScript in constructors/factory methods.

#### Scenario: API handler validates request with Zod
**Given** a handler in `apps/api/src/modules/category/delivery/http/handlers.ts`  
**When** processing POST request to create category  
**Then** it SHALL validate request body with `CategoryCreateSchema` from `@repo/schema/category`  
**And** it SHALL convert validated DTO to domain command  
**And** it SHALL pass command to use case

#### Scenario: Web form validates input with Zod
**Given** a form in `apps/web/src/features/auth/components/LoginForm.tsx`  
**When** user submits login credentials  
**Then** form SHALL validate with `LoginSchema` from `@repo/schema/user` using TanStack Form's zodValidator  
**And** validation errors SHALL be displayed inline  
**And** validated data SHALL be passed to use case

#### Scenario: Domain entity does NOT use Zod
**Given** a domain entity `Budget` in `apps/api/src/modules/budget/domain/entities/budget.ts`  
**When** creating budget instance  
**Then** invariants (positive amount, valid dates) SHALL be checked in constructor  
**And** it SHALL throw domain-specific errors if violated  
**And** it SHALL NOT import or use Zod schemas

#### Scenario: Application layer uses domain validation
**Given** a use case in `apps/api/src/modules/transaction/application/use-cases/create-transaction.use-case.ts`  
**When** calling domain entity factory `Transaction.create(props)`  
**Then** factory SHALL validate business rules and throw domain errors  
**And** use case SHALL catch domain errors and re-throw as application errors  
**And** use case SHALL NOT perform Zod validation

---

### Requirement: DEP-003 - Universal Constants in @repo/domain
**Context**: @repo/domain is shared kernel for truly universal, domain-agnostic constants used across all apps.

@repo/domain SHALL contain ONLY universal constants: error codes (BAD_REQUEST, NOT_FOUND), HTTP status mappings, API response type definitions, generic type utilities. Business-specific constants (CategoryStatus, TransactionType, BudgetPeriod) MUST NOT be in @repo/domain. All constants SHALL use `as const` for immutability and type inference. Constant objects SHALL use PascalCase names with SCREAMING_SNAKE_CASE keys.

#### Scenario: Error codes in shared domain
**Given** error handling across API and Web apps  
**When** defining error codes  
**Then** universal codes SHALL be in `packages/domain/src/errors/error-codes.ts`  
**And** codes SHALL be exported as const with type: `export const ErrorCodes = { BAD_REQUEST: "BAD_REQUEST", NOT_FOUND: "NOT_FOUND", UNAUTHORIZED: "UNAUTHORIZED", FORBIDDEN: "FORBIDDEN", VALIDATION_ERROR: "VALIDATION_ERROR", CONFLICT: "CONFLICT", INTERNAL_ERROR: "INTERNAL_ERROR" } as const; export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];`  
**And** all apps MAY import ErrorCodes without violating boundaries

#### Scenario: API response types in shared domain
**Given** consistent API response format across all endpoints  
**When** defining response wrapper types  
**Then** generic types SHALL be in `packages/domain/src/types/api-response.ts`  
**And** types SHALL be: `ApiResponse<T> = { success: boolean; data: T; meta?: { timestamp: string; requestId?: string; } }`  
**And** both API and Web apps SHALL use these types

#### Scenario: HTTP status code mapping constants
**Given** consistent HTTP status handling across API endpoints  
**When** defining status code constants  
**Then** constants SHALL be in `packages/domain/src/types/http-status.ts`  
**And** constants SHALL be: `export const HttpStatus = { OK: 200, CREATED: 201, BAD_REQUEST: 400, UNAUTHORIZED: 401, FORBIDDEN: 403, NOT_FOUND: 404, CONFLICT: 409, INTERNAL_SERVER_ERROR: 500 } as const;`  
**And** delivery handlers MAY import these for consistent status codes

#### Scenario: Generic type utilities in shared domain
**Given** reusable type utilities needed across apps  
**When** defining utility types  
**Then** utilities SHALL be in `packages/domain/src/types/utilities.ts`  
**And** utilities MAY include: `Nullable<T>`, `Optional<T>`, `Prettify<T>`, `DeepPartial<T>`  
**And** these SHALL be truly generic with no business logic

#### Scenario: Business constants in module domain (API)
**Given** category status constants (ACTIVE, INACTIVE) specific to category module  
**When** organizing constants  
**Then** constants SHALL be in `apps/api/src/modules/category/domain/constants.ts`  
**And** constants SHALL be exported: `export const CategoryStatus = { ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" } as const; export type CategoryStatusType = (typeof CategoryStatus)[keyof typeof CategoryStatus];`  
**And** they SHALL NOT be in `packages/domain/`

#### Scenario: Business constants in feature domain (Web)
**Given** transaction type constants (INCOME, EXPENSE) specific to transaction feature  
**When** organizing constants  
**Then** constants SHALL be in `apps/web/src/features/transaction/domain/constants.ts`  
**And** only transaction feature MAY import these constants  
**And** they SHALL NOT be in `packages/domain/`

#### Scenario: Constant naming and type safety
**Given** any constants defined in @repo/domain or module domains  
**When** defining constants  
**Then** constant object SHALL use PascalCase: `ErrorCodes`, `HttpStatus`  
**And** keys SHALL use SCREAMING_SNAKE_CASE: `BAD_REQUEST`, `NOT_FOUND`  
**And** constants SHALL use `as const` assertion for immutability  
**And** type SHALL be extracted: `export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];`

---

### Requirement: DEP-004 - Constructor Injection for Use Cases
**Context**: Use cases must be testable with mocked dependencies and decoupled from concrete implementations.

Application layer use cases MUST receive all dependencies via constructor parameters. Dependencies SHALL be repository interfaces (ports), domain services, or other use cases. Use cases SHALL NOT instantiate infrastructure implementations directly. Module containers SHALL wire concrete dependencies.

#### Scenario: Use case constructor with repository dependency
**Given** a use case `CreateCategoryUseCase` in `apps/api/src/modules/category/application/use-cases/`  
**When** defining the use case class  
**Then** constructor SHALL accept `CategoryRepository` interface: `constructor(private readonly categoryRepository: CategoryRepository)`  
**And** use case SHALL call repository methods via interface  
**And** use case SHALL NOT import concrete repository class

#### Scenario: Module container wires dependencies
**Given** a container in `apps/api/src/modules/transaction/module.container.ts`  
**When** setting up dependency injection  
**Then** container SHALL instantiate `PrismaTransactionRepository` (concrete)  
**And** container SHALL inject it into `CreateTransactionUseCase` constructor  
**And** container SHALL export use case instances for delivery layer

#### Scenario: Use case is testable with mocks
**Given** a unit test for `GetBudgetByIdUseCase`  
**When** writing test cases  
**Then** test SHALL create mock repository implementing `BudgetRepository` interface  
**And** test SHALL inject mock via constructor: `new GetBudgetByIdUseCase(mockRepo)`  
**And** test SHALL verify use case behavior without real database

#### Scenario: Multiple dependencies injected
**Given** a use case requiring repository and domain service  
**When** defining constructor  
**Then** constructor SHALL accept all dependencies: `constructor(private repo: TransactionRepository, private calculator: BudgetCalculator)`  
**And** module container SHALL provide all concrete implementations  
**And** dependencies SHALL be readonly properties

---

### Requirement: DEP-005 - Shared Packages Structure
**Context**: Shared packages provide cross-cutting concerns without violating bounded contexts.

Monorepo SHALL maintain these shared packages: @repo/schema (Zod schemas for boundary validation), @repo/domain (universal constants/types), @repo/ui (generic UI components), @repo/typescript-config, @repo/eslint-config. Each package SHALL have clear scope and SHALL NOT contain business logic.

#### Scenario: @repo/schema for DTO validation
**Given** category create/update operations across API and Web  
**When** defining validation schemas  
**Then** schemas SHALL be in `packages/schema/src/category/index.ts`  
**And** schemas SHALL export Zod schema and inferred type: `export const CategoryCreateSchema = z.object({...}); export type CategoryCreateDTO = z.infer<typeof CategoryCreateSchema>;`  
**And** both apps SHALL import from `@repo/schema/category`

#### Scenario: @repo/ui for generic components
**Given** reusable UI components (Button, Card, Input) used across Web features  
**When** defining components  
**Then** components SHALL be in `packages/ui/src/`  
**And** components SHALL NOT import from any app's features or domain  
**And** components SHALL be pure presentation with variant props

#### Scenario: @repo/domain contains no business logic
**Given** a code review of `packages/domain/src/`  
**When** reviewing all files  
**Then** package SHALL only contain: error codes, API response types, generic utilities  
**And** it SHALL NOT contain: entities, use cases, repositories, business rules  
**And** it SHALL NOT contain business-specific constants

#### Scenario: Workspace dependencies configured
**Given** package.json in apps/web and apps/api  
**When** declaring dependencies  
**Then** packages SHALL list `@repo/schema`, `@repo/domain`, `@repo/ui` in dependencies  
**And** monorepo SHALL resolve via workspace: protocol  
**And** TypeScript SHALL recognize shared package paths

---

### Requirement: DEP-006 - Infrastructure Returns Domain Objects
**Context**: Infrastructure implementations must translate external data models to domain objects, preventing leakage.

Repository implementations in Infrastructure layer MUST return domain entities or value objects. Repositories SHALL map database models (Prisma, Firebase) to domain objects before returning. Repositories SHALL NOT return DTOs, Zod-validated objects, or raw database models to application layer.

#### Scenario: Prisma repository maps to domain entity
**Given** a repository in `apps/api/src/modules/user/infrastructure/repositories/prisma-user.repository.ts`  
**When** implementing `findById(id: string): Promise<User | null>`  
**Then** repository SHALL query Prisma: `const userModel = await prisma.user.findUnique({ where: { id } })`  
**And** repository SHALL map to domain: `return User.create({ id: userModel.id, email: userModel.email, ... })`  
**And** repository SHALL NOT return Prisma User model directly

#### Scenario: HTTP client maps API response to domain
**Given** an infrastructure service in `apps/web/src/infrastructure/repositories/http-category.repository.ts`  
**When** fetching categories from API  
**Then** service SHALL receive HTTP response (validated by Zod at boundary)  
**And** service SHALL map DTO to domain entities: `categories.map(dto => Category.create(dto))`  
**And** service SHALL return `Category[]` to use case

#### Scenario: Forbidden returning DTO from repository
**Given** a use case calling `categoryRepository.findAll()`  
**When** repository implementation executes  
**Then** repository MUST NOT return `CategoryDTO[]` from Zod validation  
**And** repository MUST return domain `Category[]` entities  
**And** type system SHALL enforce return type is domain entity

#### Scenario: Mapper pattern for complex transformations
**Given** complex mapping between Prisma model and domain entity  
**When** implementing repository  
**Then** repository MAY use dedicated mapper: `TransactionMapper.toDomain(prismaTransaction)`  
**And** mapper SHALL be in `infrastructure/mappers/` directory  
**And** mapper SHALL handle all field transformations and edge cases
