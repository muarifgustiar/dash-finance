# Clean Architecture Layering

## ADDED Requirements

### Requirement: ARCH-001 - Enforce Inward-Only Dependencies
**Context**: Maintain Clean Architecture principle where outer layers depend on inner layers, never the reverse. This prevents domain logic from coupling to infrastructure/framework concerns.

All layers MUST follow the dependency direction: Presentation/Delivery → Application → Domain ← Infrastructure. Domain layer SHALL NOT import from Application, Infrastructure, or Delivery layers.

#### Scenario: Valid layering with use case calling domain
**Given** a use case in `apps/api/src/modules/transaction/application/use-cases/create-transaction.use-case.ts`  
**When** the use case imports from `../domain/entities/transaction.js`  
**Then** the import SHALL be allowed (application → domain is valid)

#### Scenario: Forbidden domain importing from application
**Given** a domain entity in `apps/api/src/modules/transaction/domain/entities/transaction.ts`  
**When** attempting to import from `../../application/use-cases/create-transaction.use-case.js`  
**Then** the import MUST be rejected (domain → application violates inward rule)

### Requirement: ARCH-002 - Layer Responsibilities
**Context**: Each layer has distinct responsibilities to maintain separation of concerns and testability.

The Presentation/Delivery layer SHALL handle request validation and response formatting. The Application layer SHALL orchestrate business logic via use cases. The Domain layer SHALL contain pure business entities and rules. The Infrastructure layer SHALL implement persistence and external service adapters.

#### Scenario: Handler validates request before calling use case
**Given** a handler in `apps/api/src/modules/category/delivery/http/handlers.ts`  
**When** processing a create request  
**Then** it SHALL validate the request body using Zod schema from `@repo/schema`  
**And** it SHALL call the use case with validated data  
**And** it SHALL NOT contain business logic

#### Scenario: Domain entity enforces invariants
**Given** a domain entity in `apps/api/src/modules/budget/domain/entities/budget.ts`  
**When** creating or modifying the entity  
**Then** it SHALL enforce business invariants in the constructor or factory method  
**And** it SHALL NOT depend on external validation libraries like Zod

### Requirement: ARCH-003 - Dependency Injection for Use Cases
**Context**: Use cases must be testable and decoupled from concrete implementations.

Use cases MUST receive dependencies via constructor injection. Use cases SHALL depend on repository interfaces (ports), not concrete implementations. Concrete implementations SHALL be wired in module containers.

#### Scenario: Use case receives repository via constructor
**Given** a use case `CreateTransactionUseCase` in `apps/api/src/modules/transaction/application/use-cases/`  
**When** the use case is instantiated  
**Then** it SHALL receive `TransactionRepository` interface via constructor  
**And** it SHALL NOT instantiate concrete repository classes directly

#### Scenario: Module container wires dependencies
**Given** a module container in `apps/api/src/modules/transaction/module.container.ts`  
**When** creating use case instances  
**Then** it SHALL instantiate concrete repositories (e.g., `PrismaTransactionRepository`)  
**And** it SHALL inject them into use case constructors

### Requirement: ARCH-004 - Pure Domain Layer
**Context**: Domain layer must remain framework-agnostic for maximum portability and testability.

The Domain layer SHALL be written in pure TypeScript with ZERO external dependencies. Domain code MUST NOT import from Zod, React, Next.js, Elysia, Firebase, Prisma, or any other framework/library.

#### Scenario: Domain entity uses only TypeScript
**Given** a domain entity in `apps/web/src/features/auth/domain/entities/user.ts`  
**When** reviewing imports  
**Then** it SHALL only use TypeScript language features  
**And** it SHALL NOT import from `zod`, `react`, `next`, `@repo/schema`, or any external package

#### Scenario: Domain enforces rules via factory method
**Given** a domain entity `User` with invariants (non-empty email, valid format)  
**When** creating an instance via `User.create(props)`  
**Then** it SHALL validate invariants and throw domain errors if violated  
**And** it SHALL NOT use Zod schemas for validation

### Requirement: ARCH-005 - Infrastructure Returns Domain Objects
**Context**: Infrastructure adapters must translate persistence models to domain objects, maintaining domain purity.

