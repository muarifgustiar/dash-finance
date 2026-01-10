/**
 * Auth - React Hook
 * ✅ Adapts use case for React components
 */

"use client";

import { useState } from "react";
import { LoginUseCase } from "../application/use-cases/login.use-case";
import { HttpAuthRepository } from "../infrastructure/http-auth.repository";

const authRepository = new HttpAuthRepository(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
);

const loginUseCase = new LoginUseCase(authRepository);

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await loginUseCase.execute({ email, password });
      return result;
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
    await authRepository.logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return { logout };
}
