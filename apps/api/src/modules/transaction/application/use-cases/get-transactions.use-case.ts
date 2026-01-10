/**
 * Get Transactions Use Case
 * ✅ Application layer - query logic with filtering
 */

import { calculatePaginationMeta, type PaginationMeta } from "@repo/domain/types";
import { Transaction } from "../../domain/entities/transaction";
import type { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";

export interface GetTransactionsQuery {
  budgetOwnerId?: string;
  categoryId?: string;
  categoryIds?: string[];
  startDate?: Date;
  endDate?: Date;
  year?: number;
  page?: number;
  limit?: number;
}

export interface GetTransactionsResult {
  items: Transaction[];
  pagination: PaginationMeta;
}

export class GetTransactionsUseCase {
  constructor(private readonly transactionRepository: ITransactionRepository) {}

  async execute(query: GetTransactionsQuery): Promise<GetTransactionsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const pagination = { page, limit };

    let result: { items: Transaction[]; total: number };

    // Determine which category filter to use (priority: categoryIds > categoryId)
    const useCategoryIds = query.categoryIds && query.categoryIds.length > 0;
    const useCategoryId = !useCategoryIds && query.categoryId;

    // Filter by date range
    if (query.budgetOwnerId && query.startDate && query.endDate) {
      result = await this.transactionRepository.findByDateRange(
        query.budgetOwnerId,
        query.startDate,
        query.endDate,
        pagination
      );
    }
    // Filter by year
    else if (query.budgetOwnerId && query.year) {
      result = await this.transactionRepository.findByYear(
        query.budgetOwnerId,
        query.year,
        pagination
      );
    }
    // Filter by multiple categories
    else if (useCategoryIds) {
      result = await this.transactionRepository.findByCategories(
        query.categoryIds!,
        pagination
      );
    }
    // Filter by single category
    else if (useCategoryId) {
      result = await this.transactionRepository.findByCategory(
        query.categoryId!,
        pagination
      );
    }
    // Filter by budget owner
    else if (query.budgetOwnerId) {
      result = await this.transactionRepository.findByBudgetOwner(
        query.budgetOwnerId,
        pagination
      );
    }
    // No filter (should be restricted in real app)
    else {
      result = { items: [], total: 0 };
    }

    return {
      items: result.items,
      pagination: calculatePaginationMeta(page, limit, result.total),
    };
  }
}
