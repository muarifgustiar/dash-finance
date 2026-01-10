/**
 * Transaction HTTP Handlers
 * ✅ Delivery layer - thin handlers that call use cases
 */

import type { Context } from "elysia";
import type { TransactionModuleContainer } from "../../module.container";
import { success, error } from "../../../../shared/util/response";
import { ErrInvalid, ErrNotFound } from "../../../../shared/errors";
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
  GetTransactionsQuery,
} from "@repo/schema/transaction";

// Helper to map Transaction entity to response DTO
function toTransactionResponse(transaction: any) {
  return {
    id: transaction.id,
    budgetOwnerId: transaction.budgetOwnerId,
    categoryId: transaction.categoryId,
    date: transaction.date.toISOString(),
    amount: transaction.amount,
    description: transaction.description,
    receiptUrl: transaction.receiptUrl,
    createdBy: transaction.createdBy,
    createdAt: transaction.createdAt.toISOString(),
    updatedAt: transaction.updatedAt.toISOString(),
  };
}

export async function createTransactionHandler(
  ctx: Context,
  container: TransactionModuleContainer
) {
  try {
    const body = ctx.body as any;

    // TODO: Get createdBy from authenticated user
    const createdBy = "00000000-0000-0000-0000-000000000000";

    const transaction = await container.getCreateTransactionUseCase().execute({
      budgetOwnerId: body.budgetOwnerId,
      categoryId: body.categoryId,
      date: new Date(body.date),
      amount: body.amount,
      description: body.description,
      receiptUrl: body.receiptUrl,
      createdBy,
    });

    return success(toTransactionResponse(transaction));
  } catch (err) {
    if (err instanceof ErrInvalid) {
      return error(err.message, 400);
    }
    console.error("Create transaction error:", err);
    return error("Internal server error", 500);
  }
}

export async function getTransactionsHandler(
  ctx: Context,
  container: TransactionModuleContainer
) {
  try {
    const query = ctx.query as any;

    const result = await container.getGetTransactionsUseCase().execute({
      budgetOwnerId: query.budgetOwnerId,
      categoryId: query.categoryId,
      categoryIds: query.categoryIds,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
      year: query.year ? parseInt(query.year) : undefined,
      page: query.page ? parseInt(query.page) : undefined,
      limit: query.limit ? parseInt(query.limit) : undefined,
    });

    return success({
      data: result.transactions.map(toTransactionResponse),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    });
  } catch (err) {
    console.error("Get transactions error:", err);
    return error("Internal server error", 500);
  }
}

export async function getTransactionByIdHandler(
  ctx: Context,
  container: TransactionModuleContainer
) {
  try {
    const { id } = ctx.params as { id: string };

    const transaction = await container.getTransactionRepository().findById(id);

    if (!transaction) {
      return error(`Transaction with ID ${id} not found`, 404);
    }

    return success(toTransactionResponse(transaction));
  } catch (err) {
    console.error("Get transaction by ID error:", err);
    return error("Internal server error", 500);
  }
}

export async function updateTransactionHandler(
  ctx: Context,
  container: TransactionModuleContainer
) {
  try {
    const { id } = ctx.params as { id: string };
    const body = ctx.body as any;

    const transaction = await container.getUpdateTransactionUseCase().execute({
      id,
      categoryId: body.categoryId,
      date: body.date ? new Date(body.date) : undefined,
      amount: body.amount,
      description: body.description,
      receiptUrl: body.receiptUrl,
    });

    return success(toTransactionResponse(transaction));
  } catch (err) {
    if (err instanceof ErrNotFound) {
      return error(err.message, 404);
    }
    if (err instanceof ErrInvalid) {
      return error(err.message, 400);
    }
    console.error("Update transaction error:", err);
    return error("Internal server error", 500);
  }
}

export async function deleteTransactionHandler(
  ctx: Context,
  container: TransactionModuleContainer
) {
  try {
    const { id } = ctx.params as { id: string };

    await container.getTransactionRepository().delete(id);

    return success({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Delete transaction error:", err);
    return error("Internal server error", 500);
  }
}
