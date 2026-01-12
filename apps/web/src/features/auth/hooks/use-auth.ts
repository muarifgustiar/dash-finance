/**
 * Auth Hooks (Presentation)
 * React hooks with direct API calls
 */

"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { User } from "../domain/entities/user";

// API response types
interface LoginResponse {
  data: {
    user: {
      id: string;
      email: string;
      name: string;
    };
    token: string;
  };
}

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Store token
      if (typeof window !== "undefined") {
        localStorage.setItem("auth_token", response.data.token);
      }

      // Map to domain entity
      return User.create({
        id: response.data.user.id,
        email: response.data.user.email,
        name: response.data.user.name,
        createdAt: new Date(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login gagal";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    isLoading,
    error,
  };
}

export function useLogout() {
  const logout = async () => {
    // Clear token
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
  };

  return { logout };
}
