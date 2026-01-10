# Spec Delta: Category Management

**Capability**: `category-management`  
**Change Type**: ADDED  
**Status**: DRAFT  
**Related Capabilities**: None  

---

## ADDED Requirements

### Requirement: CM-001 - List Categories with Filters
**Priority**: HIGH  
**Type**: Functional  

The system SHALL provide an API endpoint to list all transaction categories with optional filtering by status and text search.

#### Scenario: List all categories
**Given** the system has multiple categories  
**When** a user requests GET `/categories`  
**Then** the system returns all categories ordered by name ascending  
**And** each category includes id, name, description, status, createdAt, updatedAt  

#### Scenario: Filter categories by status
**Given** the system has categories with different statuses  
**When** a user requests GET `/categories?status=ACTIVE`  
**Then** the system returns only ACTIVE categories  
**And** INACTIVE categories are excluded from results  

#### Scenario: Search categories by name
**Given** the system has categories named "Food", "Transport", "Entertainment"  
**When** a user requests GET `/categories?search=foo`  
**Then** the system returns categories where name contains "foo" (case-insensitive)  
**And** the result includes "Food" category  

#### Scenario: Combine status and search filters
**Given** the system has ACTIVE category "Food" and INACTIVE category "Old Food"  
**When** a user requests GET `/categories?status=ACTIVE&search=food`  
**Then** the system returns only ACTIVE categories matching "food"  
**And** INACTIVE categories are excluded even if they match search  

---

### Requirement: CM-002 - Get Category by ID
**Priority**: HIGH  
**Type**: Functional  

The system SHALL provide an API endpoint to retrieve a single category by its unique identifier.

#### Scenario: Get existing category
**Given** a category exists with id "123e4567-e89b-12d3-a456-426614174000"  
**When** a user requests GET `/categories/123e4567-e89b-12d3-a456-426614174000`  
**Then** the system returns the category with all its details  
**And** the response includes status code 200  

#### Scenario: Get non-existent category
**Given** no category exists with id "00000000-0000-0000-0000-000000000000"  
**When** a user requests GET `/categories/00000000-0000-0000-0000-000000000000`  
**Then** the system returns status code 404  
**And** the error message is "Kategori tidak ditemukan"  

#### Scenario: Get category with invalid UUID format
**Given** a request with invalid UUID "not-a-uuid"  
**When** a user requests GET `/categories/not-a-uuid`  
**Then** the system returns status code 400  
**And** the error indicates invalid UUID format  

---

### Requirement: CM-003 - Create New Category
**Priority**: HIGH  
**Type**: Functional  

The system SHALL provide an API endpoint to create a new transaction category with name and optional description, automatically setting status to ACTIVE.

#### Scenario: Create category with name only
**Given** no category exists with name "Food"  
**When** a user submits POST `/categories` with `{"name": "Food"}`  
**Then** the system creates a new category with name "Food"  
**And** the status is automatically set to "ACTIVE"  
**And** the description is null  
**And** the response includes the created category with id, createdAt, updatedAt  

#### Scenario: Create category with name and description
**Given** no category exists with name "Transport"  
**When** a user submits POST `/categories` with `{"name": "Transport", "description": "Transportation expenses"}`  
**Then** the system creates a new category with name and description  
**And** the response includes status code 201  

#### Scenario: Create category with duplicate name
**Given** a category already exists with name "Food"  
**When** a user submits POST `/categories` with `{"name": "Food"}`  
**Then** the system returns status code 409  
**And** the error message is "Kategori dengan nama ini sudah ada"  
**And** no new category is created  

#### Scenario: Create category with empty name
**Given** a request with empty name  
**When** a user submits POST `/categories` with `{"name": ""}`  
**Then** the system returns status code 400  
**And** the error indicates name is required  
**And** no category is created  

#### Scenario: Create category with whitespace-only name
**Given** a request with whitespace-only name  
**When** a user submits POST `/categories` with `{"name": "   "}`  
**Then** the system returns status code 400  
**And** the error indicates name cannot be empty  
**And** no category is created  

---

### Requirement: CM-004 - Update Existing Category
**Priority**: HIGH  
**Type**: Functional  

The system SHALL provide an API endpoint to update an existing category's name, description, and/or status.

#### Scenario: Update category name
**Given** a category exists with id "123e4567" and name "Foo"  
**When** a user submits PUT `/categories/123e4567` with `{"name": "Food"}`  
**Then** the system updates the category name to "Food"  
**And** the updatedAt timestamp is refreshed  
**And** other fields remain unchanged  

