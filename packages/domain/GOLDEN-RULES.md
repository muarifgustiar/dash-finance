# 3 Golden Rules untuk Arsitektur Monorepo yang Bersih

## ✅ Rule #1: Apps are Leaves (Apps adalah Daun)

**❌ JANGAN:**
```typescript
// ❌ Di packages/domain/utils.ts
import { prisma } from "@repo/api/db";  // SALAH! Package import dari app
```

**✅ LAKUKAN:**
```typescript
// ✅ Di apps/api/routes/users.ts
import { UserResponse } from "@repo/domain/dtos";  // BENAR! App import dari package
```

**Kenapa?** Apps adalah consumer terakhir. Kalau package import dari app, dependency jadi circular dan kompleksitas meledak.

---

## ✅ Rule #2: Contract ≠ Database

**❌ JANGAN Taruh di `packages/domain`:**
- ❌ Prisma schema
- ❌ Database queries
- ❌ ORM models
- ❌ Repository implementations

**✅ LAKUKAN di `packages/domain`:**
- ✅ Type definitions
- ✅ DTOs (Request/Response contracts)
- ✅ Validation schemas (Zod)
- ✅ Business rules/constants

**❌ CONTOH SALAH:**
```typescript
// ❌ packages/domain/repositories/user.ts
import { prisma } from "@repo/api/db";  // HORROR STORY!

export async function createUser(data: CreateUserRequest) {
  return prisma.user.create({ data });  // Sekarang web ikut kebawa Prisma!
}
```

**✅ CONTOH BENAR:**
```typescript
// ✅ packages/domain/dtos/user.dto.ts
import { z } from "zod";

export const CreateUserRequestSchema = z.object({
  email: z.string().email(),
  name: z.string(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
```

```typescript
// ✅ apps/api/repositories/user.ts (DB logic di app!)
import { prisma } from "./db";
import type { CreateUserRequest } from "@repo/domain/dtos";

export async function createUser(data: CreateUserRequest) {
  return prisma.user.create({ data });
}
```

**Kenapa?** Domain package bisa dipakai web & api. Kalau ada DB logic di domain, web ikut bundle Prisma (500kb+) padahal cuma butuh types!

---

## ✅ Rule #3: Pisahkan DTO per Boundary

```
packages/domain/src/
├── types/          # Generic API contracts
│   ├── api-response.ts    # ApiResponse<T>, ApiError
│   └── pagination.ts      # PaginatedResponse<T>
│
├── schemas/        # Reusable validation schemas
│   └── common.ts          # EmailSchema, UuidSchema, PaginationQuerySchema
│
└── dtos/           # Endpoint-specific contracts
    ├── user.dto.ts        # CreateUserRequest, UserResponse
    └── auth.dto.ts        # LoginRequest, LoginResponse
```

**Kenapa dipisah?**

### `types/` - Generic, reusable di semua endpoint
```typescript
// Semua endpoint pakai format ini
export type ApiResponse<T> = {
  success: true;
  data: T;
  meta: { timestamp: string };
};
```

### `schemas/` - Building blocks untuk validasi
```typescript
// Reusable Zod schemas
export const EmailSchema = z.string().email().toLowerCase();
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
```

### `dtos/` - Endpoint-specific contracts
```typescript
// Kombinasi schemas jadi DTO spesifik
export const CreateUserRequestSchema = z.object({
  email: EmailSchema,  // ← Reuse schema
  name: NonEmptyStringSchema,
  password: z.string().min(8),
});
```

---

## 📦 Hasil Akhir: Clean Architecture

```
apps/
├── api/                    # Backend (Elysia + Prisma)
│   ├── src/
│   │   ├── routes/        # ✅ Import from @repo/domain
│   │   ├── repositories/  # ✅ DB queries DI SINI, bukan di domain
│   │   └── db/            # ✅ Prisma client
│   └── package.json       # dependencies: @repo/domain
│
└── web/                    # Frontend (Next.js)
    ├── src/
    │   ├── app/           # ✅ Import from @repo/domain
    │   └── api/           # ✅ Fetch dengan types dari domain
    └── package.json       # dependencies: @repo/domain

packages/
└── domain/                 # Shared contracts
    ├── src/
    │   ├── types/         # ✅ Generic API types
    │   ├── schemas/       # ✅ Zod validation
    │   └── dtos/          # ✅ Request/Response contracts
    └── package.json       # dependencies: zod ONLY
```

**Benefit:**
1. ✅ Web bundle kecil (cuma types, ~0kb runtime)
2. ✅ API bisa ganti DB tanpa touch domain
3. ✅ Type-safety end-to-end (frontend-backend)
4. ✅ Single source of truth untuk contracts
5. ✅ Gampang di-test (mock DTO, bukan DB)

---

## 🚨 Red Flags (Horror Story Indicators)

1. ❌ Ada `import prisma` di `packages/*`
2. ❌ Ada `import from "@repo/api"` di `packages/domain`
3. ❌ File `packages/domain/db.ts` atau `schema.prisma` di domain
4. ❌ Web bundle size tiba-tiba 2MB+ gara-gara kebawa server deps
5. ❌ Circular dependency warnings

---

## 🎯 Quick Check: Is My Architecture Clean?

**Test 1:** Bisa ganti Prisma ke Drizzle tanpa touch `packages/domain`?
- ✅ Yes → Clean!
- ❌ No → Ada DB logic di domain, fix it!

**Test 2:** Web bundle size reasonable?
- ✅ < 500kb → Clean!
- ❌ > 2MB → Kebawa server deps, check imports!

**Test 3:** Dependency graph tree-shaped?
```
apps/api ──→ packages/domain ──→ zod
apps/web ──→ packages/domain ──→ zod
```
- ✅ One direction → Clean!
- ❌ Circular arrows → Horror story incoming!
