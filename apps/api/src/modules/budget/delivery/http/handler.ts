import type { ApiResponse } from "@repo/domain/types";
import type { BudgetResponse } from "@repo/schema/budget";
import type {
  GetBudgetsUseCase,
  GetBudgetByIdUseCase,
  GetBudgetSummaryUseCase,
  CreateBudgetUseCase,
  UpdateBudgetUseCase,
  DeleteBudgetUseCase,
  CreateBudgetCommand,
  UpdateBudgetCommand,
  GetBudgetsQuery,
} from "../../application/use-cases";

export interface BudgetHandlerDeps {
  getBudgetsUseCase: GetBudgetsUseCase;
  getBudgetByIdUseCase: GetBudgetByIdUseCase;
  getBudgetSummaryUseCase: GetBudgetSummaryUseCase;
  createBudgetUseCase: CreateBudgetUseCase;
  updateBudgetUseCase: UpdateBudgetUseCase;
  deleteBudgetUseCase: DeleteBudgetUseCase;
}

export function createBudgetHandlers(deps: BudgetHandlerDeps) {
  return {
    async getAll(query: GetBudgetsQuery) {
      const budgets = await deps.getBudgetsUseCase.execute(query);

      const response: ApiResponse<BudgetResponse[]> = {
        success: true,
        data: budgets.map((b) => ({
          id: b.id,
          budgetOwnerId: b.budgetOwnerId,
          budgetOwnerName: b.budgetOwnerName,
          year: b.year,
          amountPlanned: b.amountPlanned,
          amountRevised: b.amountRevised,
          amountSpent: b.amountSpent,
          amountRemaining: b.amountRemaining,
          utilizationPercentage: b.utilizationPercentage,
          createdBy: b.createdBy,
          createdAt: b.createdAt.toISOString(),
          updatedAt: b.updatedAt.toISOString(),
        })),
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async getById(id: string) {
      const budget = await deps.getBudgetByIdUseCase.execute(id);

      const response: ApiResponse<BudgetResponse> = {
        success: true,
        data: {
          id: budget.id,
          budgetOwnerId: budget.budgetOwnerId,
          budgetOwnerName: budget.budgetOwnerName,
          year: budget.year,
          amountPlanned: budget.amountPlanned,
          amountRevised: budget.amountRevised,
          amountSpent: budget.amountSpent,
          amountRemaining: budget.amountRemaining,
          utilizationPercentage: budget.utilizationPercentage,
          createdBy: budget.createdBy,
          createdAt: budget.createdAt.toISOString(),
          updatedAt: budget.updatedAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async getSummary(year?: number) {
      const summary = await deps.getBudgetSummaryUseCase.execute(year);

      const response: ApiResponse<typeof summary> = {
        success: true,
        data: summary,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async create(command: CreateBudgetCommand) {
      const budget = await deps.createBudgetUseCase.execute(command);

      const response: ApiResponse<{
        id: string;
        budgetOwnerId: string;
        year: number;
        amountPlanned: number;
        amountRevised: number | null;
      }> = {
        success: true,
        data: {
          id: budget.id,
          budgetOwnerId: budget.budgetOwnerId,
          year: budget.year,
          amountPlanned: budget.amountPlanned,
          amountRevised: budget.amountRevised,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async update(id: string, command: UpdateBudgetCommand) {
      const budget = await deps.updateBudgetUseCase.execute(id, command);

      const response: ApiResponse<{
        id: string;
        budgetOwnerId: string;
        year: number;
        amountPlanned: number;
        amountRevised: number | null;
      }> = {
        success: true,
        data: {
          id: budget.id,
          budgetOwnerId: budget.budgetOwnerId,
          year: budget.year,
          amountPlanned: budget.amountPlanned,
          amountRevised: budget.amountRevised,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async delete(id: string) {
      await deps.deleteBudgetUseCase.execute(id);

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: "Budget berhasil dihapus",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },
  };
}
