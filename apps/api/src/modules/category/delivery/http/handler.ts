import type { ApiResponse } from "@repo/domain/types";
import type { CategoryResponse } from "@repo/schema/category";
import type {
  GetCategoriesUseCase,
  GetCategoryByIdUseCase,
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  CreateCategoryCommand,
  UpdateCategoryCommand,
  GetCategoriesQuery,
} from "../../application/use-cases";

export interface CategoryHandlerDeps {
  getCategoriesUseCase: GetCategoriesUseCase;
  getCategoryByIdUseCase: GetCategoryByIdUseCase;
  createCategoryUseCase: CreateCategoryUseCase;
  updateCategoryUseCase: UpdateCategoryUseCase;
  deleteCategoryUseCase: DeleteCategoryUseCase;
}

export function createCategoryHandlers(deps: CategoryHandlerDeps) {
  return {
    async getAll(query: GetCategoriesQuery) {
      const categories = await deps.getCategoriesUseCase.execute(query);

      const response: ApiResponse<CategoryResponse[]> = {
        success: true,
        data: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description,
          status: cat.status,
          createdAt: cat.createdAt.toISOString(),
          updatedAt: cat.updatedAt.toISOString(),
        })),
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async getById(id: string) {
      const category = await deps.getCategoryByIdUseCase.execute(id);

      const response: ApiResponse<CategoryResponse> = {
        success: true,
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
          status: category.status,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async create(command: CreateCategoryCommand) {
      const category = await deps.createCategoryUseCase.execute(command);

      const response: ApiResponse<CategoryResponse> = {
        success: true,
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
          status: category.status,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async update(id: string, command: UpdateCategoryCommand) {
      const category = await deps.updateCategoryUseCase.execute(id, command);

      const response: ApiResponse<CategoryResponse> = {
        success: true,
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
          status: category.status,
          createdAt: category.createdAt.toISOString(),
          updatedAt: category.updatedAt.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async delete(id: string) {
      await deps.deleteCategoryUseCase.execute(id);

      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: "Kategori berhasil dihapus",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },
  };
}
