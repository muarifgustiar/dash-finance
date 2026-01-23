/**
 * Update Category Use Case - Application Layer
 */

import type { CategoryRepository, UpdateCategoryData } from "../../domain/repositories/category-repository";
import { Category } from "../../domain/entities/category";
import { ErrNotFound, ErrDuplicate } from "../../../../shared/errors";

export interface UpdateCategoryDTO {
  id: string;
  name?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export class UpdateCategoryUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(dto: UpdateCategoryDTO): Promise<Category> {
    // Find existing
    const existing = await this.repository.findById(dto.id);
    if (!existing) {
      throw new ErrNotFound(`Category with id '${dto.id}' not found`);
    }

    // Check name uniqueness if changed
    if (dto.name && dto.name !== existing.name) {
      const duplicateName = await this.repository.findByName(dto.name);
      if (duplicateName) {
        throw new ErrDuplicate(`Category with name '${dto.name}' already exists`);
      }
    }

    // Persist changes
    const updateData: UpdateCategoryData = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.status !== undefined) updateData.status = dto.status;

    return await this.repository.update(dto.id, updateData);
  }
}
