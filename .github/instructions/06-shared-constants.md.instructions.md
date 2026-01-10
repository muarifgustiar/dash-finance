---
applyTo: '**'
---
# Shared Constants - Best Practice

## Kenapa Constants Harus di Shared Package?
Constants yang digunakan lintas aplikasi (web, API, mobile) harus disimpan di shared package untuk:
- Single source of truth
- Konsistensi nilai di seluruh aplikasi
- Type safety
- Kemudahan maintenance (ubah satu tempat, efek ke semua)

## Paket Shared: `@repo/domain`
Tujuan:
- Menyimpan constants yang benar-benar universal dan domain-agnostic
- Dipakai oleh `apps/web`, `apps/api`, `apps/mobile`
- Error codes, API response types, dan constants lain yang bersifat shared kernel

## Struktur Organisasi

### 1. Error Codes (`@repo/domain/errors`)
**Location**: `packages/domain/src/errors/error-codes.ts`

Constants untuk error codes yang universal:
```typescript
export const ErrorCodes = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  // ...
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

**Aturan**:
- Hanya error codes universal
- Tidak boleh ada business-specific error codes
- Export sebagai `const` dengan type inference

### 2. API Response Types (`@repo/domain/types`)
**Location**: `packages/domain/src/types/api-response.ts`

Type definitions untuk API response format:
```typescript
export type ApiResponse<T = unknown> = {
  success: true;
  data: T;
  meta?: { timestamp: string; requestId?: string; };
};
```

**Aturan**:
- Generic types untuk response wrapper
- Konsisten dengan format API yang sudah ditetapkan

### 3. Business Constants (Module-Specific)
**TIDAK boleh di @repo/domain**, harus berada di module/feature masing-masing:

❌ **SALAH** (di @repo/domain):
```typescript
// packages/domain/src/constants/status.ts
export const STATUS = { ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" } as const;
```

✅ **BENAR** (di module domain):
```typescript
// apps/api/src/modules/category/domain/constants.ts
export const CategoryStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

// atau di feature domain (web)
// apps/web/src/features/category/domain/constants.ts
export const CategoryStatus = {
  ACTIVE: "ACTIVE", 
  INACTIVE: "INACTIVE",
} as const;
```

**Kenapa?** Business-specific constants adalah bagian dari bounded context. Mereka tidak universal dan tidak boleh di shared kernel.

## Aturan Penggunaan

### ✅ Boleh di `@repo/domain`:
- Error codes universal (BAD_REQUEST, NOT_FOUND, dll)
- HTTP status codes mapping
- API response format types
- Generic type utilities yang benar-benar universal

### ❌ TIDAK boleh di `@repo/domain`:
- Business constants (STATUS, ROLE, CATEGORY_TYPE, dll)
- Feature-specific enums
- Module-specific constants
- Values yang hanya dipakai satu bounded context

### Module-Specific Constants
Untuk constants yang specific ke module/feature:

**Backend (API)**:
- Location: `apps/api/src/modules/<module>/domain/constants.ts`
- Example: `CategoryStatus`, `BudgetPeriod`, `TransactionType`

**Frontend (Web)**:
- Location: `apps/web/src/features/<feature>/domain/constants.ts`
- Example: form default values, UI-specific constants

## Contoh Penggunaan

### 1. Menggunakan Error Codes (dari @repo/domain)
```typescript
// apps/api/src/modules/user/application/use-cases/create-user.use-case.ts
import { ErrorCodes } from "@repo/domain/errors";

throw new DomainError(ErrorCodes.CONFLICT, "Email already exists");
```

### 2. Menggunakan Business Constants (dari module domain)
```typescript
// apps/api/src/modules/category/domain/constants.ts
export const CategoryStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type CategoryStatusType = (typeof CategoryStatus)[keyof typeof CategoryStatus];

// Usage di entity
// apps/api/src/modules/category/domain/entities/category.ts
import { CategoryStatus, CategoryStatusType } from "../constants";

export class Category {
  constructor(
    public readonly id: string,
    public name: string,
    public status: CategoryStatusType,
  ) {
    if (!Object.values(CategoryStatus).includes(status)) {
      throw new Error("Invalid category status");
    }
  }
}
```

### 3. Sharing Constants Antar Apps (Via Schema)
Jika constants dibutuhkan untuk validation di boundary (HTTP/form), gunakan `@repo/schema`:

```typescript
// packages/schema/src/category/index.ts
export const StatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export type Status = z.infer<typeof StatusSchema>;

// Ini DTO/contract, bukan domain constant!
```

## Decision Tree: Di Mana Menaruh Constants?

```
Apakah constant ini universal (dipakai semua bounded context)?
├─ YA → Apakah ini infra/technical concern (error codes, http status)?
│  ├─ YA → @repo/domain
│  └─ NO → JANGAN di @repo/domain (buatkan shared service/event)
└─ NO → Module/Feature domain
   ├─ API: apps/api/src/modules/<module>/domain/constants.ts
   └─ Web: apps/web/src/features/<feature>/domain/constants.ts
```

## Naming Conventions

### Constant Object Names
- PascalCase untuk object name: `ErrorCodes`, `CategoryStatus`
- SCREAMING_SNAKE_CASE untuk keys: `ACTIVE`, `NOT_FOUND`
- Suffix dengan type jika perlu: `CategoryStatusType`

### File Names
- Singular: `constants.ts` atau `error-codes.ts`
- Descriptive: `status.constants.ts` jika banyak constant files dalam satu folder

## Type Safety
Selalu export type dari constant object menggunakan pattern:
```typescript
export const MyConst = { ... } as const;
export type MyConstType = (typeof MyConst)[keyof typeof MyConst];
```

Ini memastikan:
- Immutability (`as const`)
- Type inference otomatis
- Compile-time type checking

## Migration Checklist
Saat refactoring existing constants:
1. ✅ Identifikasi constants yang benar-benar universal vs business-specific
2. ✅ Pindahkan universal constants ke `@repo/domain`
3. ✅ Pindahkan business constants ke module/feature domain
4. ✅ Update imports di semua apps
5. ✅ Pastikan tidak ada cross-module imports untuk business constants
6. ✅ Run type check dan tests

## Anti-Patterns (HINDARI)
❌ Constants di shared tapi hanya dipakai satu module
❌ Business logic di constant definition
❌ Mutable constants (tanpa `as const`)
❌ Constants di root level tanpa namespace/object wrapper
❌ Magic strings/numbers langsung di code (harusnya jadi constant)
