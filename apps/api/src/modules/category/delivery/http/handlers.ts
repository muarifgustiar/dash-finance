/**
 * Category HTTP Handlers - Delivery Layer
 * ✅ Thin handlers: validate → use case → map error → respond
 */

import type {
  CreateCategoryUseCase,
  GetCategoryByIdUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoriesUseCase,
} from "../../application/use-cases";
import { Category } from "../../domain/entities/category";
import { DomainError, getHttpStatus, mapErrorToResponse } from "../../../../shared/errors/canonical";

export interface CategoryDeps {
  createCategoryUc: CreateCategoryUseCase;
  getCategoryUc: GetCategoryByIdUseCase;
  updateCategoryUc: UpdateCategoryUseCase;
  deleteCategoryUc: DeleteCategoryUseCase;
  listCategoriesUc: GetCategoriesUseCase;
}

/**
 * Maps domain entity to response DTO
 */
function toResponse(category: Category) {
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    status: category.status,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
}

export function createCategoryHandler(deps: CategoryDeps) {
  return async ({ body, set }: any) => {
    try {
      const category = await deps.createCategoryUc.execute(body);
      set.status = 201;
      return {
        success: true,
        data: toResponse(category),
        message: "Category created successfully",
      };
    } catch (err) {
      if (err instanceof DomainError) {
        set.status = getHttpStatus(err);
        return mapErrorToResponse(err);
      }
      set.status = 500;
      return mapErrorToResponse(err);
    }
  };
}

export function getCategoryHandler(deps: CategoryDeps) {
  return async ({ params, set }: any) => {
    try {
      const category = await deps.getCategoryUc.execute(params.id);
      return {
        success: true,
        data: toResponse(category),
      };
    } catch (err) {
      if (err instanceof DomainError) {
        set.status = getHttpStatus(err);
        return mapErrorToResponse(err);
      }
      set.status = 500;
      return mapErrorToResponse(err);
    }
  };
}

export function updateCategoryHandler(deps: CategoryDeps) {
  return async ({ params, body, set }: any) => {
    try {
      const category = await deps.updateCategoryUc.execute(params.id, body);
      return {
        success: true,
        data: toResponse(category),
        message: "Category updated successfully",
      };
    } catch (err) {
      if (err instanceof DomainError) {
        set.status = getHttpStatus(err);
        return mapErrorToResponse(err);
      }
      set.status = 500;
      return mapErrorToResponse(err);
    }
  };
}

export function deleteCategoryHandler(deps: CategoryDeps) {
  return async ({ params, set }: any) => {
    try {
      await deps.deleteCategoryUc.execute(params.id);
      set.status = 204;
      return {
        success: true,
        message: "Category deleted successfully",
      };
    } catch (err) {
      if (err instanceof DomainError) {
        set.status = getHttpStatus(err);
        return mapErrorToResponse(err);
      }
      set.status = 500;
      return mapErrorToResponse(err);
    }
  };
}

export function listCategoriesHandler(deps: CategoryDeps) {
  return async ({ query, set }: any) => {
    try {
      const categories = await deps.listCategoriesUc.execute(query);
      return {
        success: true,
        data: {
          items: categories.map(toResponse),
          pagination: {
            page: 1,
            limit: categories.length,
            total: categories.length,
            totalPages: 1,
          },
        },
      };
    } catch (err) {
      if (err instanceof DomainError) {
        set.status = getHttpStatus(err);
        return mapErrorToResponse(err);
      }
      set.status = 500;
      return mapErrorToResponse(err);
    }
  };
}
