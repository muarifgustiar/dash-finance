/**
 * Example: Create User Form
 * ✅ TanStack Form with Zod validation
 * Type-safe form with schema validation
 */

"use client";

import { useForm } from "@tanstack/react-form";
import { CreateUserRequestSchema, type CreateUserRequest } from "@repo/schema/user";
import { FormField } from "./form-field";

interface CreateUserFormProps {
  onSubmit: (data: CreateUserRequest) => Promise<void>;
}

export function CreateUserForm({ onSubmit }: CreateUserFormProps) {
  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    } as CreateUserRequest,
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
    validators: {
      onDynamic: CreateUserRequestSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
      >
        {(field) => (
          <FormField
            label="Email"
            required
            error={field.state.meta.errors.join(", ")}
          >
            <input
              type="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="name"
      >
        {(field) => (
          <FormField
            label="Nama"
            required
            error={field.state.meta.errors.join(", ")}
          >
            <input
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nama lengkap"
            />
          </FormField>
        )}
      </form.Field>

      <form.Field
        name="password"
      >
        {(field) => (
          <FormField
            label="Password"
            required
            error={field.state.meta.errors.join(", ")}
          >
            <input
              type="password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 8 karakter"
            />
          </FormField>
        )}
      </form.Field>

      <div className="flex gap-2">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          )}
        </form.Subscribe>

        <button
          type="button"
          onClick={() => form.reset()}
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </form>
  );
}
