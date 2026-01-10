import type { User } from "@/features/auth/domain/entities/user";
import type { AuthRepository } from "@/features/auth/domain/repositories/auth-repository";
import { apiRequest } from "@/lib/api-client";

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<User> {
    const response = await apiRequest<{ data: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await apiRequest("/auth/logout", {
      method: "POST",
    });
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiRequest<{ data: User }>("/auth/me");
      return response.data;
    } catch {
      return null;
    }
  }
}
