/**
 * HTTP Auth Repository Implementation (Infrastructure Layer)
 * ✅ Concrete implementation using fetch
 */

import type { User } from "../../domain/entities/user";
import type { AuthRepository, LoginCredentials, AuthResponse } from "../../domain/repositories/auth-repository";
import type { LoginRequest, LoginResponse } from "@repo/schema";

export class HttpAuthRepository implements AuthRepository {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") {
    this.baseUrl = baseUrl;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const payload: LoginRequest = {
      email: credentials.email,
      password: credentials.password,
    };

    const response = await fetch(`${this.baseUrl}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Login gagal" }));
      throw new Error(error.message || "Login gagal");
    }

    const data: LoginResponse = await response.json();

    const user = new User(
      data.user.id,
      data.user.email,
      data.user.name,
      new Date(data.user.createdAt)
    );

    return {
      user,
      token: data.token,
    };
  }

  async logout(): Promise<void> {
    // Implement logout if needed (e.g., call logout endpoint)
    return Promise.resolve();
  }

  async getCurrentUser(): Promise<User | null> {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) return null;

    try {
      const response = await fetch(`${this.baseUrl}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) return null;

      const data = await response.json();
      return new User(data.id, data.email, data.name, new Date(data.createdAt));
    } catch {
      return null;
    }
  }
}
