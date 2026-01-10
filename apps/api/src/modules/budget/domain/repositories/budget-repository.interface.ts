/**
 * Budget Repository Interface (Port)
 * ✅ Domain layer defines contract, infrastructure implements
 */

import type { PaginationParams } from "@repo/domain/types";
import type { Budget } from "../entities/budget";

export interface IBudgetRepository {
  findById(id: string): Promise<Budget | null>;
  findByBudgetOwnerAndYear(budgetOwnerId: string, year: number): Promise<Budget | null>;
  findByBudgetOwner(budgetOwnerId: string): Promise<Budget[]>;
  findByYear(year: number): Promise<Budget[]>;
  findAll(pagination?: PaginationParams): Promise<{ items: Budget[]; total: number }>;
  create(budget: Budget): Promise<Budget>;
  update(budget: Budget): Promise<Budget>;
  delete(id: string): Promise<void>;
}
