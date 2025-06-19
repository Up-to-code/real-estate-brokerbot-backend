import { PrismaClient } from '@prisma/client';
import { config } from '../../config/config';
// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

if (config.isDevelopment) {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});