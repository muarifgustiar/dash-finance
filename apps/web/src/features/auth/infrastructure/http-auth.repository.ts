/**
 * Auth Infrastructure - HTTP Auth Repository
 * ✅ Implements AuthRepository using fetch API
 */

import type { AuthRepository } from "../domain/repositories/auth-repository";
import { User } from "../domain/entities/user";

export class HttpAuthRepository implements AuthRepository {
  constructor(private readonly baseUrl: string) {}

  async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    const user = User.create({
      id: data.data.user.id,
      email: data.data.user.email,
      name: data.data.user.name,
      createdAt: new Date(data.data.user.createdAt),
    });

    // Store token in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", data.data.token);
    }

    return {
      user,
      token: data.data.token,
    };
  }

  async getCurrentUser(): Promise<User | null> {
    if (typeof window === "undefined") {
      return null;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      return User.create({
        id: data.data.id,
        email: data.data.email,
        name: data.data.name,
        createdAt: new Date(data.data.createdAt),
      });
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }
}
