"use client";

import { useState } from "react";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Avatar } from "@repo/ui/avatar";
import { ArrowLeft, Bell, Camera, Globe, Lock, LogOut, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function SettingsPageContainer() {
  const router = useRouter();
  
  // TODO: Replace with actual user data from API/context
  // This should come from useCurrentUser hook or similar
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Profile data:", formData);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    router.push("/login");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
      </div>

      <Card className="mb-6 p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-2xl font-bold text-white">
                P
              </div>
            </Avatar>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50">
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{formData.name}</h2>
            <p className="text-sm text-gray-500">{formData.email}</p>
            <Button variant="outline" size="sm" className="mt-2">
              Ubah Foto
            </Button>
          </div>
        </div>
      </Card>

      <Card className="mb-6 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Informasi Profil</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="name"
                className="pl-10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                type="email"
                className="pl-10"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Simpan Perubahan
          </Button>
        </form>
      </Card>

      <Card className="mb-6 p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Pengaturan Akun</h3>
        <div className="space-y-2">
          <button className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50">
            <Lock className="h-5 w-5 text-gray-600" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Ubah Password</p>
              <p className="text-sm text-gray-500">Perbarui password Anda</p>
            </div>
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50">
            <Bell className="h-5 w-5 text-gray-600" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Notifikasi</p>
              <p className="text-sm text-gray-500">Kelola notifikasi aplikasi</p>
            </div>
          </button>

          <button className="flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50">
            <Globe className="h-5 w-5 text-gray-600" />
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Bahasa</p>
              <p className="text-sm text-gray-500">Bahasa Indonesia</p>
            </div>
          </button>
        </div>
      </Card>

      <Card className="p-6">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg p-3 text-red-600 transition-colors hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <div className="flex-1 text-left">
            <p className="font-medium">Keluar</p>
            <p className="text-sm text-red-500">Keluar dari akun Anda</p>
          </div>
        </button>
      </Card>
    </div>
  );
}
