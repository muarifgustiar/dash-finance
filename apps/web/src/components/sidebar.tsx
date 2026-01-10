"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Wallet,
} from "lucide-react";

const navItems = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Transaction",
    href: "/dashboard/transaction",
    icon: Receipt,
  },
  {
    name: "Plan",
    href: "/dashboard/plan",
    icon: Wallet,
  },
];

// Admin navigation extends user navigation with additional items
// const adminNavigation = [
//   ...userNavigation,
//   {
//     name: "Budget",
//     href: "/dashboard/budget",
//     icon: Wallet,
//   },
//   {
//     name: "Master",
//     href: "/dashboard/master",
//     icon: Database,
//   },
// ];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center text-white font-bold">
          ⚡
        </div>
        <span className="text-xl font-bold text-gray-900">Paypay</span>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-purple-50 text-purple-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* App Download Promo */}
      <div className="mt-8 p-4 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
            ⚡
          </div>
          <span className="font-semibold text-sm">Paypay</span>
        </div>
        <p className="text-xs mb-3 leading-relaxed">
          Download The Paypay App For Convenience Anywhere
        </p>
        <div className="flex gap-2">
          <div className="w-16 h-20 bg-white/10 rounded-lg flex items-center justify-center text-2xl">
            📱
          </div>
          <div className="w-16 h-20 bg-white/10 rounded-lg flex items-center justify-center text-2xl">
            📱
          </div>
        </div>
      </div>
    </aside>
  );
}
