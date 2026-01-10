"use client";

import { Card } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Filter, Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { formatCurrency } from "../../../components/lib/utils";

// Mock data - replace with real data from API
const transactions = [
  {
    id: "1",
    name: "ZARA",
    date: "25 March, 2025 at 7:15 PM",
    category: "Fashion",
    categoryColor: "bg-red-100 text-red-600",
    amount: -200.0,
    icon: "Z",
    iconBg: "bg-gray-900",
  },
  {
    id: "2",
    name: "Starbuck Coffee",
    date: "25 March, 2025 at 4:46 PM",
    category: "Food",
    categoryColor: "bg-orange-100 text-orange-600",
    amount: -10.0,
    icon: "S",
    iconBg: "bg-green-600",
  },
  {
    id: "3",
    name: "House Rent",
    date: "25 March, 2025 at 5:15 AM",
    category: "Income",
    categoryColor: "bg-green-100 text-green-600",
    amount: 350.0,
    icon: "H",
    iconBg: "bg-orange-500",
  },
  {
    id: "4",
    name: "McDonald",
    date: "25 March, 2025 at 3:30 PM",
    category: "Food",
    categoryColor: "bg-orange-100 text-orange-600",
    amount: -15.0,
    icon: "M",
    iconBg: "bg-red-600",
  },
];

const expenseData = [
  { day: "Mon", Food: 548, Transport: 520, Others: 581 },
  { day: "Tue", Food: 200, Transport: 300, Others: 200 },
  { day: "Wed", Food: 600, Transport: 500, Others: 600 },
  { day: "Thu", Food: 300, Transport: 400, Others: 400 },
  { day: "Fri", Food: 450, Transport: 350, Others: 400 },
  { day: "Sat", Food: 400, Transport: 300, Others: 350 },
  { day: "Sun", Food: 500, Transport: 450, Others: 500 },
];

const categories = [
  {
    name: "Food & Drink ($648)",
    color: "bg-purple-600",
    change: "+20% Last Month",
    trending: "up",
  },
  {
    name: "Transport ($520)",
    color: "bg-blue-400",
    change: "-5% Last Month",
    trending: "down",
  },
  {
    name: "Others ($581)",
    color: "bg-pink-400",
    change: "-12% Last Month",
    trending: "down",
  },
] as const;

export function DashboardPageContainer() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Transaction</h2>
                <p className="text-sm text-gray-500">25 March, 2025</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <span className="text-sm">18 March - 26 March</span>
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${transaction.iconBg} font-medium text-white`}
                    >
                      {transaction.icon}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.name}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={transaction.categoryColor} variant="secondary">
                      {transaction.category}
                    </Badge>
                    <p
                      className={`text-lg font-semibold ${
                        transaction.amount > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {transaction.amount > 0 ? "+" : ""}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-center">
              <Button variant="ghost" className="text-purple-600 hover:text-purple-700">
                See All Transactions
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="border-b p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Spending Limits</h2>
              <Button variant="ghost" size="sm">
                Edit
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <div className="mb-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">$1,540.00</span>
                <span className="text-sm text-gray-500">of $2,000.00</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  style={{ width: "77%" }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">85%</p>
            </div>

            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              ⚠️ Your spending limit almost reached the limit
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="border-b p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Expense this month</h2>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expenseData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Bar dataKey="Food" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Transport" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Others" fill="#f472b6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-3">
            {categories.map((category, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${category.color}`} />
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>{category.change}</span>
                  {category.trending === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <button className="fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-shadow hover:shadow-xl">
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}
