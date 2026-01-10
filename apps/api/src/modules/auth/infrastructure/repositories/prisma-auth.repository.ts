import type { PrismaClient } from "@prisma/client";
import type { User } from "../../domain/entities/user";
import type { AuthRepository } from "../../domain/repositories/auth-repository";

export class PrismaAuthRepository implements AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async create(
    data: Omit<User, "id" | "createdAt" | "updatedAt">
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data,
    });

    return user;
  }
}
