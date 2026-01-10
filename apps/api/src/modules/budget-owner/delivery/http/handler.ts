import type { ApiResponse } from "@repo/domain/types";
import type { BudgetOwnerResponse } from "@repo/schema/budget-owner";
import type {
  GetBudgetOwnersUseCase,
  GetBudgetOwnerByIdUseCase,
  CreateBudgetOwnerUseCase,
  UpdateBudgetOwnerUseCase,
  DeleteBudgetOwnerUseCase,
  CreateBudgetOwnerCommand,
  UpdateBudgetOwnerCommand,
  GetBudgetOwnersQuery,
} from "../../application/use-cases";

export interface BudgetOwnerHandlerDeps {
  getBudgetOwnersUseCase: GetBudgetOwnersUseCase;
  getBudgetOwnerByIdUseCase: GetBudgetOwnerByIdUseCase;
  createBudgetOwnerUseCase: CreateBudgetOwnerUseCase;
  updateBudgetOwnerUseCase: UpdateBudgetOwnerUseCase;
  deleteBudgetOwnerUseCase: DeleteBudgetOwnerUseCase;
}

export function createBudgetOwnerHandlers(deps: BudgetOwnerHandlerDeps) {
  return {
    async getAll(query: GetBudgetOwnersQuery, userId?: string, userRole?: string) {
      const budgetOwners = await deps.getBudgetOwnersUseCase.execute(query, userId, userRole);

      const response: ApiResponse<BudgetOwnerResponse[]> = {
        success: true,
        data: budgetOwners.map((bo) => ({
          id: bo.id,
          name: bo.name,
          code: bo.code,
          description: bo.description,
          status: bo.status,
          createdAt: bo.createdAt.toISOString(),
          updatedAt: bo.updatedAt.toISOString(),
        })),
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async getById(id: string) {
      const budgetOwner = await deps.getBudgetOwnerByIdUseCase.execute(id);

      const response: ApiResponse<BudgetOwnerResponse> = {
        success: true,
        data: {
          id: budgetOwner.id,
          name: budgetOwner.name,
          code: budgetOwner.code,
          description: budgetOwner.description,
          status: budgetOwner.status,
          createdAt: budgetOwner.createdAt.toISOString(),
          updatedAt: budgetOwner.updatedAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async create(command: CreateBudgetOwnerCommand) {
      const budgetOwner = await deps.createBudgetOwnerUseCase.execute(command);

      const response: ApiResponse<BudgetOwnerResponse> = {
        success: true,
        data: {
          id: budgetOwner.id,
          name: budgetOwner.name,
          code: budgetOwner.code,
          description: budgetOwner.description,
          status: budgetOwner.status,
          createdAt: budgetOwner.createdAt.toISOString(),
          updatedAt: budgetOwner.updatedAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async update(id: string, command: UpdateBudgetOwnerCommand) {
      const budgetOwner = await deps.updateBudgetOwnerUseCase.execute(id, command);

      const response: ApiResponse<BudgetOwnerResponse> = {
        success: true,
        data: {
          id: budgetOwner.id,
          name: budgetOwner.name,
          code: budgetOwner.code,
          description: budgetOwner.description,
          status: budgetOwner.status,
          createdAt: budgetOwner.createdAt.toISOString(),
          updatedAt: budgetOwner.updatedAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async delete(id: string) {
      await deps.deleteBudgetOwnerUseCase.execute(id);

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: "Budget Owner berhasil dihapus",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },
  };
}
