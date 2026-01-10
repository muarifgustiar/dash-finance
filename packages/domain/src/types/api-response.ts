/**
 * Generic API Response wrapper
 * ✅ SHARED KERNEL: Universal, used by all modules
 */
export type ApiResponse<T = unknown> = {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
};

/**
 * Generic API Error response
 * ✅ SHARED KERNEL: Universal error format
 */
export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
};

/**
 * Union type for all API responses
 */
export type ApiResult<T = unknown> = ApiResponse<T> | ApiError;
