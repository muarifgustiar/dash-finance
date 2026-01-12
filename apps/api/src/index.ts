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
import { Elysia } from "elysia";

// Module containers - DI wiring per bounded context
import { createAuthModule } from "./modules/auth/module.container";
import { createCategoryModule } from "./modules/category/module.container";
import { createBudgetOwnerModule } from "./modules/budget-owner/module.container";
import { createBudgetModule } from "./modules/budget/module.container";
import { createTransactionModule } from "./modules/transaction/module.container";

// Route registrations - thin delivery layer
import { registerAuthRoutes } from "./modules/auth/delivery/http/routes";
import { registerCategoryRoutes } from "./modules/category/delivery/http/routes";
import { registerBudgetOwnerRoutes } from "./modules/budget-owner/delivery/http/routes";
import { registerBudgetRoutes } from "./modules/budget/delivery/http/routes";
import { registerTransactionRoutes } from "./modules/transaction/delivery/http/routes";

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
 * Create Elysia plugins for dependency injection
 * Uses .decorate() to inject use cases into context
 */
function createModulePlugins(modules: ReturnType<typeof initializeModules>) {
  return {
    auth: new Elysia({ name: "auth-module" }).decorate("authUseCases", {
      loginUseCase: modules.auth.loginUseCase,
      getCurrentUserUseCase: modules.auth.getCurrentUserUseCase,
    }),
    
    category: new Elysia({ name: "category-module" }).decorate("categoryUseCases", {
      getCategoriesUseCase: modules.category.getCategoriesUseCase,
      getCategoryByIdUseCase: modules.category.getCategoryByIdUseCase,
      createCategoryUseCase: modules.category.createCategoryUseCase,
      updateCategoryUseCase: modules.category.updateCategoryUseCase,
      deleteCategoryUseCase: modules.category.deleteCategoryUseCase,
    }),
    
    budgetOwner: new Elysia({ name: "budget-owner-module" }).decorate("budgetOwnerUseCases", {
      getBudgetOwnersUseCase: modules.budgetOwner.getBudgetOwnersUseCase,
      getBudgetOwnerByIdUseCase: modules.budgetOwner.getBudgetOwnerByIdUseCase,
      createBudgetOwnerUseCase: modules.budgetOwner.createBudgetOwnerUseCase,
      updateBudgetOwnerUseCase: modules.budgetOwner.updateBudgetOwnerUseCase,
      deleteBudgetOwnerUseCase: modules.budgetOwner.deleteBudgetOwnerUseCase,
    }),
    
    budget: new Elysia({ name: "budget-module" }).decorate("budgetUseCases", {
      getBudgetsUseCase: modules.budget.getBudgetsUseCase,
      getBudgetByIdUseCase: modules.budget.getBudgetByIdUseCase,
      getBudgetSummaryUseCase: modules.budget.getBudgetSummaryUseCase,
      createBudgetUseCase: modules.budget.createBudgetUseCase,
      updateBudgetUseCase: modules.budget.updateBudgetUseCase,
      deleteBudgetUseCase: modules.budget.deleteBudgetUseCase,
    }),
    
    transaction: new Elysia({ name: "transaction-module" }).decorate("transactionUseCases", {
      getTransactionsUseCase: modules.transaction.getTransactionsUseCase,
      getTransactionByIdUseCase: modules.transaction.getTransactionByIdUseCase,
      createTransactionUseCase: modules.transaction.createTransactionUseCase,
      updateTransactionUseCase: modules.transaction.updateTransactionUseCase,
      deleteTransactionUseCase: modules.transaction.deleteTransactionUseCase,
    }),
  };
}

/**
 * Register all module routes using Elysia plugin pattern
 * Plugins inject dependencies via .decorate(), routes access from context
 */
function registerAllRoutes(
  app: ReturnType<typeof createApp>,
  plugins: ReturnType<typeof createModulePlugins>
) {
  // Register each module: plugin → routes
  // Plugins make dependencies available in handler context
  app
    .use(plugins.auth)
    .use((app) => registerAuthRoutes(app))
    
    .use(plugins.category)
    .use((app) => registerCategoryRoutes(app))
    
    .use(plugins.budgetOwner)
    .use((app) => registerBudgetOwnerRoutes(app))
    
    .use(plugins.budget)
    .use((app) => registerBudgetRoutes(app))
    
    .use(plugins.transaction)
    .use((app) => registerTransactionRoutes(app));
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

    // 3. Create Elysia plugins for dependency injection
    const plugins = createModulePlugins(modules);
    console.log("✅ Plugins created");

    // 4. Create app with global middleware (CORS, auth, error handling)
    const app = createApp(prisma);

    // 5. Register all module routes using plugin pattern
    registerAllRoutes(app, plugins);
    console.log("✅ Routes registered with plugins");

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
