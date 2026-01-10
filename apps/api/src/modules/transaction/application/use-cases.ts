import { ErrNotFound, ErrInvalid, ErrUnauthorized } from "../../../shared/errors/canonical";
import type { Transaction, TransactionWithDetails } from "../../domain/entities/transaction";
import type { TransactionRepository } from "../../domain/repositories/transaction-repository";

export interface GetTransactionsQuery {
  budgetOwnerId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
}

export class GetTransactionsUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(
    query: GetTransactionsQuery = {},
    userId?: string,
    userRole?: string
  ): Promise<TransactionWithDetails[]> {
    // Super Admin can see all transactions
    if (userRole === "SUPER_ADMIN") {
      const filters: any = {};
      
      if (query.budgetOwnerId) filters.budgetOwnerId = query.budgetOwnerId;
      if (query.categoryId) filters.categoryId = query.categoryId;
      if (query.startDate) filters.startDate = new Date(query.startDate);
      if (query.endDate) filters.endDate = new Date(query.endDate);
      if (query.year) filters.year = query.year;

      return this.transactionRepository.findAll(filters);
    }

    // Regular users can only see transactions from their accessible budget owners
    if (userId) {
      const filters: any = {};
      if (query.categoryId) filters.categoryId = query.categoryId;
      if (query.startDate) filters.startDate = new Date(query.startDate);
      if (query.endDate) filters.endDate = new Date(query.endDate);

      return this.transactionRepository.findAccessibleByUserId(userId, filters);
    }

    return [];
  }
}

export class GetTransactionByIdUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(id: string): Promise<TransactionWithDetails> {
    const transaction = await this.transactionRepository.findById(id);
    
    if (!transaction) {
      throw new ErrNotFound("Transaksi tidak ditemukan");
    }

    return transaction;
  }
}

export interface CreateTransactionCommand {
  budgetOwnerId: string;
  categoryId: string;
  date: Date;
  amount: number;
  description: string;
  receiptUrl?: string;
  createdBy: string;
}

export class CreateTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(command: CreateTransactionCommand): Promise<Transaction> {
    // Validate amount
    if (command.amount <= 0) {
      throw new ErrInvalid("Jumlah transaksi harus lebih besar dari 0");
    }

    // Validate description
    if (!command.description || command.description.trim().length === 0) {
      throw new ErrInvalid("Deskripsi transaksi harus diisi");
    }

    return this.transactionRepository.create({
      budgetOwnerId: command.budgetOwnerId,
      categoryId: command.categoryId,
      date: command.date,
      amount: command.amount,
      description: command.description.trim(),
      receiptUrl: command.receiptUrl || null,
      createdBy: command.createdBy,
    });
  }
}

export interface UpdateTransactionCommand {
  budgetOwnerId?: string;
  categoryId?: string;
  date?: Date;
  amount?: number;
  description?: string;
  receiptUrl?: string;
}

export class UpdateTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(
    id: string,
    command: UpdateTransactionCommand,
    userId: string,
    userRole: string
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);
    
    if (!transaction) {
      throw new ErrNotFound("Transaksi tidak ditemukan");
    }

    // Regular users can only update their own transactions
    if (userRole !== "SUPER_ADMIN" && transaction.createdBy !== userId) {
      throw new ErrUnauthorized("Anda hanya dapat mengubah transaksi Anda sendiri");
    }

    // Validate amount if provided
    if (command.amount && command.amount <= 0) {
      throw new ErrInvalid("Jumlah transaksi harus lebih besar dari 0");
    }

    // Validate description if provided
    if (command.description && command.description.trim().length === 0) {
      throw new ErrInvalid("Deskripsi transaksi harus diisi");
    }

    return this.transactionRepository.update(id, command);
  }
}

export class DeleteTransactionUseCase {
  constructor(private transactionRepository: TransactionRepository) {}

  async execute(id: string, userId: string, userRole: string): Promise<void> {
    const transaction = await this.transactionRepository.findById(id);
    
    if (!transaction) {
      throw new ErrNotFound("Transaksi tidak ditemukan");
    }

    // Regular users can only delete their own transactions
    if (userRole !== "SUPER_ADMIN" && transaction.createdBy !== userId) {
      throw new ErrUnauthorized("Anda hanya dapat menghapus transaksi Anda sendiri");
    }

    await this.transactionRepository.delete(id);
  }
}
