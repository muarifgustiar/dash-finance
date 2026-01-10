/**
 * Sidebar Component
 * ✅ Shared navigation component
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, TrendingUp, Wallet, Settings, HelpCircle, Zap } from "lucide-react";
import { cn } from "../lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transaction", href: "/dashboard/transaction", icon: CreditCard },
  { name: "Plan", href: "/dashboard/plan", icon: TrendingUp },
  { name: "Budget", href: "/dashboard/budget", icon: Wallet },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-20 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
          <Zap className="h-5 w-5 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-3 text-xs font-medium transition-colors",
                isActive
                  ? "bg-purple-50 text-purple-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
              title={item.name}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
