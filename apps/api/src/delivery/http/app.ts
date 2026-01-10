/**
 * Global Elysia app setup
 * ✅ Minimal: Only middleware, plugins, and route composition
 * No business logic, no direct domain access
 */

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { cookie } from "@elysiajs/cookie";
import type { PrismaClient } from "@prisma/client";
import { DomainError } from "../../shared/errors/canonical";
import type { ApiError, ApiResponse } from "@repo/domain/types";
import { ErrorCodes } from "@repo/domain/errors";

export function createApp(prisma: PrismaClient) {
  const app = new Elysia()
    // CORS configuration
    .use(
      cors({
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        credentials: true,
      })
    )
    // Cookie support
    .use(cookie())
    // Request ID and logger
    .derive(({ headers, set }) => {
      const requestId = headers["x-request-id"] || crypto.randomUUID();
      set.headers["x-request-id"] = requestId;

      return {
        requestId,
      };
    })
    // Auth middleware - extracts userId from cookie
    .derive(async ({ cookie: { token } }) => {
      if (!token.value) {
        return { userId: null, userRole: null };
      }

      try {
        const { jwtVerify } = await import("jose");
        const JWT_SECRET = new TextEncoder().encode(
          process.env.JWT_SECRET || "your-secret-key-change-in-production"
        );

        const { payload } = await jwtVerify(token.value, JWT_SECRET);
        const userId = payload.userId as string;

        // Get user role from database
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true },
        });

        if (!user || user.status !== "ACTIVE") {
          return { userId: null, userRole: null };
        }

        return {
          userId: user.id,
          userRole: user.role,
        };
      } catch {
        return { userId: null, userRole: null };
      }
    })
    // Global error handler
    .onError(({ error, set, requestId }) => {
      console.error(`[${requestId}] Error:`, error);

      if (error instanceof DomainError) {
        const statusMap: Record<string, number> = {
          [ErrorCodes.VALIDATION_ERROR]: 400,
          [ErrorCodes.NOT_FOUND]: 404,
          [ErrorCodes.DUPLICATE]: 409,
          [ErrorCodes.UNAUTHORIZED]: 401,
          [ErrorCodes.FORBIDDEN]: 403,
        };

        set.status = statusMap[error.code] || 500;

        const response: ApiError = {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        };

        return response;
      }

      // Validation error from Elysia
      if (error.code === "VALIDATION") {
        set.status = 400;
        const response: ApiError = {
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: "Validasi gagal",
            details: error.message,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId,
          },
        };
        return response;
      }

      // Generic server error
      set.status = 500;
      const response: ApiError = {
        success: false,
        error: {
          code: ErrorCodes.INTERNAL_ERROR,
          message: "Terjadi kesalahan pada server",
          details: process.env.NODE_ENV === "development" ? error.message : undefined,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
        },
      };

      return response;
    })
    // Health check
    .get("/health", () => {
      const response: ApiResponse<{ status: string }> = {
        success: true,
        data: { status: "ok" },
        meta: { timestamp: new Date().toISOString() },
      };
      return response;
    })
    .get("/", () => {
      const response: ApiResponse<{ message: string; version: string }> = {
        success: true,
        data: {
          message: "Dash Finance API",
          version: "1.0.0",
        },
        meta: { timestamp: new Date().toISOString() },
      };
      return response;
    });

  return app;
}
