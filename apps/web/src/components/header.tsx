/**
 * Header Component
 * ✅ Top header with greeting, search, and user profile
 */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";

interface HeaderProps {
  userName?: string;
}

export function Header({ userName = "Putri" }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good Morning, {userName}!
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="search"
              placeholder="Search transaction, saving ..."
              className="w-80 px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <span className="text-xl">🔔</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/avatar.jpg" alt={userName} />
              <AvatarFallback className="bg-purple-600 text-white">
                {userName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
