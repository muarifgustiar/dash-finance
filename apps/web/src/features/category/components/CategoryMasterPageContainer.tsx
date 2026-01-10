"use client";

import { useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Badge } from "@repo/ui/badge";
import { ArrowLeft, Edit2, Plus, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../hooks/useCategories";
import type { Category } from "../domain/entities/category";

type FormMode = "create" | "edit" | null;

type FormState = {
  name: string;
  description: string;
};

export function CategoryMasterPageContainer() {
  const router = useRouter();
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormState>({
    name: "",
    description: "",
  });

  // Queries & Mutations
  const { data: categories = [], isLoading, error } = useCategories("ACTIVE");
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleCreate = () => {
    setFormMode("create");
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  const handleEdit = (category: Category) => {
    setFormMode("edit");
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (formMode === "create") {
        await createMutation.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
        });
      } else if (formMode === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            name: formData.name,
            description: formData.description || undefined,
          },
        });
      }

      // Reset form
      setFormMode(null);
      setEditingId(null);
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Form submission error:", error);
      // TODO: Show error toast
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Delete error:", error);
      // TODO: Show error toast
      alert("Gagal menghapus kategori. Kategori mungkin masih digunakan oleh transaksi.");
    }
  };

  const handleCancel = () => {
    setFormMode(null);
    setEditingId(null);
    setFormData({ name: "", description: "" });
  };

  if (error) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          Gagal memuat data kategori. Silakan coba lagi.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-gray-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Kategori</h1>
        </div>
        <Button
          onClick={handleCreate}
          disabled={formMode !== null}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {formMode && (
        <Card className="mb-6 p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {formMode === "create" ? "Kategori Baru" : "Edit Kategori"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                placeholder="Contoh: Entertainment"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi (Opsional)</Label>
              <Input
                id="description"
                placeholder="Deskripsi kategori"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Simpan
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <Card key={category.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {category.description && (
                    <p className="mt-1 text-sm text-gray-500">{category.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    disabled={formMode !== null || deleteMutation.isPending}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(category.id)}
                    disabled={formMode !== null || deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === category.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="mt-3 bg-green-100 text-green-600"
              >
                {category.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && categories.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          Belum ada kategori. Tambahkan kategori pertama Anda!
        </div>
      )}
    </div>
  );
}
