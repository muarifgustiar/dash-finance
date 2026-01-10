# Dash Finance - Application Documentation

## System Overview

Dash Finance is a budget management system designed for organizational budget tracking and control. The system implements role-based access control (RBAC) with two primary user roles: Super Admin and User. It manages annual budgets for multiple budget owners and tracks expenditure transactions across categories.

## Technology Stack

### Backend
- **Runtime**: Bun
- **Framework**: Elysia.js (HTTP layer)
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Validation**: Zod (via @repo/schema)
- **Architecture**: Clean Architecture + Domain-Driven Design (DDD)

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Data Tables**: TanStack Table
- **Forms**: TanStack Form with Zod validation
- **State Management**: TanStack Query

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Package Manager**: Bun workspaces
- **Monorepo**: Turborepo

## Core Domain Concepts

### 1. Budget Owner
Represents an entity (department, division, project, or individual) that owns and manages a budget allocation. Examples include "Marketing Division", "IT Department", "Project Alpha", or specific employee names.

**Key Attributes:**
- Unique identifier
- Name (required)
- Code (optional, for organizational reference)
- Description (optional)
- Status (active/inactive)

### 2. Annual Budget
Defines the allocated budget amount for a specific Budget Owner for a given fiscal year. Each Budget Owner can have one budget per year.

**Key Attributes:**
- Budget Owner reference
- Fiscal year
- Planned amount (initial allocation)
- Revised amount (optional, for mid-year adjustments)
- Remaining amount (calculated: planned/revised - total transactions)
- Creator reference
- Timestamps

### 3. Transaction
Records budget expenditure events. Each transaction must be associated with a Budget Owner, Category, and creation date. The fiscal year is derived from the transaction date.

**Key Attributes:**
- Budget Owner reference
- Category reference
- Transaction date
- Amount
- Description
- Receipt URL (optional)
- Creator reference
- Timestamps

### 4. Category
Classification system for transactions (e.g., "Office Supplies", "Travel", "Software Licenses", "Training").

**Key Attributes:**
- Name (unique)
- Description (optional)
- Status (active/inactive)

### 5. User Access Mapping
Defines which Budget Owners a User can access for transaction input and reporting. Super Admins have access to all Budget Owners by default.

## Role-Based Access Control (RBAC)

### Super Admin
**Permissions:**
- Manage master data (Users, Budget Owners, Categories)
- Create and modify annual budgets for all Budget Owners
- View all transactions across all Budget Owners and fiscal years
- Edit and delete any transaction or budget
- Access audit logs
- Export data
- Manage user-to-budget-owner access mappings

**Dashboard Focus:** Oversight, analysis, and data integrity

### User
**Permissions:**
- Create transactions for assigned Budget Owners only
- View transactions and budgets for assigned Budget Owners only
- View summary and analytics for accessible data
- Optional: Edit/delete own transactions (configurable)

**Dashboard Focus:** Quick data entry and budget monitoring

## Data Model

### Prisma Schema Entities

