/**
 * Budget Module DI Container
 * ✅ Wires all dependencies for budget module
 */

import { PrismaBudgetRepository } from "./infrastructure/repositories/prisma-budget.repository";
import { GetBudgetsUseCase } from "./application/use-cases/get-budgets.use-case";
import { CreateBudgetUseCase } from "./application/use-cases/create-budget.use-case";
import { UpdateBudgetUseCase } from "./application/use-cases/update-budget.use-case";
import {
  GetBudgetByIdUseCase,
  GetBudgetSummaryUseCase,
  DeleteBudgetUseCase,
} from "./application/use-cases";

export function createBudgetModule() {
  // Infrastructure
  const budgetRepository = new PrismaBudgetRepository();

  // Application use cases
  const getBudgetsUseCase = new GetBudgetsUseCase(budgetRepository);
  const getBudgetByIdUseCase = new GetBudgetByIdUseCase(budgetRepository);
  const getBudgetSummaryUseCase = new GetBudgetSummaryUseCase(budgetRepository);
  const createBudgetUseCase = new CreateBudgetUseCase(budgetRepository);
  const updateBudgetUseCase = new UpdateBudgetUseCase(budgetRepository);
  const deleteBudgetUseCase = new DeleteBudgetUseCase(budgetRepository);

  return {
    getBudgetsUseCase,
    getBudgetByIdUseCase,
    getBudgetSummaryUseCase,
    createBudgetUseCase,
    updateBudgetUseCase,
    deleteBudgetUseCase,
    budgetRepository,
  };
}

export type BudgetModuleContainer = ReturnType<typeof createBudgetModule>;
