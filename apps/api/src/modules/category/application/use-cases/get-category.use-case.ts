/**
 * Get Category Use Case - Application Layer
 */

import type { ICategoryRepository } from "../../domain/repositories/category-repository.interface";
import { Category } from "../../domain/entities/category";
import { ErrNotFound } from "../../../../shared/errors";

export class GetCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(id: string): Promise<Category> {
    const category = await this.repository.findById(id);
    
    if (!category) {
      throw new ErrNotFound(`Category with id '${id}' not found`);
    }

    return category;
  }
}
