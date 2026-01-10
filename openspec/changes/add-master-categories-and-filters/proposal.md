# Change Proposal: Master Transaction Categories & Category Filtering

**Change ID**: `add-master-categories-and-filters`  
**Status**: DRAFT  
**Created**: 2026-01-09  
**Author**: AI Assistant  

---

## Overview

### Problem Statement
Currently, the system has a basic category feature but lacks:
1. **Master category management** - A comprehensive system for managing transaction categories with CRUD operations
2. **Category filtering on transactions** - Users cannot filter transactions by category in the transaction list view

This limits users' ability to organize and analyze their financial transactions effectively.

### Proposed Solution
**Implementation Target**: Both **API (Backend)** and **Web (Frontend)** applications

Implement two complementary capabilities:

1. **Master Category Management** - Full CRUD operations for transaction categories with:
   - List all categories with status/search filtering
   - Create new categories with name/description
   - Update existing categories (name, description, status)
   - Delete categories (with validation for existing transaction references)
   - Status management (ACTIVE/INACTIVE)

2. **Transaction Category Filtering** - Enhanced transaction query with:
   - Filter by single category ID
   - Filter by multiple category IDs
   - Combine with existing filters (date range, budget owner, etc.)
   - Proper validation and error handling

### Success Criteria
**API (Backend)**:
- ✅ Category CRUD API endpoints fully functional
- ✅ Transaction filter API supports category filtering (single + multiple)
- ✅ Category endpoints follow Clean Architecture principles
- ✅ All operations properly validated and error-handled
- ✅ Database relationships properly enforced

**Web (Frontend)**:
- ✅ Users can manage categories through Web UI (create, edit, delete, list)
- ✅ Transaction list page has category filter UI
- ✅ Category filter works with existing transaction filters
- ✅ Category select dropdown populated from API
- ✅ Multi-category filter support in UI

### Impact Assessment
**Scope**: Medium  
**Complexity**: Low-Medium  
**Risk**: Low  

**Affected Systems**:
- **API Backend** (`apps/api`):
  - `modules/category` (exists, verify and enhance CRUD completeness)
  - `modules/transaction` (add category filtering to query handler)
- **Web Frontend** (`apps/web`):
  - `features/category` (NEW - full category management UI)
  - `features/transaction` (ENHANCE - add category filter to list view)
- **Shared Packages**:
  - `@repo/schema` (category & transaction validation schemas)

**Dependencies**:
- Existing category entity and repository
- Existing transaction query system
- Prisma schema (Category model already exists)

### Alternatives Considered
1. **Tags instead of categories** - Rejected: more complex, overkill for current needs
2. **Hierarchical categories** - Deferred: can be added later if needed
3. **Category-based budgeting** - Out of scope: separate feature

---

## Architectural Decisions

### Design Philosophy
Follow existing patterns in the codebase:
- Clean Architecture with DDD
- Bounded contexts (no cross-feature imports)
- Pure domain layer (no external dependencies)
- Validation at boundaries (Zod schemas)
- DI for use cases

### Key Design Decisions

#### 1. Category as Independent Bounded Context
**Decision**: Keep category module independent from transaction  
**Rationale**: 
- Categories are a master data concept
- Transaction depends on category (one-way dependency)
- Easier to extend categories later (hierarchies, colors, icons)

#### 2. Soft Delete vs Hard Delete
**Decision**: Hard delete with validation  
**Rationale**:
- Check for transaction references before delete
- Throw error if category is in use
- Simpler data model, clearer semantics
- Can add soft delete later if audit requirements emerge

#### 3. Multiple Category Filter Support
**Decision**: Support filtering by array of category IDs  
**Rationale**:
- More flexible for users (OR condition)
- Common pattern in finance apps
- Easy to implement with `IN` clause
- Backward compatible (single ID still works)

#### 4. Category Status Handling
**Decision**: Allow INACTIVE categories on transactions  
**Rationale**:
- Historical transactions should keep their category
- Status only affects new transaction creation
- Users can reactivate if needed

---

## Implementation Scope

### In Scope

**API (Backend) Implementation**:
1. ✅ Category CRUD API endpoints (verify and enhance if needed)
2. ✅ Category listing with filters (status, search)
3. ✅ Transaction query enhancement (add category filter support)
4. ✅ Category delete validation (check transaction references)
5. ✅ Error handling for category constraints

**Web (Frontend) Implementation**:
6. ✅ Category management page/UI (list, create, edit, delete)
7. ✅ Category form components (create/edit)
8. ✅ Transaction list category filter UI (dropdown/multi-select)
9. ✅ Category filter integration with existing transaction filters
10. ✅ TanStack Query hooks for category operations

**Shared**:
11. ✅ Schema validation updates (`@repo/schema`)
12. ✅ Type definitions and contracts

### Out of Scope
- ❌ Category hierarchies (parent/child)
- ❌ Category colors/icons
- ❌ Category-based budgeting
- ❌ Bulk category operations
- ❌ Category templates
- ❌ Category analytics

---

