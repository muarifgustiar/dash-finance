import type { User } from "../entities/user";

/**
 * User Repository Interface - Domain Layer (Port)
 * ✅ PURE TS: Only defines the contract
 * Implementation is in infrastructure layer
 */

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(
    page: number,
    limit: number
  ): Promise<{ items: User[]; total: number }>;
}
