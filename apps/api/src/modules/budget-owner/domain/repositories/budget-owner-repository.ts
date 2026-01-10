import type { BudgetOwner } from "../entities/budget-owner";

export interface BudgetOwnerRepository {
  findAll(filters?: { status?: string }): Promise<BudgetOwner[]>;
  findById(id: string): Promise<BudgetOwner | null>;
  findByName(name: string): Promise<BudgetOwner | null>;
  findByCode(code: string): Promise<BudgetOwner | null>;
  create(data: Omit<BudgetOwner, "id" | "createdAt" | "updatedAt">): Promise<BudgetOwner>;
  update(id: string, data: Partial<Omit<BudgetOwner, "id" | "createdAt" | "updatedAt">>): Promise<BudgetOwner>;
  delete(id: string): Promise<void>;
  findAccessibleByUserId(userId: string): Promise<BudgetOwner[]>;
}
