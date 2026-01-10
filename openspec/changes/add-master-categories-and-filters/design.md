# Design Document: Master Categories & Transaction Filtering

**Change ID**: `add-master-categories-and-filters`  
**Created**: 2026-01-09  
**Status**: DRAFT  

---

## Context & Goals

### Business Context
Finance applications require effective categorization of transactions for:
- Expense tracking and analysis
- Budget planning by category
- Financial reporting and insights
- Tax preparation (category-based deductions)

Currently, while categories exist in the data model, the system lacks:
1. Comprehensive category management capabilities
2. Transaction filtering by category

### Technical Goals
1. Implement full CRUD operations for categories
2. Enable transaction queries by single or multiple categories
3. Maintain Clean Architecture and DDD principles
4. Ensure backward compatibility with existing code
5. Optimize for performance with large datasets

---

## High-Level Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Web Application                     │
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   Category UI    │         │  Transaction UI  │     │
│  │  - Management    │         │  - List + Filter │     │
│  │  - CRUD Forms    │         │  - Category Sel. │     │
│  └────────┬─────────┘         └────────┬─────────┘     │
│           │                             │               │
│           │   TanStack Query Hooks      │               │
│           └──────────┬──────────────────┘               │
│                      │                                  │
└──────────────────────┼──────────────────────────────────┘
                       │ HTTP/REST
                       │
┌──────────────────────┼──────────────────────────────────┐
│                  API Server (Elysia)                     │
│                      │                                  │
│  ┌───────────────────▼─────────┐  ┌──────────────────┐ │
│  │   Category Module           │  │ Transaction Mod. │ │
│  │  (Bounded Context)          │  │ (Bounded Ctxt)   │ │
│  │                             │  │                  │ │
│  │  Delivery ──→ Application   │  │ Delivery ──→ App │ │
│  │                ↓            │  │            ↓     │ │
│  │            Domain           │  │         Domain   │ │
│  │                ↑            │  │            ↑     │ │
│  │         Infrastructure      │  │     Infrastructure│ │
│  └─────────────┬───────────────┘  └─────────┬────────┘ │
│                │                             │          │
└────────────────┼─────────────────────────────┼──────────┘
                 │                             │
                 └──────────┬──────────────────┘
                            │
                 ┌──────────▼──────────┐
                 │   PostgreSQL DB     │
                 │                     │
                 │  ┌───────────────┐  │
                 │  │  Categories   │  │
                 │  ├───────────────┤  │
                 │  │ Transactions  │◄─┤─ FK: categoryId
                 │  └───────────────┘  │
                 └─────────────────────┘
```

### Module Relationships

**Independent Bounded Contexts**:
- `category` module - Master data management
- `transaction` module - Transaction operations

**Relationship**:
- Transaction depends on Category (via categoryId foreign key)
- No code-level imports between modules
- Referential integrity enforced at database level

---

## Architectural Decisions

### ADR-001: Category as Independent Module

**Status**: ACCEPTED  

**Context**:  
Categories could be implemented as:
1. Part of transaction module (tightly coupled)
2. Shared package (cross-cutting concern)
3. Independent bounded context (separate module)

**Decision**: Implement as independent bounded context

**Rationale**:
- Categories are a master data concept with their own lifecycle
- Transaction depends on category, not the reverse (one-way dependency)
- Easier to extend categories independently (hierarchies, colors, icons)
- Aligns with DDD principle of bounded contexts
- Maintains Clean Architecture (no circular dependencies)

**Consequences**:
- ✅ Clear separation of concerns
- ✅ Independent testing and deployment
- ✅ Easier to add category features without touching transactions
- ⚠️ Need to manage referential integrity across modules
- ⚠️ Cannot import category types in transaction domain (use primitives)

---

### ADR-002: Category Delete Validation Strategy

**Status**: ACCEPTED  

**Context**:  
When deleting a category, we need to handle existing transaction references:
1. **Cascade delete** - Delete all transactions with that category
2. **Soft delete** - Mark category as deleted but keep data
3. **Prevent delete** - Block deletion if references exist
4. **Nullify references** - Set categoryId to null on transactions

**Decision**: Prevent delete with validation

**Rationale**:
- Cascade delete is dangerous (data loss)
- Soft delete adds complexity (need to filter deleted everywhere)
- Nullify breaks data integrity (category is required field)
- Prevention is safest and clearest for users
- Users can set category to INACTIVE if not needed

**Consequences**:
- ✅ No accidental data loss
- ✅ Clear error message guides users
- ✅ Simple implementation (count query + validation)
- ⚠️ Users must manually update transactions before deleting category
- ⚠️ May accumulate unused INACTIVE categories over time

**Alternative Considered**: Soft delete  
**Why Rejected**: Adds complexity without clear benefit. Can be added later if audit requirements emerge.

---

### ADR-003: Multiple Category Filter Implementation

**Status**: ACCEPTED  

**Context**:  
Transaction filtering by category could support:
1. Single category only (categoryId)
2. Multiple categories with OR logic (categoryIds array)
3. Multiple categories with AND logic (requires many-to-many)
4. Category hierarchy navigation

**Decision**: Support both single and multiple (OR logic)

**Rationale**:
- Single filter already exists (backward compatible)
- Multiple with OR is common use case ("show Food OR Transport")
- AND logic requires many-to-many relationship (out of scope)
- Hierarchy navigation can be added later if needed
- Simple to implement with SQL IN clause

**Consequences**:
- ✅ Backward compatible (single categoryId still works)
- ✅ Flexible for users (multiple selections)
- ✅ Easy to implement and test
- ⚠️ Need to prevent both filters simultaneously (mutual exclusion)
- ⚠️ Array size limit needed (prevent abuse)

**Implementation Detail**:
```typescript
// Priority logic in use case
if (query.categoryIds && query.categoryIds.length > 0) {
  filters.categoryIds = query.categoryIds; // Use array
} else if (query.categoryId) {
  filters.categoryId = query.categoryId;  // Use single
}

