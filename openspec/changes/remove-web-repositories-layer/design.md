# Design: Simplified Web Data Fetching Architecture

## Overview

This design document explains the rationale for removing the repository pattern from the web application and adopting a simplified, direct API call pattern that aligns with modern React/Next.js best practices.

## Current Architecture Problems

### The Over-Engineered Pattern

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    Hook     │ ← TanStack Query
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  Use Case   │ ← Application Layer
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ Repository  │ ← Infrastructure Interface + Implementation
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ API Client  │ ← apiRequest wrapper
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  HTTP Call  │
└─────────────┘
```

**Problems:**
1. **4 unnecessary layers** between component and HTTP call
2. **15+ files** for simple CRUD operations
3. **Cognitive overhead** understanding abstractions
4. **No real benefits** - abstractions don't enable anything useful

### Why Repository Pattern Doesn't Fit Frontend

The repository pattern is designed to:
- **Abstract data persistence** (DB, file system, external service)
- **Enable switching implementations** (PostgreSQL → MongoDB → Redis)
- **Decouple domain from persistence technology**

Frontend doesn't have these concerns:
- ✘ No data persistence layer (always HTTP)
- ✘ No implementation switching (API contract is fixed)
- ✘ TanStack Query already provides caching/sync layer

**Verdict**: Repository pattern is architectural mismatch for frontend.

## Target Architecture

### The Simplified Pattern

```
┌─────────────┐
│  Component  │
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    Hook     │ ← TanStack Query + Direct API Calls
└──────┬──────┘
       │
       ↓
┌─────────────┐
│ API Client  │ ← apiRequest wrapper (shared utility)
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  HTTP Call  │
└─────────────┘
```

**Benefits:**
1. **2 layers total** - just hook and API client
2. **~3 files** for CRUD operations
3. **Obvious flow** - no hidden abstractions
4. **Standard pattern** used by industry (React Query docs, Vercel examples)

## Layer Responsibilities

### Component Layer
**Purpose**: Presentation and user interaction  
**Technology**: React components  
**Responsibilities**:
- Render UI
- Handle user events
- Call hooks for data
- Display loading/error states

**Example**:
```tsx
export function CategoryMasterPageContainer() {
  const { data: categories, isLoading } = useCategories("ACTIVE");
  const createMutation = useCreateCategory();
  
  // ... render logic
}
```

### Hook Layer (Data Access)
**Purpose**: Data fetching, caching, and synchronization  
**Technology**: TanStack Query hooks  
**Responsibilities**:
- Define query/mutation functions
- Configure cache keys
- Handle API calls via `apiRequest`
- Map DTOs to domain entities (if needed)
- Trigger cache invalidation

**Example**:
```tsx
export function useCategories(status?: CategoryStatus) {
  const query = status ? `?status=${status}` : "";
  
  return useQuery({
    queryKey: categoryKeys.list(status),
    queryFn: async () => {
      const response = await apiRequest<{ data: CategoryResponse[] }>(
        `/categories${query}`
      );
      return response.data.map(mapCategoryResponse);
    },
  });
}
```

### Shared Utilities Layer
**Purpose**: Reusable HTTP client and mapping functions  
**Technology**: Utility functions  
**Responsibilities**:
- `apiRequest()` - Wrapper for fetch with error handling
- Mapping functions - DTO to domain entity conversion
- Query key factories - Consistent cache key generation

**Example**:
```tsx
// lib/api-client.ts
export async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new ApiError(response.status, await response.text());
  }
  
  return response.json();
}
```

## Data Flow Patterns

### Query (Read) Pattern

```typescript
// 1. Define query hook
export function useCategories(filters?: FilterType) {
  return useQuery({
    queryKey: ["categories", filters],
    queryFn: async () => {
      const response = await apiRequest<ResponseType>("/categories");
      return response.data.map(mapToEntity);
    },
  });
}

