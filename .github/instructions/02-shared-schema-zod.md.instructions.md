---
applyTo: '**'
---
# Shared Schema (Zod) - Best Practice

## Kenapa Zod tidak boleh di Domain Layer?
Domain wajib zero dependency. Zod itu dependency eksternal, jadi schema kontrak/validation harus berada di layer boundary:
- `packages/schema` = single source untuk contract/DTO validation
- Domain entity/value object tetap pure TS

## Paket Shared: `@repo/schema`
Tujuan:
- Dipakai oleh `apps/web` (form + client validation + DTO typing)
- Dipakai oleh `apps/api` (delivery validation untuk request/response contract)
- Menghindari duplikasi schema antar app

## Aturan
1. Schema diorganisasi per bounded context/feature:
   - `packages/schema/src/<feature>/*.schema.ts`
2. Schema selalu export:
   - Zod schema (`TransactionCreateSchema`)
   - Type (`TransactionCreateDTO = z.infer<typeof ...>`)
3. Schema hanya untuk DTO/contract, bukan domain entity.
4. Mapping ke domain dilakukan di Application:
   - `CreateTransactionCommand` (application DTO) → `Transaction` (domain)

## Contoh penggunaan (Web)
- Validasi form dengan TanStack Form: `zodValidator({ schema: TransactionCreateSchema })`
- DTO type: `TransactionCreateDTO`

## Contoh penggunaan (API)
- Delivery validate: `body: TransactionCreateSchema`
- Handler mem-build command untuk use case