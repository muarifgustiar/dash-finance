/**
 * Logout Use Case (Application Layer)
 */

import type { AuthRepository } from "../../domain/repositories/auth-repository";

export class LogoutUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(): Promise<void> {
    await this.authRepository.logout();

    // Clear token
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }
}
