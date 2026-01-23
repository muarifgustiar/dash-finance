/**
 * BudgetOwner HTTP Routes - Delivery Layer
 * ✅ Route registration with validation
 */

import { Elysia, t } from "elysia";
import { budgetOwnerContainer, type BudgetOwnerModuleContainer } from "./container";
import {
  createBudgetOwnerHandler,
  getBudgetOwnerHandler,
  updateBudgetOwnerHandler,
  deleteBudgetOwnerHandler,
  listBudgetOwnersHandler,
} from "./handlers";

export const budgetOwnerRoutes = (budgetOwnerModule: BudgetOwnerModuleContainer) =>
  new Elysia({ name: "routes:budget-owner" })
    .use(budgetOwnerContainer(budgetOwnerModule))
    .group("/budget-owners", (app) =>
      app
        // List all budget owners
        .get(
          "/",
          (ctx) => listBudgetOwnersHandler(ctx.budgetOwnerDeps)(ctx as never),
          {
            query: t.Object({
              status: t.Optional(
                t.Enum({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" })
              ),
              search: t.Optional(t.String()),
            }),
          }
        )

        // Get single budget owner
        .get(
          "/:id",
          (ctx) => getBudgetOwnerHandler(ctx.budgetOwnerDeps)(ctx as never),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
          }
        )

        // Create budget owner
        .post(
          "/",
          (ctx) => createBudgetOwnerHandler(ctx.budgetOwnerDeps)(ctx as never),
          {
            body: t.Object({
              name: t.String({ minLength: 1 }),
              code: t.Optional(t.String()),
              description: t.Optional(t.String()),
            }),
          }
        )

        // Update budget owner
        .put(
          "/:id",
          (ctx) => updateBudgetOwnerHandler(ctx.budgetOwnerDeps)(ctx as never),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
            body: t.Object({
              name: t.Optional(t.String({ minLength: 1 })),
              code: t.Optional(t.String()),
              description: t.Optional(t.String()),
              status: t.Optional(
                t.Enum({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" })
              ),
            }),
          }
        )

        // Delete budget owner
        .delete(
          "/:id",
          (ctx) => deleteBudgetOwnerHandler(ctx.budgetOwnerDeps)(ctx as never),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
          }
        )
    );
