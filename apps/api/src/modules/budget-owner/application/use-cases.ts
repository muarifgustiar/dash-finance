import { ErrDuplicate, ErrNotFound } from "../../../shared/errors/canonical";
import type { BudgetOwner } from "../../domain/entities/budget-owner";
import type { BudgetOwnerRepository } from "../../domain/repositories/budget-owner-repository";

export interface GetBudgetOwnersQuery {
  status?: string;
}

export class GetBudgetOwnersUseCase {
  constructor(private budgetOwnerRepository: BudgetOwnerRepository) {}

  async execute(query: GetBudgetOwnersQuery = {}, userId?: string, userRole?: string): Promise<BudgetOwner[]> {
    // Super Admin can see all budget owners
    if (userRole === "SUPER_ADMIN") {
      return this.budgetOwnerRepository.findAll(query);
    }

    // Regular users can only see their accessible budget owners
    if (userId) {
      return this.budgetOwnerRepository.findAccessibleByUserId(userId);
    }

    return [];
  }
}

export class GetBudgetOwnerByIdUseCase {
  constructor(private budgetOwnerRepository: BudgetOwnerRepository) {}

  async execute(id: string): Promise<BudgetOwner> {
    const budgetOwner = await this.budgetOwnerRepository.findById(id);
    
    if (!budgetOwner) {
      throw new ErrNotFound("Budget Owner tidak ditemukan");
    }

    return budgetOwner;
  }
}

export interface CreateBudgetOwnerCommand {
  name: string;
  code?: string;
  description?: string;
}

export class CreateBudgetOwnerUseCase {
  constructor(private budgetOwnerRepository: BudgetOwnerRepository) {}

  async execute(command: CreateBudgetOwnerCommand): Promise<BudgetOwner> {
    // Check for duplicate name
    const existingByName = await this.budgetOwnerRepository.findByName(command.name);
    if (existingByName) {
      throw new ErrDuplicate("Budget Owner dengan nama ini sudah ada");
    }

    // Check for duplicate code if provided
    if (command.code) {
      const existingByCode = await this.budgetOwnerRepository.findByCode(command.code);
      if (existingByCode) {
        throw new ErrDuplicate("Budget Owner dengan kode ini sudah ada");
      }
    }

    return this.budgetOwnerRepository.create({
      name: command.name,
      code: command.code || null,
      description: command.description || null,
      status: "ACTIVE",
    });
  }
}

export interface UpdateBudgetOwnerCommand {
  name?: string;
  code?: string;
  description?: string;
  status?: string;
}

export class UpdateBudgetOwnerUseCase {
  constructor(private budgetOwnerRepository: BudgetOwnerRepository) {}

  async execute(id: string, command: UpdateBudgetOwnerCommand): Promise<BudgetOwner> {
    const budgetOwner = await this.budgetOwnerRepository.findById(id);
    
    if (!budgetOwner) {
      throw new ErrNotFound("Budget Owner tidak ditemukan");
    }

    // Check for duplicate name if updating name
    if (command.name && command.name !== budgetOwner.name) {
      const existing = await this.budgetOwnerRepository.findByName(command.name);
      if (existing) {
        throw new ErrDuplicate("Budget Owner dengan nama ini sudah ada");
      }
    }

    // Check for duplicate code if updating code
    if (command.code && command.code !== budgetOwner.code) {
      const existing = await this.budgetOwnerRepository.findByCode(command.code);
      if (existing) {
        throw new ErrDuplicate("Budget Owner dengan kode ini sudah ada");
      }
    }

    return this.budgetOwnerRepository.update(id, command);
  }
}

export class DeleteBudgetOwnerUseCase {
  constructor(private budgetOwnerRepository: BudgetOwnerRepository) {}

  async execute(id: string): Promise<void> {
    const budgetOwner = await this.budgetOwnerRepository.findById(id);
    
    if (!budgetOwner) {
      throw new ErrNotFound("Budget Owner tidak ditemukan");
    }

    await this.budgetOwnerRepository.delete(id);
  }
}
