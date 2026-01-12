# Web Frontend Architecture - Compliance Report

## ✅ Architecture Status: COMPLIANT

The web frontend has been successfully refactored according to the Clean Architecture + DDD principles outlined in the instruction files.

## 📁 Current Structure (Correct)

```
apps/web/
├── app/                          # Next.js App Router (Routing ONLY)
│   ├── (auth)/login/
│   │   └── page.tsx             # ✅ Imports & renders LoginContainer
│   └── (dashboard)/dashboard/
│       ├── page.tsx             # ✅ Imports & renders DashboardContainer
│       ├── master/page.tsx      # ✅ Imports & renders CategoryMasterPageContainer
│       ├── transaction/page.tsx # ✅ Imports & renders TransactionPageContainer
│       └── budget/page.tsx      # ✅ Imports & renders BudgetPageContainer
│
└── src/
    ├── features/<feature>/      # ✅ Bounded context (no cross-feature imports)
    │   ├── domain/              # ✅ Pure TypeScript entities/value objects
    │   │   └── entities/        # ✅ Domain models (Category, Transaction, etc.)
    │   ├── components/          # ✅ Feature-specific UI components
    │   │   ├── *Container.tsx   # ✅ Orchestrate components + TanStack Query
    │   │   └── *.tsx            # ✅ Presentation components
    │   └── hooks/               # ✅ TanStack Query hooks with DIRECT API calls
    │       └── use*.ts          # ✅ No repository, no use case layers
    │
    ├── components/              # ✅ Generic UI components (shadcn/ui wrappers)
    │   ├── ui/                  # ✅ Reusable UI primitives
    │   └── layouts/             # ✅ Layout components
    │
    └── lib/                     # ✅ Framework utilities & config
        ├── api-client.ts        # ✅ HTTP fetch wrapper
        ├── query-client.ts      # ✅ TanStack Query setup
        └── env.ts               # ✅ Environment config
```

## ✅ Correct Architecture Pattern

### Frontend Data Flow (CORRECT)
```
app/page.tsx (Routing)
    ↓ import & render
features/<feature>/components/*Container.tsx (Orchestration)
    ↓ uses
features/<feature>/hooks/use*.ts (TanStack Query + Direct API calls)
    ↓ calls
lib/api-client.ts (HTTP fetch wrapper)
    ↓ HTTP
Backend API
```

### ❌ REMOVED: Over-Engineered Layers
The following layers have been **correctly removed** from the frontend:
- ❌ `application/use-cases/` - **NOT NEEDED** in frontend
- ❌ `infrastructure/repositories/` - **NOT NEEDED** in frontend
- ❌ Repository pattern - **Frontend only has HTTP calls, no persistence layer**

## ✅ Implementation Examples

### 1. App Router Page (Routing Layer)
**File:** `app/(dashboard)/dashboard/master/page.tsx`

```tsx
// ✅ CORRECT: Only imports and renders Container
import { CategoryMasterPageContainer } from "@/features/category/components/CategoryMasterPageContainer";

export const dynamic = 'force-dynamic';

export default function MasterPage() {
  return <CategoryMasterPageContainer />;
}
```

**Rules:**
- ✅ No business logic
- ✅ No data fetching
- ✅ No state management
- ✅ Only routing + render Container

### 2. Feature Container (Orchestration)
**File:** `features/category/components/CategoryMasterPageContainer.tsx`

```tsx
"use client";

import { useCategories, useCreateCategory, useUpdateCategory } from "../hooks/useCategories";

export function CategoryMasterPageContainer() {
  // ✅ Uses TanStack Query hooks directly
  const { data: categories, isLoading } = useCategories("ACTIVE");
  const createMutation = useCreateCategory();
  
  // ✅ Orchestrates UI components
  // ✅ Handles UI state (forms, modals, etc.)
  
  return (
    <div>
      <CategoryForm onSubmit={handleCreate} />
      <CategoryList categories={categories} />
    </div>
  );
}
```

