# Project Context

## Purpose

**Finance Dashboard** - A comprehensive personal/business finance management system built as a monorepo application.

**Goals:**
- Track transactions across multiple budget owners (personal/business/family)
- Categorize expenses and income for analysis
- Manage budgets with period-based tracking
- Generate financial reports and insights
- Provide real-time financial overview dashboards

**Target Users:** Individuals, families, small businesses managing their finances

---

## Tech Stack

### Runtime & Package Management
- **Bun** - JavaScript runtime and package manager
- **Turborepo** - Monorepo orchestration and task runner

### Backend (API)
- **Elysia.js** - High-performance TypeScript HTTP framework
- **Prisma ORM** - Type-safe database access with PostgreSQL
- **PostgreSQL** - Primary database
- **Firebase** - Authentication, Firestore (secondary), Storage

### Frontend (Web)
- **Next.js 15** - React framework with App Router (Server/Client components)
- **TypeScript 5.9.3** - Static typing
- **TanStack Query v5** - Server state management and data fetching
- **TanStack Form** - Type-safe form handling with validation
- **TanStack Table** - Advanced data table features
- **shadcn/ui** - UI component library (Radix UI primitives)
- **Tailwind CSS** - Utility-first styling

### Shared Packages
- **Zod** - Schema validation and type inference (boundary layer only)
- **date-fns** - Date manipulation

### Development Tools
- **TypeScript** - Strict mode enabled
- **ESLint** - Code linting
- **Vitest** - Unit testing
- **Testing Library** - Component testing
- **MSW (Mock Service Worker)** - API mocking

---

## Project Conventions

### Architecture: Clean Architecture + DDD

**Mandatory Principles:**
1. **Dependency Rule**: Dependencies ONLY point inward (Delivery → Application → Domain ← Infrastructure)
2. **Pure Domain Layer**: Domain must have ZERO external dependencies (no Zod, React, Firebase, Elysia, etc.)
3. **Bounded Contexts**: No cross-feature/module imports - each feature is independent
4. **DI Pattern**: Use cases receive dependencies via constructor injection
5. **Single Source of Truth**:
   - Zod schemas (`@repo/schema`) = DTO/contract validation at boundaries
   - Universal constants (`@repo/domain`) = shared error codes, API types
   - Business constants = in module/feature domain (bounded context)

### Code Style

**Naming Conventions:**
- **Files**: kebab-case (`user-repository.ts`, `get-transactions.use-case.ts`)
- **Classes**: PascalCase (`GetTransactionsUseCase`, `Transaction`)
- **Functions/Variables**: camelCase (`getUserById`, `totalAmount`)
- **Constants**: SCREAMING_SNAKE_CASE in object (`ErrorCodes.NOT_FOUND`)
- **Types/Interfaces**: PascalCase with `I` prefix for interfaces (`ITransactionRepository`)

**Language:**
- **Code identifiers**: English only (types, functions, variables, files)
- **User-facing content**: Bahasa Indonesia (UI text, error messages, labels)
- Never mix languages in code identifiers

**Imports:**
- Absolute imports from workspace root via `@/` path alias (web)
- Package imports via `@repo/*` for shared packages
- Relative imports within same feature/module only

### Architecture Patterns

#### Backend (API) Structure
```
apps/api/src/
  modules/<module>/           # Bounded context
    delivery/http/            # Outer layer (routes, handlers)
      routes.ts               # Route registration
      handlers.ts             # Thin handlers (validate → use case → respond)
    domain/                   # PURE TypeScript (no dependencies)
      entities/
      value-objects/
      repositories/           # Interfaces only (ports)
      services/
      errors/
    application/              # Use cases (orchestration)
      use-cases/
      commands/
      queries/
      dtos/
    infrastructure/           # Implementations (Prisma, Firebase)
      repositories/
      mappers/
    module.container.ts       # DI wiring
```

**Rules:**
- Delivery validates with Zod, passes to use case, maps errors to HTTP
- Use cases are pure business logic (no framework code)
- Domain entities enforce invariants via constructors/factories
- Infrastructure maps between persistence models and domain entities

