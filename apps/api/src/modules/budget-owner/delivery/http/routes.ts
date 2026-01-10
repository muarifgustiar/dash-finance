/**
 * BudgetOwner HTTP Routes - Delivery Layer
 * ✅ Route registration with validation
 */

import { Elysia, t } from "elysia";
import type { BudgetOwnerDeps } from "./handlers";
import {
  createBudgetOwnerHandler,
  getBudgetOwnerHandler,
  updateBudgetOwnerHandler,
  deleteBudgetOwnerHandler,
  listBudgetOwnersHandler,
} from "./handlers";

export function registerBudgetOwnerRoutes(app: Elysia, deps: BudgetOwnerDeps) {
  return app.group("/budget-owners", (app) =>
    app
      // List all budget owners
      .get(
        "/",
        listBudgetOwnersHandler(deps),
        {
          query: t.Object({
            status: t.Optional(t.Enum({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" })),
            search: t.Optional(t.String()),
          }),
        }
      )
      
      // Get single budget owner
      .get(
        "/:id",
        getBudgetOwnerHandler(deps),
        {
          params: t.Object({
            id: t.String({ format: "uuid" }),
          }),
        }
      )
      
      // Create budget owner
      .post(
        "/",
        createBudgetOwnerHandler(deps),
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
        updateBudgetOwnerHandler(deps),
        {
          params: t.Object({
            id: t.String({ format: "uuid" }),
          }),
          body: t.Object({
            name: t.Optional(t.String({ minLength: 1 })),
            code: t.Optional(t.String()),
            description: t.Optional(t.String()),
            status: t.Optional(t.Enum({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" })),
          }),
        }
      )
      
      // Delete budget owner
      .delete(
        "/:id",
        deleteBudgetOwnerHandler(deps),
        {
          params: t.Object({
            id: t.String({ format: "uuid" }),
          }),
        }
      )
  );
}
