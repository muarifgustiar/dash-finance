import type { Category } from "../entities/category";

export interface CategoryRepository {
  findAll(filters?: { status?: string; search?: string }): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(data: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category>;
  update(id: string, data: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>): Promise<Category>;
  delete(id: string): Promise<void>;
  hasTransactions(categoryId: string): Promise<boolean>;
}
