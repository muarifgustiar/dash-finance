/**
 * Category Schemas
 * ✅ Shared contracts for API & Web
 */

import { z } from "zod";
import { NonEmptyStringSchema } from "../common";

export const StatusSchema = z.enum(["ACTIVE", "INACTIVE"]);
export type Status = z.infer<typeof StatusSchema>;

// ============================================
// Request DTOs
// ============================================

export const CreateCategoryRequestSchema = z.object({
  name: NonEmptyStringSchema,
  description: z.string().optional(),
});

export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;

export const UpdateCategoryRequestSchema = z.object({
  name: NonEmptyStringSchema.optional(),
  description: z.string().optional(),
  status: StatusSchema.optional(),
});

export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;

// ============================================
// Response DTOs
// ============================================

export const CategoryResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: StatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;

// ============================================
// Query DTOs
// ============================================

export const GetCategoriesQuerySchema = z.object({
  status: StatusSchema.optional(),
  search: z.string().optional(),
});

export type GetCategoriesQuery = z.infer<typeof GetCategoriesQuerySchema>;
