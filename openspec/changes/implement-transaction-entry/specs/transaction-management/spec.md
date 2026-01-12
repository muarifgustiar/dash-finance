# Transaction Management

## ADDED Requirements

### Requirement: TRANS-EDIT-001 - Transaction Update Hook
**Context**: Users need to modify existing transactions to correct mistakes or update information. The edit functionality reuses the same form as creation but pre-populates with existing data.

The transaction update hook MUST use `useMutation` with PUT method to `/transactions/:id`. It SHALL accept transaction ID and updated data, and invalidate both list and detail caches on success.

#### Scenario: Updating an existing transaction
**Given** the user clicks edit button on a transaction  
**And** the form opens in edit mode with pre-filled data  
**When** the user modifies fields and submits  
**Then** the `useUpdateTransaction` hook must call `apiRequest` with PUT method  
**And** the URL must include the transaction ID `/transactions/{id}`  
**And** on success, must invalidate `transactionKeys.lists()` and `transactionKeys.detail(id)`  
**And** success toast must show "Transaksi berhasil diperbarui"

#### Scenario: Pre-populating form for editing
**Given** the user selects a transaction to edit  
**When** the form enters edit mode  
**Then** all fields must be populated with current transaction data  
**And** amount must display as formatted number  
**And** date must be converted from ISO string to Date object  
**And** category and budget owner dropdowns must show current selections  
**And** the submit button text must change to "Perbarui" (Update)

#### Scenario: Canceling edit mode
**Given** the form is in edit mode with changes  
**When** the user clicks "Batal" (Cancel)  
**Then** the form must close without saving  
**And** edit mode must be cleared  
**And** if user has unsaved changes, may show confirmation (optional)

### Requirement: TRANS-DELETE-001 - Transaction Deletion Hook
**Context**: Users need to remove incorrect or duplicate transactions. Deletion must require confirmation to prevent accidental data loss.

The transaction deletion hook MUST use `useMutation` with DELETE method. A confirmation dialog SHALL appear before deletion proceeds.

#### Scenario: Deleting a transaction with confirmation
**Given** the user clicks delete button on a transaction  
**When** the confirmation dialog appears  
**And** the user confirms deletion  
**Then** the `useDeleteTransaction` hook must call DELETE `/transactions/{id}`  
**And** on success, must invalidate transaction queries  
**And** success toast must show "Transaksi berhasil dihapus"  
**And** the transaction must disappear from the list

#### Scenario: Showing deletion confirmation dialog
**Given** the user clicks delete button  
**When** the dialog opens  
**Then** it must show transaction details (amount, category, date)  
**And** it must ask "Hapus transaksi ini?"  
**And** it must have "Batal" and "Hapus" buttons  
**And** "Hapus" button must be styled destructively (red)

#### Scenario: Canceling deletion
**Given** the confirmation dialog is open  
**When** the user clicks "Batal" or clicks outside dialog  
**Then** the dialog must close without deleting  
**And** the transaction must remain in the list  
**And** no API call must be made

#### Scenario: Handling deletion errors
**Given** the user confirms deletion  
**When** the API returns an error (404 or 500)  
**Then** the error must be displayed to the user  
**And** the dialog must close  
**And** the transaction must remain visible  
**And** the user must be able to retry

### Requirement: TRANS-STATE-001 - Transaction Form Mode Management
**Context**: The transaction form must support multiple modes (create, edit, closed) and manage state transitions correctly.

The form MUST maintain a mode state that determines behavior. Mode can be `null` (closed), `"create"` (new transaction), or `"edit"` (modify existing).

#### Scenario: Opening form in create mode
**Given** the form is closed  
**When** the user clicks "Tambah Transaksi" button  
**Then** form mode must be set to "create"  
**And** all fields must be empty  
**And** submit button must show "Simpan" (Save)  
**And** form section must become visible

#### Scenario: Opening form in edit mode
**Given** a transaction exists in the list  
**When** the user clicks edit button on that transaction  
**Then** form mode must be set to "edit"  
**And** form must be pre-populated with transaction data  
**And** submit button must show "Perbarui" (Update)  
**And** transaction ID must be stored in state

#### Scenario: Closing form and resetting state
**Given** the form is open in any mode  
**When** the user cancels or successfully submits  
**Then** form mode must be set to null  
**And** all form fields must be cleared  
**And** editing transaction ID must be cleared  
**And** validation errors must be cleared

