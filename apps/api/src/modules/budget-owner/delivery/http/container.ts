import { Elysia } from "elysia";
import type { createBudgetOwnerModule } from "../../module.container";
import type { BudgetOwnerDeps } from "./handlers";

export type BudgetOwnerModuleContainer = ReturnType<typeof createBudgetOwnerModule>;

export const budgetOwnerContainer = (budgetOwnerModule: BudgetOwnerModuleContainer) => {
  const deps: BudgetOwnerDeps = {
    createBudgetOwnerUc: budgetOwnerModule.createBudgetOwnerUseCase,
    getBudgetOwnerUc: budgetOwnerModule.getBudgetOwnerByIdUseCase,
    updateBudgetOwnerUc: budgetOwnerModule.updateBudgetOwnerUseCase,
    deleteBudgetOwnerUc: budgetOwnerModule.deleteBudgetOwnerUseCase,
    listBudgetOwnersUc: budgetOwnerModule.getBudgetOwnersUseCase,
  };

  return new Elysia({ name: "container:budget-owner" }).decorate(
    "budgetOwnerDeps",
    deps
  );
};
