/**
 * Database Seed
 * Creates initial super admin user and sample data
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const { Pool } = pg;

// Create connection pool
const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://finance:finance@localhost:5432/dash_finance?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  // Create Super Admin
  const hashedPassword = await Bun.password.hash("admin123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@dashfinance.com" },
    update: {},
    create: {
      email: "admin@dashfinance.com",
      name: "Super Admin",
      passwordHash: hashedPassword,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("✅ Super Admin created:", admin.email);

  // Create regular user
  const userPassword = await Bun.password.hash("user123");

  const user = await prisma.user.upsert({
    where: { email: "user@dashfinance.com" },
    update: {},
    create: {
      email: "user@dashfinance.com",
      name: "Regular User",
      passwordHash: userPassword,
      role: "USER",
      status: "ACTIVE",
    },
  });

  console.log("✅ Regular User created:", user.email);

  // Create sample categories
  const categories = [
    { name: "Alat Tulis Kantor", description: "Perlengkapan dan alat tulis untuk kantor" },
    { name: "Perjalanan Dinas", description: "Biaya transportasi dan akomodasi" },
    { name: "Pelatihan & Pengembangan", description: "Biaya training dan workshop" },
    { name: "Software & Lisensi", description: "Pembelian software dan perpanjangan lisensi" },
    { name: "Konsumsi", description: "Makanan dan minuman untuk kegiatan" },
    { name: "Utilitas", description: "Listrik, air, internet, dan utilitas lainnya" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log(`✅ ${categories.length} categories created`);

  // Create sample budget owners
  const budgetOwners = [
    { name: "Divisi IT", code: "IT", description: "Divisi Teknologi Informasi" },
    { name: "Divisi Marketing", code: "MKT", description: "Divisi Pemasaran" },
    { name: "Divisi HR", code: "HR", description: "Divisi Sumber Daya Manusia" },
    { name: "Divisi Finance", code: "FIN", description: "Divisi Keuangan" },
  ];

  for (const owner of budgetOwners) {
    await prisma.budgetOwner.upsert({
      where: { name: owner.name },
      update: {},
      create: owner,
    });
  }

  console.log(`✅ ${budgetOwners.length} budget owners created`);

  // Create sample budgets for current year
  const currentYear = new Date().getFullYear();
  const budgetOwnerRecords = await prisma.budgetOwner.findMany();

  for (const owner of budgetOwnerRecords) {
    await prisma.budget.upsert({
      where: {
        budgetOwnerId_year: {
          budgetOwnerId: owner.id,
          year: currentYear,
        },
      },
      update: {},
      create: {
        budgetOwnerId: owner.id,
        year: currentYear,
        amountPlanned: 100000000, // 100 juta
        createdBy: admin.id,
      },
    });
  }

  console.log(`✅ ${budgetOwnerRecords.length} budgets created for year ${currentYear}`);

  // Create user access mapping for regular user
  const firstBudgetOwner = budgetOwnerRecords[0];
  if (firstBudgetOwner) {
    await prisma.userAccess.upsert({
      where: {
        userId_budgetOwnerId: {
          userId: user.id,
          budgetOwnerId: firstBudgetOwner.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        budgetOwnerId: firstBudgetOwner.id,
      },
    });

    console.log(`✅ User access mapping created`);
  }

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