```prisma
model User {
  id           String     @id @default(uuid())
  email        String     @unique
  name         String
  passwordHash String     @map("password_hash")
  role         UserRole   @default(USER)
  status       UserStatus @default(ACTIVE)
  
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")
  
  userAccess   UserAccess[]
  transactions Transaction[]
  budgets      Budget[]
  
  @@map("users")
}

enum UserRole {
  SUPER_ADMIN
  USER
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

model BudgetOwner {
  id          String   @id @default(uuid())
  name        String   @unique
  code        String?  @unique
  description String?
  status      Status   @default(ACTIVE)
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  budgets      Budget[]
  transactions Transaction[]
  userAccess   UserAccess[]
  
  @@map("budget_owners")
}

model Category {
  id          String   @id @default(uuid())
  name        String   @unique
  description String?
  status      Status   @default(ACTIVE)
  
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  
  transactions Transaction[]
  
  @@map("categories")
}

model Budget {
  id              String   @id @default(uuid())
  budgetOwnerId   String   @map("budget_owner_id")
  year            Int
  amountPlanned   Decimal  @db.Decimal(15, 2) @map("amount_planned")
  amountRevised   Decimal? @db.Decimal(15, 2) @map("amount_revised")
  createdBy       String   @map("created_by")
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  budgetOwner     BudgetOwner @relation(fields: [budgetOwnerId], references: [id], onDelete: Cascade)
  creator         User        @relation(fields: [createdBy], references: [id])
  
  @@unique([budgetOwnerId, year])
  @@index([budgetOwnerId])
  @@index([year])
  @@map("budgets")
}

model Transaction {
  id              String   @id @default(uuid())
  budgetOwnerId   String   @map("budget_owner_id")
  categoryId      String   @map("category_id")
  date            DateTime
  amount          Decimal  @db.Decimal(15, 2)
  description     String
  receiptUrl      String?  @map("receipt_url")
  createdBy       String   @map("created_by")
  
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  budgetOwner     BudgetOwner @relation(fields: [budgetOwnerId], references: [id], onDelete: Cascade)
  category        Category    @relation(fields: [categoryId], references: [id])
  creator         User        @relation(fields: [createdBy], references: [id])
  
  @@index([budgetOwnerId])
  @@index([categoryId])
  @@index([date])
  @@index([createdBy])
  @@map("transactions")
}

model UserAccess {
  userId          String   @map("user_id")
  budgetOwnerId   String   @map("budget_owner_id")
  
  createdAt       DateTime @default(now()) @map("created_at")
  
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  budgetOwner     BudgetOwner  @relation(fields: [budgetOwnerId], references: [id], onDelete: Cascade)
  
  @@id([userId, budgetOwnerId])
  @@index([userId])
  @@index([budgetOwnerId])
  @@map("user_access")
}

enum Status {
  ACTIVE
  INACTIVE
}
```

## System Workflows

### Initial Setup (One-time)
1. Super Admin creates Categories
2. Super Admin creates Budget Owners
3. Super Admin creates Users and assigns Budget Owner access
4. Super Admin creates Annual Budgets for each Budget Owner

### Daily Operations
Users input transactions by specifying:
- Transaction date
- Amount
- Category (from predefined list)
- Budget Owner (from assigned list)
- Description (required)
- Receipt attachment (optional)

System automatically:
- Derives fiscal year from transaction date
- Validates user access to selected Budget Owner
- Updates budget utilization metrics
- Triggers alerts if budget threshold exceeded

## User Dashboard

### Purpose
Enable quick transaction entry and budget monitoring for assigned Budget Owners.

### Key Components

#### 1. KPI Cards
- Current Year Budget (for selected Budget Owner)
- Year-to-Date Spending
- Remaining Budget
- Utilization Percentage

#### 2. Quick Filters
- Fiscal Year (default: current year)
- Budget Owner (restricted to assigned list)
- Category
- Date Range

#### 3. Charts
- Monthly burn rate (bar/line chart)
- Category breakdown (pie/bar chart)

#### 4. Transaction List
- Sortable and filterable table using TanStack Table
- Actions: Create (required), Edit/Delete (optional, policy-based)

#### 5. Alerts
- Warning when utilization exceeds 80% (configurable threshold)
- Notification for over-budget transactions

### User Experience Optimization
- Floating "Add Transaction" button for quick access
- Auto-fill last-used Budget Owner and Category
- Client-side validation before submission

## Super Admin Dashboard

### Purpose
Provide comprehensive oversight, analysis, and data management capabilities across all Budget Owners.

### Key Components

#### 1. Global KPIs
- Total allocated budget (all Budget Owners, selected year)
- Total spending
- Total remaining
- Number of transactions
- Count of over-budget Budget Owners

#### 2. Leaderboards
- Top 10 Budget Owners by spending
- Top 10 most used Categories
- Budget Owners approaching limit (≥80% utilization)

