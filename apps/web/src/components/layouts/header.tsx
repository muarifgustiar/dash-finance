/**
 * Header Component
 * ✅ Shared layout component - no business logic
 */

"use client";

import { Search, Bell } from "lucide-react";
import { Input } from "@repo/ui/input";
import { Avatar } from "@repo/ui/avatar";

interface HeaderProps {
  userName?: string;
  userInitials?: string;
}

export function Header({ userName = "Putra", userInitials = "P" }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">
            Good Morning, {userName}!
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search transaction, saving ..."
              className="pl-10"
            />
          </div>

          {/* Notifications */}
          <button className="relative rounded-full p-2 hover:bg-gray-100">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* User Avatar */}
          <Avatar className="h-10 w-10">
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-sm font-medium text-white">
              {userInitials}
            </div>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
