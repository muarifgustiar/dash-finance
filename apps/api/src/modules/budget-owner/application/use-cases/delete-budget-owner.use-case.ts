/**
 * Delete BudgetOwner Use Case - Application Layer
 */

import type { IBudgetOwnerRepository } from "../../domain/repositories/budget-owner-repository.interface";
import { ErrNotFound } from "../../../../shared/errors";

export class DeleteBudgetOwnerUseCase {
  constructor(private readonly repository: IBudgetOwnerRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);
    
    if (!existing) {
      throw new ErrNotFound(`Budget owner with id '${id}' not found`);
    }

    await this.repository.delete(id);
  }
}
