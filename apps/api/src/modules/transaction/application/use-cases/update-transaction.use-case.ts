/**
 * Update Transaction Use Case
 * ✅ Application layer - update logic
 */

import { Transaction } from "../../domain/entities/transaction";
import type { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";
import { ErrNotFound, ErrInvalid } from "../../../../shared/errors";

export interface UpdateTransactionCommand {
  id: string;
  categoryId?: string;
  date?: Date;
  amount?: number;
  description?: string;
  receiptUrl?: string | null;
}

export class UpdateTransactionUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(command: UpdateTransactionCommand): Promise<Transaction> {
    // Find existing transaction
    const transaction = await this.transactionRepository.findById(command.id);
    if (!transaction) {
      throw new ErrNotFound(`Transaction with ID ${command.id} not found`);
    }

    // Update (domain validation happens here)
    try {
      transaction.update({
        categoryId: command.categoryId,
        date: command.date,
        amount: command.amount,
        description: command.description,
        receiptUrl: command.receiptUrl,
      });

      // Persist
      return await this.transactionRepository.update(transaction);
    } catch (error) {
      if (error instanceof Error) {
        throw new ErrInvalid(error.message);
      }
      throw error;
    }
  }
}
