/**
 * BudgetOwner Module Container - Dependency Injection
 * ✅ Wires concrete implementations
 */

import type { PrismaClient } from "@prisma/client";
import { PrismaBudgetOwnerRepository } from "./infrastructure/repositories/prisma-budget-owner.repository";
import {
  GetBudgetOwnersUseCase,
  GetBudgetOwnerByIdUseCase,
  CreateBudgetOwnerUseCase,
  UpdateBudgetOwnerUseCase,
  DeleteBudgetOwnerUseCase,
} from "./application/use-cases";

export function createBudgetOwnerModule() {
  // Infrastructure
  const budgetOwnerRepository = new PrismaBudgetOwnerRepository();

  // Application use cases
  const getBudgetOwnersUseCase = new GetBudgetOwnersUseCase(budgetOwnerRepository);
  const getBudgetOwnerByIdUseCase = new GetBudgetOwnerByIdUseCase(budgetOwnerRepository);
  const createBudgetOwnerUseCase = new CreateBudgetOwnerUseCase(budgetOwnerRepository);
  const updateBudgetOwnerUseCase = new UpdateBudgetOwnerUseCase(budgetOwnerRepository);
  const deleteBudgetOwnerUseCase = new DeleteBudgetOwnerUseCase(budgetOwnerRepository);

  return {
    getBudgetOwnersUseCase,
    getBudgetOwnerByIdUseCase,
    createBudgetOwnerUseCase,
    updateBudgetOwnerUseCase,
    deleteBudgetOwnerUseCase,
  };
}
