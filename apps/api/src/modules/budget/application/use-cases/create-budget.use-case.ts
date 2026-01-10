/**
 * Create Budget Use Case
 * ✅ Application layer - orchestrates business logic
 */

import { Budget } from "../../domain/entities/budget";
import type { IBudgetRepository } from "../../domain/repositories/budget-repository.interface";
import { ErrDuplicate, ErrInvalid } from "../../../../shared/errors";

export interface CreateBudgetCommand {
  budgetOwnerId: string;
  year: number;
  amountPlanned: number;
  amountRevised?: number;
  createdBy: string;
}

export class CreateBudgetUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(command: CreateBudgetCommand): Promise<Budget> {
    // Check for duplicate budget (unique per owner per year)
    const existing = await this.budgetRepository.findByBudgetOwnerAndYear(
      command.budgetOwnerId,
      command.year
    );

    if (existing) {
      throw new ErrDuplicate(
        `Budget for owner ${command.budgetOwnerId} and year ${command.year} already exists`
      );
    }

    // Create budget entity (domain validation happens here)
    try {
      const budget = Budget.create({
        budgetOwnerId: command.budgetOwnerId,
        year: command.year,
        amountPlanned: command.amountPlanned,
        amountRevised: command.amountRevised ?? null,
        createdBy: command.createdBy,
      });

      // Persist
      return await this.budgetRepository.create(budget);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrInvalid(error.message);
      }
      throw error;
    }
  }
}