#### 3. Analytics Charts
- Monthly spending trend (aggregated)
- Heatmap: Budget Owner × Month spending matrix
- Global category breakdown

#### 4. Management Pages
- **Budget Management**: Create/edit annual budgets (supports bulk operations)
- **User Management**: Manage roles and Budget Owner access mappings
- **Master Data**: Manage Categories and Budget Owners
- **Audit Log**: Track create/update/delete operations with user attribution

#### 5. Data Operations
- Transaction anomaly detection (e.g., excessive "Other" category usage)
- CSV import/export for accounting integration

## System Design Decisions

### Critical Configuration Points

#### 1. Fiscal Year Derivation
**Decision:** Fiscal year is automatically derived from transaction date.  
**Rationale:** Ensures data consistency and prevents manual entry errors.

#### 2. Budget Revisions
**Decision:** Support optional mid-year budget revisions via `amountRevised` field.  
**Rationale:** Accommodates organizational budget reallocation needs.  
**Implementation:** When `amountRevised` is set, it overrides `amountPlanned` for calculations.

#### 3. Transaction Modification
**Decision:** Users can edit/delete own transactions (feature-flagged).  
**Rationale:** Allows error correction while maintaining audit trail.  
**Implementation:** Audit log captures all modifications with timestamps and user attribution.

#### 4. Over-Budget Handling
**Decision:** Soft constraint (warning only, not hard-block).  
**Rationale:** Real-world scenarios may require emergency spending.  
**Implementation:** Display warning in UI, log in audit trail, but allow transaction.

#### 5. Category Management
**Decision:** Categories are admin-only (Users cannot create new categories).  
**Rationale:** Maintains data quality and reporting consistency.

## MVP Scope

### Phase 1 (Core Features)
- ✅ Authentication & Authorization (RBAC)
- ✅ Master data management (Budget Owners, Categories)
- ✅ Annual budget creation (Super Admin only)
- ✅ Transaction entry (User)
- ✅ User & Admin dashboards (KPIs + 2 charts + transaction table)
- ✅ CSV export for transactions

### Phase 2 (Enhanced Features)
- Receipt file upload and storage
- Budget revision history and versioning
- Transaction approval workflow
- Email/WhatsApp notifications
- Budget forecast and depletion estimates
- Advanced analytics and reporting

## API Endpoints (RESTful)

### Authentication
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### Budget Owners (Admin only)
- `GET /budget-owners` - List all budget owners
- `POST /budget-owners` - Create budget owner
- `GET /budget-owners/:id` - Get budget owner details
- `PUT /budget-owners/:id` - Update budget owner
- `DELETE /budget-owners/:id` - Delete budget owner

### Categories (Admin only)
- `GET /categories` - List all categories
- `POST /categories` - Create category
- `GET /categories/:id` - Get category details
- `PUT /categories/:id` - Update category
- `DELETE /categories/:id` - Delete category

### Budgets (Admin only)
- `GET /budgets` - List budgets (filterable by year, budget owner)
- `POST /budgets` - Create annual budget
- `GET /budgets/:id` - Get budget details
- `PUT /budgets/:id` - Update budget
- `DELETE /budgets/:id` - Delete budget
- `GET /budgets/summary` - Get budget summary with utilization

### Transactions
- `GET /transactions` - List transactions (filtered by user access)
- `POST /transactions` - Create transaction
- `GET /transactions/:id` - Get transaction details
- `PUT /transactions/:id` - Update transaction (own only)
- `DELETE /transactions/:id` - Delete transaction (own only)
- `GET /transactions/export` - Export transactions to CSV

