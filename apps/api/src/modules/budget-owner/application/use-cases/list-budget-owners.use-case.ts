/**
 * List BudgetOwners Use Case - Application Layer
 */

import { calculatePaginationMeta, type PaginationMeta } from "@repo/domain/types";
import type { IBudgetOwnerRepository } from "../../domain/repositories/budget-owner-repository.interface";
import { BudgetOwner } from "../../domain/entities/budget-owner";

export interface ListBudgetOwnersDTO {
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
  page?: number;
  limit?: number;
  paginate?: boolean;
}

export interface ListBudgetOwnersResult {
  items: BudgetOwner[];
  pagination: PaginationMeta;
}

export class ListBudgetOwnersUseCase {
  constructor(private readonly repository: IBudgetOwnerRepository) {}

  async execute(dto?: ListBudgetOwnersDTO): Promise<ListBudgetOwnersResult> {
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