Repository implementations in the Infrastructure layer MUST return domain entities or value objects. They SHALL NOT return DTOs, Prisma models, or Firebase documents directly to use cases.

#### Scenario: Repository maps Prisma model to domain entity
**Given** a repository in `apps/api/src/modules/category/infrastructure/repositories/prisma-category.repository.ts`  
**When** fetching categories from database  
**Then** it SHALL map Prisma `Category` models to domain `Category` entities  
**And** it SHALL return domain entities to the use case

#### Scenario: Forbidden returning DTO from repository
**Given** a repository implementation  
**When** a use case calls `repository.findById(id)`  
**Then** the repository MUST NOT return a Zod-validated DTO  
**And** it MUST return a domain entity

### Requirement: ARCH-006 - Elysia Plugin Pattern for Dependency Injection
**Context**: Elysia modules must be composable and explicitly declare dependencies, preventing duplicate execution and improving modularity. Plugins use `.decorate()` to expose services and `.model()` to share validation schemas.

Elysia delivery layer SHALL use plugin pattern with explicit dependency declaration. Plugins MUST use `name` property for deduplication when shared across multiple parent instances. Plugins SHALL use `.decorate()` to expose services/dependencies and `.model()` to share validation schemas. Business logic plugins (Auth, Database, feature modules) MUST use explicit dependency (`.use()` pattern), while cross-cutting concerns (CORS, compression) MAY be registered globally.

#### Scenario: Plugin exposes service via decorate
**Given** an auth plugin in `apps/api/src/modules/auth/delivery/http/plugin.ts`  
**When** defining the plugin with `const auth = new Elysia().decorate('Auth', Auth).model(Auth.models)`  
**Then** the plugin SHALL expose `Auth` service to consuming instances  
**And** it SHALL expose validation models via `Auth.models`  
**And** TypeScript SHALL infer `Auth` in context type for routes using this plugin

#### Scenario: Module explicitly declares plugin dependency
**Given** a transaction module in `apps/api/src/modules/transaction/delivery/http/routes.ts`  
**When** transaction routes require Auth service  
**Then** the module SHALL explicitly call `.use(auth)` to access `Auth` decorator  
**And** routes SHALL access Auth via context: `({ Auth }) => Auth.getProfile()`  
**And** TypeScript SHALL error if `.use(auth)` is missing but `Auth` is accessed

#### Scenario: Type safety enforces dependency declaration
**Given** a module attempting to use `Auth` in route handler  
**When** the module does NOT call `.use(auth)`  
**Then** TypeScript SHALL produce error: "Property 'Auth' does not exist on type"  
**And** the application SHALL NOT compile until dependency is declared

#### Scenario: Plugin uses name for deduplication
**Given** a logger plugin used by multiple modules  
**When** instantiating the plugin with `new Elysia({ name: 'logger' })`  
**Then** the plugin's lifecycle SHALL execute only once even when used by multiple parent instances  
**And** each instance SHALL share the same logger functionality

#### Scenario: Shared validation models via plugin
**Given** an auth plugin exposing `.model(Auth.models)` with schemas like `SignInSchema`  
**When** a module calls `.use(auth)`  
**Then** the module SHALL access validation models in route definitions  
**And** routes SHALL use models: `.post('/sign-in', ({ body }) => ..., { body: 'SignInSchema' })`

#### Scenario: Global plugins for infrastructure concerns
**Given** plugins that don't add types: CORS, compression, helmet, tracing, logging  
**When** these plugins add global lifecycle that no instance should control  
**Then** they MAY be registered globally with `{ as: 'global' }` scope  
**And** they SHALL apply to all routes without explicit `.use()`  
**And** examples: OpenAPI document, OpenTelemetry tracer, global logger

#### Scenario: Explicit dependency for type-adding plugins
**Given** plugins that add types: state management, ORM/ODM, Auth, Database  
**When** a module needs these services  
**Then** the module MUST explicitly `.use(plugin)` (NOT global registration)  
**And** the type system SHALL enforce dependency declaration  
**And** examples: Store/Session state, Prisma/Drizzle ORM, Auth service, feature modules (Chat, Notification)

