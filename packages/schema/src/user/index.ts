/**
 * User DTO Schemas
 * ✅ Shared contracts for API & Web
 * Used for HTTP validation and form validation
 */

import { z } from "zod";
import { EmailSchema, NonEmptyStringSchema, PaginationQuerySchema } from "../common";

// ============================================
// Request DTOs
// ============================================

export const CreateUserRequestSchema = z.object({
  email: EmailSchema,
  name: NonEmptyStringSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: NonEmptyStringSchema,
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ============================================
// Response DTOs
// ============================================

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.string().datetime(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: UserResponseSchema,
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// ============================================
// Query DTOs
// ============================================

export const GetUsersQuerySchema = PaginationQuerySchema;

export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;
