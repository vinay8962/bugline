import { PrismaClient } from '@prisma/client';

// Create a single PrismaClient instance that can be shared throughout the app
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Database health check using Prisma
export const checkDatabaseConnection = async () => {
  try {
    // Simple query to test database connectivity
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Graceful shutdown for Prisma
export const disconnectPrisma = async () => {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error.message);
  }
}; 