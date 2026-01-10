# Proposal: Remove Repository Layer from Web Application

## Why

The web application currently uses a backend-style repository pattern that adds unnecessary complexity without providing value. This architectural mismatch creates maintenance burden and violates project conventions.

**Core Problem**: Repository pattern is designed for abstracting data persistence layers (databases), but frontend only communicates via HTTP. There's no persistence layer to abstract.

**Impact of Current Pattern**:
- 15+ extra files per feature
- 4 unnecessary layers between component and HTTP call
- Cognitive overhead understanding abstractions
- Inconsistency (`useTransactions` already uses direct API calls)
- Violates `.github/instructions/03-web-nextjs.md` conventions

**Why Change Now**:
- Prevents pattern from spreading to more features
- Aligns with industry best practices (React Query documentation, Vercel examples)
- Simplifies onboarding and maintenance
- Improves code readability and debuggability

## Context

The current web application (`apps/web`) violates Clean Architecture principles and project conventions by implementing a repository pattern that is inappropriate for a frontend presentation layer. The web app currently has:

1. **Domain repository interfaces** (`features/*/domain/repositories/`)
2. **Infrastructure repository implementations** (`features/*/infrastructure/repositories/`)
3. **Application use cases** that depend on these repositories
4. **Hooks** that instantiate repositories and use cases

This pattern is borrowed from backend architecture but is unsuitable for frontend because:
- Frontend doesn't have data persistence layer to abstract
- Repository pattern adds unnecessary complexity and indirection
- TanStack Query already provides caching, synchronization, and state management
- Direct HTTP calls via `apiRequest` are simpler and more appropriate for frontend

## Problem Statement

**Current Issues:**
1. **Architectural Mismatch**: Repository pattern is backend-specific, not needed for HTTP clients
2. **Over-Engineering**: Three layers (domain interface → infrastructure impl → use case → hook) where one would suffice (hook → API client)
3. **Maintenance Burden**: More files, more abstractions, harder to understand and modify
4. **Inconsistency**: `useTransactions` hook already follows the correct pattern (direct API calls), while `useCategories` and `useAuth` use repositories
5. **Violation of Conventions**: Per `.github/instructions/03-web-nextjs.md`, web layer should use TanStack Query with direct API calls, not repositories

**Affected Features:**
- `features/auth` - Has `HttpAuthRepository` and auth use cases
- `features/category` - Has `ApiCategoryRepository` and category use cases
- Documentation in `docs/` referencing repository pattern for web

## Proposed Solution

**Remove repository and application layers from web, simplify to direct API calls in hooks:**

### Current Pattern (Over-Engineered)
```
Hook → Use Case → Repository → API Client → HTTP
```

### Target Pattern (Simplified)
```
Hook → API Client (apiRequest) → HTTP
```

### Changes Required

1. **Delete** domain repository interfaces:
   - `features/auth/domain/repositories/auth-repository.ts`
   - `features/category/domain/repositories/category-repository.ts`

2. **Delete** infrastructure repository implementations:
   - `features/auth/infrastructure/http-auth.repository.ts`
   - `features/category/infrastructure/repositories/api-category.repository.ts`