// Repository translates to SQL
WHERE categoryId IN (...) OR categoryId = ?
```

---

### ADR-004: Category Status Enum

**Status**: ACCEPTED  

**Context**:  
Category status could be:
1. Simple boolean (active/inactive)
2. Enum with two values (ACTIVE/INACTIVE)
3. Enum with multiple values (ACTIVE/INACTIVE/ARCHIVED/DELETED)
4. Status with workflow transitions

**Decision**: Enum with ACTIVE/INACTIVE only

**Rationale**:
- Matches existing pattern in codebase (BudgetOwner, User status)
- More explicit than boolean (clearer semantics)
- Extensible (can add ARCHIVED later if needed)
- Simple enough (no complex workflow required)
- Type-safe in TypeScript/Prisma

**Consequences**:
- ✅ Consistent with codebase patterns
- ✅ Type-safe and validated
- ✅ Easy to extend in future
- ✅ Clear semantics (vs. "isActive" boolean)

---

### ADR-005: No Cross-Module Imports

**Status**: ACCEPTED  

**Context**:  
Transaction module needs to reference categories:
1. Import Category entity from category module
2. Import Category type/interface from shared package
3. Use primitive categoryId (string UUID) only
4. Create duplicate Category type in transaction module

**Decision**: Use primitive categoryId only

**Rationale**:
- Aligns with Clean Architecture (dependencies inward only)
- Transaction domain should not depend on category domain
- categoryId is sufficient for transaction operations
- Category details fetched separately when needed (lazy loading)
- Prevents circular dependencies and tight coupling

**Consequences**:
- ✅ Clean separation of bounded contexts
- ✅ No circular dependencies
- ✅ Independent module evolution
- ⚠️ Need separate API call to get category details
- ⚠️ Cannot validate category existence in transaction domain (done at application layer)

**Pattern**:
```typescript
// Transaction Domain (GOOD)
class Transaction {
  categoryId: string; // Primitive only
}

