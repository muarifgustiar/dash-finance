/**
 * Prisma Repository Implementation for User
 * ✅ Infrastructure Layer - Concrete implementation
 * Maps Prisma models ↔ Domain entities
 */

import type { IUserRepository } from "../../domain/repositories/user-repository.interface";
import { User } from "../../domain/entities/user";
import { prisma } from "../../../../shared/db/prisma";

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.toDomain(user);
  }

  async findAll(
    page: number,
    limit: number
  ): Promise<{ items: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(),
    ]);
    return {
      items: users.map((u) => this.toDomain(u)),
      total,
    };
  }

  async create(user: User): Promise<User> {
    const created = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
        status: user.status,
      },
    });
    return this.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        status: user.status,
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  /**
   * Maps Prisma model to Domain entity
   */
  private toDomain(prismaUser: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: "SUPER_ADMIN" | "USER";
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.name,
      prismaUser.passwordHash,
      prismaUser.role,
      prismaUser.status,
      prismaUser.createdAt,
      prismaUser.updatedAt
    );
  }
}