#### Frontend (Web) Structure
```
apps/web/
  app/                        # Routing ONLY (Next.js App Router)
    (auth)/
    (dashboard)/
  src/
    features/<feature>/       # Bounded context
      domain/                 # PURE TypeScript
        entities/
        value-objects/
        constants.ts          # Business constants
      application/            # Use cases, DTOs
        use-cases/
        dtos/
      components/             # Feature-specific UI
        *Container.tsx        # Orchestration (TanStack Query)
        *Form.tsx
        *List.tsx
      hooks/                  # TanStack Query wrappers
        use*.ts
      infrastructure/         # API clients, adapters
    components/               # Generic UI ONLY (not domain-specific)
      ui/                     # shadcn/ui primitives
      layouts/
      forms/
      tables/
    lib/                      # Framework config
```

**Rules:**
- `app/` routes only import and render Containers
- Containers are client components ("use client") that orchestrate
- Presentation components receive data via props
- No cross-feature imports
- Generic UI components in `src/components/`, feature-specific in `features/*/components/`

#### Data Flow Patterns

**API Request Flow:**
```
HTTP Request
  ↓ Elysia Route (validate with Zod)
  ↓ Handler (thin, maps to command/query)
  ↓ Use Case (business logic)
  ↓ Repository Interface (port)
  ↓ Repository Implementation (Prisma/Firebase)
  ↓ Domain Entity
  ↓ Response DTO
  ↓ HTTP Response (ApiResponse<T>)
```

**Web Data Flow:**
```
User Action
  ↓ Component Event
  ↓ TanStack Query/Mutation Hook
  ↓ Use Case (optional, for complex logic)
  ↓ API Client (fetch)
  ↓ Response mapped to Domain Entity
  ↓ State Update (TanStack Query cache)
  ↓ Component Re-render
```

### Testing Strategy

**Priority:**
1. Domain unit tests (pure logic) - Target 100%
2. Application/use case unit tests (mock repos via DI)
3. Handler/component tests
4. Repository integration tests (in-memory DB/mocked services)

**Tools:**
- **Vitest** - Unit testing framework
- **Testing Library** - React component testing
- **MSW** - Mock network requests
- **bun:test** - Optional for API modules

**Principles:**
- Test behavior, not implementation
- Mock at boundaries (repositories, API clients)
- No snapshot testing for large components
- E2E tests for critical user flows only

### Git Workflow

**Branching:**
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches

**Commit Conventions:**
- Use conventional commits: `type(scope): message`
- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- Scope: module/feature name (`category`, `transaction`, `shared`)

**Examples:**
```
feat(category): add category filtering to transaction list
fix(api): resolve category delete validation error
refactor(web): extract transaction form to separate component
docs(openspec): update implementation status for pagination
```

---

## Domain Context

### Business Domains

**Budget Owners:**
- Represents a financial entity (person, family, business)
- Each user can manage multiple budget owners
- Transactions are associated with budget owners

**Categories:**
- Master data for transaction classification
- Status: ACTIVE/INACTIVE
- Enforces referential integrity (cannot delete if used in transactions)
- Used for expense analysis and reporting

**Transactions:**
- Financial records (income/expense)
- Associated with budget owner and category
- Includes amount, date, description, optional receipt
- Supports filtering by multiple dimensions

**Budgets:**
- Period-based spending limits per budget owner
- Year-based tracking
- Compares planned vs actual spending

### Key Business Rules

1. **Category Deletion**: Cannot delete category if associated with any transactions
2. **Transaction Validation**: Must have valid budget owner and category
3. **Budget Periods**: Budgets are year-based, non-overlapping per budget owner
4. **User Ownership**: Users can only access their own data (enforced at API level)

### Standard API Response Format

**Success:**
```typescript
{
  success: true,
  data: T,  // or { items: T[], pagination: PaginationMeta }
  meta?: { timestamp: string, requestId?: string }
}
```

**Error:**
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

**Pagination:**
```typescript
{
  page: number,
  limit: number,
  total: number,
  totalPages: number,
  hasNext: boolean,
  hasPrev: boolean
}
```

---

## Important Constraints

### Technical Constraints

