/**
 * Create Transaction Use Case
 * ✅ Application layer - orchestrates business logic
 */

import { Transaction } from "../../domain/entities/transaction";
import type { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";
import { ErrInvalid } from "../../../../shared/errors";

export interface CreateTransactionCommand {
  budgetOwnerId: string;
  categoryId: string;
  date: Date;
  amount: number;
  description: string;
  receiptUrl?: string;
  createdBy: string;
}

export class CreateTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    // Create transaction entity (domain validation happens here)
    try {
      const transaction = Transaction.create({
        budgetOwnerId: command.budgetOwnerId,
        categoryId: command.categoryId,
        date: command.date,
        amount: command.amount,
        description: command.description,
        receiptUrl: command.receiptUrl ?? null,
        createdBy: command.createdBy,
      });

      // Persist
      return await this.transactionRepository.create(transaction);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrInvalid(error.message);
      }
      throw error;
    }
  }
}
