/**
 * Category HTTP Routes - Delivery Layer
 * ✅ Route registration with validation
 */

import { Elysia, t } from "elysia";
import { categoryContainer, type CategoryModuleContainer } from "./container";
import {
  createCategoryHandler,
  getCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
  listCategoriesHandler,
} from "./handlers";

export const categoryRoutes = (categoryModule: CategoryModuleContainer) =>
  new Elysia({ name: "routes:category" })
    .use(categoryContainer(categoryModule))
    .group("/categories", (app) =>
      app
        // List all categories
        .get(
          "/",
          (ctx) => listCategoriesHandler(ctx.categoryDeps)(ctx as never),
          {
            query: t.Object({
              status: t.Optional(
                t.Enum({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" })
              ),
              search: t.Optional(t.String()),
            }),
          }
        )

        // Get single category
        .get(
          "/:id",
          (ctx) => getCategoryHandler(ctx.categoryDeps)(ctx as never),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
          }
        )

        // Create category
        .post(
          "/",
          (ctx) => createCategoryHandler(ctx.categoryDeps)(ctx as never),
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
          (ctx) => updateCategoryHandler(ctx.categoryDeps)(ctx as never),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
            body: t.Object({
              name: t.Optional(t.String({ minLength: 1 })),
              description: t.Optional(t.String()),
              status: t.Optional(
                t.Enum({ ACTIVE: "ACTIVE", INACTIVE: "INACTIVE" })
              ),
            }),
          }
        )

        // Delete category
        .delete(
          "/:id",
          (ctx) => deleteCategoryHandler(ctx.categoryDeps)(ctx as never),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
          }
        )
    );
