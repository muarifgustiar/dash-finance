/**
 * Budget Owner Schemas
 * ✅ Shared contracts for API & Web
 */

import { z } from "zod";
import { NonEmptyStringSchema } from "../common";

// Status enum
export const StatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export type Status = z.infer<typeof StatusSchema>;

// ============================================
// Request DTOs
// ============================================

export const CreateBudgetOwnerRequestSchema = z.object({
  name: NonEmptyStringSchema,
  code: z.string().optional(),
  description: z.string().optional(),
});

export type CreateBudgetOwnerRequest = z.infer<typeof CreateBudgetOwnerRequestSchema>;

export const UpdateBudgetOwnerRequestSchema = z.object({
  name: NonEmptyStringSchema.optional(),
  code: z.string().optional(),
  description: z.string().optional(),
  status: StatusSchema.optional(),
});

export type UpdateBudgetOwnerRequest = z.infer<typeof UpdateBudgetOwnerRequestSchema>;

// ============================================
// Response DTOs
// ============================================

export const BudgetOwnerResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string().nullable(),
  description: z.string().nullable(),
  status: StatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BudgetOwnerResponse = z.infer<typeof BudgetOwnerResponseSchema>;

// ============================================
// Query DTOs
// ============================================

export const GetBudgetOwnersQuerySchema = z.object({
  status: StatusSchema.optional(),
  search: z.string().optional(),
});

export type GetBudgetOwnersQuery = z.infer<typeof GetBudgetOwnersQuerySchema>;
