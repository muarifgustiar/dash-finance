import { ErrDuplicate, ErrNotFound, ErrInvalid } from "../../../shared/errors/canonical";
import type { Budget, BudgetWithDetails } from "../../domain/entities/budget";
import type { BudgetRepository } from "../../domain/repositories/budget-repository";

export interface GetBudgetsQuery {
  year?: number;
  budgetOwnerId?: string;
}

export class GetBudgetsUseCase {
  constructor(private budgetRepository: BudgetRepository) {}

  async execute(query: GetBudgetsQuery = {}): Promise<BudgetWithDetails[]> {
    return this.budgetRepository.findAll(query);
  }
}

export class GetBudgetByIdUseCase {
  constructor(private budgetRepository: BudgetRepository) {}

  async execute(id: string): Promise<BudgetWithDetails> {
    const budget = await this.budgetRepository.findById(id);
    
    if (!budget) {
      throw new ErrNotFound("Budget tidak ditemukan");
    }

    return budget;
  }
}

export class GetBudgetSummaryUseCase {
  constructor(private budgetRepository: BudgetRepository) {}

  async execute(year?: number) {
    return this.budgetRepository.getSummary(year);
  }
}

export interface CreateBudgetCommand {
  budgetOwnerId: string;
  year: number;
  amountPlanned: number;
  amountRevised?: number;
  createdBy: string;
}

export class CreateBudgetUseCase {
  constructor(private budgetRepository: BudgetRepository) {}

  async execute(command: CreateBudgetCommand): Promise<Budget> {
    // Validate amounts
    if (command.amountPlanned <= 0) {
      throw new ErrInvalid("Jumlah budget harus lebih besar dari 0");
    }

    if (command.amountRevised && command.amountRevised <= 0) {
      throw new ErrInvalid("Jumlah revisi budget harus lebih besar dari 0");
    }

    // Check for duplicate budget (same budget owner and year)
    const existing = await this.budgetRepository.findByBudgetOwnerAndYear(
      command.budgetOwnerId,
      command.year
    );

    if (existing) {
      throw new ErrDuplicate("Budget untuk Budget Owner dan tahun ini sudah ada");
    }

    return this.budgetRepository.create({
      budgetOwnerId: command.budgetOwnerId,
      year: command.year,
      amountPlanned: command.amountPlanned,
      amountRevised: command.amountRevised || null,
      createdBy: command.createdBy,
    });
  }
}

export interface UpdateBudgetCommand {
  amountPlanned?: number;
  amountRevised?: number;
}

export class UpdateBudgetUseCase {
  constructor(private budgetRepository: BudgetRepository) {}

  async execute(id: string, command: UpdateBudgetCommand): Promise<Budget> {
    const budget = await this.budgetRepository.findById(id);
    
    if (!budget) {
      throw new ErrNotFound("Budget tidak ditemukan");
    }

    // Validate amounts if provided
    if (command.amountPlanned && command.amountPlanned <= 0) {
      throw new ErrInvalid("Jumlah budget harus lebih besar dari 0");
    }

    if (command.amountRevised && command.amountRevised <= 0) {
      throw new ErrInvalid("Jumlah revisi budget harus lebih besar dari 0");
    }

    return this.budgetRepository.update(id, command);
  }
}

export class DeleteBudgetUseCase {
  constructor(private budgetRepository: BudgetRepository) {}

  async execute(id: string): Promise<void> {
    const budget = await this.budgetRepository.findById(id);
    
    if (!budget) {
      throw new ErrNotFound("Budget tidak ditemukan");
    }

    await this.budgetRepository.delete(id);
  }
}
