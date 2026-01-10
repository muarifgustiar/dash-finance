/**
 * API Category Repository (Infrastructure)
 * Implements CategoryRepository using fetch API
 */

import type { Category, CategoryStatus } from "../../domain/entities/category";
import type { CategoryRepository, CreateCategoryData, UpdateCategoryData } from "../../domain/repositories/category-repository";
import { apiRequest } from "@/lib/api-client";
import type { CategoryResponse } from "@repo/schema/category";

export class ApiCategoryRepository implements CategoryRepository {
  private mapResponse(dto: CategoryResponse): Category {
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      status: dto.status,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    };
  }

  async findAll(status?: CategoryStatus): Promise<Category[]> {
    const query = status ? `?status=${status}` : "";
    const response = await apiRequest<{ success: boolean; data: CategoryResponse[] }>(
      `/categories${query}`
    );
    return response.data.map((dto) => this.mapResponse(dto));
  }

  async findById(id: string): Promise<Category | null> {
    try {
      const response = await apiRequest<{ success: boolean; data: CategoryResponse }>(
        `/categories/${id}`
      );
      return this.mapResponse(response.data);
    } catch (error) {
      if (error instanceof Error && "status" in error && (error as { status: number }).status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const response = await apiRequest<{ success: boolean; data: CategoryResponse }>(
      `/categories`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    return this.mapResponse(response.data);
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await apiRequest<{ success: boolean; data: CategoryResponse }>(
      `/categories/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
    return this.mapResponse(response.data);
  }

  async delete(id: string): Promise<void> {
    await apiRequest<{ success: boolean; data: null }>(
      `/categories/${id}`,
      {
        method: "DELETE",
      }
    );
  }
}
