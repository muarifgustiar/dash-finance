# Boundary Constraints

## ADDED Requirements

### Requirement: BOUND-001 - No Cross-Feature Imports (Web)
**Context**: Features represent bounded contexts that must remain independent for modularity and testability.

Web app features SHALL NOT import from other features. Feature components, hooks, and application layer MAY ONLY import from their own feature's domain/application/components/hooks, shared utilities, generic UI components, and shared packages (@repo/schema, @repo/ui, @repo/domain).

#### Scenario: Valid feature composition
**Given** a transaction feature in `apps/web/src/features/transaction/components/TransactionCard.tsx`  
**When** importing dependencies  
**Then** it SHALL import from `../domain/entities/transaction.js` (same feature)  
**And** it SHALL import from `@/components/ui/card` (generic UI)  
**And** it SHALL import from `@repo/schema/transaction` (shared package)  
**And** it SHALL NOT import from `../../budget/domain/entities/budget.js`

#### Scenario: Cross-feature violation detection
**Given** a budget feature component  
**When** attempting to import `@/features/category/domain/entities/category.ts`  
**Then** the import MUST be rejected (cross-feature violation)  
**And** linting/architecture tests SHALL flag this as an error

#### Scenario: Shared kernel usage for cross-cutting concerns
**Given** multiple features need shared utilities (date formatting, validation helpers)  
**When** organizing shared code  
**Then** utilities SHALL be placed in `apps/web/src/shared/` or `packages/`  
**And** features MAY import from shared without violating boundaries

#### Scenario: Generic UI components are boundary-safe
**Given** a transaction feature needs a reusable Button component  
**When** the Button is defined in `apps/web/src/components/ui/button.tsx`  
**Then** transaction feature MAY import it without violating boundaries  
**And** Button SHALL NOT import from any feature's domain/application

---

### Requirement: BOUND-002 - No Cross-Module Imports (API)
**Context**: Modules represent bounded contexts on the backend. Cross-module imports create tight coupling and violate domain boundaries.

API modules SHALL NOT import from other modules' domain, application, or infrastructure layers. Modules MAY ONLY import from their own layers, shared errors, shared utilities, and shared packages (@repo/schema, @repo/domain).

#### Scenario: Valid module dependencies
**Given** a transaction module use case in `apps/api/src/modules/transaction/application/use-cases/create-transaction.use-case.ts`  
**When** importing dependencies  
**Then** it SHALL import from `../../domain/entities/transaction.js` (same module)  
**And** it SHALL import from `../../../shared/errors/canonical.js` (shared errors)  
**And** it SHALL import from `@repo/domain/types` (shared package)  
**And** it SHALL NOT import from `../../category/domain/entities/category.js`

#### Scenario: Cross-module import in delivery layer is forbidden
**Given** a budget module handler in `apps/api/src/modules/budget/delivery/http/handlers.ts`  
**When** attempting to import `../../../transaction/application/use-cases/get-transactions.use-case.js`  
**Then** the import MUST be rejected (cross-module violation)  
**And** module boundary checks SHALL flag this as an error

#### Scenario: Shared kernel for cross-module concepts
**Given** multiple modules need canonical error types  
**When** organizing error handling  
**Then** errors SHALL be placed in `apps/api/src/shared/errors/`  
**And** all modules MAY import shared errors without violating boundaries

#### Scenario: Module communication via events or shared services
**Given** transaction module needs to notify budget module of new transaction  
**When** implementing inter-module communication  
**Then** modules SHALL communicate via domain events or shared service layer  
**And** they SHALL NOT directly import each other's use cases or entities

---

### Requirement: BOUND-003 - Allowed Web Import Patterns
**Context**: Explicitly define allowed import directions to maintain layering and prevent circular dependencies.

Web app SHALL follow these import patterns: `app/` → `features/` → `components/` → `shared/`, `lib/`. Features' application layer → domain layer. Infrastructure → domain and shared. Domain MAY ONLY import from @repo/domain for universal constants.

#### Scenario: Routing layer imports Container
**Given** a page component in `apps/web/app/(dashboard)/dashboard/transaction/page.tsx`  
**When** rendering the page  
**Then** it SHALL import TransactionPageContainer from `@/features/transaction/components/TransactionPageContainer`  
**And** it SHALL pass route params/searchParams as props  
**And** it SHALL NOT contain business logic or data fetching

#### Scenario: Feature application imports domain
**Given** a use case in `apps/web/src/features/auth/application/use-cases/login.use-case.ts`  
**When** processing login logic  
**Then** it SHALL import User entity from `../../domain/entities/user.js`  
**And** it SHALL import repository interface from `../../domain/repositories/auth-repository.js`

