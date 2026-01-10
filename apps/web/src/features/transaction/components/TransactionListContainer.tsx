/**
 * Transaction List Container
 * Container for displaying transaction list with filters
 */

"use client";

import { useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Badge } from "@repo/ui/badge";
import { Loader2, Filter } from "lucide-react";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "@/features/category/hooks/useCategories";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export function TransactionListContainer() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch transactions with category filter
  const { data: transactionsData, isLoading: isLoadingTransactions } = useTransactions({
    categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined,
    page: 1,
    limit: 20,
  });

  // Fetch active categories for filter
  const { data: categories = [], isLoading: isLoadingCategories } = useCategories("ACTIVE");

  const transactions = transactionsData?.data?.data || [];
  const pagination = transactionsData?.data?.pagination;

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
  };

  if (isLoadingTransactions || isLoadingCategories) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Filter</h2>
            {selectedCategories.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedCategories.length} kategori dipilih
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {selectedCategories.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
              >
                Hapus Filter
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Sembunyikan" : "Tampilkan"}
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Kategori
            </Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    selectedCategories.includes(category.id)
                      ? "bg-purple-500 hover:bg-purple-600"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleCategoryToggle(category.id)}
                >
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Transaction List */}
      <div className="space-y-3">
        {transactions.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            {selectedCategories.length > 0
              ? "Tidak ada transaksi untuk kategori yang dipilih"
              : "Belum ada transaksi"}
          </Card>
        ) : (
          transactions.map((transaction) => (
            <Card key={transaction.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {transaction.description}
                    </h3>
                    <Badge variant="secondary">{transaction.categoryName}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {format(new Date(transaction.date), "PPP", { locale: localeId })}
                  </p>
                  <p className="text-xs text-gray-400">
                    Budget Owner: {transaction.budgetOwnerName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    Rp {transaction.amount.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Info */}
      {pagination && pagination.total > 0 && (
        <div className="text-center text-sm text-gray-500">
          Menampilkan {transactions.length} dari {pagination.total} transaksi
          (Halaman {pagination.page} dari {pagination.totalPages})
        </div>
      )}
    </div>
  );
}

// Helper Label component
function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
