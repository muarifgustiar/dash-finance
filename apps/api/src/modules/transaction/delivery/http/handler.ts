import type { ApiResponse, PaginatedResponse } from "@repo/domain/types";
import type { TransactionResponse } from "@repo/schema/transaction";
import type {
  GetTransactionsUseCase,
  GetTransactionByIdUseCase,
  CreateTransactionUseCase,
  UpdateTransactionUseCase,
  DeleteTransactionUseCase,
  CreateTransactionCommand,
  UpdateTransactionCommand,
  GetTransactionsQuery,
} from "../../application/use-cases";

export interface TransactionHandlerDeps {
  getTransactionsUseCase: GetTransactionsUseCase;
  getTransactionByIdUseCase: GetTransactionByIdUseCase;
  createTransactionUseCase: CreateTransactionUseCase;
  updateTransactionUseCase: UpdateTransactionUseCase;
  deleteTransactionUseCase: DeleteTransactionUseCase;
}

export function createTransactionHandlers(deps: TransactionHandlerDeps) {
  return {
    async getAll(query: GetTransactionsQuery) {
      const result = await deps.getTransactionsUseCase.execute(query);

      const response: ApiResponse<PaginatedResponse<TransactionResponse>> = {
        success: true,
        data: {
          items: result.items.map((t) => ({
            id: t.id,
            budgetOwnerId: t.budgetOwnerId,
            budgetOwnerName: t.budgetOwnerName,
            categoryId: t.categoryId,
            categoryName: t.categoryName,
            date: t.date.toISOString(),
            amount: t.amount,
            description: t.description,
            receiptUrl: t.receiptUrl,
            createdBy: t.createdBy,
            createdByName: t.createdByName,
            createdAt: t.createdAt.toISOString(),
            updatedAt: t.updatedAt.toISOString(),
          })),
          pagination: result.pagination,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async getById(id: string) {
      const transaction = await deps.getTransactionByIdUseCase.execute(id);

      const response: ApiResponse<TransactionResponse> = {
        success: true,
        data: {
          id: transaction.id,
          budgetOwnerId: transaction.budgetOwnerId,
          budgetOwnerName: transaction.budgetOwnerName,
          categoryId: transaction.categoryId,
          categoryName: transaction.categoryName,
          date: transaction.date.toISOString(),
          amount: transaction.amount,
          description: transaction.description,
          receiptUrl: transaction.receiptUrl,
          createdBy: transaction.createdBy,
          createdByName: transaction.createdByName,
          createdAt: transaction.createdAt.toISOString(),
          updatedAt: transaction.updatedAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async create(command: CreateTransactionCommand) {
      const transaction = await deps.createTransactionUseCase.execute(command);

      const response: ApiResponse<{
        id: string;
        budgetOwnerId: string;
        categoryId: string;
        date: string;
        amount: number;
        description: string;
      }> = {
        success: true,
        data: {
          id: transaction.id,
          budgetOwnerId: transaction.budgetOwnerId,
          categoryId: transaction.categoryId,
          date: transaction.date.toISOString(),
          amount: transaction.amount,
          description: transaction.description,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async update(id: string, command: UpdateTransactionCommand, userId: string, userRole: string) {
      const transaction = await deps.updateTransactionUseCase.execute(id, command, userId, userRole);

      const response: ApiResponse<{
        id: string;
        budgetOwnerId: string;
        categoryId: string;
        date: string;
        amount: number;
        description: string;
      }> = {
        success: true,
        data: {
          id: transaction.id,
          budgetOwnerId: transaction.budgetOwnerId,
          categoryId: transaction.categoryId,
          date: transaction.date.toISOString(),
          amount: transaction.amount,
          description: transaction.description,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async delete(id: string, userId: string, userRole: string) {
      await deps.deleteTransactionUseCase.execute(id, userId, userRole);

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: "Transaksi berhasil dihapus",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },
  };
}
