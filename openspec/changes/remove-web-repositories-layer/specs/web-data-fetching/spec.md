# Web Data Fetching Architecture

## REMOVED Requirements

### Requirement: WEB-REPO-001 - Repository Pattern in Web Layer
**Context**: The web application previously used a repository pattern borrowed from backend architecture. This pattern is inappropriate for frontend applications as it adds unnecessary abstraction without providing benefits.

**Removed Components**:
- Domain repository interfaces (`features/*/domain/repositories/`)
- Infrastructure repository implementations (`features/*/infrastructure/repositories/`)
- Application use cases that wrap repository calls (`features/*/application/use-cases/`)

**Reason for Removal**:
- Repository pattern is designed for abstracting data persistence layers (databases)
- Frontend only communicates via HTTP - no persistence abstraction needed
- TanStack Query already provides caching and synchronization layer
- Pattern adds cognitive overhead and maintenance burden without value
- Inconsistent with industry best practices for React/Next.js data fetching

#### Scenario: Attempting to create repository in web feature
**Given** a developer is implementing a new web feature  
**When** they attempt to create a repository interface or implementation  
**Then** the pattern should be rejected in code review  
**And** developer should be directed to use direct API calls in hooks

#### Scenario: Refactoring existing repository pattern
**Given** a web feature using repository pattern exists  
**When** the feature is refactored  
**Then** repository interface should be deleted  
**And** repository implementation should be deleted  
**And** use cases wrapping repositories should be deleted  
**And** hooks should call `apiRequest` directly

## ADDED Requirements

### Requirement: WEB-FETCH-001 - Direct API Calls in Hooks
**Context**: Web features should use TanStack Query hooks that make direct HTTP calls via the shared `apiRequest` utility. This creates a clean, simple data flow appropriate for frontend applications.

Web feature hooks MUST call `apiRequest` directly without use case or repository layers. The data flow SHALL be: Component → Hook (TanStack Query) → API Client (apiRequest) → HTTP.

#### Scenario: Implementing data fetching for new feature
**Given** a developer needs to fetch data from an API endpoint  
**When** they implement the feature  
**Then** they must create a TanStack Query hook  
**And** the hook must call `apiRequest` directly  
**And** the hook must not instantiate use cases or repositories  
**And** the queryFn must handle DTO-to-entity mapping if needed

#### Scenario: Query hook with filters
**Given** an API endpoint accepts query parameters  
**When** implementing a query hook with filters  
**Then** filters should be part of the queryKey for cache management  
**And** query parameters should be constructed in the queryFn  
**And** the hook should call `apiRequest` with the constructed URL  
**Example**:
```typescript
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

#### Scenario: Mutation hook with optimistic updates
**Given** a user performs a create/update/delete action  
**When** implementing a mutation hook  
**Then** the hook must use `useMutation` from TanStack Query  
**And** mutationFn must call `apiRequest` with appropriate HTTP method  
**And** onSuccess callback must invalidate affected query cache  
**And** the hook should not involve use cases or repositories  
**Example**:
```typescript
export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await apiRequest<{ data: CategoryResponse }>(
        "/categories",
        {
          method: "POST",
          body: JSON.stringify(data),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
```

### Requirement: WEB-FETCH-002 - DTO Mapping in Hooks
**Context**: When API response structure differs from desired domain entity shape, mapping should occur within the hook. This keeps transformation logic close to the data fetching point.

DTO-to-entity mapping MUST occur within the hook's queryFn or mutationFn. Mapping functions SHALL be defined inline or in a separate mapper file within the feature directory.

#### Scenario: Mapping DTO to domain entity
**Given** an API returns DTOs that need transformation  
**When** implementing a query hook  
**Then** mapping function should be defined near the hook (inline or separate file)  
**And** mapping should occur in the queryFn after API call  
**And** components should receive domain entities, not DTOs  
**Example**:
```typescript
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

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const response = await apiRequest<{ data: CategoryResponse[] }>("/categories");
      return response.data.map(mapCategoryResponse);
    },
  });
}
```

#### Scenario: Simple DTOs without mapping
**Given** API response structure is already suitable for component consumption  
**When** implementing a query hook  
**Then** mapping may be skipped if DTO structure is acceptable  
**And** decision to skip mapping should consider: type safety, date parsing, future flexibility

### Requirement: WEB-FETCH-003 - Query Key Management
**Context**: TanStack Query requires consistent, hierarchical query keys for effective cache management. Keys should be defined using a factory pattern.

Query keys MUST be defined using a hierarchical factory pattern. Each feature SHALL export a query key factory object that defines all query keys for that feature.

#### Scenario: Defining query key factory
**Given** a feature needs multiple related queries  
**When** setting up query hooks  
**Then** a query key factory object must be defined  
**And** factory should use hierarchical structure (parent → child)  
**And** factory should be exported for use across hooks  
**Example**:
```typescript
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: Filters) => [...categoryKeys.lists(), filters] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};
```

#### Scenario: Using query keys in hooks
**Given** a query hook is implemented  
**When** defining the useQuery call  
**Then** queryKey must reference the key factory  
**And** queryKey must include all parameters that affect the query result  
**And** changing any parameter must result in a different cache entry

### Requirement: WEB-FETCH-004 - Error Handling in Data Fetching
**Context**: HTTP errors should be handled consistently using TanStack Query's built-in error mechanisms, not custom try-catch patterns in every hook.

Hook query functions MUST NOT wrap API calls in try-catch blocks. Error handling SHALL be delegated to TanStack Query's built-in error mechanisms and handled at the component level.

#### Scenario: API error in query
**Given** an API endpoint returns an error response  
**When** a query hook calls that endpoint  
**Then** `apiRequest` should throw an error  
**And** TanStack Query should catch the error automatically  
**And** hook should not wrap queryFn in try-catch  
**And** component can access error via `isError` and `error` from useQuery

#### Scenario: API error in mutation
**Given** an API endpoint returns an error response  
**When** a mutation is triggered  
**Then** `apiRequest` should throw an error  
**And** mutation should fail and expose error to component  
**And** component can handle error via mutation.error or onError callback

## MODIFIED Requirements

### Requirement: WEB-ARCH-001 - Web Feature Structure
**Context**: Updated to remove repository and application layers from web features.

Web features MUST NOT include repository interfaces, repository implementations, or application use cases. The feature structure SHALL include only: domain entities/types, components, hooks, and optional mappers.

**Previous Structure**:
```
features/<feature>/
  - domain/
    - entities/
    - repositories/         ← REMOVED
  - application/            ← REMOVED (use cases)
  - infrastructure/
    - repositories/         ← REMOVED
  - components/
  - hooks/