#### Scenario: Update category status to INACTIVE
**Given** an ACTIVE category exists with id "123e4567"  
**When** a user submits PUT `/categories/123e4567` with `{"status": "INACTIVE"}`  
**Then** the system updates the category status to "INACTIVE"  
**And** the category is no longer shown in default filters  

#### Scenario: Update category description
**Given** a category exists with id "123e4567"  
**When** a user submits PUT `/categories/123e4567` with `{"description": "New description"}`  
**Then** the system updates only the description  
**And** name and status remain unchanged  

#### Scenario: Update multiple fields at once
**Given** a category exists with id "123e4567"  
**When** a user submits PUT `/categories/123e4567` with `{"name": "NewName", "description": "NewDesc", "status": "INACTIVE"}`  
**Then** the system updates all provided fields atomically  
**And** updatedAt reflects the latest change  

#### Scenario: Update with duplicate name
**Given** categories "Food" with id "111" and "Transport" with id "222" exist  
**When** a user submits PUT `/categories/222` with `{"name": "Food"}`  
**Then** the system returns status code 409  
**And** the error message is "Kategori dengan nama ini sudah ada"  
**And** the category "Transport" is not updated  

#### Scenario: Update non-existent category
**Given** no category exists with id "00000000-0000-0000-0000-000000000000"  
**When** a user submits PUT `/categories/00000000-0000-0000-0000-000000000000` with any data  
**Then** the system returns status code 404  
**And** the error message is "Kategori tidak ditemukan"  

---

### Requirement: CM-005 - Delete Category with Validation
**Priority**: HIGH  
**Type**: Functional  

The system SHALL provide an API endpoint to delete a category, but only if no transactions reference that category.

#### Scenario: Delete unused category
**Given** a category exists with id "123e4567"  
**And** no transactions reference this category  
**When** a user requests DELETE `/categories/123e4567`  
**Then** the system permanently deletes the category  
**And** the response includes status code 204  
**And** subsequent GET requests for this category return 404  

#### Scenario: Attempt to delete category with transactions
**Given** a category exists with id "123e4567"  
**And** at least one transaction references this category  
**When** a user requests DELETE `/categories/123e4567`  
**Then** the system returns status code 400  
**And** the error message is "Kategori tidak dapat dihapus karena masih digunakan pada transaksi"  
**And** the category remains in the system unchanged  

#### Scenario: Delete non-existent category
**Given** no category exists with id "00000000-0000-0000-0000-000000000000"  
**When** a user requests DELETE `/categories/00000000-0000-0000-0000-000000000000`  
**Then** the system returns status code 404  
**And** the error message is "Kategori tidak ditemukan"  

---

### Requirement: CM-006 - Category Name Uniqueness
**Priority**: HIGH  
**Type**: Business Rule  

The system SHALL enforce unique category names across all categories regardless of status.

#### Scenario: Case-sensitive uniqueness
**Given** a category exists with name "Food"  
**When** a user attempts to create a category with name "food" (lowercase)  
**Then** the system allows creation (case-sensitive comparison)  
**And** both categories coexist with different names  

#### Scenario: Uniqueness across statuses
**Given** an INACTIVE category exists with name "Old Category"  
**When** a user attempts to create an ACTIVE category with name "Old Category"  
**Then** the system returns status code 409  
**And** the error indicates duplicate name  
**And** status does not affect uniqueness validation  

---

### Requirement: CM-007 - Category Status Management
**Priority**: MEDIUM  
**Type**: Business Rule  

The system SHALL support two status values for categories: ACTIVE and INACTIVE, with ACTIVE being the default for new categories.

#### Scenario: New category defaults to ACTIVE
**Given** a user creates a category without specifying status  
**When** the category is created  
**Then** the status is automatically set to "ACTIVE"  

#### Scenario: INACTIVE categories remain accessible
**Given** an INACTIVE category exists  
**When** a user retrieves the category by ID  
**Then** the system returns the category with status "INACTIVE"  
**And** the category data is fully accessible  

#### Scenario: Status affects transaction creation
**Given** an INACTIVE category exists with id "123e4567"  
**When** a user creates a new transaction with categoryId "123e4567"  
**Then** the system SHOULD warn or prevent using INACTIVE category  
*Note: This is handled in transaction module, not category module*

---

### Requirement: CM-008 - API Response Format
**Priority**: HIGH  
**Type**: Technical  

The system SHALL return category data in consistent JSON format following the established API response pattern.

#### Scenario: Success response format
**Given** any successful category operation  
**When** the API returns a response  
**Then** the response follows the format:
```json
{
  "success": true,
  "data": { /* category object or array */ },
  "meta": {
    "timestamp": "ISO-8601 datetime",
    "requestId": "optional-request-id"
  }
}
```

