import type { IUserRepository } from "./domain/repositories/user-repository.interface";
import { CreateUserUseCase } from "./application/use-cases/create-user.use-case";
import { GetUserUseCase } from "./application/use-cases/get-user.use-case";
import { PrismaUserRepository } from "./infrastructure/repositories/prisma-user.repository";

/**
 * User Module Container - Dependency Injection
 * ✅ Wires up all dependencies for this module
 * Routes/handlers request dependencies from here
 */

export class UserModuleContainer {
  private static instance: UserModuleContainer;
  private userRepository: IUserRepository;

  private constructor() {
    // Initialize concrete implementations
    this.userRepository = new PrismaUserRepository();
  }

  static getInstance(): UserModuleContainer {
    if (!UserModuleContainer.instance) {
      UserModuleContainer.instance = new UserModuleContainer();
    }
    return UserModuleContainer.instance;
  }

  getCreateUserUseCase(): CreateUserUseCase {
    return new CreateUserUseCase(this.userRepository);
  }

  getGetUserUseCase(): GetUserUseCase {
    return new GetUserUseCase(this.userRepository);
  }
}
