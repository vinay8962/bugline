import { PrismaClient } from "@prisma/client";
import { logInfo, logError, logSystem, logDatabase } from "../utils/logger.js";

// Create a single PrismaClient instance that can be shared throughout the app
const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    // Optimize connection pooling for better performance
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Enhanced Prisma client with logging
const prismaWithLogging = new Proxy(prisma, {
  get(target, prop) {
    const value = target[prop];

    if (
      typeof value === "function" &&
      prop !== "$connect" &&
      prop !== "$disconnect"
    ) {
      return async (...args) => {
        const startTime = Date.now();
        try {
          const result = await value.apply(target, args);
          const duration = Date.now() - startTime;

          // Log database operations
          logDatabase(prop, "database", duration, true);

          return result;
        } catch (error) {
          const duration = Date.now() - startTime;
          logDatabase(prop, "database", duration, false);
          logError(`Database operation failed: ${prop}`, error);
          throw error;
        }
      };
    }

    return value;
  },
});

// Database health check using Prisma
export const checkDatabaseConnection = async () => {
  const startTime = Date.now();

  try {
    logSystem("Checking database connection");

    // Simple query to test database connectivity
    await prisma.$queryRaw`SELECT 1`;

    const duration = Date.now() - startTime;
    logSystem("Database connection successful", { duration: `${duration}ms` });

    return { success: true, message: "Database connection successful" };
  } catch (error) {
    const duration = Date.now() - startTime;
    logError("Database connection failed", error);
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Graceful shutdown for Prisma
export const disconnectPrisma = async () => {
  try {
    logSystem("Disconnecting from database");
    await prisma.$disconnect();
    logSystem("Database disconnected successfully");
  } catch (error) {
    logError("Error disconnecting from database", error);
  }
};
