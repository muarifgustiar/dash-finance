/**
 * Auth Domain - Auth Repository Interface
 * ✅ Port (abstraction) for infrastructure
 */

import { User } from "../entities/user";

export interface AuthRepository {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  getCurrentUser(): Promise<User | null>;
  logout(): Promise<void>;
}
