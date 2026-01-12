/**
 * Unit Tests for Pagination Helper Function
 * Testing calculatePaginationMeta utility
 */

import { describe, expect, it } from "bun:test";
import { calculatePaginationMeta, type PaginationMeta } from "../pagination";

describe("calculatePaginationMeta", () => {
  describe("Basic calculations", () => {
    it("should calculate correct metadata for first page", () => {
      const result = calculatePaginationMeta(1, 20, 100);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: true,
        hasPrev: false,
      });
    });

    it("should calculate correct metadata for middle page", () => {
      const result = calculatePaginationMeta(3, 20, 100);

      expect(result).toEqual({
        page: 3,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      });
    });

    it("should calculate correct metadata for last page", () => {
      const result = calculatePaginationMeta(5, 20, 100);

      expect(result).toEqual({
        page: 5,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNext: false,
        hasPrev: true,
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle empty results", () => {
      const result = calculatePaginationMeta(1, 20, 0);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle single page with few items", () => {
      const result = calculatePaginationMeta(1, 20, 10);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 10,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle exact page boundary", () => {
      const result = calculatePaginationMeta(1, 20, 20);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("should handle partial last page", () => {
      const result = calculatePaginationMeta(3, 20, 55);

      expect(result).toEqual({
        page: 3,
        limit: 20,
        total: 55,
        totalPages: 3,
        hasNext: false,
        hasPrev: true,
      });
    });

    it("should handle single item", () => {
      const result = calculatePaginationMeta(1, 20, 1);

      expect(result).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });
  });

  describe("Different page sizes", () => {
    it("should work with limit of 10", () => {
      const result = calculatePaginationMeta(2, 10, 95);

      expect(result).toEqual({
        page: 2,
        limit: 10,
        total: 95,
        totalPages: 10,
        hasNext: true,
        hasPrev: true,
      });
    });

    it("should work with limit of 50", () => {
      const result = calculatePaginationMeta(1, 50, 200);

      expect(result).toEqual({
        page: 1,
        limit: 50,
        total: 200,
        totalPages: 4,
        hasNext: true,
        hasPrev: false,
      });
    });

    it("should work with limit of 100", () => {
      const result = calculatePaginationMeta(2, 100, 150);

      expect(result).toEqual({
        page: 2,
        limit: 100,
        total: 150,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      });
    });
  });

  describe("Large datasets", () => {
    it("should handle 1000+ items", () => {
      const result = calculatePaginationMeta(15, 20, 1250);

      expect(result).toEqual({
        page: 15,
        limit: 20,
        total: 1250,
        totalPages: 63,
        hasNext: true,
        hasPrev: true,
      });
    });

    it("should handle very large total", () => {
      const result = calculatePaginationMeta(50, 100, 10000);

      expect(result).toEqual({
        page: 50,
        limit: 100,
        total: 10000,
        totalPages: 100,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe("Boundary validation", () => {
    it("should return correct hasNext for second-to-last page", () => {
      const result = calculatePaginationMeta(4, 20, 100);

      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(true);
      expect(result.totalPages).toBe(5);
    });

    it("should return correct hasPrev for page 2", () => {
      const result = calculatePaginationMeta(2, 20, 100);

      expect(result.hasPrev).toBe(true);
      expect(result.hasNext).toBe(true);
    });
  });
});
