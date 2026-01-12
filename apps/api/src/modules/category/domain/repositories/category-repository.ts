import type { Category, Status } from "../entities/category";

export interface CreateCategoryData {
  name: string;
  description: string | null;
  status: Status;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string | null;
  status?: Status;
}

export interface CategoryRepository {
  findAll(filters?: { status?: string; search?: string }): Promise<Category[]>;
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  create(data: CreateCategoryData): Promise<Category>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
  hasTransactions(categoryId: string): Promise<boolean>;
}
