/**
 * Budget Entity (Domain Layer)
 * ✅ PURE TypeScript - No external dependencies
 */

export interface BudgetProps {
  id: string;
  budgetOwnerId: string;
  year: number;
  amountPlanned: number;
  amountRevised: number | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Budget {
  private constructor(private readonly props: BudgetProps) {
    // Enforce invariants
    this.validateYear(props.year);
    this.validateAmount(props.amountPlanned, "amountPlanned");
    if (props.amountRevised !== null) {
      this.validateAmount(props.amountRevised, "amountRevised");
    }
  }

  private validateYear(year: number): void {
    if (year < 2000 || year > 2100) {
      throw new Error("Year must be between 2000 and 2100");
    }
  }

  private validateAmount(amount: number, field: string): void {
    if (amount <= 0) {
      throw new Error(`${field} must be positive`);
    }
  }

  static create(props: Omit<BudgetProps, "id" | "createdAt" | "updatedAt">): Budget {
    return new Budget({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static reconstitute(props: BudgetProps): Budget {
    return new Budget(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get budgetOwnerId(): string {
    return this.props.budgetOwnerId;
  }

  get year(): number {
    return this.props.year;
  }

  get amountPlanned(): number {
    return this.props.amountPlanned;
  }

  get amountRevised(): number | null {
    return this.props.amountRevised;
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
  updateAmounts(planned?: number, revised?: number): void {
    if (planned !== undefined) {
      this.validateAmount(planned, "amountPlanned");
      this.props.amountPlanned = planned;
    }
    if (revised !== undefined) {
      this.validateAmount(revised, "amountRevised");
      this.props.amountRevised = revised;
    }
    this.props.updatedAt = new Date();
  }

  getEffectiveAmount(): number {
    return this.props.amountRevised ?? this.props.amountPlanned;
  }

  calculateUtilization(totalSpent: number): {
    totalSpent: number;
    remaining: number;
    utilizationPercentage: number;
  } {
    const effectiveAmount = this.getEffectiveAmount();
    const remaining = effectiveAmount - totalSpent;
    const utilizationPercentage = (totalSpent / effectiveAmount) * 100;

    return {
      totalSpent,
      remaining,
      utilizationPercentage: Math.round(utilizationPercentage * 100) / 100,
    };
  }
}
