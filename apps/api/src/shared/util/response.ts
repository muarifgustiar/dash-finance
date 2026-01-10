import type { ApiResponse } from "@repo/domain/types";

/**
 * Response helpers
 * Used by handlers to create consistent response format
 */

export function success<T>(
  data: T,
  requestId?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

export function error(
  message: string,
  statusCode?: number,
  requestId?: string
): { success: false; error: string; meta: { timestamp: string; requestId?: string } } {
  return {
    success: false,
    error: message,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}
