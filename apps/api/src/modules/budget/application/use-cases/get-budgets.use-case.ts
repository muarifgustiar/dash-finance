/**
 * Get Budgets Use Case
 * ✅ Application layer - query logic
 */

import { calculatePaginationMeta, type PaginationMeta } from "@repo/domain/types";
import { Budget } from "../../domain/entities/budget";
import type { IBudgetRepository } from "../../domain/repositories/budget-repository.interface";

export interface GetBudgetsQuery {
  budgetOwnerId?: string;
  year?: number;
  page?: number;
  limit?: number;
  paginate?: boolean;
}

export interface GetBudgetsResult {
  items: Budget[];
  pagination: PaginationMeta;
}

export class GetBudgetsUseCase {
  constructor(private readonly budgetRepository: IBudgetRepository) {}

  async execute(query: GetBudgetsQuery): Promise<GetBudgetsResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const paginate = query.paginate ?? true;

    let items: Budget[];

    // Filter by budget owner and year
    if (query.budgetOwnerId && query.year) {
      const budget = await this.budgetRepository.findByBudgetOwnerAndYear(
        query.budgetOwnerId,
        query.year
      );
      items = budget ? [budget] : [];
    }
    // Filter by budget owner only
    else if (query.budgetOwnerId) {
      items = await this.budgetRepository.findByBudgetOwner(query.budgetOwnerId);
    }
    // Filter by year only
    else if (query.year) {
      items = await this.budgetRepository.findByYear(query.year);
    }
    // Return all with pagination
    else {
      const result = await this.budgetRepository.findAll(
        paginate ? { page, limit } : undefined
      );
      return {
        items: result.items,
        pagination: calculatePaginationMeta(page, limit, result.total),
      };
    }

    // For filtered results (no pagination)
    return {
      items,
      pagination: calculatePaginationMeta(1, items.length, items.length),
    };
  }
}
