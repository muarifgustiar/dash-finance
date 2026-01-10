/**
 * Prisma Repository Implementation for BudgetOwner
 * ✅ Infrastructure Layer - Concrete implementation
 * Maps Prisma models ↔ Domain entities
 */

import type { PaginationParams } from "@repo/domain/types";
import type { IBudgetOwnerRepository } from "../../domain/repositories/budget-owner-repository.interface";
import { BudgetOwner } from "../../domain/entities/budget-owner";
import { prisma } from "../../../../shared/db/prisma";

export class PrismaBudgetOwnerRepository implements IBudgetOwnerRepository {
  async findById(id: string): Promise<BudgetOwner | null> {
    const budgetOwner = await prisma.budgetOwner.findUnique({ where: { id } });
    if (!budgetOwner) return null;
    return this.toDomain(budgetOwner);
  }

  async findByCode(code: string): Promise<BudgetOwner | null> {
    const budgetOwner = await prisma.budgetOwner.findUnique({ where: { code } });
    if (!budgetOwner) return null;
    return this.toDomain(budgetOwner);
  }

  async findAll(
    filters?: {
      status?: "ACTIVE" | "INACTIVE";
      search?: string;
    },
    pagination?: PaginationParams
  ): Promise<{ items: BudgetOwner[]; total: number }> {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { code: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (!pagination) {
      // Unpaginated mode
      const budgetOwners = await prisma.budgetOwner.findMany({ 
        where,
        orderBy: { name: "asc" },
      });
      return {
        items: budgetOwners.map((bo) => this.toDomain(bo)),
        total: budgetOwners.length,
      };
    }

    // Paginated mode
    const [budgetOwners, total] = await Promise.all([
      prisma.budgetOwner.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.budgetOwner.count({ where }),
    ]);

    return {
      items: budgetOwners.map((bo) => this.toDomain(bo)),
      total,
    };
  }

  async create(budgetOwner: BudgetOwner): Promise<BudgetOwner> {
    const created = await prisma.budgetOwner.create({
      data: {
        id: budgetOwner.id,
        name: budgetOwner.name,
        code: budgetOwner.code,
        description: budgetOwner.description,
        status: budgetOwner.status,
      },
    });
    return this.toDomain(created);
  }

  async update(budgetOwner: BudgetOwner): Promise<BudgetOwner> {
    const updated = await prisma.budgetOwner.update({
      where: { id: budgetOwner.id },
      data: {
        name: budgetOwner.name,
        code: budgetOwner.code,
        description: budgetOwner.description,
        status: budgetOwner.status,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.budgetOwner.delete({ where: { id } });
  }

  /**
   * Maps Prisma model to Domain entity
   */
  private toDomain(prismaModel: {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
    updatedAt: Date;
  }): BudgetOwner {
    return new BudgetOwner(
      prismaModel.id,
      prismaModel.name,
      prismaModel.code,
      prismaModel.description,
      prismaModel.status,
      prismaModel.createdAt,
      prismaModel.updatedAt
    );
  }
}
