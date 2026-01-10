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
    - domain/                # PURE TS (no Zod/React)
      - entities/
      - value-objects/
      - services/
      - events/
      - repositories/        # interfaces only
      - errors/
      - __tests__/
    - application/           # Use cases, commands, queries, dtos
      - use-cases/
      - commands/
      - queries/
      - dtos/
      - __tests__/
    - components/            # Feature-specific presentation components
      - TransactionList.tsx  # Domain-specific component
      - TransactionForm.tsx
      - TransactionCard.tsx
      - TransactionPageContainer.tsx  # Container: orchestrate feature components
    - hooks/                 # Hooks wrapping use cases
      - useTransactions.ts
      - useCreateTransaction.ts
    - types/

  - infrastructure/          # Implementations (fetch clients, firebase adapters, persistence)
  - shared/                  # Shared kernel (utils/types/constants/hooks)
  - components/              # UI components ONLY (shadcn/ui wrappers, layouts, generic forms)
    - ui/                    # shadcn/ui primitives
      - button.tsx
      - card.tsx
      - input.tsx
    - layouts/
      - header.tsx
      - sidebar.tsx
    - forms/
      - FormField.tsx        # Generic form components
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

### 3. **src/components/** = Generic/Reusable UI Components ONLY
**Tugas:**
- Komponen UI yang tidak terikat domain tertenap
- Wrappers untuk shadcn/ui components
- Layout components (Header, Sidebar, Footer)
- Generic form components

**Rules:**
- ❌ TIDAK boleh import dari `features/`
- ✅ Pure presentational components
- ✅ Reusable across multiple features

**Example:** `Button`, `Card`, `Input`, `Header`, `Sidebar`, `DataTable` (generic)

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
features/<feature>/hooks/use*.ts (Data Fetching)
    ↓ calls
features/<feature>/application/use-cases/*.ts (Business Logic)
    ↓ uses
features/<feature>/domain/* (Pure Business Logic)
```

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

## No Cross-Feature Imports
Jika butuh komunikasi antar bounded context:
- lewat Application layer (facade) atau event/port di shared, bukan import langsung file.