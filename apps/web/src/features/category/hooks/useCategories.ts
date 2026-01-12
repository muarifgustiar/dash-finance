/**
 * Category Hooks (Presentation)
 * TanStack Query hooks with direct API calls
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CategoryStatus, Category } from "../domain/entities/category";
import { apiRequest } from "@/lib/api-client";
import type {
  CategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@repo/schema/category";

// Type definitions for mutation inputs
export interface CreateCategoryData {
  name: string;
  description?: string;
  status?: CategoryStatus;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string | null;
  status?: CategoryStatus;
}

// Mapper function: API DTO → Domain Entity
function mapCategoryResponse(dto: CategoryResponse): Category {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    status: dto.status,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
  };
}

// Query keys for cache management
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (status?: CategoryStatus) => [...categoryKeys.lists(), { status }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

/**
 * Fetch categories with optional status filter
 */
export function useCategories(status?: CategoryStatus) {
  return useQuery({
    queryKey: categoryKeys.list(status),
    queryFn: async () => {
      const query = status ? `?status=${status}` : "";
      const response = await apiRequest<{ data: CategoryResponse[] }>(
        `/categories${query}`
      );
      return response.data.map(mapCategoryResponse);
    },
  });
}

/**
 * Create new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const payload: CreateCategoryRequest = {
        name: data.name,
        description: data.description,
      };
      const response = await apiRequest<{ data: CategoryResponse }>(
        "/categories",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      return mapCategoryResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

/**
 * Update existing category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryData }) => {
      const payload: UpdateCategoryRequest = {
        name: data.name,
        description: data.description === null ? undefined : data.description,
        status: data.status,
      };
      const response = await apiRequest<{ data: CategoryResponse }>(
        `/categories/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );
      return mapCategoryResponse(response.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

/**
 * Delete category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest(`/categories/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
