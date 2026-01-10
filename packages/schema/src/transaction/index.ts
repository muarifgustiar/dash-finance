/**
 * Transaction Schemas
 * ✅ Shared contracts for API & Web
 */

import { z } from "zod";
import { NonEmptyStringSchema } from "../common";

// ============================================
// Request DTOs
// ============================================

export const CreateTransactionRequestSchema = z.object({
  budgetOwnerId: z.uuid(),
  categoryId: z.uuid(),
  date: z.coerce.date(),
  amount: z.number().positive(),
  description: NonEmptyStringSchema,
  receiptUrl: z.url().optional(),
});

export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>;

export const UpdateTransactionRequestSchema = z.object({
  budgetOwnerId: z.uuid().optional(),
  categoryId: z.uuid().optional(),
  date: z.coerce.date().optional(),
  amount: z.number().positive().optional(),
  description: NonEmptyStringSchema.optional(),
  receiptUrl: z.url().optional(),
});

export type UpdateTransactionRequest = z.infer<typeof UpdateTransactionRequestSchema>;

// ============================================
// Response DTOs
// ============================================

export const TransactionResponseSchema = z.object({
  id: z.uuid(),
  budgetOwnerId: z.uuid(),
  budgetOwnerName: z.string(),
  categoryId: z.uuid(),
  categoryName: z.string(),
  date: z.iso.datetime(),
  amount: z.number(),
  description: z.string(),
  receiptUrl: z.url().nullable(),
  createdBy: z.uuid(),
  createdByName: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;

// ============================================
// Query DTOs
// ============================================

export const GetTransactionsQuerySchema = z
  .object({
    budgetOwnerId: z.uuid().optional(),
    categoryId: z.uuid().optional(),
    categoryIds: z.array(z.uuid()).max(50).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    year: z.coerce.number().int().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })
  .refine(
    (data) => !(data.categoryId && data.categoryIds),
    {
      message: "Cannot specify both categoryId and categoryIds",
      path: ["categoryIds"],
    }
  );

export type GetTransactionsQuery = z.infer<typeof GetTransactionsQuerySchema>;
