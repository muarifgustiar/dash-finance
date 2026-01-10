/**
 * Budget Schemas
 * ✅ Shared contracts for API & Web
 */

import { z } from "zod";

// ============================================
// Request DTOs
// ============================================

export const CreateBudgetRequestSchema = z.object({
  budgetOwnerId: z.string().uuid(),
  year: z.number().int().min(2000).max(2100),
  amountPlanned: z.number().positive(),
  amountRevised: z.number().positive().optional(),
});

export type CreateBudgetRequest = z.infer<typeof CreateBudgetRequestSchema>;

export const UpdateBudgetRequestSchema = z.object({
  amountPlanned: z.number().positive().optional(),
  amountRevised: z.number().positive().optional(),
});

export type UpdateBudgetRequest = z.infer<typeof UpdateBudgetRequestSchema>;

// ============================================
// Response DTOs
// ============================================

export const BudgetResponseSchema = z.object({
  id: z.string().uuid(),
  budgetOwnerId: z.string().uuid(),
  budgetOwnerName: z.string(),
  year: z.number().int(),
  amountPlanned: z.number(),
  amountRevised: z.number().nullable(),
  amountSpent: z.number(),
  amountRemaining: z.number(),
  utilizationPercentage: z.number(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BudgetResponse = z.infer<typeof BudgetResponseSchema>;

export const BudgetSummaryResponseSchema = z.object({
  budgetOwnerId: z.string().uuid(),
  budgetOwnerName: z.string(),
  year: z.number().int(),
  amountPlanned: z.number(),
  amountRevised: z.number().nullable(),
  amountSpent: z.number(),
  amountRemaining: z.number(),
  utilizationPercentage: z.number(),
  transactionCount: z.number(),
});

export type BudgetSummaryResponse = z.infer<typeof BudgetSummaryResponseSchema>;

// ============================================
// Query DTOs
// ============================================

export const GetBudgetsQuerySchema = z.object({
  year: z.coerce.number().int().optional(),
  budgetOwnerId: z.string().uuid().optional(),
});

export type GetBudgetsQuery = z.infer<typeof GetBudgetsQuerySchema>;
