/**
 * Prisma Repository Implementation for Category
 * ✅ Infrastructure Layer - Concrete implementation
 * Maps Prisma models ↔ Domain entities
 */

import type { PaginationParams } from "@repo/domain/types";
import type { ICategoryRepository } from "../../domain/repositories/category-repository.interface";
import { Category } from "../../domain/entities/category";
import { prisma } from "../../../../shared/db/prisma";

export class PrismaCategoryRepository implements ICategoryRepository {
  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return null;
    return this.toDomain(category);
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
    if (!category) return null;
    return this.toDomain(category);
  }

  async findAll(
    filters?: {
      status?: "ACTIVE" | "INACTIVE";
      search?: string;
    },
    pagination?: PaginationParams
  ): Promise<{ items: Category[]; total: number }> {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (!pagination) {
      // Unpaginated mode
      const categories = await prisma.category.findMany({ 
        where,
        orderBy: { name: "asc" },
      });
      return {
        items: categories.map((c) => this.toDomain(c)),
        total: categories.length,
      };
    }

    // Paginated mode
    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      items: categories.map((c) => this.toDomain(c)),
      total,
    };
  }

  async create(category: Category): Promise<Category> {
    const created = await prisma.category.create({
      data: {
        id: category.id,
        name: category.name,
        description: category.description,
        status: category.status,
      },
    });
    return this.toDomain(created);
  }

  async update(category: Category): Promise<Category> {
    const updated = await prisma.category.update({
      where: { id: category.id },
      data: {
        name: category.name,
        description: category.description,
        status: category.status,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async hasTransactions(categoryId: string): Promise<boolean> {
    const count = await prisma.transaction.count({
      where: { categoryId },
    });
    return count > 0;
  }

  /**
   * Maps Prisma model to Domain entity
   */
  private toDomain(prismaModel: {
    id: string;
    name: string;
    description: string | null;
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
    updatedAt: Date;
  }): Category {
    return new Category(
      prismaModel.id,
      prismaModel.name,
      prismaModel.description,
      prismaModel.status,
      prismaModel.createdAt,
      prismaModel.updatedAt
    );
  }
}
