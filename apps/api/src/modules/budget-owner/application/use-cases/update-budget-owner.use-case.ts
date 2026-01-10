/**
 * Update BudgetOwner Use Case - Application Layer
 */

import type { IBudgetOwnerRepository } from "../../domain/repositories/budget-owner-repository.interface";
import { BudgetOwner } from "../../domain/entities/budget-owner";
import { ErrNotFound, ErrDuplicate } from "../../../../shared/errors";

export interface UpdateBudgetOwnerDTO {
  id: string;
  name?: string;
  code?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export class UpdateBudgetOwnerUseCase {
  constructor(private readonly repository: IBudgetOwnerRepository) {}

  async execute(dto: UpdateBudgetOwnerDTO): Promise<BudgetOwner> {
    // Find existing
    const existing = await this.repository.findById(dto.id);
    if (!existing) {
      throw new ErrNotFound(`Budget owner with id '${dto.id}' not found`);
    }

    // Check code uniqueness if changed
    if (dto.code && dto.code !== existing.code) {
      const duplicateCode = await this.repository.findByCode(dto.code);
      if (duplicateCode) {
        throw new ErrDuplicate(`Budget owner with code '${dto.code}' already exists`);
      }
    }

    // Apply updates
    let updated = existing;
    
    if (dto.name || dto.code !== undefined || dto.description !== undefined) {
      updated = updated.updateInfo(dto.name, dto.code, dto.description);
    }
    
    if (dto.status) {
      updated = updated.updateStatus(dto.status);
    }

    // Persist
    return await this.repository.update(updated);
  }
}
