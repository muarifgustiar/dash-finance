/**
 * Category Repository Interface (Domain)
 * Port - to be implemented by infrastructure
 */

import type { Category, CategoryStatus } from "../entities/category";

export interface CategoryRepository {
  findAll(status?: CategoryStatus): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  create(data: CreateCategoryData): Promise<Category>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  status?: CategoryStatus;
}
