/**
 * Transaction HTTP Handlers
 * ✅ Delivery layer - thin handlers that call use cases
 */

import { success, error } from "../../../../shared/util/response";
import { ErrInvalid, ErrNotFound } from "../../../../shared/errors";
import type { TransactionModuleContainer } from "./container";

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
  ctx: any,
  container: TransactionModuleContainer
) {
  try {
    const body = ctx.body as any;

    const createdBy = (ctx as any).userId || "00000000-0000-0000-0000-000000000000";

    const transaction = await container.createTransactionUseCase.execute({
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
  ctx: any,
  container: TransactionModuleContainer
) {
  try {
    const query = ctx.query as any;
    const userId = (ctx as any).userId as string | null | undefined;
    const userRole = (ctx as any).userRole as string | null | undefined;

    const transactions = await container.getTransactionsUseCase.execute(
      {
        budgetOwnerId: query.budgetOwnerId,
        categoryId: query.categoryId,
        startDate: query.startDate,
        endDate: query.endDate,
        year: query.year,
      },
      userId ?? undefined,
      userRole ?? undefined
    );

    const page = (query as any).page ?? 1;
    const limit = (query as any).limit ?? 50;
    const total = transactions.length;
    const start = (page - 1) * limit;
    const items = transactions.slice(start, start + limit);

    return success({
      data: items.map(toTransactionResponse),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("Get transactions error:", err);
    return error("Internal server error", 500);
  }
}

export async function getTransactionByIdHandler(
  ctx: any,
  container: TransactionModuleContainer
) {
  try {
    const { id } = ctx.params as { id: string };

    const transaction = await container.getTransactionByIdUseCase.execute(id);
    return success(toTransactionResponse(transaction));
  } catch (err) {
    if (err instanceof ErrNotFound) {
      return error(err.message, 404);
    }
    console.error("Get transaction by ID error:", err);
    return error("Internal server error", 500);
  }
}

export async function updateTransactionHandler(
  ctx: any,
  container: TransactionModuleContainer
) {
  try {
    const { id } = ctx.params as { id: string };
    const body = ctx.body as any;

    const userId = (ctx as any).userId as string | null | undefined;
    const userRole = (ctx as any).userRole as string | null | undefined;

    if (!userId || !userRole) {
      return error("Unauthorized", 401);
    }

    const transaction = await container.updateTransactionUseCase.execute(
      id,
      {
        categoryId: body.categoryId,
        date: body.date ? new Date(body.date) : undefined,
        amount: body.amount,
        description: body.description,
        receiptUrl: body.receiptUrl,
      },
      userId,
      userRole
    );

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
  ctx: any,
  container: TransactionModuleContainer
) {
  try {
    const { id } = ctx.params as { id: string };

    const userId = (ctx as any).userId as string | null | undefined;
    const userRole = (ctx as any).userRole as string | null | undefined;

    if (!userId || !userRole) {
      return error("Unauthorized", 401);
    }

    await container.deleteTransactionUseCase.execute(id, userId, userRole);

    return success({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Delete transaction error:", err);
    return error("Internal server error", 500);
  }
}
