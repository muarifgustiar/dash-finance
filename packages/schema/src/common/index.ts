/**
 * Common Validation Schemas
 * ✅ Reusable building blocks for DTOs
 * Used across all bounded contexts
 */

import { z } from "zod";

// Primitive validators
export const EmailSchema = z.email().toLowerCase();

export const UuidSchema = z.uuid();

export const PositiveIntSchema = z.number().int().positive();

export const NonEmptyStringSchema = z.string().min(1).trim();

// Pagination
/**
 * Query parameter schema for pagination
 * Used in API route validation for list endpoints
 * @example
 * // With pagination (default)
 * ?page=2&limit=50
 * // Without pagination
 * ?paginate=false
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  paginate: z.coerce.boolean().default(true),
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

// Date range
export const DateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End date must be after start date",
});

export type DateRange = z.infer<typeof DateRangeSchema>;