#### Scenario: Business logic requires explicit dependency
**Given** an Auth plugin that adds decorators and business operations  
**When** transaction module needs Auth.getProfile()  
**Then** transaction module MUST explicitly call `.use(auth)`  
**And** TypeScript SHALL error if Auth is accessed without `.use(auth)`  
**And** this enforces explicit dependency graph for better tracking

#### Scenario: Infrastructure plugin is global by default
**Given** CORS configuration in global app setup  
**When** defining app in `apps/api/src/delivery/http/app.ts`  
**Then** CORS plugin SHALL be registered once at app level  
**And** all modules SHALL inherit CORS behavior automatically  
**And** modules SHALL NOT need to explicitly `.use(cors)`

### Requirement: ARCH-007 - Elysia Scope Management
**Context**: Hooks and schemas must have controlled propagation across plugin boundaries to prevent unintended side effects.

Elysia delivery layer SHALL use scope levels (local/scoped/global) to control hook and schema propagation. Default scope is `local` (current instance + descendants only). Use `scoped` for parent + current + descendants. Use `global` for all instances. Instance-level scope cast with `.as()` SHALL apply to all hooks/schemas in that instance.

#### Scenario: Local scope for module-specific validation
**Given** a category module with input validation hooks  
**When** registering hook without `as` parameter (defaults to local)  
**Then** the hook SHALL apply to category routes and any nested groups  
**And** it SHALL NOT apply to parent app routes

#### Scenario: Scoped for parent route protection
**Given** an auth check needed for both module routes and parent using the module  
**When** registering hook with `{ as: 'scoped' }`  
**Then** the auth check SHALL apply to parent, current module, and all nested routes

#### Scenario: Global logging across entire app
**Given** a request logging hook for observability  
**When** registering hook with `{ as: 'global' }`  
**Then** the hook SHALL apply to all parent instances, current instance, and all descendants

#### Scenario: Instance-level scope cast
**Given** a plugin with multiple local hooks (validation, transform, logging)  
**When** calling `.as('scoped')` on the plugin instance  
**Then** ALL hooks and schemas in that instance SHALL adopt scoped behavior  
**And** they SHALL propagate to parent routes

### Requirement: ARCH-008 - Elysia Guard Pattern
**Context**: Route groups often share validation and security concerns. Guards provide DRY mechanism for applying schemas/hooks to multiple routes.

Elysia delivery layer SHALL use guard pattern to apply validation schemas and hooks to route groups. Guards SHALL support both nested composition (layered validation) and grouped guards with prefix (`.group(prefix, schema, routes)`). Guards MAY specify scope with `{ as: 'scoped' | 'global' }` to control propagation.

#### Scenario: Guard for shared request validation
**Given** sign-up and sign-in routes requiring same body schema  
**When** using `.guard({ body: UserCredentialsSchema }, (app) => app.post('/sign-up', ...).post('/sign-in', ...))`  
**Then** BOTH routes SHALL validate request body against UserCredentialsSchema  
**And** validation errors SHALL return 400 with Zod error details

#### Scenario: Grouped guard with API versioning
**Given** a versioned API group `/v1` with shared response schema  
**When** using `.group('/v1', { response: t.String() }, (app) => app.get('/users', ...).get('/posts', ...))`  
**Then** routes SHALL have `/v1` prefix AND response type SHALL be enforced  
**And** non-string responses SHALL cause type errors

#### Scenario: Scoped guard for parent validation
**Given** admin routes requiring role check  
**When** defining guard with `{ as: 'scoped', beforeHandle: checkAdminRole }`  
**Then** the role check SHALL apply to current instance AND parent routes using the plugin  
**And** it SHALL NOT apply to sibling modules

#### Scenario: Nested guards for layered security
**Given** admin routes requiring both authentication and role authorization  
**When** using outer guard for auth `.guard({ beforeHandle: authenticate })` and inner guard for role `.guard({ beforeHandle: authorizeAdmin })`  
**Then** BOTH guards SHALL execute in order (auth first, then role)  
**And** failure at any layer SHALL short-circuit and return appropriate error
