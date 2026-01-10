/**
 * Database initialization script
 * Creates tables using Prisma Client directly (workaround for Prisma 7 CLI limitation)
 */

import { prisma } from "../src/shared/db/prisma";

async function main() {
  try {
    console.log("🚀 Initializing database schema...");
    
    // Test connection
    await prisma.$connect();
    console.log("✅ Connected to database");
    
    // Create tables using raw SQL (Prisma 7 CLI doesn't support prisma.config.ts yet)
    await prisma.$executeRawUnsafe(`
      -- Create enums
      DO $$ BEGIN
        CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'USER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      -- Create User table
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT NOT NULL,
        "password_hash" TEXT NOT NULL,
        "role" "UserRole" NOT NULL DEFAULT 'USER',
        "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL
      );

      -- Create BudgetOwner table
      CREATE TABLE IF NOT EXISTS "BudgetOwner" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT UNIQUE,
        "description" TEXT,
        "status" "Status" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL
      );

      -- Create Category table
      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "status" "Status" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL
      );

      -- Create Budget table
      CREATE TABLE IF NOT EXISTS "Budget" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "budget_owner_id" TEXT NOT NULL REFERENCES "BudgetOwner"("id") ON DELETE CASCADE,
        "year" INTEGER NOT NULL,
        "amount_planned" DOUBLE PRECISION NOT NULL,
        "amount_revised" DOUBLE PRECISION,
        "amount_spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
        "created_by" TEXT NOT NULL REFERENCES "User"("id"),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL,
        UNIQUE("budget_owner_id", "year")
      );

      -- Create Transaction table
      CREATE TABLE IF NOT EXISTS "Transaction" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "budget_owner_id" TEXT NOT NULL REFERENCES "BudgetOwner"("id"),
        "category_id" TEXT NOT NULL REFERENCES "Category"("id"),
        "date" TIMESTAMP(3) NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "description" TEXT NOT NULL,
        "receipt_url" TEXT,
        "created_by" TEXT NOT NULL REFERENCES "User"("id"),
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" TIMESTAMP(3) NOT NULL
      );

      -- Create UserAccess table
      CREATE TABLE IF NOT EXISTS "UserAccess" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "user_id" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
        "budget_owner_id" TEXT NOT NULL REFERENCES "BudgetOwner"("id") ON DELETE CASCADE,
        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE("user_id", "budget_owner_id")
      );

      -- Create indexes
      CREATE INDEX IF NOT EXISTS "Budget_budget_owner_id_idx" ON "Budget"("budget_owner_id");
      CREATE INDEX IF NOT EXISTS "Budget_created_by_idx" ON "Budget"("created_by");
      CREATE INDEX IF NOT EXISTS "Transaction_budget_owner_id_idx" ON "Transaction"("budget_owner_id");
      CREATE INDEX IF NOT EXISTS "Transaction_category_id_idx" ON "Transaction"("category_id");
      CREATE INDEX IF NOT EXISTS "Transaction_created_by_idx" ON "Transaction"("created_by");
      CREATE INDEX IF NOT EXISTS "Transaction_date_idx" ON "Transaction"("date");
      CREATE INDEX IF NOT EXISTS "UserAccess_user_id_idx" ON "UserAccess"("user_id");
      CREATE INDEX IF NOT EXISTS "UserAccess_budget_owner_id_idx" ON "UserAccess"("budget_owner_id");
    `);
    
    console.log("✅ Database schema created successfully");
    
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