```

**Current Structure**:
```
features/<feature>/
  - domain/
    - entities/
    - types/
  - components/
  - hooks/
  - mappers/                ← OPTIONAL (for DTO mapping)
```

#### Scenario: Creating new web feature
**Given** a developer starts a new feature  
**When** setting up the folder structure  
**Then** they must create: domain/entities, components, hooks  
**And** they must NOT create: domain/repositories, application, infrastructure/repositories  
**And** if DTO mapping is complex, create optional mappers/ directory

#### Scenario: Code review for new feature
**Given** a pull request introduces a new web feature  
**When** reviewing the code  
**Then** reviewer must verify absence of repository pattern  
**And** reviewer must verify hooks use direct API calls  
**And** reviewer must verify consistency with existing patterns (like useTransactions)

### Requirement: WEB-TEST-001 - Testing Data Fetching
**Context**: Testing strategy updated to reflect removal of repositories.

Web feature tests MUST use MSW (Mock Service Worker) to mock HTTP responses. Tests SHALL NOT mock repositories, use cases, or the apiRequest function directly.

**Previous Approach** (with repositories):
- Mock repository implementations in tests
- Test use cases with mocked repositories
- Test hooks with mocked use cases

**Current Approach** (without repositories):
- Use MSW (Mock Service Worker) to mock HTTP responses
- Test components with mocked API responses
- Test hooks (if needed) with QueryClient wrapper

#### Scenario: Testing component with data fetching
**Given** a component uses a query hook  
**When** writing tests for the component  
**Then** tests must use MSW to mock API endpoints  
**And** tests must not mock hooks or repositories  
**And** tests should verify component behavior with real data flow  
**Example**:
```typescript
import { server } from "@/test/msw-server";
import { rest } from "msw";

test("displays categories", async () => {
  server.use(
    rest.get("/api/categories", (req, res, ctx) => {
      return res(ctx.json({
        success: true,
        data: [{ id: "1", name: "Test" }],
      }));
    })
  );
  
  render(<CategoryList />);
  expect(await screen.findByText("Test")).toBeInTheDocument();
});
```

#### Scenario: Testing hook directly (if necessary)
**Given** complex hook logic needs isolated testing  
**When** writing hook tests  
**Then** use `renderHook` with QueryClientProvider wrapper  
**And** use MSW to mock API responses  
**And** avoid mocking apiRequest directly (test real flow)

## Related Specifications

- **Backend Repository Pattern**: Backend (API) should continue using repository pattern as it abstracts database access
- **Shared Schema**: Continue using `@repo/schema` for DTOs/contracts shared between API and web
- **TanStack Query Configuration**: Ensure QueryClient is properly configured in root layout

## Migration Notes

### For Existing Features

1. **Category Feature**: Refactor to remove repositories and use cases
2. **Auth Feature**: Refactor to remove repositories and use cases  
3. **Transaction Feature**: Already follows correct pattern (no changes needed)
4. **Future Features**: Must follow new pattern from the start

### Breaking Changes

None - this is internal refactoring that maintains the same public API for components.

### Rollout Strategy

- Refactor features one at a time
- Start with category (most complete example)
- Validate each refactor before proceeding
- Update documentation concurrently

## Documentation Updates Required

- `.github/instructions/03-web-nextjs.md.instructions.md` - Add anti-pattern warnings
- `docs/ARCHITECTURE-QUICK-REFERENCE.md` - Update web architecture section
- `docs/APPLICATION-DOCUMENTATION.md` - Update data flow diagrams
- `apps/web/README.md` - Add data fetching examples
