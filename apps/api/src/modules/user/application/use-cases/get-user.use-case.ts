import type { IUserRepository } from "../../domain/repositories/user-repository.interface";
import { ErrNotFound } from "../../../../shared/errors";
import type { UserResponse } from "@repo/schema/user";

/**
 * Get User Use Case - Application Layer
 */

export class GetUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new ErrNotFound(`User with id ${id} not found`);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