### Users (Admin only)
- `GET /users` - List all users
- `POST /users` - Create user
- `GET /users/:id` - Get user details
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/access` - Set budget owner access for user

### Analytics
- `GET /analytics/dashboard/user` - User dashboard data
- `GET /analytics/dashboard/admin` - Admin dashboard data
- `GET /analytics/budget-utilization` - Budget utilization by owner
- `GET /analytics/spending-trend` - Monthly spending trend

## Frontend Routes

### Public Routes
- `/login` - Authentication page

### User Routes
- `/dashboard` - User dashboard (role-specific view)
- `/transactions` - Transaction list and creation
- `/profile` - User profile management

### Admin Routes
- `/dashboard` - Admin dashboard (role-specific view)
- `/budgets` - Budget management
- `/budget-owners` - Budget Owner master data
- `/categories` - Category master data
- `/users` - User management
- `/audit` - Audit log viewer (optional)

## Implementation Guidelines

### Backend (Bun + Elysia)
1. Follow Clean Architecture: Domain → Application → Infrastructure
2. Use dependency injection for use cases
3. Implement RBAC middleware at delivery layer
4. Validate all requests using @repo/schema (Zod)
5. Map Prisma models to Domain entities in infrastructure layer
6. Use canonical errors (ErrNotFound, ErrInvalid, ErrDuplicate)

### Frontend (Next.js)
1. Use server components by default
2. Implement client components only for interactive features
3. Use TanStack Table for all data tables
4. Use TanStack Form with Zod validation for all forms
5. Implement role-based component rendering
6. Use shared schemas from @repo/schema for type safety

### Database (Prisma + PostgreSQL)
1. Use UUIDs for primary keys
2. Enable soft deletes where applicable (status field)
3. Create indexes on foreign keys and frequently queried fields
4. Use Decimal type for monetary amounts
5. Maintain audit fields (createdAt, updatedAt, createdBy)

## Security Considerations

1. **Authentication**: Implement secure password hashing (bcrypt/argon2)
2. **Authorization**: Enforce RBAC at API layer (middleware)
3. **Data Access**: Users can only access assigned Budget Owners
4. **Input Validation**: Validate all inputs using Zod schemas
5. **SQL Injection**: Use Prisma ORM (parameterized queries)
6. **Audit Trail**: Log all CUD operations with user attribution
7. **Rate Limiting**: Implement rate limiting on API endpoints
8. **CORS**: Configure CORS properly for production

## Performance Optimization

1. **Database**: Use appropriate indexes, connection pooling
2. **Caching**: Cache master data (Categories, Budget Owners)
3. **Pagination**: Implement cursor-based pagination for large datasets
4. **Lazy Loading**: Load charts and heavy data on-demand
5. **Code Splitting**: Use Next.js automatic code splitting
6. **CDN**: Serve static assets via CDN in production

## Monitoring and Observability

1. Log all errors with context
2. Track API response times
3. Monitor database query performance
4. Implement health check endpoint
5. Set up alerts for critical errors
6. Track user activity metrics

## Deployment Architecture

```
┌─────────────────┐
│   Docker Host   │
├─────────────────┤
│                 │
│  ┌───────────┐  │
│  │ PostgreSQL│  │
│  │   :5432   │  │
│  └───────────┘  │
│        │        │
│  ┌───────────┐  │
│  │  Elysia   │  │
│  │  API      │  │
│  │   :3001   │  │
│  └───────────┘  │
│        │        │
│  ┌───────────┐  │
│  │  Next.js  │  │
│  │  Web      │  │
│  │   :3000   │  │
│  └───────────┘  │
│                 │
└─────────────────┘
```

## Development Workflow

1. Start Docker services: `bun run docker:up`
2. Generate Prisma client: `bun run db:generate`
3. Push schema to database: `bun run db:push`
4. Run development servers: `bun run dev`
5. Access application at `http://localhost:3000`

## Testing Strategy

1. **Unit Tests**: Domain logic and use cases
2. **Integration Tests**: API endpoints with in-memory database
3. **E2E Tests**: Critical user flows (Playwright/Cypress)
4. **Load Tests**: API performance under load

## Documentation Maintenance

This document should be updated when:
- New features are added
- System architecture changes
- API endpoints are modified
- Database schema evolves
- Security policies change

---

**Document Version**: 1.0  
**Last Updated**: January 6, 2026  
**Maintained By**: Development Team
