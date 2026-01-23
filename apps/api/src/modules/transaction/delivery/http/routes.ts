/**
 * Transaction HTTP Routes
 * ✅ Delivery layer - thin routing with schema validation
 */

import { Elysia, t } from "elysia";
import { transactionContainer, type TransactionModuleContainer } from "./container";
import {
  createTransactionHandler,
  getTransactionsHandler,
  getTransactionByIdHandler,
  updateTransactionHandler,
  deleteTransactionHandler,
} from "./handlers";

export const transactionRoutes = (transactionModule: TransactionModuleContainer) =>
  new Elysia({ name: "routes:transaction" })
    .use(transactionContainer(transactionModule))
    .group("/transactions", (app) =>
      app
        // Create transaction
        .post(
          "/",
          async (ctx) => createTransactionHandler(ctx, ctx.transactionModule),
          {
            body: t.Object({
              budgetOwnerId: t.String({ format: "uuid" }),
              categoryId: t.String({ format: "uuid" }),
              date: t.String({ format: "date-time" }),
              amount: t.Number({ minimum: 0 }),
              description: t.String({ minLength: 1 }),
              receiptUrl: t.Optional(t.String({ format: "uri" })),
            }),
          }
        )

        // Get transactions (with filters)
        .get(
          "/",
          async (ctx) => getTransactionsHandler(ctx, ctx.transactionModule),
          {
            query: t.Object({
              budgetOwnerId: t.Optional(t.String({ format: "uuid" })),
              categoryId: t.Optional(t.String({ format: "uuid" })),
              categoryIds: t.Optional(
                t.Array(t.String({ format: "uuid" }), { maxItems: 50 })
              ),
              startDate: t.Optional(t.String({ format: "date-time" })),
              endDate: t.Optional(t.String({ format: "date-time" })),
              year: t.Optional(t.Number()),
              page: t.Optional(t.Number({ minimum: 1 })),
              limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
            }),
          }
        )

        // Get transaction by ID
        .get(
          "/:id",
          async (ctx) => getTransactionByIdHandler(ctx, ctx.transactionModule),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
          }
        )

        // Update transaction
        .patch(
          "/:id",
          async (ctx) => updateTransactionHandler(ctx, ctx.transactionModule),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
            body: t.Object({
              categoryId: t.Optional(t.String({ format: "uuid" })),
              date: t.Optional(t.String({ format: "date-time" })),
              amount: t.Optional(t.Number({ minimum: 0 })),
              description: t.Optional(t.String({ minLength: 1 })),
              receiptUrl: t.Optional(t.String({ format: "uri" })),
            }),
          }
        )

        // Delete transaction
        .delete(
          "/:id",
          async (ctx) => deleteTransactionHandler(ctx, ctx.transactionModule),
          {
            params: t.Object({
              id: t.String({ format: "uuid" }),
            }),
          }
        )
    );
