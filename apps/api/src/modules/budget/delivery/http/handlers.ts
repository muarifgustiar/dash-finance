/**
 * Budget HTTP Handlers
 * ✅ Delivery layer - thin handlers that call use cases
 */

import type { Context } from "elysia";
import type { BudgetModuleContainer } from "../../module.container";
import { success, error } from "../../../../shared/util/response";
import { ErrInvalid, ErrDuplicate, ErrNotFound } from "../../../../shared/errors";
import type {
  CreateBudgetRequest,
  UpdateBudgetRequest,
  GetBudgetsQuery,
} from "@repo/schema/budget";

// Helper to map Budget entity to response DTO
function toBudgetResponse(budget: any) {
  return {
    id: budget.id,
    budgetOwnerId: budget.budgetOwnerId,
    year: budget.year,
    amountPlanned: budget.amountPlanned,
    amountRevised: budget.amountRevised,
    createdBy: budget.createdBy,
    createdAt: budget.createdAt.toISOString(),
    updatedAt: budget.updatedAt.toISOString(),
  };
}

export async function createBudgetHandler(
  ctx: Context,
  container: BudgetModuleContainer
) {
  try {
    const body = ctx.body as CreateBudgetRequest;

    // TODO: Get createdBy from authenticated user
    const createdBy = "00000000-0000-0000-0000-000000000000";

    const budget = await container.createBudgetUseCase.execute({
      ...body,
      createdBy,
    });

    return success(toBudgetResponse(budget));
  } catch (err) {
    if (err instanceof ErrDuplicate) {
      return error(err.message, 409);
    }
    if (err instanceof ErrInvalid) {
      return error(err.message, 400);
    }
    console.error("Create budget error:", err);
    return error("Internal server error", 500);
  }
}

export async function getBudgetsHandler(
  ctx: Context,
  container: BudgetModuleContainer
) {
  try {
    const query = ctx.query as GetBudgetsQuery;

    const result = await container.getBudgetsUseCase.execute(query);

    return success({
      items: result.items.map(toBudgetResponse),
      pagination: result.pagination,
    });
  } catch (err) {
    console.error("Get budgets error:", err);
    return error("Internal server error", 500);
  }
}

export async function getBudgetByIdHandler(
  ctx: Context,
  container: BudgetModuleContainer
) {
  try {
    const { id } = ctx.params as { id: string };

    const budget = await container.budgetRepository.findById(id);

    if (!budget) {
      return error(`Budget with ID ${id} not found`, 404);
    }

    return success(toBudgetResponse(budget));
  } catch (err) {
    console.error("Get budget by ID error:", err);
    return error("Internal server error", 500);
  }
}

export async function updateBudgetHandler(
  ctx: Context,
  container: BudgetModuleContainer
) {
  try {
    const { id } = ctx.params as { id: string };
    const body = ctx.body as UpdateBudgetRequest;

    const budget = await container.updateBudgetUseCase.execute({
      id,
      ...body,
    });

    return success(toBudgetResponse(budget));
  } catch (err) {
    if (err instanceof ErrNotFound) {
      return error(err.message, 404);
    }
    if (err instanceof ErrInvalid) {
      return error(err.message, 400);
    }
    console.error("Update budget error:", err);
    return error("Internal server error", 500);
  }
}

export async function deleteBudgetHandler(
  ctx: Context,
  container: BudgetModuleContainer
) {
  try {
    const { id } = ctx.params as { id: string };

    await container.budgetRepository.delete(id);

    return success({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Delete budget error:", err);
    return error("Internal server error", 500);
  }
}
