/**
 * Prisma Repository Implementation for Category
 * ✅ Infrastructure Layer - Concrete implementation
 * Maps Prisma models ↔ Domain entities
 */

import type { 
  CategoryRepository, 
  CreateCategoryData, 
  UpdateCategoryData 
} from "../../domain/repositories/category-repository";
import { Category } from "../../domain/entities/category";
import { prisma } from "../../../../shared/db/prisma";
import { randomUUID } from "crypto";

export class PrismaCategoryRepository implements CategoryRepository {
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
      status?: string;
      search?: string;
    }
  ): Promise<Category[]> {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const categories = await prisma.category.findMany({ 
      where,
      orderBy: { name: "asc" },
    });
    
    return categories.map((c) => this.toDomain(c));
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const created = await prisma.category.create({
      data: {
        id: randomUUID(),
        name: data.name,
        description: data.description,
        status: data.status,
      },
    });
    return this.toDomain(created);
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
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
