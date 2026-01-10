/**
 * Transaction Hooks (Presentation)
 * TanStack Query hooks for transaction operations
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { TransactionResponse } from "@repo/schema/transaction";

export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters: TransactionFilters) => [...transactionKeys.lists(), filters] as const,
};

export interface TransactionFilters {
  budgetOwnerId?: string;
  categoryId?: string;
  categoryIds?: string[];
  startDate?: string;
  endDate?: string;
  year?: number;
  page?: number;
  limit?: number;
}

interface TransactionsResponse {
  success: boolean;
  data: {
    data: TransactionResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export function useTransactions(filters: TransactionFilters = {}) {
  const queryParams = new URLSearchParams();
  
  if (filters.budgetOwnerId) queryParams.append("budgetOwnerId", filters.budgetOwnerId);
  if (filters.categoryId) queryParams.append("categoryId", filters.categoryId);
  if (filters.categoryIds && filters.categoryIds.length > 0) {
    filters.categoryIds.forEach(id => queryParams.append("categoryIds", id));
  }
  if (filters.startDate) queryParams.append("startDate", filters.startDate);
  if (filters.endDate) queryParams.append("endDate", filters.endDate);
  if (filters.year) queryParams.append("year", filters.year.toString());
  if (filters.page) queryParams.append("page", filters.page.toString());
  if (filters.limit) queryParams.append("limit", filters.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/transactions${queryString ? `?${queryString}` : ""}`;

  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => apiRequest<TransactionsResponse>(endpoint),
  });
}
