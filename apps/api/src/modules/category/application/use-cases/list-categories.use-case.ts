/**
 * List Categories Use Case - Application Layer
 */

import type { CategoryRepository } from "../../domain/repositories/category-repository";
import { Category } from "../../domain/entities/category";

export interface ListCategoriesDTO {
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
}

export class ListCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(dto?: ListCategoriesDTO): Promise<Category[]> {
    return this.repository.findAll(dto);
  }
}
