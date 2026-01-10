/**
 * Category Entity (Domain)
 * Pure TS - no external dependencies
 */

export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface Category {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly status: CategoryStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
