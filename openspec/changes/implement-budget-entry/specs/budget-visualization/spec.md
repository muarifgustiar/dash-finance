# Budget Visualization

## MODIFIED Requirements

### Requirement: BUDGET-VIZ-001 - Replace Mock Data with Real API Integration
**Context**: Budget page currently displays hardcoded mock data. This must be replaced with real data fetched from the API.

The budget page MUST fetch real data using `useBudgets` hook calling `/budgets` endpoint. The hardcoded mock array SHALL be completely removed from the component, and the component MUST handle loading states with skeleton UI while data is being fetched.

#### Scenario: Loading real budgets from API
**Given** the budget page is opened  
**When** the component mounts  
**Then** the `useBudgets` hook must call GET `/budgets`  
**And** loading skeleton must display during fetch  
**And** real budget data must replace mock array  
**And** budgets must include actual spending data from backend

#### Scenario: Handling empty budget list
**Given** no budgets exist for the user  
**When** API returns empty array  
**Then** display empty state message "Belum ada budget"  
**And** show "Buat Budget Pertama" call-to-action button

#### Scenario: Handling API errors during load
**Given** the page is loading budgets  
**When** the API request fails  
**Then** display error message "Gagal memuat budget"  
**And** provide retry button  
**And** do not show mock data

## ADDED Requirements

### Requirement: BUDGET-VIZ-002 - Progress Bar Calculation
**Context**: Budget cards must visually display spending progress relative to planned amount.

Progress bars MUST calculate percentage as `(spentAmount / plannedAmount) * 100`. They SHALL use color-coding to indicate budget health.

#### Scenario: Calculating spending percentage
**Given** a budget with plannedAmount 5000 and spentAmount 3500  
**When** the component renders  
**Then** progress percentage must be 70.0%  
**And** progress bar must fill to 70% width  
**And** percentage must be rounded to 1 decimal place

#### Scenario: Handling zero planned amount
**Given** a budget with plannedAmount 0  
**When** calculating percentage  
**Then** must handle division by zero safely  
**And** display 0% or show error indicator

#### Scenario: Color-coding by spending level
**Given** a budget is rendered  
**When** spending percentage is < 80%  
**Then** progress bar must be green/primary color  

**When** spending percentage is 80-99%  
**Then** progress bar must be yellow/warning color  

**When** spending percentage is ≥ 100%  
**Then** progress bar must be red/destructive color

### Requirement: BUDGET-VIZ-003 - Budget Owner Display
**Context**: Budget cards must show the budget owner's name for clarity.

Budget cards MUST display the budget owner name, not just the ID.

#### Scenario: Displaying budget owner name
**Given** budget data includes budget owner information  
**When** budget card renders  
**Then** owner name must display prominently  
**And** owner name must be fetched from API or joined in response

#### Scenario: Handling missing owner data
**Given** budget owner data is not available  
**When** rendering budget card  
**Then** display placeholder or fetch owner data separately  
**And** do not show raw ID to user

### Requirement: BUDGET-VIZ-004 - Budget Filtering
**Context**: Users need to filter budgets by owner and year to find specific budgets quickly.

Budget list MUST support filtering by budget owner and year. Filters SHALL be passed as query parameters to the API.

#### Scenario: Filtering by budget owner
**Given** multiple budgets exist for different owners  
**When** user selects a budget owner from filter dropdown  
**Then** the `useBudgets` hook must call `/budgets?budgetOwnerId={id}`  
**And** only budgets for selected owner must display  
**And** filter selection must persist in UI state

#### Scenario: Filtering by year
**Given** budgets exist for multiple years  
**When** user selects a year from filter dropdown  
**Then** the `useBudgets` hook must call `/budgets?year={year}`  
**And** only budgets for selected year must display

#### Scenario: Combining multiple filters
**Given** both owner and year filters are active  
**When** budgets are fetched  
**Then** API call must include both query params `/budgets?budgetOwnerId={id}&year={year}`  
**And** results must match all filter criteria

#### Scenario: Clearing filters
**Given** filters are applied  
**When** user clicks "Tampilkan Semua" or "Clear"  
**Then** all filters must be removed  
**And** full budget list must display

### Requirement: BUDGET-VIZ-005 - Year Display and Formatting
**Context**: Budget year must be clearly visible to distinguish between annual budgets.

Each budget card MUST prominently display its year.

#### Scenario: Displaying budget year
**Given** a budget for year 2026  
**When** the card renders  
**Then** year must display as "Budget 2026" or "Tahun 2026"  
**And** year must be styled as badge or label  
**And** year must be immediately visible