3. **Delete** application use cases (frontend doesn't need these):
   - `features/auth/application/use-cases/login.use-case.ts`
   - `features/auth/application/use-cases/logout.use-case.ts`
   - `features/category/application/use-cases/*.use-case.ts`

4. **Refactor** hooks to call `apiRequest` directly:
   - `features/auth/hooks/use-auth.ts`
   - `features/category/hooks/useCategories.ts`

5. **Update** documentation:
   - `docs/ARCHITECTURE-QUICK-REFERENCE.md`
   - `docs/APPLICATION-DOCUMENTATION.md`
   - Any other docs mentioning web repositories

6. **Keep** domain entities and types (these are still valid):
   - `features/*/domain/entities/`
   - `features/*/domain/types/`

### Example: Category Hook Refactor

**Before (Over-Engineered):**
```typescript
// domain/repositories/category-repository.ts
export interface CategoryRepository {
  findAll(status?: CategoryStatus): Promise<Category[]>;
}

// infrastructure/repositories/api-category.repository.ts
export class ApiCategoryRepository implements CategoryRepository {
  async findAll(status?: CategoryStatus): Promise<Category[]> {
    const response = await apiRequest<...>(`/categories${query}`);
    return response.data.map(this.mapResponse);
  }
}

// application/use-cases/get-categories.use-case.ts
export class GetCategoriesUseCase {
  constructor(private repo: CategoryRepository) {}
  async execute(query: { status?: CategoryStatus }): Promise<Category[]> {
    return this.repo.findAll(query.status);
  }
}

// hooks/useCategories.ts
const categoryRepository = new ApiCategoryRepository();
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

export function useCategories(status?: CategoryStatus) {
  return useQuery({
    queryKey: categoryKeys.list(status),
    queryFn: () => getCategoriesUseCase.execute({ status }),
  });
}
```

**After (Simplified):**
```typescript
// hooks/useCategories.ts
import { apiRequest } from "@/lib/api-client";
import type { CategoryResponse } from "@repo/schema/category";
import type { Category } from "../domain/entities/category";

function mapCategoryResponse(dto: CategoryResponse): Category {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

export function useCategories(status?: CategoryStatus) {
  const query = status ? `?status=${status}` : "";
  
  return useQuery({
    queryKey: categoryKeys.list(status),
    queryFn: async () => {
      const response = await apiRequest<{ success: boolean; data: CategoryResponse[] }>(
        `/categories${query}`
      );
      return response.data.map(mapCategoryResponse);
    },
  });
}
```

## Benefits

1. **Simplicity**: Reduces ~15+ files to ~2 files per feature
2. **Clarity**: Direct, obvious data flow from hook to API
3. **Consistency**: Aligns with `useTransactions` pattern and project conventions
4. **Maintainability**: Fewer abstractions = easier to understand and modify
5. **Performance**: Eliminates unnecessary object instantiation and method calls
6. **Standards Compliance**: Matches Next.js/React best practices for data fetching

## Migration Strategy

1. ✅ Start with `category` feature (has most complete example)
2. ✅ Apply to `auth` feature
3. ✅ Update documentation
4. ✅ Verify `useTransactions` already follows correct pattern (no changes needed)
5. ✅ Apply pattern to any future features

## Risks & Mitigation

**Risk**: Loss of testability with tight coupling to `apiRequest`  
**Mitigation**: `apiRequest` can still be mocked via MSW for integration tests; unit testing hooks is anti-pattern anyway (test components instead)

**Risk**: Code duplication of mapping logic  
**Mitigation**: Mapping functions can be extracted to shared utilities if duplication becomes significant

**Risk**: No abstraction for changing API implementation  
**Mitigation**: Frontend always calls HTTP APIs; if API contract changes, both backend AND frontend must change anyway; repository abstraction provides no real benefit

## Success Criteria

- [ ] All domain repository interfaces deleted
- [ ] All infrastructure repository implementations deleted
- [ ] All frontend application use cases deleted
- [ ] Hooks refactored to use `apiRequest` directly
- [ ] Documentation updated to reflect correct pattern
- [ ] All existing tests passing
- [ ] No regression in functionality
- [ ] Code is simpler and easier to understand

## Open Questions

1. Should we keep domain entities, or also simplify to just using DTOs from `@repo/schema`?
   - **Recommendation**: Keep entities for now, as they provide type safety and domain-specific behavior

2. Should mapping logic be extracted to separate files?
   - **Recommendation**: Keep inline unless duplication becomes significant (YAGNI principle)

## Timeline

- **Proposal & Review**: 1 day
- **Implementation**: 1-2 days
- **Testing & Documentation**: 1 day
- **Total**: 3-4 days
