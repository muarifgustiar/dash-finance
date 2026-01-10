import { ErrDuplicate, ErrNotFound, ErrInvalid } from "../../../shared/errors/canonical";
import type { Category } from "../../domain/entities/category";
import type { CategoryRepository } from "../../domain/repositories/category-repository";

export interface GetCategoriesQuery {
  status?: string;
}

export class GetCategoriesUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(query: GetCategoriesQuery = {}): Promise<Category[]> {
    return this.categoryRepository.findAll(query);
  }
}

export class GetCategoryByIdUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new ErrNotFound("Kategori tidak ditemukan");
    }

    return category;
  }
}

export interface CreateCategoryCommand {
  name: string;
  description?: string;
}

export class CreateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(command: CreateCategoryCommand): Promise<Category> {
    // Check for duplicate name
    const existing = await this.categoryRepository.findByName(command.name);
    if (existing) {
      throw new ErrDuplicate("Kategori dengan nama ini sudah ada");
    }

    return this.categoryRepository.create({
      name: command.name,
      description: command.description || null,
      status: "ACTIVE",
    });
  }
}

export interface UpdateCategoryCommand {
  name?: string;
  description?: string;
  status?: string;
}

export class UpdateCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(id: string, command: UpdateCategoryCommand): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new ErrNotFound("Kategori tidak ditemukan");
    }

    // Check for duplicate name if updating name
    if (command.name && command.name !== category.name) {
      const existing = await this.categoryRepository.findByName(command.name);
      if (existing) {
        throw new ErrDuplicate("Kategori dengan nama ini sudah ada");
      }
    }

    return this.categoryRepository.update(id, command);
  }
}

export class DeleteCategoryUseCase {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    
    if (!category) {
      throw new ErrNotFound("Kategori tidak ditemukan");
    }

    // Check if category has transactions
    const hasTransactions = await this.categoryRepository.hasTransactions(id);
    if (hasTransactions) {
      throw new ErrInvalid(
        "Kategori tidak dapat dihapus karena masih digunakan pada transaksi"
      );
    }

    await this.categoryRepository.delete(id);
  }
}