**Rules:**
- ✅ Uses `"use client"` directive
- ✅ Calls TanStack Query hooks from `../hooks/`
- ✅ Orchestrates presentation components
- ✅ Handles UI state & interactions

### 3. Custom Hooks (Direct API Calls)
**File:** `features/category/hooks/useCategories.ts`

```tsx
"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { CategoryResponse } from "@repo/schema/category";
import type { Category } from "../domain/entities/category";

// ✅ Inline mapper function (DTO → Domain)
function mapCategoryResponse(dto: CategoryResponse): Category {
  return {
    id: dto.id,
    name: dto.name,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
  };
}

// ✅ TanStack Query with direct API call
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

// ✅ Mutation with direct API call
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await apiRequest<{ data: CategoryResponse }>(
        `/categories`,
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return mapCategoryResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
```

**Rules:**
- ✅ Direct API calls via `apiRequest()`
- ✅ Inline mapper functions (DTO → Domain)
- ✅ TanStack Query for caching & state
- ❌ NO repository layer
- ❌ NO use case layer

### 4. Domain Layer (Pure TypeScript)
**File:** `features/category/domain/entities/category.ts`

```tsx
// ✅ PURE TypeScript - zero external dependencies
export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly status: CategoryStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
```

**Rules:**
- ✅ Pure TypeScript interfaces/types
- ✅ No external dependencies
- ❌ NO Zod imports
- ❌ NO React imports
- ❌ NO Next.js imports
- ❌ NO TanStack Query imports

## ✅ Validation & Forms

**Pattern:**
```tsx
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { CategoryCreateSchema } from "@repo/schema/category";

// ✅ Zod validation at boundary (form input)
const form = useForm({
  defaultValues: { name: "", description: "" },
  validators: {
    onChange: zodValidator({ schema: CategoryCreateSchema }),
  },
  onSubmit: async ({ value }) => {
    // ✅ Direct mutation call
    await createMutation.mutateAsync(value);
  },
});
```

## ✅ Boundary Rules

### Allowed Imports
```
✅ app/ → features/, components/, shared/, lib/
✅ features/*/components → features/*/hooks, features/*/domain
✅ features/*/hooks → features/*/domain, @/lib/, @repo/schema
✅ features/*/domain → @repo/domain (only universal constants)
✅ components/ → @repo/ui, lucide-react, clsx
✅ lib/ → Framework packages (next, react, @tanstack/*)
```

### Forbidden Imports
```
❌ Cross-feature: features/a ↔ features/b
❌ Domain → React/Next/Zod/TanStack
❌ Domain → @repo/schema (Zod schemas)
❌ app/ → Direct domain/hooks imports (must go through Container)
```

## ✅ Best Practices

### 1. Server Components (Default)
```tsx
// app/page.tsx
// ✅ Server component by default (no "use client")
export default function Page() {
  return <Container />;
}
```

### 2. Client Components (When Needed)
```tsx
// features/*/components/*Container.tsx
"use client";

// ✅ Add "use client" when using:
// - React hooks (useState, useEffect)
// - TanStack Query/Form/Table
// - Browser APIs
```

### 3. TanStack Query Setup
```tsx
// app/layout.tsx
import { QueryProvider } from "@/lib/query-client";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
```

### 4. Error Boundaries
```tsx
// app/error.tsx
"use client";

export default function Error({ error, reset }) {
  return (
    <div>
      <h2>Terjadi kesalahan</h2>
      <button onClick={reset}>Coba Lagi</button>
    </div>
  );
}
```

## ✅ Testing Strategy

### 1. Domain Unit Tests (Pure Logic)
```typescript
// features/*/domain/__tests__/category.test.ts
import { describe, it, expect } from "vitest";
import type { Category } from "../entities/category";

describe("Category", () => {
  it("should create valid category", () => {
    const category: Category = {
      id: "1",
      name: "Test",
      status: "ACTIVE",
      // ...
    };
    expect(category.name).toBe("Test");
  });
});
```

