import { Elysia } from "elysia";
import type { createTransactionModule } from "../../module.container";

export type TransactionModuleContainer = ReturnType<typeof createTransactionModule>;

export const transactionContainer = (transactionModule: TransactionModuleContainer) => {
  return new Elysia({ name: "container:transaction" })
    .decorate("transactionModule", transactionModule);
};
