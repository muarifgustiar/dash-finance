/**
 * Unit Tests for GetTransactionsUseCase
 * Testing transaction retrieval with category filtering and pagination
 */

import { describe, expect, it, mock } from "bun:test";
import { GetTransactionsUseCase, type GetTransactionsQuery } from "../get-transactions.use-case";
import { Transaction } from "../../../domain/entities/transaction";
import type { ITransactionRepository } from "../../../domain/repositories/transaction-repository.interface";

describe("GetTransactionsUseCase", () => {
  const createMockTransaction = (id: string, categoryId: string) => {
    return Transaction.reconstitute({
      id,
      categoryId,
      budgetOwnerId: "budget-123",
      amount: 100.50,
      description: "Test transaction",
      date: new Date(),
      receiptUrl: null,
      createdBy: "user-123",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  const createMockRepository = (): ITransactionRepository => ({
    findById: mock(async () => null),
    findByDateRange: mock(async () => ({ items: [], total: 0 })),
    findByYear: mock(async () => ({ items: [], total: 0 })),
    findByCategory: mock(async () => ({ items: [], total: 0 })),
    findByCategories: mock(async () => ({ items: [], total: 0 })),
    findByBudgetOwner: mock(async () => ({ items: [], total: 0 })),
    getTotalSpentByBudgetOwner: mock(async () => 0),
    create: mock(async (t) => t),
    update: mock(async (t) => t),
    delete: mock(async () => {}),
  });

  describe("Pagination defaults", () => {
    it("should use default pagination when not provided", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByBudgetOwner = mock(async (id, pagination) => ({
        items: [createMockTransaction("tx-1", "cat-1")],
        total: 1,
      }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      const result = await useCase.execute({ budgetOwnerId: "budget-123" });

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it("should use provided pagination params", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByBudgetOwner = mock(async () => ({
        items: [],
        total: 100,
      }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      const result = await useCase.execute({
        budgetOwnerId: "budget-123",
        page: 3,
        limit: 50,
      });

      expect(result.pagination.page).toBe(3);
      expect(result.pagination.limit).toBe(50);
      expect(result.pagination.total).toBe(100);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe("Category filtering - single category", () => {
    it("should filter by single categoryId", async () => {
      const mockRepo = createMockRepository();
      const mockTransactions = [
        createMockTransaction("tx-1", "cat-123"),
        createMockTransaction("tx-2", "cat-123"),
      ];

      mockRepo.findByCategory = mock(async (categoryId, pagination) => ({
        items: mockTransactions,
        total: 2,
      }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      const query: GetTransactionsQuery = {
        categoryId: "cat-123",
      };

      const result = await useCase.execute(query);

      expect(mockRepo.findByCategory).toHaveBeenCalledWith(
        "cat-123",
        { page: 1, limit: 20 }
      );
      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.categoryId).toBe("cat-123");
    });

    it("should not call findByCategories when using single categoryId", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByCategory = mock(async () => ({ items: [], total: 0 }));
      mockRepo.findByCategories = mock(async () => ({ items: [], total: 0 }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      await useCase.execute({ categoryId: "cat-123" });

      expect(mockRepo.findByCategory).toHaveBeenCalled();
      expect(mockRepo.findByCategories).not.toHaveBeenCalled();
    });
  });

  describe("Category filtering - multiple categories", () => {
    it("should filter by multiple categoryIds", async () => {
      const mockRepo = createMockRepository();
      const mockTransactions = [
        createMockTransaction("tx-1", "cat-1"),
        createMockTransaction("tx-2", "cat-2"),
        createMockTransaction("tx-3", "cat-1"),
      ];

      mockRepo.findByCategories = mock(async (ids, pagination) => ({
        items: mockTransactions,
        total: 3,
      }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      const query: GetTransactionsQuery = {
        categoryIds: ["cat-1", "cat-2"],
      };

      const result = await useCase.execute(query);

      expect(mockRepo.findByCategories).toHaveBeenCalledWith(
        ["cat-1", "cat-2"],
        { page: 1, limit: 20 }
      );
      expect(result.items).toHaveLength(3);
    });

    it("should prioritize categoryIds over categoryId", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByCategories = mock(async () => ({ items: [], total: 0 }));
      mockRepo.findByCategory = mock(async () => ({ items: [], total: 0 }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      await useCase.execute({
        categoryId: "cat-1",
        categoryIds: ["cat-2", "cat-3"],
      });

      expect(mockRepo.findByCategories).toHaveBeenCalledWith(
        ["cat-2", "cat-3"],
        { page: 1, limit: 20 }
      );
      expect(mockRepo.findByCategory).not.toHaveBeenCalled();
    });

    it("should handle empty categoryIds array", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByCategories = mock(async () => ({ items: [], total: 0 }));
      mockRepo.findByBudgetOwner = mock(async () => ({ items: [], total: 0 }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      await useCase.execute({
        budgetOwnerId: "budget-123",
        categoryIds: [],
      });

      // Should fall through to budgetOwner filter
      expect(mockRepo.findByCategories).not.toHaveBeenCalled();
      expect(mockRepo.findByBudgetOwner).toHaveBeenCalled();
    });
  });

  describe("Date range filtering", () => {
    it("should filter by date range with budgetOwner", async () => {
      const mockRepo = createMockRepository();
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");

      mockRepo.findByDateRange = mock(async () => ({
        items: [createMockTransaction("tx-1", "cat-1")],
        total: 1,
      }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      await useCase.execute({
        budgetOwnerId: "budget-123",
        startDate,
        endDate,
      });

      expect(mockRepo.findByDateRange).toHaveBeenCalledWith(
        "budget-123",
        startDate,
        endDate,
        { page: 1, limit: 20 }
      );
    });

    it("should prioritize date range over category filter", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByDateRange = mock(async () => ({ items: [], total: 0 }));
      mockRepo.findByCategory = mock(async () => ({ items: [], total: 0 }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      await useCase.execute({
        budgetOwnerId: "budget-123",
        categoryId: "cat-1",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
      });

      expect(mockRepo.findByDateRange).toHaveBeenCalled();
      expect(mockRepo.findByCategory).not.toHaveBeenCalled();
    });
  });

  describe("Year filtering", () => {
    it("should filter by year with budgetOwner", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByYear = mock(async () => ({
        items: [createMockTransaction("tx-1", "cat-1")],
        total: 1,
      }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      await useCase.execute({
        budgetOwnerId: "budget-123",
        year: 2024,
      });

      expect(mockRepo.findByYear).toHaveBeenCalledWith(
        "budget-123",
        2024,
        { page: 1, limit: 20 }
      );
    });
  });

  describe("Pagination metadata calculation", () => {
    it("should calculate correct pagination for first page", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByBudgetOwner = mock(async () => ({
        items: Array(20).fill(null).map((_, i) => createMockTransaction(`tx-${i}`, "cat-1")),
        total: 100,
      }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      const result = await useCase.execute({
        budgetOwnerId: "budget-123",
        page: 1,
        limit: 20,
      });

      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      });
    });

    it("should calculate correct pagination for last page", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByCategory = mock(async () => ({
        items: Array(5).fill(null).map((_, i) => createMockTransaction(`tx-${i}`, "cat-1")),
        total: 45,
      }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      const result = await useCase.execute({
        categoryId: "cat-1",
        page: 3,
        limit: 20,
      });

      expect(result.pagination).toEqual({
        page: 3,
        limit: 20,
        total: 45,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });

    it("should handle empty results", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findByCategories = mock(async () => ({
        items: [],
        total: 0,
      }));

      const useCase = new GetTransactionsUseCase(mockRepo);
      const result = await useCase.execute({
        categoryIds: ["cat-1", "cat-2"],
      });

      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
      expect(result.items).toHaveLength(0);
    });
  });

  describe("No filters provided", () => {
    it("should return empty result when no filters", async () => {
      const mockRepo = createMockRepository();
      const useCase = new GetTransactionsUseCase(mockRepo);

      const result = await useCase.execute({});

      expect(result.items).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });
});
