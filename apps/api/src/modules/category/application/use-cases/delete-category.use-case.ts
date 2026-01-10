/**
 * Delete Category Use Case - Application Layer
 */

import type { ICategoryRepository } from "../../domain/repositories/category-repository.interface";
import { ErrNotFound } from "../../../../shared/errors";

export class DeleteCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    
    if (!existing) {
      throw new ErrNotFound(`Category with id '${id}' not found`);
    }

    await this.repository.delete(id);
  }
}
