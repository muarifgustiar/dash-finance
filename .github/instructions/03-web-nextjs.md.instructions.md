---
applyTo: '**'
---
# Web (Next.js 15 App Router) - Struktur & Aturan

## Struktur Direktori (Final)
apps/web/
- app/                       # Routing ONLY - Next.js App Router
  - (auth)/
    - login/
      - page.tsx             # Import & render LoginContainer dari features/auth
  - (dashboard)/
    - dashboard/
      - page.tsx             # Import & render DashboardContainer dari features/dashboard
      - layout.tsx           # Layout wrapper
      - transaction/
        - page.tsx           # Import & render TransactionPageContainer dari features/transaction
      - budget/
        - page.tsx           # Import & render BudgetPageContainer dari features/budget
      - plan/
        - page.tsx           # Import & render PlanPageContainer dari features/plan
  
- src/
  - features/<feature>/      # Bounded context (no cross-feature imports)
    - domain/                # PURE TS (no Zod/React) - ONLY entities, value objects, constants
      - entities/           # Domain models (Category, Transaction, User)
      - value-objects/      # Immutable value types (Money, Email, etc)
      - constants/          # Feature-specific constants
      - __tests__/
    - components/            # Feature-specific presentation components
      - TransactionList.tsx  # Domain-specific component
      - TransactionForm.tsx
      - TransactionCard.tsx
      - TransactionPageContainer.tsx  # Container: orchestrate feature components
    - hooks/                 # Hooks with direct API calls (NO repositories, NO use cases)
      - useTransactions.ts
      - useCreateTransaction.ts
    - types/

  - shared/                  # Shared kernel (utils/types/constants/hooks)
  - components/              # UI kit components
    - ui/                    # shadcn/ui primitives (from CLI/generator)
      - button.tsx
      - card.tsx
      - input.tsx
      - dialog.tsx
    - ds/                    # Design-system layer (wrappers/customizations)
      - button.tsx           # Project-specific Button extending ui/button
      - input.tsx            # Project-specific Input extending ui/input
      - index.ts             # Barrel export for design system
    - layouts/
      - header.tsx
      - sidebar.tsx
    - forms/
      - form-field.tsx       # Generic form components
  - lib/                     # framework/config (query client, http client, config)

## Server vs Client Components
Default: Server Component.
Tambahkan `"use client"` hanya bila:
- pakai state/effects, TanStack Form, TanStack Query, TanStack Table, browser APIs

## Aturan Routing & Components

### 1. **app/** = Routing Layer ONLY
**Tugas:**
- Hanya untuk routing Next.js (page.tsx, layout.tsx, loading.tsx, error.tsx)
- Import dan render Container dari `features/<feature>/components/`
- Handle metadata, route groups, parallel routes
- Server components by default

**Rules:**
- ❌ TIDAK boleh ada business logic
- ❌ TIDAK boleh ada data fetching logic
- ❌ TIDAK boleh ada state management
- ✅ Hanya import & render Container components
- ✅ Pass route params/searchParams ke Container

**Contoh:**
```tsx
// app/(dashboard)/dashboard/transaction/page.tsx
import { TransactionPageContainer } from "@/features/transaction/components/TransactionPageContainer";
**Server Components** (app/): Prefer untuk initial data load yang tidak interaktif
- **Client Components** (Container dalam features/): Gunakan TanStack Query untuk:
  - Interactive data fetching
  - Mutations dengan optimistic updates
  - Real-time refetch & cache management
  - Client-side state synchronization

**Pattern:**
1. `app/page.tsx` → render Container (server component by default)
2. Container (`features/*/components/*Container.tsx`) → "use client" + useQuery hooks
3. Custom hooks (`features/*/hooks/use*.ts`) → wrap TanStack Query calls
4. Setup QueryClient di `app/layout.tsx` dengan error/loading boundaries
```

### 2. **features/<feature>/components/** = Feature Components & Containers
**Struktur:**
- **Containers**: Orchestrate feature components, handle data fetching, state
  - Example: `TransactionPageContainer.tsx`, `BudgetDashboardContainer.tsx`
  - Gunakan TanStack Query hooks untuk data fetching
  - Compose presentation components
  - Handle loading/error states
  
