---
applyTo: '**'
---
# Clean Architecture + DDD

## Layering (Wajib)
Presentation/Delivery → Application → Domain ← Infrastructure

- **Presentation (UI/HTTP handlers)**
  - Web: Next route/page components, view models, containers
  - API: Elysia handlers (thin), routing
  - Tugas: validate request, panggil use case, map error → response

- **Application (Use Cases)**
  - Orkestrasi bisnis, rules tingkat aplikasi
  - Hanya bergantung ke Domain + abstractions (repo interface, service port)
  - Tidak boleh import framework (React, Next, Elysia), tidak boleh import Firebase SDK

- **Domain (Core)**
  - Entities, Value Objects, Domain Services, Domain Events
  - Pure TS, **zero external dependencies**
  - Enforce invariant via factory/constructor (throw canonical domain errors)
  - Business-specific constants (Status, Type, Category, dll) berada di domain module/feature
  - Universal constants (error codes, API types) dari `@repo/domain`

- **Infrastructure**
  - Implementasi repo/service (Firebase, DB, HTTP clients)
  - Map data model ↔ domain
  - Tidak boleh mengembalikan DTO; return Domain entities/value objects

## Boundary Rules (Web)
Allowed:
- `app/` → `features/`, `components/`, `shared/`, `lib/`
- `features/*/application` → `features/*/domain`
- `features/*/components|hooks` → `features/*/application` (via adapters/hooks)
- `infrastructure/` → `features/*/domain`, `shared/`, `lib/`
- `features/*/domain` → `@repo/domain` (hanya untuk universal constants/types)

Forbidden:
- Cross-feature import: `features/a` ↔ `features/b`
- Domain import dari React/Next/fetch/Firebase/Zod
- Business constants di `@repo/domain` (harus di feature domain)

## Boundary Rules (API)
Allowed:
- `delivery/` → `modules/*/application`, `shared/errors`
- `modules/*/application` → `modules/*/domain`, `shared/errors`
- `modules/*/infrastructure` → `modules/*/domain`, `shared/*` (db, util)
- `modules/*/domain` → `@repo/domain` (hanya untuk universal constants/types)

Forbidden:
- Domain/Application import dari Elysia/Firebase SDK/DB client langsung
- Cross-module import: `modules/transaction` ↔ `modules/user`
- Business constants di `@repo/domain` (harus di module domain)

## Canonical Errors (Backend)
Use case harus throw error ini (atau domain-specific error yang di-map ke canonical di application/delivery):
- `ErrInvalid` → 400
- `ErrDuplicate` → 409
- `ErrNotFound` → 404
- Unknown → 500