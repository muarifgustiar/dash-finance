/**
 * Dash Finance API - Bootstrap
 * ✅ Minimal: Only environment setup and server start
 */

import { createApp } from "./delivery/http/app";
import { prisma } from "./shared/db/prisma";

// Module containers
import { createAuthModule } from "./modules/auth/module.container";
import { createCategoryModule } from "./modules/category/module.container";
import { createBudgetOwnerModule } from "./modules/budget-owner/module.container";
import { createBudgetModule } from "./modules/budget/module.container";
import { createTransactionModule } from "./modules/transaction/module.container";

// Route registrations
import { registerAuthRoutes } from "./modules/auth/delivery/http/routes";
import { registerCategoryRoutes } from "./modules/category/delivery/http/routes";
import { registerBudgetOwnerRoutes } from "./modules/budget-owner/delivery/http/routes";
import { registerBudgetRoutes } from "./modules/budget/delivery/http/routes";
import { registerTransactionRoutes } from "./modules/transaction/delivery/http/routes";

async function bootstrap() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    // Initialize modules with DI
    const authModule = createAuthModule(prisma);
    const categoryModule = createCategoryModule(prisma);
    const budgetOwnerModule = createBudgetOwnerModule(prisma);
    const budgetModule = createBudgetModule();
    const transactionModule = createTransactionModule(prisma);

    // Create app with middleware (CORS, auth, error handling)
    const app = createApp(prisma);

    // Register all module routes
    registerAuthRoutes(app, {
      loginUseCase: authModule.loginUseCase,
      getCurrentUserUseCase: authModule.getCurrentUserUseCase,
    });

    registerCategoryRoutes(app, {
      getCategoriesUseCase: categoryModule.getCategoriesUseCase,
      getCategoryByIdUseCase: categoryModule.getCategoryByIdUseCase,
      createCategoryUseCase: categoryModule.createCategoryUseCase,
      updateCategoryUseCase: categoryModule.updateCategoryUseCase,
      deleteCategoryUseCase: categoryModule.deleteCategoryUseCase,
    });

    registerBudgetOwnerRoutes(app, {
      getBudgetOwnersUseCase: budgetOwnerModule.getBudgetOwnersUseCase,
      getBudgetOwnerByIdUseCase: budgetOwnerModule.getBudgetOwnerByIdUseCase,
      createBudgetOwnerUseCase: budgetOwnerModule.createBudgetOwnerUseCase,
      updateBudgetOwnerUseCase: budgetOwnerModule.updateBudgetOwnerUseCase,
      deleteBudgetOwnerUseCase: budgetOwnerModule.deleteBudgetOwnerUseCase,
    });

    registerBudgetRoutes(app, {
      getBudgetsUseCase: budgetModule.getBudgetsUseCase,
      getBudgetByIdUseCase: budgetModule.getBudgetByIdUseCase,
      getBudgetSummaryUseCase: budgetModule.getBudgetSummaryUseCase,
      createBudgetUseCase: budgetModule.createBudgetUseCase,
      updateBudgetUseCase: budgetModule.updateBudgetUseCase,
      deleteBudgetUseCase: budgetModule.deleteBudgetUseCase,
    });

    registerTransactionRoutes(app, {
      getTransactionsUseCase: transactionModule.getTransactionsUseCase,
      getTransactionByIdUseCase: transactionModule.getTransactionByIdUseCase,
      createTransactionUseCase: transactionModule.createTransactionUseCase,
      updateTransactionUseCase: transactionModule.updateTransactionUseCase,
      deleteTransactionUseCase: transactionModule.deleteTransactionUseCase,
    });

    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT);

    console.log(`🦊 Dash Finance API is running at http://localhost:${PORT}`);
    console.log(`📚 Health check: http://localhost:${PORT}/health`);
    console.log(`\n📋 Available endpoints:`);
    console.log(`   Authentication: /auth/*`);
    console.log(`   Categories: /categories`);
    console.log(`   Budget Owners: /budget-owners`);
    console.log(`   Budgets: /budgets`);
    console.log(`   Transactions: /transactions`);
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
