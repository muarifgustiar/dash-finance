import type { ApiResponse } from "@repo/domain/types";
import type { LoginRequest } from "@repo/schema/user";
import type { LoginUseCase } from "../../application/use-cases/login.use-case";
import type { GetCurrentUserUseCase } from "../../application/use-cases/get-current-user.use-case";

export interface AuthHandlerDeps {
  loginUseCase: LoginUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
}

export function createAuthHandlers(deps: AuthHandlerDeps) {
  return {
    async login(body: LoginRequest) {
      const result = await deps.loginUseCase.execute(body);

      const response: ApiResponse<{
        token: string;
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
        };
      }> = {
        success: true,
        data: {
          token: result.token,
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name,
            role: result.user.role,
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async getCurrentUser(userId: string) {
      const user = await deps.getCurrentUserUseCase.execute(userId);

      const response: ApiResponse<{
        id: string;
        email: string;
        name: string;
        role: string;
        status: string;
      }> = {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },

    async logout() {
      const response: ApiResponse<{ message: string }> = {
        success: true,
        data: {
          message: "Logout berhasil",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return response;
    },
  };
}
