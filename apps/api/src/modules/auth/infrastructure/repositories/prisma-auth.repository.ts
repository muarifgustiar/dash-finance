import type { PrismaClient } from "@prisma/client";
import type { User } from "../../domain/entities/user";
import type { AuthRepository } from "../../domain/repositories/auth-repository";

/**
 * Map Prisma User model to domain User entity
 * Handles enum compatibility between Prisma and domain types
 */
function toDomainUser(prismaUser: any): User {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    name: prismaUser.name,
    passwordHash: prismaUser.passwordHash,
    role: prismaUser.role as User["role"], // Type assertion for enum compatibility
    status: prismaUser.status as User["status"],
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt,
  };
}

export class PrismaAuthRepository implements AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? toDomainUser(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? toDomainUser(user) : null;
  }

  async create(
    data: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data,
    });

    return toDomainUser(user);
  }
}
