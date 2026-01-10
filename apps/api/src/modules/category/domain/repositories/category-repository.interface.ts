/**
 * Category Repository Interface - Domain Layer (Port)
 */

import type { PaginationParams } from "@repo/domain/types";
import type { Category } from "../entities/category";

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findAll(
    filters?: {
      status?: "ACTIVE" | "INACTIVE";
      search?: string;
    },
    pagination?: PaginationParams
  ): Promise<{ items: Category[]; total: number }>;
  create(category: Category): Promise<Category>;
  update(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
