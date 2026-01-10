/**
 * Update Budget Use Case
 * ✅ Application layer - update logic
 */

import { Budget } from "../../domain/entities/budget";
import type { IBudgetRepository } from "../../domain/repositories/budget-repository.interface";
import { ErrNotFound, ErrInvalid } from "../../../../shared/errors";

export interface UpdateBudgetCommand {
  id: string;
  amountPlanned?: number;
  amountRevised?: number;
}

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(command: UpdateBudgetCommand): Promise<Budget> {
    // Find existing budget
    const budget = await this.budgetRepository.findById(command.id);
    if (!budget) {
      throw new ErrNotFound(`Budget with ID ${command.id} not found`);
    }

    // Update amounts (domain validation happens here)
    try {
      budget.updateAmounts(command.amountPlanned, command.amountRevised);

      // Persist
      return await this.budgetRepository.update(budget);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrInvalid(error.message);
      }
      throw error;
    }
  }
}
