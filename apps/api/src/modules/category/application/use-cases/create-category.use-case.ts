/**
 * Create Category Use Case - Application Layer
 */

import type { ICategoryRepository } from "../../domain/repositories/category-repository.interface";
import { Category } from "../../domain/entities/category";
import { ErrDuplicate } from "../../../../shared/errors";
import { randomUUID } from "crypto";

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export class CreateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

  async execute(dto: CreateCategoryDTO): Promise<Category> {
    // Check name uniqueness
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new ErrDuplicate(`Category with name '${dto.name}' already exists`);
    }

    // Create domain entity
    const category = Category.create(
      randomUUID(),
      dto.name,
      dto.description
    );

    // Persist
    return await this.repository.create(category);
  }
}