- **Presentation Components**: Domain-specific UI
  - Example: `TransactionList.tsx`, `TransactionForm.tsx`, `TransactionCard.tsx`
  - Receive data via props
  - Focus on rendering logic only

**Rules:**
- ✅ Boleh import dari feature's domain/application/hooks (dalam boundary yang sama)
- ✅ Boleh import dari `src/components/` (generic UI)
- ✅ Boleh import dari `@repo/schema`, `@repo/ui`
- ❌ TIDAK boleh cross-feature import

**Contoh Container:**
```tsx
// src/features/transaction/components/TransactionPageContainer.tsx
"use client";

import { useTransactions } from "../hooks/useTransactions";
import { TransactionList } from "./TransactionList";
import { TransactionForm } from "./TransactionForm";

export function TransactionPageContainer() {
  const { data, isLoading } = useTransactions();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <TransactionForm />
      <TransactionList transactions={data} />
    </div>
  );
}
```

### 3. **src/components/** = UI Kit & Generic Components
**Tugas:**
- Organized component kit dengan clear separation of concerns
- Base primitives dari vendor (shadcn/ui)
- Design-system layer untuk project-specific customizations
- Layout dan form components

**Struktur (Kit Approach):**
- `ui/` - shadcn/ui primitives (hasil CLI/generator, minimal modifications)
- `primitives/` - Optional: vendor vs local primitives separation
- `ds/` - Design-system layer (turunan/wrapper dari ui/, project-specific)
- `layouts/` - Layout components (Header, Sidebar, Footer)
- `forms/` - Generic form components (kebab-case naming)

**Component Layers:**
```
Feature Component (features/*/components)
    ↓ uses
Design System (components/ds)
    ↓ extends
UI Primitives (components/ui - shadcn)
```

**Rules:**
- ❌ TIDAK boleh import dari `features/`
- ✅ `ui/` components = base primitives, minimal changes (vendor layer)
- ✅ `ds/` components = project customizations, extends `ui/`
- ✅ Features should import from `ds/` not `ui/` for consistency
- ✅ File names use kebab-case for multi-word components
- ✅ Each `ds/` component can re-export or wrap `ui/` component

**Example Usage Pattern:**
```tsx
// ❌ AVOID: Direct import from ui in features
import { Button } from "@/components/ui/button";

// ✅ CORRECT: Import from design-system layer
import { Button } from "@/components/ds";
```

**Example Files:**
- Base: `ui/button.tsx`, `ui/input.tsx`, `ui/dialog.tsx` (shadcn primitives)
- DS Layer: `ds/button.tsx`, `ds/input.tsx`, `ds/index.ts` (project styling)
- Layouts: `layouts/header.tsx`, `layouts/sidebar.tsx`, `layouts/data-table.tsx`
- Forms: `forms/form-field.tsx`, `forms/form-input.tsx`

## Frontend Architecture Pattern (Simplified)

**✅ CORRECT: Frontend hooks call API directly**
```
Component → Hook (TanStack Query) → API Client → HTTP → Backend
```

**❌ WRONG: DO NOT use repository pattern in frontend**
```
Component → Hook → Use Case → Repository → API Client → HTTP  ← Over-engineered!
```

**Why NO repository pattern in frontend?**
- Repository pattern abstracts *persistence layers* (databases)
- Frontend only has HTTP calls - no persistence layer to abstract
- TanStack Query already handles caching, state management
- Adds 15+ unnecessary files and 4 extra layers per feature
- Violates React Query best practices

**Correct Hook Implementation:**
```tsx
// ✅ CORRECT: Direct API call with inline mapper
import { apiRequest } from "@/lib/api-client";
import type { CategoryResponse } from "@repo/schema/category";

function mapCategoryResponse(dto: CategoryResponse): Category {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
  };
}

export function useCategories(status?: CategoryStatus) {
  return useQuery({
    queryKey: categoryKeys.list(status),
    queryFn: async () => {
      const query = status ? `?status=${status}` : "";
      const response = await apiRequest<{ data: CategoryResponse[] }>(
        `/categories${query}`
      );
      return response.data.map(mapCategoryResponse);
    },
  });
}
```

