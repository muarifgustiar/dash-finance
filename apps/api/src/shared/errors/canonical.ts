import type { ApiError, ApiResponse } from "@repo/domain/types";
import { ErrorCodes } from "@repo/domain/errors";

/**
 * Canonical domain errors
 * These are thrown by use cases and mapped to HTTP by handlers
 */

export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class ErrInvalid extends DomainError {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.VALIDATION_ERROR, message, details);
    this.name = "ErrInvalid";
  }
}

export class ErrNotFound extends DomainError {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.NOT_FOUND, message, details);
    this.name = "ErrNotFound";
  }
}

export class ErrDuplicate extends DomainError {
  constructor(message: string, details?: unknown) {
    super(ErrorCodes.CONFLICT, message, details);
    this.name = "ErrDuplicate";
  }
}

export class ErrUnauthorized extends DomainError {
  constructor(message: string = "Unauthorized", details?: unknown) {
    super(ErrorCodes.UNAUTHORIZED, message, details);
    this.name = "ErrUnauthorized";
  }
}

/**
 * HTTP status mapping for canonical errors
 */
export function getHttpStatus(error: DomainError): number {
  switch (error.code) {
    case ErrorCodes.VALIDATION_ERROR:
      return 400;
    case ErrorCodes.UNAUTHORIZED:
      return 401;
    case ErrorCodes.FORBIDDEN:
      return 403;
    case ErrorCodes.NOT_FOUND:
      return 404;
    case ErrorCodes.CONFLICT:
      return 409;
    case ErrorCodes.BAD_REQUEST:
      return 400;
    case ErrorCodes.INTERNAL_ERROR:
    case ErrorCodes.DATABASE_ERROR:
    case ErrorCodes.SERVICE_UNAVAILABLE:
    default:
      return 500;
  }
}

/**
 * Convert domain error to HTTP response
 */
export function mapErrorToResponse(
  error: unknown,
  requestId?: string
): ApiError {
  if (error instanceof DomainError) {
    return {
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
  }

  // Unknown error
  return {
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: error instanceof Error ? error.message : "Internal server error",
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}
