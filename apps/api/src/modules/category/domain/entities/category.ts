/**
 * Category Entity - Domain Layer
 * ✅ PURE TS: No external dependencies
 */

export type Status = "ACTIVE" | "INACTIVE";

export class Category {
  constructor(
    public readonly id: string,
    public readonly name: string,
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
    description?: string | null,
    createdAt: Date = new Date()
  ): Category {
    return new Category(
      id,
      name,
      description || null,
      "ACTIVE",
      createdAt,
      createdAt
    );
  }

  updateInfo(name?: string, description?: string | null): Category {
    const updatedName = name || this.name;
    
    if (!updatedName || updatedName.trim().length === 0) {
      throw new Error("Name cannot be empty");
    }

    return new Category(
      this.id,
      updatedName,
      description !== undefined ? description : this.description,
      this.status,
      this.createdAt,
      new Date()
    );
  }

  updateStatus(status: Status): Category {
    return new Category(
      this.id,
      this.name,
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
