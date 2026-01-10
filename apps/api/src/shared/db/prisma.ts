/**
 * Prisma Client Singleton
 * ✅ Infrastructure Layer
 * Ensures single instance across hot reloads in development
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// Create connection pool
const connectionString = process.env.DATABASE_URL || "postgresql://finance:finance@localhost:5432/dash_finance?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper to disconnect Prisma on shutdown
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
  await pool.end();
}
