/**
 * Example: User Table Columns
 * ✅ Type-safe column definitions for TanStack Table
 */

"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { UserResponse } from "@repo/schema/user";

export const userColumns: ColumnDef<UserResponse>[] = [
  {
    accessorKey: "name",
    header: "Nama",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Dibuat",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
];
