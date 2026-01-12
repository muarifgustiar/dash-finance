/**
 * List Categories Use Case - Application Layer
 */

import { calculatePaginationMeta, type PaginationMeta } from "@repo/domain/types";
import type { CategoryRepository } from "../../domain/repositories/category-repository";
import { Category } from "../../domain/entities/category";

export interface ListCategoriesDTO {
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
  page?: number;
  limit?: number;
  paginate?: boolean;
}

export interface ListCategoriesResult {
  items: Category[];
  pagination: PaginationMeta;
}

export class ListCategoriesUseCase {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(dto?: ListCategoriesDTO): Promise<ListCategoriesResult> {
    const page = dto?.page ?? 1;
    const limit = dto?.limit ?? 20;
    const paginate = dto?.paginate ?? true;

    if (!paginate) {
      // Unpaginated mode - return all items
      const result = await this.repository.findAll(dto);
      return {
        items: result.items,
        pagination: calculatePaginationMeta(1, result.items.length, result.items.length),
      };
    }

    // Paginated mode
    const result = await this.repository.findAll(dto, { page, limit });
    return {
      items: result.items,
      pagination: calculatePaginationMeta(page, limit, result.total),
    };
  }
}
