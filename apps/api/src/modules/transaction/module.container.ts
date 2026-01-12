/**
 * Transaction Module DI Container
 * ✅ Wires all dependencies for transaction module
 */

import type { PrismaClient } from "@prisma/client";
import { PrismaTransactionRepository } from "./infrastructure/repositories/prisma-transaction.repository";
import {
  GetTransactionsUseCase,
  GetTransactionByIdUseCase,
  CreateTransactionUseCase,
  UpdateTransactionUseCase,
  DeleteTransactionUseCase,
} from "./application/use-cases";

export function createTransactionModule() {
  // Infrastructure
  const transactionRepository = new PrismaTransactionRepository();

  // Application use cases
  const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository);
  const getTransactionByIdUseCase = new GetTransactionByIdUseCase(transactionRepository);
  const createTransactionUseCase = new CreateTransactionUseCase(transactionRepository);
  const updateTransactionUseCase = new UpdateTransactionUseCase(transactionRepository);
  const deleteTransactionUseCase = new DeleteTransactionUseCase(transactionRepository);

  return {
    getTransactionsUseCase,
    getTransactionByIdUseCase,
    createTransactionUseCase,
    updateTransactionUseCase,
    deleteTransactionUseCase,
  };
}
