/**
 * Update Category Use Case - Application Layer
 */

import type { ICategoryRepository } from "../../domain/repositories/category-repository.interface";
import { Category } from "../../domain/entities/category";
import { ErrNotFound, ErrDuplicate } from "../../../../shared/errors";

export interface UpdateCategoryDTO {
  id: string;
  name?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export class UpdateCategoryUseCase {
  constructor(private readonly repository: ICategoryRepository) {}

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

    // Apply updates
    let updated = existing;
    
    if (dto.name || dto.description !== undefined) {
      updated = updated.updateInfo(dto.name, dto.description);
    }
    
    if (dto.status) {
      updated = updated.updateStatus(dto.status);
    }

    // Persist
    return await this.repository.update(updated);
  }
}
