import { ErrNotFound } from "../../../../shared/errors/canonical";
import type { User } from "../../domain/entities/user";
import type { AuthRepository } from "../../domain/repositories/auth-repository";

export class GetCurrentUserUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new ErrNotFound("User tidak ditemukan");
    }

    return user;
  }
}
