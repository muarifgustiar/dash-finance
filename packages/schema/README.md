# @repo/schema

**Shared Zod validation schemas and DTO contracts for Dash Finance monorepo.**

## Purpose

This package contains:
- ✅ Zod schemas for validation at boundaries (HTTP/forms)
- ✅ DTO types inferred from schemas
- ✅ Reusable validation building blocks (EmailSchema, UuidSchema, etc.)

## Why Separate from @repo/domain?

- `@repo/domain` = Pure TypeScript (zero dependencies)
- `@repo/schema` = Zod schemas (validation contracts)

## Usage

### API (Delivery Layer)
```typescript
import { CreateUserRequestSchema } from "@repo/schema/user";

app.post("/users", {
  body: CreateUserRequestSchema,
  handler: async ({ body }) => { ... }
});
```

### Web (Form Validation)
```typescript
import { CreateUserRequestSchema } from "@repo/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";

const form = useForm({
  resolver: zodResolver(CreateUserRequestSchema)
});
```

## Architecture Rules

1. **Zod schemas only** - No business logic
2. **No domain entities** - Keep those in bounded contexts
3. **Shared contracts** - Used by api/web/mobile
4. **Boundary validation** - Input/output contracts

## Structure

```
src/
  common/       # Reusable validation primitives
  user/         # User-related DTO schemas
  transaction/  # Transaction-related DTO schemas
```
