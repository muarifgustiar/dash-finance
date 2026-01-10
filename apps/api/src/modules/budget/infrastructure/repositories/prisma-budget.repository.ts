/**
 * Prisma Budget Repository Implementation
 * ✅ Infrastructure layer - maps Prisma models to Domain entities
 */

import type { PaginationParams } from "@repo/domain/types";
import { prisma } from "../../../../shared/db/prisma";
import { Budget } from "../../domain/entities/budget";
import type { IBudgetRepository } from "../../domain/repositories/budget-repository.interface";
import type { Budget as PrismaBudget } from "@prisma/client";

export class PrismaBudgetRepository implements IBudgetRepository {
  private toDomain(model: PrismaBudget): Budget {
    return Budget.reconstitute({
      id: model.id,
      budgetOwnerId: model.budgetOwnerId,
      year: model.year,
      amountPlanned: model.amountPlanned.toNumber(),
      amountRevised: model.amountRevised?.toNumber() ?? null,
      createdBy: model.createdBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async findById(id: string): Promise<Budget | null> {
    const model = await prisma.budget.findUnique({ where: { id } });
    return model ? this.toDomain(model) : null;
  }

  async findByBudgetOwnerAndYear(
    budgetOwnerId: string,
    year: number
  ): Promise<Budget | null> {
    const model = await prisma.budget.findUnique({
      where: {
        budgetOwnerId_year: { budgetOwnerId, year },
      },
    });
    return model ? this.toDomain(model) : null;
  }

  async findByBudgetOwner(budgetOwnerId: string): Promise<Budget[]> {
    const models = await prisma.budget.findMany({
      where: { budgetOwnerId },
      orderBy: { year: "desc" },
    });
    return models.map((m) => this.toDomain(m));
  }

  async findByYear(year: number): Promise<Budget[]> {
    const models = await prisma.budget.findMany({
      where: { year },
      orderBy: { createdAt: "desc" },
    });
    return models.map((m) => this.toDomain(m));
  }

  async findAll(pagination?: PaginationParams): Promise<{ items: Budget[]; total: number }> {
    if (!pagination) {
      // Unpaginated mode
      const models = await prisma.budget.findMany({
        orderBy: { createdAt: "desc" },
      });
      return {
        items: models.map((m) => this.toDomain(m)),
        total: models.length,
      };
    }

    // Paginated mode
    const [models, total] = await Promise.all([
      prisma.budget.findMany({
        orderBy: { createdAt: "desc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.budget.count(),
    ]);

    return {
      items: models.map((m) => this.toDomain(m)),
      total,
    };
  }

  async create(budget: Budget): Promise<Budget> {
    const model = await prisma.budget.create({
      data: {
        id: budget.id,
        budgetOwnerId: budget.budgetOwnerId,
        year: budget.year,
        amountPlanned: budget.amountPlanned,
        amountRevised: budget.amountRevised,
        createdBy: budget.createdBy,
        createdAt: budget.createdAt,
        updatedAt: budget.updatedAt,
      },
    });
    return this.toDomain(model);
  }

  async update(budget: Budget): Promise<Budget> {
    const model = await prisma.budget.update({
      where: { id: budget.id },
      data: {
        amountPlanned: budget.amountPlanned,
        amountRevised: budget.amountRevised,
        updatedAt: budget.updatedAt,
      },
    });
    return this.toDomain(model);
  }

  async delete(id: string): Promise<void> {
    await prisma.budget.delete({ where: { id } });
  }
}
