/**
 * Budget HTTP Routes
 * ✅ Delivery layer - thin routing with schema validation
 */

import { Elysia, t } from "elysia";
import { budgetContainer, type BudgetModuleContainer } from "./container";
import {
  createBudgetHandler,
  getBudgetsHandler,
  getBudgetByIdHandler,
  updateBudgetHandler,
  deleteBudgetHandler,
} from "./handlers";

export const budgetRoutes = (budgetModule: BudgetModuleContainer) =>
  new Elysia({ name: "routes:budget" })
    .use(budgetContainer(budgetModule))
    .group("/budgets", (app) =>
      app
        // Create budget
        .post(
          "/",
          async (ctx) => createBudgetHandler(ctx, ctx.budgetModule),
          {
            body: t.Object({
              budgetOwnerId: t.String({ format: "uuid" }),
              year: t.Number({ minimum: 2000, maximum: 2100 }),
              amountPlanned: t.Number({ minimum: 0 }),
              amountRevised: t.Optional(t.Number({ minimum: 0 })),
            }),
          }
        )

        // Get budgets (with optional filters)
        .get(
          "/",
          async (ctx) => getBudgetsHandler(ctx, ctx.budgetModule),
          {
            query: t.Object({
              budgetOwnerId: t.Optional(t.String({ format: "uuid" })),
              year: t.Optional(t.Number()),
            }),
          }
        )

        // Get budget by ID
        .get("/:id", async (ctx) => getBudgetByIdHandler(ctx, ctx.budgetModule), {
          params: t.Object({
            id: t.String({ format: "uuid" }),
          }),
        })

        // Update budget
        .patch(
          "/:id",
          async (ctx) => updateBudgetHandler(ctx, ctx.budgetModule),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
            body: t.Object({
              amountPlanned: t.Optional(t.Number({ minimum: 0 })),
              amountRevised: t.Optional(t.Number({ minimum: 0 })),
            }),
          }
        )

        // Delete budget
        .delete(
          "/:id",
          async (ctx) => deleteBudgetHandler(ctx, ctx.budgetModule),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
          }
        )
    );
