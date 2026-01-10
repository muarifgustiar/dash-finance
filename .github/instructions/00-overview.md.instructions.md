---
applyTo: '**'
---
# Finance Dashboard - Engineering Guide (Monorepo)

## Bahasa & Konten
- Konten user-facing: **Bahasa Indonesia**
- Identifiers code (type/function/variable/file): **English**
- UI text: **Bahasa Indonesia**
- Jangan campur bahasa di identifier code.

## Tech Stack (Ringkas)
- Runtime: **Bun** (API)
- Package manager: **Bun** (workspaces)
- Task runner/orchestration: **Turborepo**
- Web: **Next.js 15 App Router + TypeScript**
- Mobile: **Expo + React Native + TypeScript**
- Backend: **Elysia.js + TypeScript**
- Validation/Contracts: **Zod schemas**
- State Management & Forms (Web): **TanStack Query + TanStack Form + TanStack Table**
- Backend services: **Firebase Auth/Firestore/Storage**
- Testing: **Vitest + Testing Library + MSW** (web), **bun:test** (api bila dibutuhkan)

## Non-Negotiables (Global)
1. **Clean Architecture + DDD**: dependency mengarah ke dalam (inward only).
2. **Domain Layer harus PURE**: tidak boleh ada dependency eksternal (termasuk Zod, Firebase, Elysia, React).
3. **Tidak ada cross-feature imports** (bounded context saling independent).
4. **DI wajib**: use case menerima dependency via constructor (tanpa hard-coded concretes).
5. **API response format tidak boleh berubah** (keys/structure tetap).

## "Single Source of Truth" untuk Validation & Constants
- **Zod** (`@repo/schema`) = single source untuk **DTO/contract** dan validasi boundary (HTTP/form).
- **Constants** (`@repo/domain`) = single source untuk **universal constants** (error codes, API types) — **BUKAN business constants**.
- **Business constants** = di module/feature domain masing-masing (bounded context).
- Domain entity/value object = **pure TS** (enforce invariant lewat constructor/factory, bukan Zod).
- Mapping:
  - Delivery/Presentation: validate (Zod) → Command/DTO
  - Application: orchestrate → Domain
  - Infrastructure: map persistence → Domain