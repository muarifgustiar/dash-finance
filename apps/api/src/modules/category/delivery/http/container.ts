import { Elysia } from "elysia";
import type { createCategoryModule } from "../../module.container";
import type { CategoryDeps } from "./handlers";

export type CategoryModuleContainer = ReturnType<typeof createCategoryModule>;

export const categoryContainer = (categoryModule: CategoryModuleContainer) => {
  const deps: CategoryDeps = {
    createCategoryUc: categoryModule.createCategoryUseCase,
    getCategoryUc: categoryModule.getCategoryByIdUseCase,
    updateCategoryUc: categoryModule.updateCategoryUseCase,
    deleteCategoryUc: categoryModule.deleteCategoryUseCase,
    listCategoriesUc: categoryModule.getCategoriesUseCase,
  };

  return new Elysia({ name: "container:category" }).decorate("categoryDeps", deps);
};
