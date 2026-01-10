# Change Proposal: Master Transaction Categories & Filters

**Status**: ✅ VALIDATED - Ready for Review  
**Change ID**: `add-master-categories-and-filters`  
**Created**: January 9, 2026  

---

## 📋 Quick Summary

This change proposal adds comprehensive category management and transaction filtering capabilities to the Finance Dashboard application.

### What's Being Added?

1. **Master Category Management**
   - Full CRUD operations for transaction categories
   - List/search categories with status filter
   - Validation to prevent deletion of categories in use

2. **Transaction Category Filtering**
   - Filter transactions by single or multiple categories
   - Combine with existing filters (date, budget owner, etc.)
   - Web UI with category multi-select dropdown

---

## 📁 Proposal Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [proposal.md](./proposal.md) | High-level overview, problem statement, solution approach | ✅ Complete |
| [tasks.md](./tasks.md) | Detailed implementation tasks (21 tasks, ~40-45 hours) | ✅ Complete |
| [design.md](./design.md) | Architectural decisions, data models, API design | ✅ Complete |
| [specs/category-management/spec.md](./specs/category-management/spec.md) | Detailed requirements for category CRUD (13 requirements) | ✅ Complete |
| [specs/transaction-category-filter/spec.md](./specs/transaction-category-filter/spec.md) | Detailed requirements for transaction filtering (14 requirements) | ✅ Complete |

---

## 🎯 Key Features

### Category Management
- ✅ List all categories with optional status/search filters
- ✅ Get single category by ID
- ✅ Create category with name and description
- ✅ Update category (name, description, status)
- ✅ Delete category (with validation)
- ✅ Status management (ACTIVE/INACTIVE)

### Transaction Filtering
- ✅ Filter by single category (backward compatible)
- ✅ Filter by multiple categories (new)
- ✅ Combine with existing filters
- ✅ Web UI multi-select dropdown
- ✅ URL-based filter persistence

---

## 🏗️ Architecture Highlights

### Clean Architecture Compliance
- Category module is independent bounded context
- Transaction module enhanced (no cross-module imports)
- Domain layer remains pure TypeScript
- Validation at boundaries (Zod schemas)
- Dependency injection throughout

### Database Design
- Category table already exists ✅
- Foreign key relationship in place ✅
- Indexes present for performance ✅
- No migration required ✅

### API Design
```
GET    /categories              # List with filters
GET    /categories/:id          # Get single
POST   /categories              # Create
PUT    /categories/:id          # Update
DELETE /categories/:id          # Delete with validation

GET    /transactions?categoryId=...       # Single filter
GET    /transactions?categoryIds=...      # Multiple filter (new)
```

---

## 📊 Scope & Effort

### Effort Estimate
- **Total Tasks**: 21
- **Estimated Time**: 40-45 hours (5-6 days)
- **Phases**: 5 (API → Schema → Web Category → Web Filter → Testing)

### Affected Components
- ✅ API: `modules/category` (enhancement)
- ✅ API: `modules/transaction` (filter addition)
- ✅ Web: `features/category` (new)
- ✅ Web: `features/transaction` (enhancement)
- ✅ Shared: `@repo/schema` (updates)

### Risk Assessment
- **Overall Risk**: LOW
- **Complexity**: Low-Medium
- **Breaking Changes**: None (all additive)
- **Database Changes**: None (schema exists)

---

## ✅ Validation Results

```bash
openspec validate add-master-categories-and-filters --strict
```

**Result**: ✅ **PASS** - All validation checks passed

### What Was Validated?
- ✅ All requirements use SHALL/MUST verbs
- ✅ Each requirement has at least one scenario
- ✅ Spec delta structure is correct
- ✅ Change metadata is complete
- ✅ No syntax errors in markdown

---

## 🚀 Implementation Phases

### Phase 1: API Enhancement (Backend) - 10 hours
- Task 1.1: Verify & enhance category module
- Task 1.2: Add category filter to transaction repository
- Task 1.3: Update transaction use cases
- Task 1.4: Update HTTP routes & handlers
- Task 1.5: Add category delete validation

### Phase 2: Schema Updates (Shared) - 1 hour
- Task 2.1: Update transaction schemas
- Task 2.2: Verify category schemas