// 2. Use in component
function Component() {
  const { data, isLoading, error } = useCategories();
  // ... render
}
```

### Mutation (Write) Pattern

```typescript
// 1. Define mutation hook
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateData) => {
      const response = await apiRequest<ResponseType>("/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// 2. Use in component
function Component() {
  const createMutation = useCreateCategory();
  
  const handleSubmit = async (data) => {
    await createMutation.mutateAsync(data);
  };
  // ... render
}
```

## Mapping Strategy

### When to Map

**Map DTO → Entity when:**
- Domain entity has behavior (methods)
- Need consistent date parsing
- Want type safety beyond API contract
- Hiding API response structure from components

**Use DTO directly when:**
- Data is simple POJOs
- No domain behavior needed
- API response structure is clean
- Premature abstraction concern

### Mapping Location

**Option 1: Inline in Hook** (Recommended for simple cases)
```typescript
export function useCategories() {
  return useQuery({
    queryFn: async () => {
      const response = await apiRequest<{ data: CategoryResponse[] }>("/categories");
      // Inline mapping
      return response.data.map(dto => ({
        id: dto.id,
        name: dto.name,
        createdAt: new Date(dto.createdAt),
      }));
    },
  });
}
```

**Option 2: Extracted Mapper** (For complex mapping)
```typescript
// features/category/mappers/category-mapper.ts
export function mapCategoryResponse(dto: CategoryResponse): Category {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

// features/category/hooks/useCategories.ts
import { mapCategoryResponse } from "../mappers/category-mapper";

export function useCategories() {
  return useQuery({
    queryFn: async () => {
      const response = await apiRequest<{ data: CategoryResponse[] }>("/categories");
      return response.data.map(mapCategoryResponse);
    },
  });
}
```

**Guideline**: Start with Option 1, refactor to Option 2 if duplication occurs.

## Comparison with Backend Architecture

### Backend (Correct Use of Repositories)

```
API Handler → Use Case → Repository Interface → Repository Impl → Database
             (business)  (port)                  (adapter)
```

**Why repositories make sense:**
- Abstracts database technology (Prisma, TypeORM, raw SQL)
- Enables switching storage (Postgres → MongoDB)
- Decouples domain from ORM
- Testability via in-memory implementations

### Frontend (No Repository Needed)

```
Component → Hook → API Client → HTTP
           (TanStack Query)
```

**Why repositories don't make sense:**
- Always HTTP (no abstraction needed)
- API contract is fixed (can't switch)
- TanStack Query already handles caching/sync
- Testing via MSW (mock network, not repository)

**Key Insight**: Repositories belong in backend infrastructure layer, not frontend presentation layer.

## Testing Strategy

### Without Repositories (Recommended)

**Component/Integration Tests:**
```typescript
import { render, screen } from "@testing-library/react";
import { server } from "@/test/msw-server";
import { rest } from "msw";

test("displays categories", async () => {
  // Mock API response
  server.use(
    rest.get("/api/categories", (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: [{ id: "1", name: "Test Category" }],
      }));
    })
  );
  
  render(<CategoryList />);
  
  expect(await screen.findByText("Test Category")).toBeInTheDocument();
});
```

**Hook Tests (if needed):**
```typescript
import { renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCategories } from "./useCategories";

test("fetches categories", async () => {
  const { result, waitFor } = renderHook(() => useCategories(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        {children}
      </QueryClientProvider>
    ),
  });
  
  await waitFor(() => result.current.isSuccess);
  expect(result.current.data).toHaveLength(1);
});
```

**Why This Works:**
- MSW intercepts fetch calls (more realistic than mocking repositories)
- Tests actual data flow (network → parsing → rendering)
- No need for mock repository implementations
- Catches DTO mapping bugs

## Migration Path

### Step-by-Step Refactoring

**1. Identify Pattern:**
```typescript
// Current
const repo = new ApiCategoryRepository();
const useCase = new GetCategoriesUseCase(repo);
const result = await useCase.execute({ status });
```

**2. Inline Use Case:**
```typescript
// Step 1: Move use case logic into hook
const repo = new ApiCategoryRepository();
const result = await repo.findAll(status);
```

**3. Inline Repository:**
```typescript
// Step 2: Replace repository with direct API call
const response = await apiRequest<...>(`/categories?status=${status}`);
const result = response.data.map(mapResponse);
```

**4. Clean Up:**
```typescript
// Step 3: Final form
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
```

### Handling Edge Cases

**Error Handling:**
```typescript
queryFn: async () => {
  try {
    const response = await apiRequest<...>("/endpoint");
    return response.data;
  } catch (error) {
    // Let TanStack Query handle it
    throw error;
  }
}
```

**Authentication:**
```typescript
// apiRequest already handles auth headers
export async function apiRequest<T>(endpoint: string, options?: RequestInit) {
  const token = getAuthToken();
  
  return fetch(endpoint, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
}
```

**Pagination:**
```typescript
export function useCategories(page: number, limit: number) {
  return useQuery({
    queryKey: ["categories", { page, limit }],
    queryFn: async () => {
      const response = await apiRequest<PaginatedResponse>(
        `/categories?page=${page}&limit=${limit}`
      );
      return {
        items: response.data.map(mapCategoryResponse),
        pagination: response.pagination,
      };
    },
  });
}
```

## Consistency Check

### Before (Inconsistent)

```typescript
// useTransactions - Direct API calls ✓
export function useTransactions(filters) {
  return useQuery({
    queryFn: () => apiRequest<...>("/transactions"),
  });
}

// useCategories - Repository pattern ✗
const repo = new ApiCategoryRepository();
const useCase = new GetCategoriesUseCase(repo);
export function useCategories() {
  return useQuery({
    queryFn: () => useCase.execute(),
  });
}
```

### After (Consistent)

```typescript
// useTransactions - Direct API calls ✓
export function useTransactions(filters) {
  return useQuery({
    queryFn: () => apiRequest<...>("/transactions"),
  });
}

// useCategories - Direct API calls ✓
export function useCategories() {
  return useQuery({
    queryFn: () => apiRequest<...>("/categories"),
  });
}
```

## Conclusion

Removing the repository layer from the web application:
- ✅ Simplifies architecture (4 layers → 2 layers)
- ✅ Reduces code (15+ files → 3 files)
- ✅ Improves consistency (all hooks use same pattern)
- ✅ Aligns with industry standards (React Query best practices)
- ✅ Maintains testability (MSW for network mocking)
- ✅ Preserves type safety (DTOs from @repo/schema)

This is not a compromise—it's the correct architectural pattern for modern frontend applications.