1. **Domain Purity**: Domain layer MUST remain pure TypeScript - no external dependencies
2. **No Cross-Feature Imports**: Bounded contexts are strictly isolated
3. **API Response Format**: Cannot change established response format (breaking change)
4. **Authentication**: Firebase Auth required for all protected endpoints
5. **Database**: PostgreSQL primary, Firestore secondary (migration in progress)

### Business Constraints

1. **Multi-tenancy**: Data isolation per user (enforced in repository layer)
2. **Referential Integrity**: Must validate relationships before deletion
3. **Audit Trail**: Track createdBy/updatedBy for all mutations

### Performance Constraints

1. **Pagination**: List endpoints must support pagination (max 100 items)
2. **Query Optimization**: Use parallel queries where possible (Promise.all)
3. **Category Filter**: Array filters limited to 50 items max

### Language Constraints

1. **Code**: English only for all identifiers
2. **UI**: Bahasa Indonesia for all user-facing text
3. **Error Messages**: Indonesian for user errors, English for developer errors

---

## External Dependencies

### Firebase Services
- **Firebase Auth**: User authentication (JWT tokens)
- **Firestore**: Document database (being phased out)
- **Firebase Storage**: Receipt/file uploads

### Database
- **PostgreSQL**: Primary relational database
- **Prisma**: ORM with migrations in `apps/api/prisma/`

### Third-Party Libraries
- **Radix UI**: Headless UI primitives (via shadcn/ui)
- **Lucide Icons**: Icon library
- **date-fns**: Date utilities

### Development Services
- **Turborepo**: Build orchestration
- **TypeScript**: Type checking across monorepo

---

## Workspace Structure

```
dash_finance/
├── apps/
│   ├── api/              # Backend (Elysia + Prisma)
│   └── web/              # Frontend (Next.js 15)
├── packages/
│   ├── domain/           # Shared types/errors/utils (pure TS)
│   ├── schema/           # Zod validation schemas
│   ├── ui/               # Shared UI components
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/# TypeScript configurations
├── openspec/             # Change proposals and specs
│   └── changes/
└── docs/                 # Architecture and API documentation
```

---

## OpenSpec Conventions

### Change Proposal Structure
```
openspec/changes/<change-id>/
  proposal.md     # Overview, problem, solution, scope
  design.md       # Technical design, architecture decisions
  tasks.md        # Implementation checklist
  specs/          # Detailed specifications
  README.md       # Quick reference
```

### Task Status Tracking
- `[ ]` - Not started
- `[x]` - Completed
- Mark with ✅ **COMPLETE** when verified operational

### Implementation Workflow
1. Read proposal.md, design.md, tasks.md
2. Work through tasks sequentially
3. Update checklist after each completion
4. Create IMPLEMENTATION-STATUS.md when done
5. Validate with `openspec validate <change-id> --strict`

---

## Quick Reference

### Common Commands

```bash
# Install dependencies
bun install

# Development
bun run dev            # All apps
bun run dev:web        # Web only
bun run dev:api        # API only

# Build
bun run build
bun run build:web
bun run build:api

# Testing
bun run test
bun run lint
bun run type-check

# Type checking packages
bun run --filter='@repo/domain' check-types
bun run --filter='@repo/schema' check-types

# OpenSpec
openspec list                    # List changes
openspec validate <id> --strict  # Validate change
openspec apply <id>              # Mark as applied
```

### Key Paths

- API modules: `apps/api/src/modules/<module>/`
- Web features: `apps/web/src/features/<feature>/`
- Shared schemas: `packages/schema/src/<domain>/`
- Shared types: `packages/domain/src/types/`
- UI components: `packages/ui/src/`

### Common Patterns

**Creating a new API module:**
1. Create `modules/<name>/` with domain/application/infrastructure/delivery
2. Define repository interface in domain
3. Implement use cases in application
4. Create Prisma repository in infrastructure
5. Add routes and handlers in delivery
6. Wire dependencies in module.container.ts

**Creating a new Web feature:**
1. Create `features/<name>/` with domain/application/components/hooks
2. Define entities in domain (pure TS)
3. Create use cases in application (if needed)
4. Build Container component (orchestration)
5. Create TanStack Query hooks
6. Add presentation components
7. Create page in `app/` that renders Container

---

**Last Updated**: January 9, 2026
