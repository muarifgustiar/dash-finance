/**
 * Budget HTTP Routes
 * ✅ Delivery layer - thin routing with schema validation
 */

import { Elysia, t } from "elysia";
import {
  CreateBudgetRequestSchema,
  UpdateBudgetRequestSchema,
  GetBudgetsQuerySchema,
} from "@repo/schema/budget";
import type { BudgetModuleContainer } from "../../module.container";
import {
  createBudgetHandler,
  getBudgetsHandler,
  getBudgetByIdHandler,
  updateBudgetHandler,
  deleteBudgetHandler,
} from "./handlers";

export function registerBudgetRoutes(
  app: Elysia,
  container: BudgetModuleContainer
) {
  return app.group("/budgets", (app) =>
    app
      // Create budget
      .post(
        "/",
        async (ctx) => createBudgetHandler(ctx, container),
        {
          body: t.Object({
            budgetOwnerId: t.String({ format: "uuid" }),
            year: t.Number({ minimum: 2000, maximum: 2100 }),
            amountPlanned: t.Number({ minimum: 0 }),
            amountRevised: t.Optional(
              t.Number({ minimum: 0 })
            ),
          }),
        }
      )

      // Get budgets (with optional filters)
      .get(
        "/",
        async (ctx) => getBudgetsHandler(ctx, container),
        {
          query: t.Object({
            budgetOwnerId: t.Optional(t.String({ format: "uuid" })),
            year: t.Optional(t.Number()),
          }),
        }
      )

      // Get budget by ID
      .get("/:id", async (ctx) => getBudgetByIdHandler(ctx, container), {
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
      })

      // Update budget
      .patch(
        "/:id",
        async (ctx) => updateBudgetHandler(ctx, container),
        {
          params: t.Object({
            id: t.String({ format: "uuid" }),
          }),
          body: t.Object({
            amountPlanned: t.Optional(
              t.Number({ minimum: 0 })
            ),
            amountRevised: t.Optional(
              t.Number({ minimum: 0 })
            ),
          }),
        }
      )

      // Delete budget
      .delete("/:id", async (ctx) => deleteBudgetHandler(ctx, container), {
        params: t.Object({
          id: t.String({ format: "uuid" }),
        }),
      })
  );
}
