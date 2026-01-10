"use client";

import { useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { ArrowLeft, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

const categories = [
  { value: "food", label: "Food & Drink" },
  { value: "transport", label: "Transport" },
  { value: "fashion", label: "Fashion" },
  { value: "hobbies", label: "Hobbies" },
  { value: "income", label: "Income" },
  { value: "others", label: "Others" },
] as const;

const budgetOwners = [
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
  { value: "business", label: "Business" },
] as const;

export function TransactionPageContainer() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    budgetOwner: "",
    date: new Date().toISOString().split("T")[0] ?? "",
    receiptUrl: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement transaction creation
    console.log("Transaction data:", formData);
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Tambah Transaksi</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              placeholder="Contoh: Makan siang di McDonald"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah (Rp)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetOwner">Budget Owner</Label>
              <select
                id="budgetOwner"
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
                value={formData.budgetOwner}
                onChange={(e) => setFormData({ ...formData, budgetOwner: e.target.value })}
                required
              >
                <option value="">Pilih budget owner</option>
                {budgetOwners.map((owner) => (
                  <option key={owner.value} value={owner.value}>
                    {owner.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Upload Receipt (Opsional)</Label>
            <div className="flex items-center gap-4">
              <Button type="button" variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Pilih File
              </Button>
            </div>
            <p className="text-xs text-gray-500">Format: JPG, PNG, PDF. Max: 5MB</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Simpan Transaksi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
