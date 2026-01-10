import type { IUserRepository } from "../../domain/repositories/user-repository.interface";
import { User } from "../../domain/entities/user";
import { ErrNotFound, ErrDuplicate } from "../../../../shared/errors";
import type { CreateUserRequest, UserResponse } from "@repo/schema/user";

/**
 * Create User Use Case - Application Layer
 * ✅ No Elysia, no Firebase SDK directly
 * Dependencies injected via constructor
 */

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<UserResponse> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new ErrDuplicate(
        `User with email ${request.email} already exists`
      );
    }

    // Create user (hash password in real app)
    const user = User.create(
      crypto.randomUUID(),
      request.email,
      request.name,
      request.password // TODO: Hash password in production
    );

    const created = await this.userRepository.create(user);

    return {
      id: created.id,
      email: created.email,
      name: created.name,
      createdAt: created.createdAt.toISOString(),
    };
  }
}
