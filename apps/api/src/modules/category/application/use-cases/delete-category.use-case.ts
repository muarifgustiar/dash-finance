/**
 * Delete Category Use Case - Application Layer
 */

import type { CategoryRepository } from "../../domain/repositories/category-repository";
import { ErrNotFound } from "../../../../shared/errors";

export class DeleteCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    
    if (!existing) {
      throw new ErrNotFound(`Category with id '${id}' not found`);
    }

    await this.repository.delete(id);
  }
}