**❌ ANTI-PATTERN: Don't do this:**
```tsx
// ❌ WRONG: Repository + Use Case layers (over-engineered)
const repository = new ApiCategoryRepository();
const useCase = new GetCategoriesUseCase(repository);

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: () => useCase.execute(),  // Unnecessary indirection!
  });
}
```

## Data Fetching
- Prefer server-side untuk data non-interaktif.
- **TanStack Query** untuk flow interaktif (mutation, cache, refetch, optimistic updates).
- Semua query/mutation dibungkus custom hook per feature.
- Setup QueryClient di root layout dengan proper error/loading boundaries.

## Validation & Forms
- Gunakan schema dari `@repo/schema` untuk:
  - form validation (**TanStack Form** dengan `zodValidator`)
  - parsing payload sebelum memanggil use case
- Domain tetap pure TS.
- TanStack Form features:
  - Field-level validation
  - Async validation
  - Optimistic updates via TanStack Query integration

## Data Tables
- Gunakan **TanStack Table** untuk complex data tables:

## Flow Diagram
```
app/page.tsx (Routing)
    ↓ import & render
features/<feature>/components/Container.tsx (Orchestration)
    ↓ uses
features/<feature>/hooks/use*.ts (TanStack Query + Direct API calls)
    ↓ calls
lib/api-client.ts (HTTP fetch wrapper)
    ↓ HTTP
Backend API
```

**Note:** Frontend does NOT have application/use-cases or infrastructure/repositories layers.

## Quick Checklist
- [ ] `app/` hanya routing, tidak ada logic
- [ ] Container ada di `features/*/components/`
- [ ] Container pakai "use client" bila perlu state/effects/TanStack Query
- [ ] Presentation components terpisah dari Container
- [ ] Generic UI components di `src/components/`
- [ ] Tidak ada cross-feature imports
- [ ] Data fetching lewat custom hooks yang wrap TanStack Query
  - Sorting, filtering, pagination
  - Column visibility, resizing, reordering
  - Server-side atau client-side data management
- Wrap dalam reusable components di `components/tables/`

## Testing & Test Coverage (Wajib)

### Unit Test Principles (STRICT)

**Critical Rules:**
	•	✅ **No production code until failing tests exist** - Write tests first (TDD approach). Test harus fail dulu sebelum implementation.
	•	✅ **Each spec requirement maps to ≥1 test** - Setiap requirement di spec harus punya minimal 1 test case.
	•	✅ **Never edit unrelated packages** - Hanya edit files dalam feature boundary yang sedang dikerjakan.
	•	✅ **Update spec when ambiguity is found** - Jika requirement tidak jelas saat implementasi, update spec.md dulu sebelum lanjut coding.
	•	✅ **Code coverage minimum 80%** - Hooks dan Components harus ≥80% coverage.

### Test Organization per Feature

```text
features/<feature>/
  hooks/__tests__/
    useTransactions.test.ts      # Query hook tests
    useCreateTransaction.test.ts # Mutation hook tests
  components/__tests__/
    TransactionForm.test.tsx     # Component behavior tests
    TransactionList.test.tsx     # Rendering & interaction tests
    TransactionPageContainer.test.tsx  # Integration tests
```

### Test Coverage Requirements

**Hooks Layer (Target: 85-95%)**
	•	Query hooks: data fetching, caching, error handling
	•	Mutation hooks: API calls, cache invalidation, optimistic updates
	•	Query key generation and cache management
	•	Data transformation (DTO → domain mapping)
	•	Filter and pagination logic

**Components Layer (Target: 80-90%)**
	•	User interactions (clicks, form input, submissions)
	•	Conditional rendering (loading, error, empty states)
	•	Form validation (Zod + TanStack Form)
	•	Props handling and event callbacks
	•	Accessibility (ARIA, keyboard navigation)