#### Scenario: Error response format
**Given** any failed category operation  
**When** the API returns an error  
**Then** the response follows the format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message in Indonesian",
    "details": { /* optional additional context */ }
  },
  "meta": {
    "timestamp": "ISO-8601 datetime",
    "requestId": "optional-request-id"
  }
}
```

#### Scenario: Category object structure
**Given** any response containing category data  
**When** the category object is serialized  
**Then** it includes these fields:
```json
{
  "id": "uuid string",
  "name": "string",
  "description": "string or null",
  "status": "ACTIVE | INACTIVE",
  "createdAt": "ISO-8601 datetime string",
  "updatedAt": "ISO-8601 datetime string"
}
```

---

### Requirement: CM-009 - Input Validation
**Priority**: HIGH  
**Type**: Technical  

The system SHALL validate all category inputs at the API boundary before processing.

#### Scenario: UUID format validation
**Given** any endpoint requiring category ID  
**When** a request provides an invalid UUID format  
**Then** the system returns status code 400 immediately  
**And** the error indicates invalid UUID format  
**And** no use case is invoked  

#### Scenario: Name length validation
**Given** a create or update request  
**When** the name field is empty or contains only whitespace  
**Then** the system returns status code 400  
**And** the error indicates name is required  

#### Scenario: Status enum validation
**Given** an update request with status field  
**When** the status value is not "ACTIVE" or "INACTIVE"  
**Then** the system returns status code 400  
**And** the error indicates invalid status value  

---

### Requirement: CM-010 - Clean Architecture Compliance
**Priority**: HIGH  
**Type**: Technical  

The category module SHALL follow Clean Architecture and DDD principles with clear separation of concerns.

#### Scenario: Domain layer purity
**Given** the category domain layer code  
**When** inspected for dependencies  
**Then** it MUST NOT import external libraries (Zod, Elysia, Firebase)  
**And** it contains only pure TypeScript  
**And** invariants are enforced in entity constructors  

#### Scenario: Delivery layer responsibility
**Given** the category HTTP routes and handlers  
**When** processing a request  
**Then** validation occurs at the boundary using Zod schemas  
**And** handlers invoke use cases via dependency injection  
**And** handlers map domain errors to HTTP status codes  
**And** no business logic exists in the delivery layer  

#### Scenario: Use case orchestration
**Given** any category use case  
**When** executing business logic  
**Then** the use case depends only on domain interfaces (ports)  
**And** the use case does not import infrastructure implementations  
**And** dependencies are injected via constructor  

#### Scenario: No cross-module imports
**Given** the category module code  
**When** inspected for imports  
**Then** it MUST NOT import from other modules (transaction, user, budget)  
**And** shared concerns come from `@repo/domain` or `shared/` only  

---

## Performance Considerations

### Requirement: CM-011 - Query Performance
**Priority**: MEDIUM  
**Type**: Non-Functional  

#### Scenario: Category list performance
**Given** the system has up to 1000 categories  
**When** a user requests the category list  
**Then** the response time is under 500ms at p95  
**And** database queries use indexes on status field  

#### Scenario: Search performance
**Given** a search query is executed  
**When** searching by name  
**Then** the query uses case-insensitive LIKE with index support  
**And** results are limited to prevent memory issues  

---

## Security Considerations

### Requirement: CM-012 - Authorization
**Priority**: HIGH  
**Type**: Security  

#### Scenario: Authentication required
**Given** any category endpoint  
**When** a request is made without valid authentication  
**Then** the system returns status code 401  
**And** no category data is exposed  

#### Scenario: Role-based access (Future)
**Given** different user roles (SUPER_ADMIN vs USER)  
**When** category operations are performed  
**Then** only SUPER_ADMIN can create/update/delete categories  
**And** all authenticated users can read categories  
*Note: This may be implemented in future iterations*

---

## Error Scenarios

### Requirement: CM-013 - Error Handling
**Priority**: HIGH  
**Type**: Technical  

#### Scenario: Database connection failure
**Given** the database is unavailable  
**When** any category operation is attempted  
**Then** the system returns status code 500  
**And** the error message is generic (no internal details exposed)  
**And** the error is logged for debugging  

#### Scenario: Validation error collection
**Given** multiple validation errors in a single request  
**When** the request is processed  
**Then** all validation errors are collected and returned together  
**And** the response includes detailed field-level errors  

---

## Related Requirements
- This capability does not depend on other capabilities
- This capability is referenced by: `transaction-category-filter` (transactions depend on categories)
