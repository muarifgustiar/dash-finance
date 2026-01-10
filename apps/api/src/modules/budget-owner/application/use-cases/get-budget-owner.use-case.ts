/**
 * Get BudgetOwner Use Case - Application Layer
 */

import type { IBudgetOwnerRepository } from "../../domain/repositories/budget-owner-repository.interface";
import { BudgetOwner } from "../../domain/entities/budget-owner";
import { ErrNotFound } from "../../../../shared/errors";

export class GetBudgetOwnerUseCase {
  constructor(private readonly repository: IBudgetOwnerRepository) {}

  async execute(id: string): Promise<BudgetOwner> {
    const budgetOwner = await this.repository.findById(id);
    
    if (!budgetOwner) {
      throw new ErrNotFound(`Budget owner with id '${id}' not found`);
    }

    return budgetOwner;
  }
}
