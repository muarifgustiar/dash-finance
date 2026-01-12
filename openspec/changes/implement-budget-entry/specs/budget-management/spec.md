# Budget Management

## ADDED Requirements

### Requirement: BUDGET-EDIT-001 - Budget Update Hook
**Context**: Users need to modify existing budgets to adjust planned amounts or correct information.

The budget update hook MUST use `useMutation` with PUT method to `/budgets/:id`. It SHALL invalidate budget caches on success.

#### Scenario: Updating an existing budget
**Given** the user clicks edit on a budget  
**And** form opens in edit mode with pre-filled data  
**When** the user modifies and submits  
**Then** `useUpdateBudget` must call PUT `/budgets/{id}`  
**And** on success, invalidate `budgetKeys.lists()` and `budgetKeys.detail(id)`  
**And** show toast "Budget berhasil diperbarui"

#### Scenario: Pre-populating form for editing
**Given** user selects a budget to edit  
**When** form enters edit mode  
**Then** all fields must populate with current budget data  
**And** plannedAmount must display correctly  
**And** budget owner and year must show current values  
**And** submit button text must be "Perbarui"

### Requirement: BUDGET-DELETE-001 - Budget Deletion Hook
**Context**: Users need to remove incorrect or obsolete budgets with confirmation to prevent accidental loss.

The budget deletion hook MUST use `useMutation` with DELETE method and require confirmation dialog.

#### Scenario: Deleting budget with confirmation
**Given** user clicks delete on a budget  
**When** confirmation dialog appears and user confirms  
**Then** `useDeleteBudget` must call DELETE `/budgets/{id}`  
**And** on success, invalidate budget queries  
**And** show toast "Budget berhasil dihapus"  
**And** budget disappears from list

#### Scenario: Showing deletion confirmation
**Given** user clicks delete  
**When** dialog opens  
**Then** show budget details (owner, year, amount)  
**And** ask "Hapus budget ini?"  
**And** provide "Batal" and "Hapus" buttons  
**And** style "Hapus" destructively (red)

### Requirement: BUDGET-STATE-001 - Budget Form Mode Management
**Context**: Budget form must support create and edit modes.

Form MUST maintain mode state (`null`, `"create"`, or `"edit"`).

#### Scenario: Opening form in create mode
**Given** form is closed  
**When** user clicks "Tambah Budget"  
**Then** mode must be "create"  
**And** fields must be empty  
**And** button must show "Simpan"

#### Scenario: Opening form in edit mode
**Given** budget exists  
**When** user clicks edit  
**Then** mode must be "edit"  
**And** form pre-populated with budget data  
**And** button must show "Perbarui"

