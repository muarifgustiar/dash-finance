/**
 * Delete Category Use Case (Application)
 * Orchestrates category deletion logic
 */

import type { CategoryRepository } from "../domain/repositories/category-repository";

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    return this.categoryRepository.delete(id);
  }
}
