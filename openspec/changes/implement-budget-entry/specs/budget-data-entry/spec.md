# Budget Data Entry

## ADDED Requirements

### Requirement: BUDGET-CREATE-001 - Budget Creation Hook
**Context**: Users need to create annual budgets for different budget owners. The frontend must call the backend API directly using TanStack Query mutations following the simplified web architecture pattern.

The budget creation hook MUST use `useMutation` from TanStack Query and call `/budgets` endpoint via `apiRequest`. It SHALL invalidate budget list queries on success.

#### Scenario: Creating a new budget successfully
**Given** the user has filled out the budget form with valid data  
**And** the backend API is available  
**When** the user submits the form  
**Then** the `useCreateBudget` hook must call `apiRequest` with POST method  
**And** the request must include budgetOwnerId, year, and plannedAmount  
**And** on success, the hook must invalidate `budgetKeys.lists()` cache  
**And** the component must show success toast "Budget berhasil dibuat"  
**And** the budget list must refresh automatically

#### Scenario: Handling duplicate budget detection
**Given** a budget already exists for the same owner and year  
**When** the user tries to create another budget with same owner/year  
**Then** the API must return a 409 Conflict error  
**And** the error message must be displayed to user  
**And** the form must remain open for correction

#### Scenario: Validating network errors during creation
**Given** the user submits a valid budget  
**When** the network request fails  
**Then** the mutation error must be exposed  
**And** a user-friendly error message must display  
**And** the user must be able to retry

### Requirement: BUDGET-VALID-001 - Budget Form Validation
**Context**: Budget data must be validated to ensure data integrity and provide immediate feedback to users.

All budget form fields MUST be validated. Budget owner must be selected, year must be current year or later, and planned amount must be positive.

#### Scenario: Validating positive planned amount
**Given** the user enters a planned amount  
**When** the form validates  
**Then** the amount must be > 0  
**And** if amount ≤ 0, show error "Jumlah budget harus lebih dari 0"  
**And** disable submit button until valid

#### Scenario: Validating required budget owner
**Given** the user fills the budget form  
**When** budget owner is not selected  
**Then** show error "Budget Owner harus dipilih"  
**And** prevent submission

#### Scenario: Validating year constraints
**Given** the user enters a year  
**When** the year is before current year  
**Then** show error "Tahun harus tahun ini atau yang akan datang"  
**And** prevent submission

### Requirement: BUDGET-UI-001 - Budget Form UI States
**Context**: The budget form must provide clear feedback about submission state.

The form MUST display loading, error, and success states appropriately.

#### Scenario: Displaying loading state during submission
**Given** the user has submitted a valid budget  
**When** the API request is in progress  
**Then** all form fields must be disabled  
**And** submit button must show loading spinner  
**And** button text must indicate loading state

#### Scenario: Displaying error state
**Given** budget creation failed  
**When** error is returned  
**Then** error alert must display above form  
**And** error message must be in Bahasa Indonesia  
**And** form fields must remain enabled for correction

#### Scenario: Resetting form after success
**Given** budget was created successfully  
**When** success callback executes  
**Then** all form fields must be cleared  
**And** form section must close  
**And** success toast must appear

### Requirement: BUDGET-DATA-001 - Budget Data Transformation
**Context**: Form data must be transformed to match API requirements.

The hook MUST transform form data correctly. Planned amount must be number, year must be integer, budget owner ID must be string.

#### Scenario: Transforming form data for API
**Given** user submits form with plannedAmount "5000.00" as string  
**And** year "2026" as string  
**When** mutation executes  
**Then** plannedAmount must be converted to number 5000  
**And** year must be converted to integer 2026  
**And** budgetOwnerId must remain string type

