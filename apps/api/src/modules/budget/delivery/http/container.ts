import { Elysia } from "elysia";
import type { createBudgetModule } from "../../module.container";

export type BudgetModuleContainer = ReturnType<typeof createBudgetModule>;

export const budgetContainer = (budgetModule: BudgetModuleContainer) => {
  return new Elysia({ name: "container:budget" })
    .decorate("budgetModule", budgetModule);
};