### Phase 3: Web UI - Category Management - 10 hours
- Task 3.1: Create category feature structure
- Task 3.2: Implement domain & application layers
- Task 3.3: Create TanStack Query hooks
- Task 3.4: Build UI components
- Task 3.5: Create management container
- Task 3.6: Create page route

### Phase 4: Web UI - Transaction Filter - 6 hours
- Task 4.1: Create category select components
- Task 4.2: Add filter to transaction list
- Task 4.3: Update transaction form

### Phase 5: Testing & Documentation - 13 hours
- Task 5.1: Write unit tests
- Task 5.2: Write integration tests
- Task 5.3: Manual testing checklist
- Task 5.4: Update documentation

---

## 📝 Key Requirements

### Category Management (13 Requirements)
1. CM-001: List categories with filters
2. CM-002: Get category by ID
3. CM-003: Create new category
4. CM-004: Update existing category
5. CM-005: Delete category with validation
6. CM-006: Category name uniqueness
7. CM-007: Category status management
8. CM-008: API response format
9. CM-009: Input validation
10. CM-010: Clean Architecture compliance
11. CM-011: Query performance
12. CM-012: Authorization
13. CM-013: Error handling

### Transaction Category Filter (14 Requirements)
1. TCF-001: Single category filter (enhanced)
2. TCF-002: Multiple category filter (new)
3. TCF-003: Category filter validation
4. TCF-004: Filter combination
5. TCF-005: Query performance optimization
6. TCF-006: API response consistency
7. TCF-007: Repository layer enhancement
8. TCF-008: Use case modification
9. TCF-009: HTTP route & handler updates
10. TCF-010: Schema package updates
11. TCF-011: Web UI integration
12. TCF-012: Error handling in UI
13. TCF-013: Analytics & monitoring
14. TCF-014: Architecture boundaries

---

## 🔍 Review Checklist

### For Reviewers
- [ ] Read [proposal.md](./proposal.md) for problem statement and solution
- [ ] Review [design.md](./design.md) for architectural decisions
- [ ] Check [tasks.md](./tasks.md) for implementation breakdown
- [ ] Review spec deltas for completeness:
  - [ ] [category-management/spec.md](./specs/category-management/spec.md)
  - [ ] [transaction-category-filter/spec.md](./specs/transaction-category-filter/spec.md)
- [ ] Verify no cross-module imports introduced
- [ ] Confirm Clean Architecture principles maintained
- [ ] Check backward compatibility preserved

### Approval Gates
- [ ] **Product Owner**: Business value and user experience
- [ ] **Tech Lead**: Architecture and implementation approach
- [ ] **Security**: Input validation and authorization (Standard CRUD - Low Risk)

---

## 🤔 Open Questions

These questions should be answered before implementation:

1. **Category Limit**: Should we limit the number of categories per user/system?
   - Recommendation: Start with no limit, add warning at 50+

2. **Category Sorting**: Should categories have custom display order?
   - Recommendation: Alphabetical for now, add ordering field later if requested

3. **INACTIVE Categories**: Should they appear in transaction form dropdowns?
   - Recommendation: Hide from dropdowns, but show in existing transactions

4. **Usage Statistics**: Should we show transaction count per category?
   - Recommendation: Start without, add in future "Category Analytics" feature

---

## 📚 Related Documentation

### Project Guidelines
- [Architecture & Boundaries](.github/instructions/01-architecture-and-boundaries.md)
- [API Structure](.github/instructions/04-api-elysia.md)
- [Web Structure](.github/instructions/03-web-nextjs.md)
- [Shared Schema](.github/instructions/02-shared-schema-zod.md)

### OpenSpec Documentation
- [OpenSpec Agents Guide](../../AGENTS.md)
- [Project Context](../../project.md)

---

## 📞 Contact

For questions or clarifications about this proposal:
- Review the detailed specs first
- Check the design document for architectural context
- Reference existing code patterns in the codebase

---

## 🎉 Next Steps

### For Approvers
1. Review all documents in this directory
2. Ask questions about unclear aspects
3. Approve or request changes
4. Mark approval checkboxes in proposal.md

### For Implementers (After Approval)
1. Follow tasks.md sequentially
2. Reference specs for detailed requirements
3. Run validation tests after each phase
4. Update documentation as you go

---

**Status**: 🟢 Ready for Review  
**Validation**: ✅ Passed strict validation  
**Estimated Effort**: 40-45 hours  
**Risk Level**: 🟢 Low
