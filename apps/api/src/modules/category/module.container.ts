/**
 * Category Module Container - Dependency Injection
 * ✅ Wires concrete implementations
 */

import type { PrismaClient } from "@prisma/client";
import { PrismaCategoryRepository } from "./infrastructure/repositories/prisma-category.repository";
import {
  GetCategoriesUseCase,
  GetCategoryByIdUseCase,
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
} from "./application/use-cases";

export function createCategoryModule(prisma: PrismaClient) {
  // Infrastructure
  const categoryRepository = new PrismaCategoryRepository(prisma);

  // Application use cases
  const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);
  const getCategoryByIdUseCase = new GetCategoryByIdUseCase(categoryRepository);
  const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
  const updateCategoryUseCase = new UpdateCategoryUseCase(categoryRepository);
  const deleteCategoryUseCase = new DeleteCategoryUseCase(categoryRepository);

  return {
    getCategoriesUseCase,
    getCategoryByIdUseCase,
    createCategoryUseCase,
    updateCategoryUseCase,
    deleteCategoryUseCase,
  };
}
