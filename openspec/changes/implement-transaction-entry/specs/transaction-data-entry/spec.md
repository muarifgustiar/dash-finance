# Transaction Data Entry

## ADDED Requirements

### Requirement: TRANS-CREATE-001 - Transaction Creation Hook
**Context**: Users need the ability to create new transactions through a web form. The frontend must call the backend API directly using TanStack Query mutations without involving repository or use case layers.

The transaction creation hook MUST use `useMutation` from TanStack Query and call `/transactions` endpoint via `apiRequest`. It SHALL invalidate transaction list queries on success to trigger automatic cache refresh.

#### Scenario: Creating a new transaction successfully
**Given** the user has filled out the transaction form with valid data  
**And** the backend API is available  
**When** the user submits the form  
**Then** the `useCreateTransaction` hook must call `apiRequest` with POST method  
**And** the request must include amount, categoryId, budgetOwnerId, date, and optional description  
**And** on success, the hook must invalidate `transactionKeys.lists()` cache  
**And** the component must show success toast message "Transaksi berhasil disimpan"  
**And** the transaction list must refresh automatically

#### Scenario: Handling validation errors from API
**Given** the user submits a transaction with invalid data  
**When** the API returns a 400 error with validation messages  
**Then** the mutation must expose the error in `error` property  
**And** the component must display the error message to the user  
**And** the form must remain open for correction  
**And** the form fields must not be reset

#### Scenario: Handling network errors during creation
**Given** the user submits a valid transaction  
**When** the network request fails or times out  
**Then** the mutation error must be caught and exposed  
**And** the component must display a user-friendly error message  
**And** the loading state must return to idle  
**And** the user must be able to retry the submission

### Requirement: TRANS-VALID-001 - Form Data Validation
**Context**: Transaction data must be validated before submission to prevent invalid data from reaching the API and to provide immediate feedback to users.

All transaction form fields MUST be validated according to business rules. Amount must be positive, category and budget owner must be selected, and date must not be in the future (configurable).

#### Scenario: Validating positive amount
**Given** the user enters an amount in the form  
**When** the user attempts to submit  
**Then** the form must validate that amount > 0  
**And** if amount ≤ 0, the form must show error "Jumlah harus lebih dari 0"  
**And** the submit button must be disabled until amount is valid

#### Scenario: Validating required category selection
**Given** the user fills the transaction form  
**When** the user has not selected a category  
**Then** the form must show error "Kategori harus dipilih"  
**And** submission must be prevented

#### Scenario: Validating required budget owner selection
**Given** the user fills the transaction form  
**When** the user has not selected a budget owner  
**Then** the form must show error "Budget Owner harus dipilih"  
**And** submission must be prevented

#### Scenario: Validating date constraints
**Given** the user selects a date in the future  
**When** the validation runs  
**Then** the form must show warning or error (configurable)  
**And** may prevent submission based on business rules

### Requirement: TRANS-UI-001 - Transaction Form UI States
**Context**: The transaction form must provide clear feedback about submission state to prevent confusion and multiple submissions.

The form MUST display loading, error, and success states. During loading, form fields and submit button must be disabled. Errors must be displayed clearly above the form or inline with fields.

#### Scenario: Displaying loading state during submission
**Given** the user has submitted a valid transaction  
**When** the API request is in progress  
**Then** all form fields must be disabled  
**And** the submit button must be disabled  
**And** the submit button must show a loading spinner  
**And** the button text must change to indicate loading

#### Scenario: Displaying error state after failed submission
**Given** transaction creation failed  
**When** the error is returned from the API  
**Then** an error alert must be displayed above the form  
**And** the error message must be in Bahasa Indonesia  
**And** form fields must remain enabled for correction  
**And** the user must be able to retry

#### Scenario: Resetting form after successful creation
**Given** transaction was created successfully  
**When** the success callback executes  
**Then** all form fields must be cleared  
**And** the form section must be closed or minimized  
**And** focus must return to transaction list  
**And** success toast must appear briefly

### Requirement: TRANS-DATA-001 - Transaction Data Transformation
**Context**: Form data types may differ from API request types. The hook must transform form data into the correct format expected by the backend.

The hook MUST transform form data before sending to API. Amount must be converted to number, date to ISO string, and selected IDs must be strings matching the backend schema.

#### Scenario: Transforming form data for API request
**Given** the user submits a form with amount "1500.50" as string  
**And** date as Date object  
**When** the mutation function executes  
**Then** amount must be converted to number 1500.5  
**And** date must be converted to ISO string format  
**And** categoryId must be string type  
**And** budgetOwnerId must be string type  
**And** description may be undefined if not provided

#### Scenario: Mapping API response to domain model
**Given** the API returns a transaction response  
**When** the mutation succeeds  
**Then** the response must be mapped to client-side Transaction model  
**And** date strings must be converted to Date objects  
**And** amounts must remain as numbers  
**And** the mapped model must be type-safe

