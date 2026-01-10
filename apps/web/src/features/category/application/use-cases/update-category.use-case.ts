/**
 * Update Category Use Case (Application)
 * Orchestrates category update logic
 */

import type { Category } from "../domain/entities/category";
import type { CategoryRepository, UpdateCategoryData } from "../domain/repositories/category-repository";

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string, data: UpdateCategoryData): Promise<Category> {
    return this.categoryRepository.update(id, data);
  }
}