// Application layer validates category exists
class CreateTransactionUseCase {
  async execute(command: CreateCommand) {
    // Optionally validate category exists via category repository
    // But transaction domain remains pure
  }
}
```

---

### ADR-006: Schema Validation at Boundaries

**Status**: ACCEPTED  

**Context**:  
Validation could happen at:
1. Domain layer (entity constructors)
2. Application layer (use cases)
3. Delivery layer (HTTP routes)
4. Multiple layers (redundant validation)

**Decision**: Zod validation at delivery, business rules in domain

**Rationale**:
- Zod schemas define contract at API boundary (single source of truth)
- Domain enforces business invariants (pure TypeScript)
- Separation of concerns: structure validation vs. business rules
- Follows project's established pattern

**Consequences**:
- ✅ Clear separation of concerns
- ✅ Zod schemas shared between API and Web
- ✅ Domain remains pure (no Zod dependency)
- ⚠️ Some validation duplicated (e.g., name required)

**Example**:
```typescript
// Delivery: Structure validation
const schema = z.object({
  name: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

// Domain: Business rules
class Category {
  constructor(name: string) {
    if (name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }
    // Enforce domain invariants
  }
}
```

---

## Data Model

### Database Schema

```prisma
model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  status      Status   @default(ACTIVE)  // Enum: ACTIVE | INACTIVE
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  transactions Transaction[]

  @@map("categories")
  @@index([status])
}

model Transaction {
  // ... existing fields
  categoryId  String   @map("category_id")
  category    Category @relation(fields: [categoryId], references: [id])
  
  @@map("transactions")
  @@index([categoryId])  // Important for filter performance
}
```

**Key Points**:
- `name` is unique constraint (enforced at DB level)
- `status` indexed for efficient filtering
- `categoryId` indexed for transaction queries
- Foreign key relationship for referential integrity

---

## API Design

### Category Endpoints

**Base Path**: `/categories`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | List all categories | ✅ |
| GET | `/categories/:id` | Get single category | ✅ |
| POST | `/categories` | Create category | ✅ Admin |
| PUT | `/categories/:id` | Update category | ✅ Admin |
| DELETE | `/categories/:id` | Delete category | ✅ Admin |

**Query Parameters** (GET `/categories`):
- `status`: Filter by ACTIVE or INACTIVE
- `search`: Text search on name (case-insensitive)

**Request/Response Examples**:

```typescript
// POST /categories - Create
Request:
{
  "name": "Food & Beverages",
  "description": "All food and drink expenses"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Food & Beverages",
    "description": "All food and drink expenses",
    "status": "ACTIVE",
    "createdAt": "2026-01-09T10:30:00Z",
    "updatedAt": "2026-01-09T10:30:00Z"
  }
}

// DELETE /categories/:id - Error when in use
Response: 400 Bad Request
{
  "success": false,
  "error": {
    "code": "INVALID_OPERATION",
    "message": "Kategori tidak dapat dihapus karena masih digunakan pada transaksi"
  }
}
```

### Transaction Filter Enhancement

**Endpoint**: `GET /transactions`

**New Query Parameters**:
- `categoryId`: Single category UUID (existing, unchanged)
- `categoryIds`: Array of category UUIDs (new)

**Validation Rules**:
- Both `categoryId` and `categoryIds` cannot be provided simultaneously
- All UUIDs must be valid format
- Array size limited to 50 items

**Request Examples**:

```http
# Single category
GET /transactions?categoryId=550e8400-e29b-41d4-a716-446655440000

# Multiple categories
GET /transactions?categoryIds=550e8400-e29b-41d4-a716-446655440000,660e8400-e29b-41d4-a716-446655440001

# Combined filters
GET /transactions?categoryIds=cat1,cat2&budgetOwnerId=owner1&startDate=2026-01-01&endDate=2026-01-31

# With pagination
GET /transactions?categoryId=cat1&page=1&limit=20
```

---

## Performance Considerations

### Database Indexes

**Existing**:
```sql
CREATE INDEX idx_categories_status ON categories(status);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
```

**Query Optimization**:
- Category list: Use status index for filtering
- Transaction filter: Use categoryId index for single/multiple filter
- Combined filters: Database query planner optimizes automatically

**Expected Performance**:
- Category list: < 100ms for 1000 categories
- Transaction filter: < 200ms for 100K transactions
- Combined filters: < 300ms (multiple indexes)

### Caching Strategy (Future)

**Not implemented in this change, but designed for**:
- Category list rarely changes (good cache candidate)
- Cache at API layer with short TTL (5 minutes)
- Invalidate cache on create/update/delete operations
- Transaction queries not cached (real-time data)

---

## Security Considerations

### Authentication & Authorization

**Current State**:
- All endpoints require authentication
- Role-based access not yet implemented

**Future Enhancement** (Out of scope):
- Category management (POST/PUT/DELETE) restricted to SUPER_ADMIN
- Category viewing (GET) available to all authenticated users
- Transaction filtering follows existing authorization rules

### Input Validation

**Protections**:
- UUID format validation (prevents injection)
- Array size limits (prevents DoS)
- String length limits on name/description
- Enum validation for status

### Error Messages

**Security Principle**: Don't leak internal details

**Good** ✅:
- "Kategori tidak ditemukan" (404)
- "Kategori dengan nama ini sudah ada" (409)

**Bad** ❌:
- "Database connection failed: host unreachable"
- "Prisma error: Unique constraint violation on field 'name'"

---

## Testing Strategy

### Unit Tests

**Category Module**:
- ✅ Use case logic (CRUD operations)
- ✅ Domain entity invariants
- ✅ Delete validation logic
- ✅ Name uniqueness check

**Transaction Module**:
- ✅ Filter logic (single/multiple)
- ✅ Filter priority (categoryIds over categoryId)
- ✅ Combined filter logic

### Integration Tests

**API Tests**:
- ✅ Full CRUD flow for categories
- ✅ Transaction filtering by category
- ✅ Category delete with transaction constraint
- ✅ Error scenarios (404, 409, 400)

### E2E Tests (Web)

**Category Management**:
- ✅ Create/edit/delete category flow
- ✅ Category list with filters
- ✅ Error handling

**Transaction Filtering**:
- ✅ Apply category filter
- ✅ Multi-select categories
- ✅ Combine with other filters
- ✅ Clear filters

---

## Migration & Rollout

### Database Migration

**Not Required**:
- Category table already exists
- Transaction.categoryId already exists
- Indexes already present

**Verification**:
```sql
-- Verify foreign key exists
SELECT * FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_name = 'transactions'
  AND constraint_name LIKE '%category%';