**Containers Layer (Target: 75-85%)**
	•	Data fetching orchestration
	•	State management and mode switching
	•	Error boundary behavior
	•	Loading state transitions
	•	Component composition

### Testing Tools & Commands

**Framework**: Vitest + Testing Library + MSW

**Commands**:
	•	Run all tests: `bun test` (from apps/web)
	•	Run feature tests: `bun test features/transaction`
	•	Watch mode: `bun test --watch`
	•	Coverage report: `bun test --coverage`
	•	UI mode: `bun test --ui`

**Mocking Strategy**:
	•	**MSW (Mock Service Worker)** for API mocking - intercept network requests
	•	Mock TanStack Query hooks in component tests when needed
	•	Mock Next.js router for navigation tests
	•	No real API calls in unit tests

### Test-First Workflow (TDD)

1. **Red**: Write failing test for spec requirement
2. **Green**: Write minimal code to make test pass
3. **Refactor**: Improve code while keeping tests green
4. **Repeat**: Next requirement

**Example Hook Test:**
```typescript
// hooks/__tests__/useCreateTransaction.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useCreateTransaction } from "../useCreateTransaction";
import { server } from "@/test/mocks/server";
import { http, HttpResponse } from "msw";

describe("useCreateTransaction", () => {
  it("should create transaction successfully", async () => {
    server.use(
      http.post("/transactions", () => {
        return HttpResponse.json({ data: { id: "1", amount: 1000 } });
      })
    );

    const { result } = renderHook(() => useCreateTransaction());
    
    result.current.mutate({ amount: 1000, categoryId: "cat1" });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data.amount).toBe(1000);
  });
});
```

**Example Component Test:**
```typescript
// components/__tests__/TransactionForm.test.tsx
import { render, screen, userEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TransactionForm } from "../TransactionForm";

describe("TransactionForm", () => {
  it("should validate positive amount", async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);
    
    const amountInput = screen.getByLabelText(/jumlah/i);
    await userEvent.type(amountInput, "-100");
    
    const submitButton = screen.getByRole("button", { name: /simpan/i });
    await userEvent.click(submitButton);
    
    expect(screen.getByText(/harus lebih dari 0/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

### Coverage Enforcement

**Pre-commit Hook** (recommended):
	•	Run tests sebelum commit
	•	Block commit jika coverage < 80%
	•	Format: `bun test --coverage --coverage-threshold=80`

**CI/CD Pipeline** (wajib):
	•	Run full test suite
	•	Generate coverage report
	•	Fail build jika coverage turun dari threshold
	•	Report coverage ke team dashboard

### MSW Setup (API Mocking)

**Setup Files:**
```text
apps/web/src/
  test/
    mocks/
      server.ts          # MSW server setup
      handlers.ts        # API handlers for tests
    setup.ts             # Test environment setup
```

**Example Handler:**
```typescript
// test/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/transactions", () => {
    return HttpResponse.json({
      data: [
        { id: "1", amount: 1000, categoryId: "cat1" }
      ]
    });
  }),
  
  http.post("/transactions", async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      data: { id: "new-id", ...body }
    });
  }),
];
```

### Test Best Practices

**DO:**
	•	✅ Test behavior, not implementation
	•	✅ Use semantic queries (getByRole, getByLabelText)
	•	✅ Test user interactions and accessibility
	•	✅ Mock at network boundary (MSW), not at hook level
	•	✅ Test error states and edge cases
	•	✅ Keep tests independent and isolated

**DON'T:**
	•	❌ Test internal state or private methods
	•	❌ Rely on implementation details (class names, DOM structure)
	•	❌ Write tests that depend on other tests
	•	❌ Mock everything (only mock external dependencies)
	•	❌ Ignore accessibility in tests
	•	❌ Skip error and loading state tests

⸻

## No Cross-Feature Imports
Jika butuh komunikasi antar bounded context:
- lewat Application layer (facade) atau event/port di shared, bukan import langsung file.