## Technical Approach

### API Changes

#### Category Module (Enhancement)
Current state: Basic CRUD exists, verify completeness

**Endpoints**:
```
GET    /categories              # List with filters
GET    /categories/:id          # Get single
POST   /categories              # Create
PUT    /categories/:id          # Update
DELETE /categories/:id          # Delete (with validation)
```

**Validations**:
- Name required, unique, min 1 char
- Status enum: ACTIVE | INACTIVE
- Cannot delete category with transactions

#### Transaction Module (Filter Enhancement)
**Endpoint**: `GET /transactions`

**Query Parameters** (additions):
```typescript
{
  categoryId?: string;           // Single category (backward compat)
  categoryIds?: string[];        // Multiple categories (new)
  // ... existing filters
}
```

**Logic**:
- If `categoryIds` provided, use array filter (OR condition)
- If `categoryId` provided, convert to single-item array
- Combine with existing filters (AND condition)

### Web Changes

#### New Feature: `features/category`
**Structure**:
```
features/category/
  domain/
    entities/category.ts
    constants.ts
  application/
    use-cases/
  components/
    CategoryList.tsx
    CategoryForm.tsx
    CategoryCard.tsx
    CategoryManagementContainer.tsx
  hooks/
    useCategories.ts
    useCreateCategory.ts
    useUpdateCategory.ts
    useDeleteCategory.ts
```

#### Enhanced Feature: `features/transaction`
**Updates**:
- Add category filter to transaction list
- Category select dropdown (fetch from categories API)
- Multi-select support for category filter
- Clear filter button

### Schema Changes

#### `@repo/schema/src/category/index.ts`
Already exists, verify completeness:
- ✅ CreateCategoryRequestSchema
- ✅ UpdateCategoryRequestSchema
- ✅ CategoryResponseSchema
- ✅ GetCategoriesQuerySchema

#### `@repo/schema/src/transaction/index.ts`
**Updates**:
```typescript
export const GetTransactionsQuerySchema = z.object({
  // ... existing fields
  categoryId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
});
```

---

## Migration & Rollout

### Database Migration
**Not Required** - Category table already exists with proper relationships

### API Versioning
**Not Required** - Backward compatible additions

### Rollout Plan

**Phase 1: API Backend** (Category Module)
1. Verify/enhance category CRUD endpoints
2. Add category listing filters (status, search)
3. Implement category delete validation
4. Update error handling

**Phase 2: API Backend** (Transaction Module)
1. Add category filter to transaction query handler
2. Support single and multiple category IDs
3. Update transaction repository filter logic
4. Test filter combinations

**Phase 3: Web Frontend** (Category Feature)
1. Create category management feature structure
2. Implement category list page/container
3. Build category form components
4. Add TanStack Query hooks for CRUD operations
5. Implement delete confirmation flow

**Phase 4: Web Frontend** (Transaction Filter)
1. Add category filter UI to transaction list
2. Implement category select dropdown
3. Support multi-category selection
4. Integrate with existing filters
5. Update transaction list query hooks

**Phase 5: Testing & Validation**
1. Unit tests (API use cases, Web components)
2. Integration tests (API endpoints)
3. E2E tests (Web flows)
4. Performance validation

---

## Testing Strategy

### API Backend Tests

**Unit Tests**:
- Category use cases (create, update, delete, list)
- Transaction filter logic with category params
- Category delete validation logic
- Schema validation rules

**Integration Tests**:
- Category CRUD API endpoints
- Transaction filter endpoint with category params
- Category delete with transaction constraint
- Error handling scenarios

### Web Frontend Tests

**Component Tests**:
- CategoryList component
- CategoryForm component
- Category filter dropdown
- Multi-select category filter

**Hook Tests**:
- useCategories hook
- useCreateCategory hook
- useUpdateCategory hook
- useDeleteCategory hook
- Transaction filter hooks with category

**E2E Tests**:
- Complete category CRUD flow in browser
- Filter transactions by single category
- Filter transactions by multiple categories
- Combine category filter with other filters
- Delete category with validation error handling

---

## Risks & Mitigations

### Risk 1: Category in Use Cannot Be Deleted
**Mitigation**: Clear error message, suggest setting to INACTIVE instead

### Risk 2: Performance with Large Category Lists
**Mitigation**: Pagination on category list, simple search

### Risk 3: Category Filter Performance
**Mitigation**: Database index on `categoryId` (already exists), limit array size

---

## Documentation Updates

### API Documentation
- Category endpoints specification
- Transaction filter query parameters
- Error codes for category operations

### User Guide
- How to manage categories
- How to filter transactions by category
- Category best practices

---

## Open Questions
1. Should we limit the number of categories a user can create?
2. Do we need category sorting (order field)?
3. Should inactive categories be hidden in transaction forms?
4. Do we want category usage statistics (transaction count)?

---

## Related Changes
- None (this is a new feature addition)

---

## Approval
- [ ] Product Owner
- [ ] Tech Lead
- [ ] Security Review (N/A - standard CRUD)
