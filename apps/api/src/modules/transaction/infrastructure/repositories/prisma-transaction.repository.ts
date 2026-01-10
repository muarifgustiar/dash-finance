/**
 * Prisma Transaction Repository Implementation
 * ✅ Infrastructure layer - maps Prisma models to Domain entities
 */

import type { PaginationParams } from "@repo/domain/types";
import { prisma } from "../../../../shared/db/prisma";
import { Transaction } from "../../domain/entities/transaction";
import type { ITransactionRepository } from "../../domain/repositories/transaction-repository.interface";
import type { Transaction as PrismaTransaction } from "@prisma/client";

export class PrismaTransactionRepository implements ITransactionRepository {
  private toDomain(model: PrismaTransaction): Transaction {
    return Transaction.reconstitute({
      id: model.id,
      budgetOwnerId: model.budgetOwnerId,
      categoryId: model.categoryId,
      date: model.date,
      amount: model.amount.toNumber(),
      description: model.description,
      receiptUrl: model.receiptUrl,
      createdBy: model.createdBy,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    const model = await prisma.transaction.findUnique({ where: { id } });
    return model ? this.toDomain(model) : null;
  }

  async findByBudgetOwner(
    budgetOwnerId: string,
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }> {
    const where = { budgetOwnerId };

    const [models, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
        take: pagination?.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items: models.map((m) => this.toDomain(m)),
      total,
    };
  }

  async findByCategory(
    categoryId: string,
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }> {
    const where = { categoryId };

    const [models, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
        take: pagination?.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items: models.map((m) => this.toDomain(m)),
      total,
    };
  }

  async findByCategories(
    categoryIds: string[],
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }> {
    const where = { categoryId: { in: categoryIds } };

    const [models, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
        take: pagination?.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items: models.map((m) => this.toDomain(m)),
      total,
    };
  }

  async findByDateRange(
    budgetOwnerId: string,
    startDate: Date,
    endDate: Date,
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }> {
    const where = {
      budgetOwnerId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    };

    const [models, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: pagination ? (pagination.page - 1) * pagination.limit : undefined,
        take: pagination?.limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items: models.map((m) => this.toDomain(m)),
      total,
    };
  }

  async findByYear(
    budgetOwnerId: string,
    year: number,
    pagination?: PaginationParams
  ): Promise<{ items: Transaction[]; total: number }> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    return this.findByDateRange(budgetOwnerId, startDate, endDate, pagination);
  }

  async getTotalSpentByBudgetOwner(
    budgetOwnerId: string,
    year: number
  ): Promise<number> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const result = await prisma.transaction.aggregate({
      where: {
        budgetOwnerId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount?.toNumber() ?? 0;
  }

  async create(transaction: Transaction): Promise<Transaction> {
    const model = await prisma.transaction.create({
      data: {
        id: transaction.id,
        budgetOwnerId: transaction.budgetOwnerId,
        categoryId: transaction.categoryId,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description,
        receiptUrl: transaction.receiptUrl,
        createdBy: transaction.createdBy,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
    return this.toDomain(model);
  }

  async update(transaction: Transaction): Promise<Transaction> {
    const model = await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        categoryId: transaction.categoryId,
        date: transaction.date,
        amount: transaction.amount,
        description: transaction.description,
        receiptUrl: transaction.receiptUrl,
        updatedAt: transaction.updatedAt,
      },
    });
    return this.toDomain(model);
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({ where: { id } });
  }
}
