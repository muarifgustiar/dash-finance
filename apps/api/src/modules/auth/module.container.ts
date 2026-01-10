import type { PrismaClient } from "@prisma/client";
import { PrismaAuthRepository } from "./infrastructure/repositories/prisma-auth.repository";
import { JwtAuthService } from "./infrastructure/services/jwt-auth.service";
import { LoginUseCase } from "./application/use-cases/login.use-case";
import { GetCurrentUserUseCase } from "./application/use-cases/get-current-user.use-case";

export function createAuthModule(prisma: PrismaClient) {
  // Infrastructure
  const authRepository = new PrismaAuthRepository(prisma);
  const authService = new JwtAuthService();

  // Application
  const loginUseCase = new LoginUseCase(authRepository, authService);
  const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

  return {
    authRepository,
    authService,
    loginUseCase,
    getCurrentUserUseCase,
  };
}
