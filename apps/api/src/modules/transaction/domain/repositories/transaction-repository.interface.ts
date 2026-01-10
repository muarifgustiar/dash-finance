/**
 * Transaction Repository Interface (Port)
 * ✅ Domain layer defines contract, infrastructure implements
 */

import type { PaginationParams } from "@repo/domain/types";
import type { Transaction } from "../entities/transaction";

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByBudgetOwner(
    budgetOwnerId: string,
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }>;
  findByCategory(
    categoryId: string,
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }>;
  findByCategories(
    categoryIds: string[],
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }>;
  findByDateRange(
    budgetOwnerId: string,
    startDate: Date,
    endDate: Date,
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }>;
  findByYear(
    budgetOwnerId: string,
    year: number,
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }>;
  getTotalSpentByBudgetOwner(budgetOwnerId: string, year: number): Promise<number>;
  create(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
