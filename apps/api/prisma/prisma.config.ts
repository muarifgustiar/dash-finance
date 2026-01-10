import { defineConfig } from "prisma/config";

export default defineConfig({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://finance:finance@localhost:5432/dash_finance?schema=public",
    },
  },
});
