/**
 * Dash Finance API - Bootstrap
 * ✅ Clean Architecture: Dependency Injection via Elysia Plugins
 * 
 * Flow:
 * 1. Initialize infrastructure (DB)
 * 2. Wire dependencies via module containers (DI)
 * 3. Create Elysia plugins with decorated dependencies
 * 4. Register plugins + routes using .use()
 * 5. Start server
 */

import { createApp } from "./delivery/http/app";
import { prisma } from "./shared/db/prisma";

// Module containers - DI wiring per bounded context
import { createAuthModule } from "./modules/auth/module.container";
import { createCategoryModule } from "./modules/category/module.container";
import { createBudgetOwnerModule } from "./modules/budget-owner/module.container";
import { createBudgetModule } from "./modules/budget/module.container";
import { createTransactionModule } from "./modules/transaction/module.container";

// Route registrations - thin delivery layer
import { authRoutes } from "./modules/auth/delivery/http/routes";
import { categoryRoutes } from "./modules/category/delivery/http/routes";
import { budgetOwnerRoutes } from "./modules/budget-owner/delivery/http/routes";
import { budgetRoutes } from "./modules/budget/delivery/http/routes";
import { transactionRoutes } from "./modules/transaction/delivery/http/routes";

/**
 * Initialize all modules with dependency injection
 * Each module container wires: infrastructure → application
 */
function initializeModules(prisma: typeof import("./shared/db/prisma").prisma) {
  return {
    auth: createAuthModule(prisma),
    category: createCategoryModule(),
    budgetOwner: createBudgetOwnerModule(),
    budget: createBudgetModule(),
    transaction: createTransactionModule(),
  };
}

/**
 * Main bootstrap function
 * Separates concerns: infrastructure → DI → routing → server start
 */
async function bootstrap() {
  try {
    // 1. Initialize infrastructure
    await prisma.$connect();
    console.log("✅ Database connected");

    // 2. Wire dependencies via module containers (DI)
    const modules = initializeModules(prisma);
    console.log("✅ Modules initialized with DI");

    // 3. Create app with global middleware (CORS, auth, error handling)
    const app = createApp(prisma);

    // 4. Register all module routes (each route plugin wires its own container)
    app
      .use(authRoutes(modules.auth))
      .use(categoryRoutes(modules.category))
      .use(budgetOwnerRoutes(modules.budgetOwner))
      .use(budgetRoutes(modules.budget))
      .use(transactionRoutes(modules.transaction));
    console.log("✅ Routes registered");

    // 5. Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT);

    console.log(`\n🦊 Dash Finance API is running at http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/health`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   POST   /auth/login - User authentication`);
    console.log(`   GET    /auth/me - Get current user`);
    console.log(`   GET    /categories - List all categories`);
    console.log(`   POST   /categories - Create category`);
    console.log(`   GET    /budget-owners - List budget owners`);
    console.log(`   POST   /budget-owners - Create budget owner`);
    console.log(`   GET    /budgets - List budgets`);
    console.log(`   POST   /budgets - Create budget`);
    console.log(`   GET    /transactions - List transactions`);
    console.log(`   POST   /transactions - Create transaction`);
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏳ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏳ Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