### 2. Hook Tests (with MSW)
```typescript
// features/*/hooks/__tests__/useCategories.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useCategories } from "../useCategories";
import { server } from "@/mocks/server";

describe("useCategories", () => {
  it("fetches categories", async () => {
    const { result } = renderHook(() => useCategories());
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });
});
```

### 3. Component Tests
```typescript
// features/*/components/__tests__/CategoryList.test.tsx
import { render, screen } from "@testing-library/react";
import { CategoryList } from "../CategoryList";

describe("CategoryList", () => {
  it("renders categories", () => {
    const categories = [{ id: "1", name: "Test", /* ... */ }];
    render(<CategoryList categories={categories} />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
```

## 📊 Architecture Compliance Checklist

- [x] ✅ No repository pattern in frontend
- [x] ✅ No use case layer in frontend
- [x] ✅ Hooks call API directly with TanStack Query
- [x] ✅ Domain layer is pure TypeScript
- [x] ✅ Validation at boundaries (forms) using @repo/schema
- [x] ✅ No cross-feature imports
- [x] ✅ App router pages only render Containers
- [x] ✅ Containers orchestrate components + hooks
- [x] ✅ Generic UI components in src/components/
- [x] ✅ TanStack Query for data fetching & caching
- [x] ✅ TanStack Form for form validation
- [x] ✅ TanStack Table for data tables

## 🎯 Migration from Old Architecture (COMPLETED)

### ❌ Before (Over-engineered)
```
Component → Hook → Use Case → Repository → API Client ← REMOVED!
```

### ✅ After (Correct)
```
Component → Hook (TanStack Query) → API Client → Backend
```

### Removed Layers
1. ✅ **Removed:** `features/*/application/use-cases/` - Not needed in frontend
2. ✅ **Removed:** `features/*/infrastructure/repositories/` - Not needed in frontend
3. ✅ **Removed:** Repository interfaces from domain - Frontend doesn't abstract persistence

### Benefits
- ⚡ **Simpler architecture** - Fewer layers, easier to understand
- ⚡ **Less boilerplate** - No repository/use case classes per feature
- ⚡ **Better DX** - Direct API calls with type safety
- ⚡ **React Query benefits** - Built-in caching, optimistic updates, refetch logic
- ⚡ **Easier testing** - Mock fetch instead of multiple layers

## 📖 References

1. **Instruction Files:**
   - `.github/instructions/03-web-nextjs.md` - Web architecture rules
   - `.github/instructions/01-architecture-and-boundaries.md` - Boundary rules
   - `.github/instructions/02-shared-schema-zod.md` - Validation strategy

2. **Next.js Best Practices:**
   - [Next.js App Router](https://nextjs.org/docs/app)
   - [Server & Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

3. **TanStack Libraries:**
   - [TanStack Query](https://tanstack.com/query/latest)
   - [TanStack Form](https://tanstack.com/form/latest)
   - [TanStack Table](https://tanstack.com/table/latest)

## 🔄 Continuous Compliance

### When Adding New Features:
1. ✅ Create feature in `features/<feature>/`
2. ✅ Add domain entities in `domain/entities/`
3. ✅ Create hooks with TanStack Query in `hooks/`
4. ✅ Build Container component in `components/`
5. ✅ Create page in `app/` that renders Container
6. ✅ **Never** add `application/` or `infrastructure/` layers

### Code Review Checklist:
- [ ] No repository pattern in PR
- [ ] No use case layer in PR
- [ ] Hooks use TanStack Query directly
- [ ] Domain layer has no external deps
- [ ] No cross-feature imports
- [ ] Validation uses @repo/schema at boundaries

---

**Status:** ✅ **FULLY COMPLIANT** with Clean Architecture + DDD principles for frontend
**Last Updated:** January 12, 2026
