/**
 * In-memory User Repository - Infrastructure Layer (Adapter)
 * ✅ Implementation detail, not visible to domain/application
 * Can be swapped with Firebase, Prisma, etc.
 */

import type { IUserRepository } from "../../domain/repositories/user-repository.interface";
import type { User } from "../../domain/entities/user";

export class UserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async create(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async update(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }

  async findAll(
    page: number,
    limit: number
  ): Promise<{ items: User[]; total: number }> {
    const users = Array.from(this.users.values());
    const total = users.length;
    const start = (page - 1) * limit;
    const items = users.slice(start, start + limit);
    return { items, total };
  }
}
