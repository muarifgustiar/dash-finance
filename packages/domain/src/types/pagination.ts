/**
 * Generic pagination parameters for queries
 * Used in repository and use case layers
 * @example
 * const params: PaginationParams = { page: 1, limit: 20 };
 */
export type PaginationParams = {
  page: number;   // 1-indexed page number
  limit: number;  // items per page
};

/**
 * Pagination metadata returned in responses
 * Provides complete information for UI pagination controls
 * @example
 * const meta: PaginationMeta = {
 *   page: 2,
 *   limit: 20,
 *   total: 95,
 *   totalPages: 5,
 *   hasNext: true,
 *   hasPrev: true
 * };
 */
export type PaginationMeta = {
  page: number;       // current page (1-indexed)
  limit: number;      // items per page
  total: number;      // total items across all pages
  totalPages: number; // total number of pages (Math.ceil(total / limit))
  hasNext: boolean;   // true if page < totalPages
  hasPrev: boolean;   // true if page > 1
};

/**
 * Generic paginated response wrapper
 * Used in API responses to wrap data with pagination metadata
 * @example
 * const response: PaginatedResponse<User> = {
 *   items: [...users],
 *   pagination: {...meta}
 * };
 */
export type PaginatedResponse<T> = {
  items: T[];
  pagination: PaginationMeta;
};

/**
 * Helper function to calculate pagination metadata
 * @param page - Current page number (1-indexed)
 * @param limit - Items per page
 * @param total - Total items across all pages
 * @returns Complete pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
