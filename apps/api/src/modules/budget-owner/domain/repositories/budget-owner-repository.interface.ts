/**
 * BudgetOwner Repository Interface - Domain Layer (Port)
 * ✅ Defines contract; no implementation details
 */

import type { PaginationParams } from "@repo/domain/types";
import type { BudgetOwner } from "../entities/budget-owner";

export interface IBudgetOwnerRepository {
  findById(id: string): Promise<BudgetOwner | null>;
  findByCode(code: string): Promise<BudgetOwner | null>;
  findAll(
    filters?: {
      status?: "ACTIVE" | "INACTIVE";
      search?: string;
    },
    pagination?: PaginationParams
  ): Promise<{ items: BudgetOwner[]; total: number }>;
  create(budgetOwner: BudgetOwner): Promise<BudgetOwner>;
  update(budgetOwner: BudgetOwner): Promise<BudgetOwner>;
  delete(id: string): Promise<void>;
}