#### Scenario: Infrastructure implements domain interfaces
**Given** a repository in `apps/web/src/infrastructure/repositories/http-auth.repository.ts`  
**When** implementing AuthRepository interface  
**Then** it SHALL import interface from `@/features/auth/domain/repositories/auth-repository.js`  
**And** it SHALL import User entity from `@/features/auth/domain/entities/user.js`  
**And** it SHALL map HTTP responses to domain entities

#### Scenario: Domain pure - no framework imports
**Given** a domain entity in `apps/web/src/features/budget/domain/entities/budget.ts`  
**When** reviewing imports  
**Then** it SHALL ONLY import from other domain entities/value objects in same feature  
**And** it MAY import from `@repo/domain` for universal types  
**And** it SHALL NOT import from React, Next.js, Zod, TanStack, or any framework

---

### Requirement: BOUND-004 - Allowed API Import Patterns
**Context**: API modules must maintain strict layering with delivery as outer layer and domain as innermost.

API modules SHALL follow: `delivery/http/` → `application/` → `domain/` ← `infrastructure/`. Module delivery → module application and shared errors. Module application → module domain and shared errors. Module infrastructure → module domain and shared utilities. Domain imports ONLY from @repo/domain.

#### Scenario: Delivery handler imports application use case
**Given** a handler in `apps/api/src/modules/category/delivery/http/handlers.ts`  
**When** processing HTTP request  
**Then** it SHALL receive use case instances via function parameters (from module container)  
**And** it SHALL validate request with Zod schema from `@repo/schema/category`  
**And** it SHALL call use case with validated data  
**And** it SHALL map errors to HTTP responses

#### Scenario: Application use case imports domain
**Given** a use case in `apps/api/src/modules/budget/application/use-cases/create-budget.use-case.ts`  
**When** orchestrating budget creation  
**Then** it SHALL import Budget entity from `../../domain/entities/budget.js`  
**And** it SHALL import BudgetRepository interface from `../../domain/repositories/budget-repository.js`  
**And** it SHALL receive repository via constructor injection

#### Scenario: Infrastructure repository imports domain
**Given** a repository in `apps/api/src/modules/transaction/infrastructure/repositories/prisma-transaction.repository.ts`  
**When** implementing TransactionRepository interface  
**Then** it SHALL import interface from `../../domain/repositories/transaction-repository.js`  
**And** it SHALL import Transaction entity from `../../domain/entities/transaction.js`  
**And** it SHALL map Prisma models to domain entities before returning

#### Scenario: Module container wires dependencies
**Given** a container in `apps/api/src/modules/auth/module.container.ts`  
**When** setting up dependency injection  
**Then** it SHALL instantiate concrete repositories (infrastructure layer)  
**And** it SHALL inject repositories into use cases (application layer)  
**And** it SHALL export use case instances for delivery layer

---

### Requirement: BOUND-005 - Forbidden Import Patterns
**Context**: Explicitly document anti-patterns to prevent architectural violations.

The following imports SHALL be FORBIDDEN: Domain SHALL NOT import from Application/Infrastructure/Delivery, Application SHALL NOT import from Infrastructure/Delivery, Cross-feature/module imports SHALL NOT occur, Domain SHALL NOT import from frameworks (React, Elysia, Zod, Firebase, Prisma), Business constants SHALL NOT be placed in @repo/domain.

#### Scenario: Domain cannot import use case
**Given** a domain entity in `apps/api/src/modules/user/domain/entities/user.ts`  
**When** code review detects import from `../../application/use-cases/create-user.use-case.js`  
**Then** the import MUST be rejected (domain → application violates inward rule)  
**And** CI/CD pipeline SHALL fail with boundary violation error

#### Scenario: Application cannot import delivery
**Given** a use case in `apps/web/src/features/auth/application/use-cases/logout.use-case.ts`  
**When** attempting to import from `../../components/LoginForm.tsx`  
**Then** the import MUST be rejected (application → presentation violates layering)  
**And** architecture tests SHALL flag this violation

#### Scenario: Domain cannot import Zod
**Given** a domain entity in `apps/api/src/modules/category/domain/entities/category.ts`  
**When** attempting to import `import { z } from "zod"`  
**Then** the import MUST be rejected (domain must be pure TS)  
**And** validation SHALL be enforced via constructor/factory methods

#### Scenario: Cross-module business logic import is forbidden
**Given** a budget module attempting to import transaction use case  
**When** code in `apps/api/src/modules/budget/application/` imports from `../../transaction/application/`  
**Then** the import MUST be rejected (cross-module violation)  
**And** communication SHALL happen via domain events or shared facade

#### Scenario: Business constants in shared domain package
**Given** a constant like `CategoryStatus` specific to category module  
**When** placed in `packages/domain/src/constants/status.ts`  
**Then** it MUST be rejected (business constants belong in module domain)  
**And** constants SHALL be moved to `apps/api/src/modules/category/domain/constants.ts`
