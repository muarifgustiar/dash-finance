/**
 * Get Categories Use Case (Application)
 * Orchestrates category retrieval logic
 */

import type { Category, CategoryStatus } from "../domain/entities/category";
import type { CategoryRepository } from "../domain/repositories/category-repository";

export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoriesQuery): Promise<Category[]> {
    return this.categoryRepository.findAll(query.status);
  }
}

export interface GetCategoriesQuery {
  status?: CategoryStatus;
}
