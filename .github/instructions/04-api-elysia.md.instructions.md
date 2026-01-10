---
applyTo: '**'
---
# API (Bun + Elysia) - Struktur & Aturan (Delivery per Module)

Dokumen ini menetapkan best practice untuk:
- Struktur folder API per module (bounded context)
- Cara menulis routes + handlers yang “thin”
- Cara module memakai domain shared dari `@repo/domain` tanpa melanggar Clean Architecture
- Delivery (HTTP) **digabung ke masing-masing module** (bukan terpusat)

---

## Struktur Direktori (Final - Recommended)

```text
apps/api/src/
  main.ts                          # bootstrap: env load, DI container, server start

  delivery/http/
    app.ts                         # Elysia app setup global (middleware, plugins), compose module routes only

  modules/<module>/
    delivery/http/                 # Delivery layer milik module ini (outer layer untuk bounded context)
      routes.ts                    # route registration untuk module ini
      handler.ts                   # thin handler: validate → usecase → map error → respond
    domain/                        # Module domain (PURE TS, no deps)
      entities/
      value-objects/
      repositories/                # interfaces only (ports)
      services/
      errors/
      __tests__/
    application/                   # Use cases (no Elysia, no Firebase SDK)
      use-cases/
      dtos/
      __tests__/
    infrastructure/                # Implementations (Firebase/DB), mapping model ↔ domain
      repositories/
      mappers/
      __tests__/                   # integration tests
    module.container.ts            # DI wiring for this module

  shared/
    errors/
      canonical.ts                 # ErrInvalid/ErrDuplicate/ErrNotFound
      http-mapper.ts               # Error → HTTP mapping helper (delivery only)
    util/
      env.ts
      logger.ts

Kenapa delivery digabung ke module?
	•	Bounded context jadi “paket lengkap”: delivery + app + domain + infra ada dalam satu boundary.
	•	Mengurangi coupling antar module, dan memperjelas ownership.
	•	Tetap Clean Architecture: delivery adalah outer layer, tapi terlokalisasi per module.

⸻

Domain Shared: @repo/domain (Wajib untuk Shared Core)

Prinsip
	•	@repo/domain = core domain yang benar-benar shared lintas apps (api/web/mobile).
	•	modules/<module>/domain = domain khusus bounded context itu.

Aturan Import (STRICT)

✅ Boleh:
	•	modules/<module>/domain → @repo/domain (hanya jika shared concept memang dipakai)
	•	modules/<module>/application → modules/<module>/domain, @repo/domain, shared/errors
	•	modules/<module>/delivery/http/* → modules/<module>/application, shared/errors, @repo/schema
	•	modules/<module>/infrastructure/* → modules/<module>/domain, @repo/domain, shared/* (db/util)

❌ Tidak boleh:
	•	Domain layer (modules/*/domain atau @repo/domain) import:
	•	Elysia
	•	Firebase SDK
	•	Zod
	•	DB clients
	•	library eksternal apa pun
	•	modules/<module>/application import dari delivery atau infrastructure
	•	Cross-module import: modules/a ↔ modules/b (termasuk delivery)

Catatan: Zod tetap hanya untuk kontrak/validation dan disimpan di @repo/schema.

⸻

Pola Delivery per Module (Wajib)

1) modules/<module>/delivery/http/routes.ts

Tugas file:
	•	Define base path untuk module (mis. /transactions)
	•	Pasang schema validation (body/query/params) dari @repo/schema
	•	Forward ke handler function (yang hanya memanggil use case)

Rules:
	•	Tidak boleh ada business logic
	•	Tidak boleh akses DB/Firebase SDK
	•	Tidak boleh melakukan mapping model persistence

2) modules/<module>/delivery/http/handler.ts

Tugas file:
	•	Ambil use case dari module container (dependency sudah ter-wire)
	•	Convert request → command/dto (application DTO)
	•	Call use case
	•	Catch error → map ke HTTP (via shared/errors/http-mapper.ts)
	•	Return response dengan format yang sudah ditetapkan (jangan ubah format)

Handler harus “thin”:
	•	No business logic
	•	No DB calls
	•	No Firebase SDK direct usage

⸻

Komposisi Global App (Minimal)

apps/api/src/delivery/http/app.ts hanya:
	•	setup Elysia global: middleware, plugin, request id, logger, CORS, dsb.
	•	register routes dari module-module (tanpa tahu detail bisnis)

Aturan:
	•	delivery/http/app.ts tidak boleh import domain/application langsung.
	•	Ia hanya boleh import fungsi register<Module>Routes() dari setiap module delivery.

⸻

Validation (Delivery Only)
	•	Semua request validation dilakukan di modules/<module>/delivery/http/routes.ts menggunakan schema dari @repo/schema.
	•	Schema = kontrak HTTP (DTO), bukan domain entity.
	•	Domain invariants tetap ditegakkan di domain entity/value object (pure TS).

⸻

Error Mapping (Delivery Only)
	•	Use case boleh throw canonical errors:
	•	ErrInvalid → 400
	•	ErrDuplicate → 409
	•	ErrNotFound → 404
	•	Unknown → 500
	•	Mapping status code hanya di delivery handler.

⸻

DI (Wajib)
	•	Use case menerima dependency via constructor (ports/repo interface).
	•	modules/<module>/module.container.ts memasang:
	•	concrete repositories/services (infra)
	•	use cases (application)
	•	expose dependencies yang dibutuhkan delivery module

Delivery module (handler) tidak boleh membuat concrete infra sendiri.

⸻

Contoh Struktur Module: transaction

apps/api/src/modules/transaction/
  delivery/http/
    routes.ts
    handler.ts
  domain/
    entities/transaction.ts
    value-objects/money.ts
    repositories/transaction-repository.ts
  application/
    use-cases/create-transaction.use-case.ts
    dtos/create-transaction.dto.ts
  infrastructure/
    repositories/firestore-transaction.repository.ts
    mappers/transaction.mapper.ts
  module.container.ts

Naming conventions
	•	routes.ts: export registerTransactionRoutes(app, deps)
	•	handler.ts: export handler function(s) createTransactionHandler(deps)
	•	Use case instance suffix: Uc
	•	Repo concrete: FirestoreTransactionRepository, PostgresTransactionRepository

⸻

Verify compliance
	•	Delivery (routes + handlers) berada di dalam masing-masing module ✅
	•	Dependency tetap inward: delivery → application → domain ← infrastructure ✅
	•	Domain tetap pure TS, dan shared core domain lewat @repo/domain tanpa dependency eksternal ✅
	•	Validasi tetap pakai @repo/schema (Zod) hanya di delivery ✅

