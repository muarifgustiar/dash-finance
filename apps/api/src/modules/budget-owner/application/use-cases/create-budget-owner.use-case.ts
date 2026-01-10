/**
 * Create BudgetOwner Use Case - Application Layer
 * ✅ Orchestrates business flow; depends only on domain abstractions
 */

import type { IBudgetOwnerRepository } from "../../domain/repositories/budget-owner-repository.interface";
import { BudgetOwner } from "../../domain/entities/budget-owner";
import { ErrDuplicate, ErrInvalid } from "../../../../shared/errors";
import { randomUUID } from "crypto";

export interface CreateBudgetOwnerDTO {
  name: string;
  code?: string;
  description?: string;
}

export class CreateBudgetOwnerUseCase {
  constructor(private readonly repository: IBudgetOwnerRepository) {}

  async execute(dto: CreateBudgetOwnerDTO): Promise<BudgetOwner> {
    // Validate code uniqueness if provided
    if (dto.code) {
      const existing = await this.repository.findByCode(dto.code);
      if (existing) {
        throw new ErrDuplicate(`Budget owner with code '${dto.code}' already exists`);
      }
    }

    // Create domain entity
    const budgetOwner = BudgetOwner.create(
      randomUUID(),
      dto.name,
      dto.code,
      dto.description
    );

    // Persist
    return await this.repository.create(budgetOwner);
  }
}
