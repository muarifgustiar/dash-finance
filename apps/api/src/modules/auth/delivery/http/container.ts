import { Elysia } from "elysia";
import type { createAuthModule } from "../../module.container";

export type AuthModuleContainer = ReturnType<typeof createAuthModule>;

export const authContainer = (authModule: AuthModuleContainer) =>
  new Elysia({ name: "container:auth" }).decorate("authUseCases", {
    loginUseCase: authModule.loginUseCase,
    getCurrentUserUseCase: authModule.getCurrentUserUseCase,
  });
