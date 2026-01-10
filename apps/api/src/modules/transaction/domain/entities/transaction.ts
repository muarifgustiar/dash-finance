/**
 * Transaction Entity (Domain Layer)
 * ✅ PURE TypeScript - No external dependencies
 */

export interface TransactionProps {
  id: string;
  budgetOwnerId: string;
  categoryId: string;
  date: Date;
  amount: number;
  description: string;
  receiptUrl: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {
    // Enforce invariants
    this.validateAmount(props.amount);
    this.validateDescription(props.description);
  }

  private validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error("Amount must be positive");
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error("Description is required");
    }
  }

  static create(
    props: Omit<TransactionProps, "id" | "createdAt" | "updatedAt">
  ): Transaction {
    return new Transaction({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: TransactionProps): Transaction {
    return new Transaction(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get budgetOwnerId(): string {
    return this.props.budgetOwnerId;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get date(): Date {
    return this.props.date;
  }

  get amount(): number {
    return this.props.amount;
  }

  get description(): string {
    return this.props.description;
  }

  get receiptUrl(): string | null {
    return this.props.receiptUrl;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic
  getFiscalYear(): number {
    return this.props.date.getFullYear();
  }

  update(updates: {
    categoryId?: string;
    date?: Date;
    amount?: number;
    description?: string;
    receiptUrl?: string | null;
  }): void {
    if (updates.categoryId !== undefined) {
      this.props.categoryId = updates.categoryId;
    }
    if (updates.date !== undefined) {
      this.props.date = updates.date;
    }
    if (updates.amount !== undefined) {
      this.validateAmount(updates.amount);
      this.props.amount = updates.amount;
    }
    if (updates.description !== undefined) {
      this.validateDescription(updates.description);
      this.props.description = updates.description;
    }
    if (updates.receiptUrl !== undefined) {
      this.props.receiptUrl = updates.receiptUrl;
    }
    this.props.updatedAt = new Date();
  }
}
