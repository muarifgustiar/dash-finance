/**
 * BudgetOwner HTTP Handlers - Delivery Layer
 * ✅ Thin handlers: validate → use case → map error → respond
 */

import type {
  CreateBudgetOwnerUseCase,
  GetBudgetOwnerByIdUseCase,
  UpdateBudgetOwnerUseCase,
  DeleteBudgetOwnerUseCase,
  GetBudgetOwnersUseCase,
} from "../../application/use-cases";
import { BudgetOwner } from "../../domain/entities/budget-owner";
import { success, error } from "../../../../shared/util/response";

export interface BudgetOwnerDeps {
  createBudgetOwnerUc: CreateBudgetOwnerUseCase;
  getBudgetOwnerUc: GetBudgetOwnerByIdUseCase;
  updateBudgetOwnerUc: UpdateBudgetOwnerUseCase;
  deleteBudgetOwnerUc: DeleteBudgetOwnerUseCase;
  listBudgetOwnersUc: GetBudgetOwnersUseCase;
}

/**
 * Maps domain entity to response DTO
 */
function toResponse(budgetOwner: BudgetOwner) {
  return {
    id: budgetOwner.id,
    name: budgetOwner.name,
    code: budgetOwner.code,
    description: budgetOwner.description,
    status: budgetOwner.status,
    createdAt: budgetOwner.createdAt.toISOString(),
    updatedAt: budgetOwner.updatedAt.toISOString(),
  };
}

export function createBudgetOwnerHandler(deps: BudgetOwnerDeps) {
  return async ({ body }: any) => {
    try {
      const budgetOwner = await deps.createBudgetOwnerUc.execute(body);
      return {
        success: true,
        data: toResponse(budgetOwner),
        message: "Budget owner created successfully",
      };
    } catch (err) {
      return error("Internal server error");
    }
  };
}

export function getBudgetOwnerHandler(deps: BudgetOwnerDeps) {
  return async ({ params }: any) => {
    try {
      const budgetOwner = await deps.getBudgetOwnerUc.execute(params.id);
      return {
        success: true,
        data: toResponse(budgetOwner),
      };
    } catch (err) {
      return error("Internal server error");
    }
  };
}

export function updateBudgetOwnerHandler(deps: BudgetOwnerDeps) {
  return async ({ params, body }: any) => {
    try {
      const budgetOwner = await deps.updateBudgetOwnerUc.execute(params.id, body);
      return {
        success: true,
        data: toResponse(budgetOwner),
        message: "Budget owner updated successfully",
      };
    } catch (err) {
      return error("Internal server error");
    }
  };
}

export function deleteBudgetOwnerHandler(deps: BudgetOwnerDeps) {
  return async ({ params }: any) => {
    try {
      await deps.deleteBudgetOwnerUc.execute(params.id);
      return {
        success: true,
        message: "Budget owner deleted successfully",
      };
    } catch (err) {
      return error("Internal server error");
    }
  };
}

export function listBudgetOwnersHandler(deps: BudgetOwnerDeps) {
  return async ({ query }: any) => {
    try {
      const budgetOwners = await deps.listBudgetOwnersUc.execute(query);
      return {
        success: true,
        data: {
          items: budgetOwners.map(toResponse),
          pagination: {
            page: 1,
            limit: budgetOwners.length,
            total: budgetOwners.length,
            totalPages: 1,
          },
        },
      };
    } catch (err) {
      return error("Internal server error");
    }
  };
}
