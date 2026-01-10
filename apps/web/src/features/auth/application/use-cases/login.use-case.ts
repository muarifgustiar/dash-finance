/**
 * Auth Application - Login Use Case
 * ✅ Orchestrates authentication logic
 */

import type { AuthRepository } from "../domain/repositories/auth-repository";
import type { User } from "../domain/entities/user";

export interface LoginCommand {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User;
  token: string;
}

export class LoginUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    // Validate command
    if (!command.email || !command.password) {
      throw new Error("Email and password are required");
    }

    // Execute domain logic through repository
    const result = await this.authRepository.login(
      command.email,
      command.password
    );

    return result;
  }
}
