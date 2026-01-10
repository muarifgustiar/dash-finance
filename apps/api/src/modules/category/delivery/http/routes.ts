/**
 * Category HTTP Routes - Delivery Layer
 * ✅ Route registration with validation
 */

import { Elysia, t } from "elysia";
import type { CategoryDeps } from "./handlers";
import {
  createCategoryHandler,
  getCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  listCategoriesHandler,
} from "./handlers";

export function registerCategoryRoutes(app: Elysia, deps: CategoryDeps) {
  return app.group("/categories", (app) =>
    app
      // List all categories
      .get(
        "/",
        listCategoriesHandler(deps),
        {
          query: t.Object({
            status: t.Optional(t.Enum({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" })),
            search: t.Optional(t.String()),
          }),
        }
      )
      
      // Get single category
      .get(
        "/:id",
        getCategoryHandler(deps),
        {
          params: t.Object({
            id: t.String({ format: "uuid" }),
          }),
        }
      )
      
      // Create category
      .post(
        "/",
        createCategoryHandler(deps),
        {
          body: t.Object({
            name: t.String({ minLength: 1 }),
            description: t.Optional(t.String()),
          }),
        }
      )
      
      // Update category
      .put(
        "/:id",
        updateCategoryHandler(deps),
        {
          params: t.Object({
            id: t.String({ format: "uuid" }),
          }),
          body: t.Object({
            name: t.Optional(t.String({ minLength: 1 })),
            description: t.Optional(t.String()),
            status: t.Optional(t.Enum({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" })),
          }),
        }
      )
      
      // Delete category
      .delete(
        "/:id",
        deleteCategoryHandler(deps),
        {
          params: t.Object({
            id: t.String({ format: "uuid" }),
          }),
        }
      )
  );
}
