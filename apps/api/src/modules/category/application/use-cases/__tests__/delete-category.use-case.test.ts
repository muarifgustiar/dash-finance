/**
 * Unit Tests for DeleteCategoryUseCase
 * Testing category deletion with validation logic
 */

import { describe, expect, it, mock } from "bun:test";
import { DeleteCategoryUseCase } from "../delete-category.use-case";
import { Category } from "../../../domain/entities/category";
import { ErrNotFound } from "../../../../../shared/errors";
import type { ICategoryRepository } from "../../../domain/repositories/category-repository.interface";

describe("DeleteCategoryUseCase", () => {
  const createMockRepository = (): ICategoryRepository => ({
    findById: mock(async () => null),
    findByName: mock(async () => null),
    findAll: mock(async () => ({ items: [], total: 0 })),
    create: mock(async (cat) => cat),
    update: mock(async (cat) => cat),
    delete: mock(async () => {}),
  });

  describe("Successful deletion", () => {
    it("should delete category when it exists", async () => {
      const mockRepo = createMockRepository();
      const mockCategory = new Category(
        "cat-123",
        "Test Category",
        "Test description",
        "ACTIVE",
        new Date(),
        new Date()
      );

      mockRepo.findById = mock(async () => mockCategory);
      mockRepo.delete = mock(async () => {});

      const useCase = new DeleteCategoryUseCase(mockRepo);

      await useCase.execute("cat-123");

      expect(mockRepo.findById).toHaveBeenCalledWith("cat-123");
      expect(mockRepo.delete).toHaveBeenCalledWith("cat-123");
      expect(mockRepo.delete).toHaveBeenCalledTimes(1);
    });

    it("should call repository methods in correct order", async () => {
      const mockRepo = createMockRepository();
      const callOrder: string[] = [];

      mockRepo.findById = mock(async (id) => {
        callOrder.push("findById");
        return new Category(id, "Test", null, "ACTIVE", new Date(), new Date());
      });

      mockRepo.delete = mock(async (id) => {
        callOrder.push("delete");
      });

      const useCase = new DeleteCategoryUseCase(mockRepo);
      await useCase.execute("cat-123");

      expect(callOrder).toEqual(["findById", "delete"]);
    });
  });

  describe("Error handling", () => {
    it("should throw ErrNotFound when category does not exist", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findById = mock(async () => null);

      const useCase = new DeleteCategoryUseCase(mockRepo);

      await expect(useCase.execute("nonexistent-id")).rejects.toThrow(ErrNotFound);
      await expect(useCase.execute("nonexistent-id")).rejects.toThrow(
        "Category with id 'nonexistent-id' not found"
      );
    });

    it("should not call delete when category not found", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findById = mock(async () => null);
      mockRepo.delete = mock(async () => {});

      const useCase = new DeleteCategoryUseCase(mockRepo);

      try {
        await useCase.execute("nonexistent-id");
      } catch (error) {
        // Expected error
      }

      expect(mockRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("Input validation", () => {
    it("should handle empty string ID", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findById = mock(async () => null);

      const useCase = new DeleteCategoryUseCase(mockRepo);

      await expect(useCase.execute("")).rejects.toThrow(ErrNotFound);
    });

    it("should handle UUID format ID", async () => {
      const mockRepo = createMockRepository();
      const uuid = "123e4567-e89b-12d3-a456-426614174000";

      mockRepo.findById = mock(async () =>
        new Category(uuid, "Test", null, "ACTIVE", new Date(), new Date())
      );
      mockRepo.delete = mock(async () => {});

      const useCase = new DeleteCategoryUseCase(mockRepo);

      await useCase.execute(uuid);

      expect(mockRepo.findById).toHaveBeenCalledWith(uuid);
      expect(mockRepo.delete).toHaveBeenCalledWith(uuid);
    });
  });

  describe("Status handling", () => {
    it("should delete ACTIVE category", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findById = mock(async () =>
        new Category("id", "Test", null, "ACTIVE", new Date(), new Date())
      );
      mockRepo.delete = mock(async () => {});

      const useCase = new DeleteCategoryUseCase(mockRepo);

      await useCase.execute("id");

      expect(mockRepo.delete).toHaveBeenCalled();
    });

    it("should delete INACTIVE category", async () => {
      const mockRepo = createMockRepository();
      mockRepo.findById = mock(async () =>
        new Category("id", "Test", null, "INACTIVE", new Date(), new Date())
      );
      mockRepo.delete = mock(async () => {});

      const useCase = new DeleteCategoryUseCase(mockRepo);

      await useCase.execute("id");

      expect(mockRepo.delete).toHaveBeenCalled();
    });
  });
});
