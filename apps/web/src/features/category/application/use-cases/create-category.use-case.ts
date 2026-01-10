/**
 * Create Category Use Case (Application)
 * Orchestrates category creation logic
 */

import type { Category } from "../domain/entities/category";
import type { CategoryRepository, CreateCategoryData } from "../domain/repositories/category-repository";

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(data: CreateCategoryData): Promise<Category> {
    return this.categoryRepository.create(data);
  }
}
