/**
 * BudgetOwner Entity - Domain Layer
 * ✅ PURE TS: No external dependencies
 * Business rules are enforced here via constructor invariants
 */

export type Status = "ACTIVE" | "INACTIVE";

export class BudgetOwner {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string | null,
    public readonly description: string | null,
    public readonly status: Status,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {
    // Enforce invariants
    if (!name || name.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }
    if (status !== "ACTIVE" && status !== "INACTIVE") {
      throw new Error("Invalid status");
    }
  }

  static create(
    id: string,
    name: string,
    code?: string | null,
    description?: string | null,
    createdAt: Date = new Date()
  ): BudgetOwner {
    return new BudgetOwner(
      id,
      name,
      code || null,
      description || null,
      "ACTIVE",
      createdAt,
      createdAt
    );
  }

  updateInfo(
    name?: string,
    code?: string | null,
    description?: string | null
  ): BudgetOwner {
    const updatedName = name || this.name;
    
    if (!updatedName || updatedName.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }

    return new BudgetOwner(
      this.id,
      updatedName,
      code !== undefined ? code : this.code,
      description !== undefined ? description : this.description,
      this.status,
      this.createdAt,
      new Date()
    );
  }

  updateStatus(status: Status): BudgetOwner {
    return new BudgetOwner(
      this.id,
      this.name,
      this.code,
      this.description,
      status,
      this.createdAt,
      new Date()
    );
  }

  isActive(): boolean {
    return this.status === "ACTIVE";
  }
}
