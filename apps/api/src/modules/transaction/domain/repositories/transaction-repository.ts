import type { Transaction, TransactionWithDetails } from "../entities/transaction";

export interface TransactionRepository {
  findAll(filters?: {
    budgetOwnerId?: string;
    categoryId?: string;
    categoryIds?: string[];
    startDate?: Date;
    endDate?: Date;
    year?: number;
    createdBy?: string;
  }): Promise<TransactionWithDetails[]>;
  findById(id: string): Promise<TransactionWithDetails | null>;
  findAccessibleByUserId(userId: string, filters?: {
    categoryId?: string;
    categoryIds?: string[];
    startDate?: Date;
    endDate?: Date;
  }): Promise<TransactionWithDetails[]>;
  create(data: Omit<Transaction, "id" | "createdAt" | "updatedAt">): Promise<Transaction>;
  update(
    id: string,
    data: Partial<Omit<Transaction, "id" | "createdBy" | "createdAt" | "updatedAt">>
  ): Promise<Transaction>;
  delete(id: string): Promise<void>;
}
