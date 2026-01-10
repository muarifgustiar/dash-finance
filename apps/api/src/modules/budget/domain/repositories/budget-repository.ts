import type { Budget, BudgetWithDetails } from "../entities/budget";

export interface BudgetRepository {
  findAll(filters?: {
    year?: number;
    budgetOwnerId?: string;
  }): Promise<BudgetWithDetails[]>;
  findById(id: string): Promise<BudgetWithDetails | null>;
  findByBudgetOwnerAndYear(budgetOwnerId: string, year: number): Promise<Budget | null>;
  create(data: Omit<Budget, "id" | "createdAt" | "updatedAt">): Promise<Budget>;
  update(
    id: string,
    data: Partial<Omit<Budget, "id" | "budgetOwnerId" | "year" | "createdBy" | "createdAt" | "updatedAt">>
  ): Promise<Budget>;
  delete(id: string): Promise<void>;
  getSummary(year?: number): Promise<{
    totalPlanned: number;
    totalRevised: number;
    totalSpent: number;
    totalRemaining: number;
    averageUtilization: number;
  }>;
}