-- Verify indexes
SELECT * FROM pg_indexes 
WHERE tablename IN ('categories', 'transactions');
```

### Deployment Plan

**Phase 1: API** (Can deploy independently)
1. Deploy category API enhancements
2. Deploy transaction filter enhancement
3. Run smoke tests
4. Monitor error logs

**Phase 2: Web** (Requires Phase 1 deployed)
1. Deploy category management UI
2. Deploy transaction filter UI
3. Run E2E tests in production
4. Monitor user feedback

**Rollback Plan**:
- API changes are additive (backward compatible)
- Web rollback: remove new UI, fallback to old behavior
- No database migration to rollback

---

## Monitoring & Observability

### Metrics to Track

**API Metrics**:
- Category CRUD operation counts
- Transaction filter query counts
- Query response times (p50, p95, p99)
- Error rates by endpoint

**Business Metrics**:
- Number of categories created
- Most used categories (transaction count)
- Filter usage patterns

### Logging

**Info Level**:
- Category created/updated/deleted (with id)
- Transaction queries with filters applied

**Error Level**:
- Delete validation failures
- Duplicate category attempts
- Database errors

**Example Log**:
```json
{
  "level": "info",
  "timestamp": "2026-01-09T10:30:00Z",
  "message": "Category created",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "categoryName": "Food",
  "userId": "user-123"
}
```

---

## Future Enhancements (Out of Scope)

### Category Hierarchies
- Parent-child relationships
- Subcategory support
- Breadcrumb navigation

### Category Customization
- Custom colors/icons
- User-specific categories
- Category templates

### Category Analytics
- Spending by category charts
- Category budgets
- Trend analysis

### Bulk Operations
- Bulk category creation
- Bulk transaction re-categorization
- Import/export categories

---

## Open Questions & Decisions Needed

### 1. Category Limit per User/System?
**Question**: Should we limit the number of categories?  
**Options**:
- No limit (trust users)
- Soft limit (e.g., 100) with warning
- Hard limit enforced at API

**Recommendation**: Start with no limit, add warning at 50+

### 2. Category Sorting/Ordering?
**Question**: Should categories have custom sort order?  
**Options**:
- Alphabetical only (current)
- Add `displayOrder` field
- User-defined sorting

**Recommendation**: Alphabetical for now, add ordering field in future if requested

### 3. INACTIVE Categories in Transaction Forms?
**Question**: Should INACTIVE categories appear in transaction creation dropdown?  
**Options**:
- Hide completely (recommended)
- Show but disabled
- Show with warning

**Recommendation**: Hide from dropdowns, but allow viewing in existing transactions

### 4. Category Usage Statistics?
**Question**: Should we show transaction count per category?  
**Options**:
- No statistics (simple)
- Transaction count only
- Amount totals, trends, etc.

**Recommendation**: Start without, add in future "Category Analytics" feature

---

## References

### Related Documentation
- [Clean Architecture Guidelines](.github/instructions/01-architecture-and-boundaries.md)
- [API Structure](.github/instructions/04-api-elysia.md)
- [Web Structure](.github/instructions/03-web-nextjs.md)

### External Resources
- [Prisma Foreign Keys](https://www.prisma.io/docs/concepts/components/prisma-schema/relations/referential-actions)
- [Zod Validation](https://zod.dev/)
- [TanStack Query](https://tanstack.com/query/latest)
