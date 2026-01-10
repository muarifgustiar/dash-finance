/**
 * User entity - Domain Layer
 * ✅ PURE TS: No Elysia, no Firebase, no Zod
 * Business rules are enforced here via constructor invariants
 */

export type UserRole = "SUPER_ADMIN" | "USER";
export type UserStatus = "ACTIVE" | "INACTIVE";

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly passwordHash: string,
    public readonly role: UserRole,
    public readonly status: UserStatus,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    // Enforce invariants
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email");
    }
    if (!name || name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }
    if (role !== "SUPER_ADMIN" && role !== "USER") {
      throw new Error("Invalid role");
    }
    if (status !== "ACTIVE" && status !== "INACTIVE") {
      throw new Error("Invalid status");
    }
  }

  static create(
    id: string,
    email: string,
    name: string,
    passwordHash: string,
    role: UserRole = "USER",
    status: UserStatus = "ACTIVE",
    createdAt: Date = new Date()
  ): User {
    return new User(id, email, name, passwordHash, role, status, createdAt, createdAt);
  }

  updateName(name: string): User {
    if (!name || name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }
    return new User(
      this.id,
      this.email,
      name,
      this.passwordHash,
      this.role,
      this.status,
      this.createdAt,
      new Date()
    );
  }

  updateStatus(status: UserStatus): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.passwordHash,
      this.role,
      status,
      this.createdAt,
      new Date()
    );
  }

  isActive(): boolean {
    return this.status === "ACTIVE";
  }

  isSuperAdmin(): boolean {
    return this.role === "SUPER_ADMIN";
  }
}
