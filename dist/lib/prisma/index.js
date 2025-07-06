"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const config_1 = require("../../config/config");
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? new client_1.PrismaClient({
    log: config_1.config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
});
if (config_1.config.isDevelopment) {
    globalForPrisma.prisma = exports.prisma;
}
process.on('beforeExit', async () => {
    await exports.prisma.$disconnect();
});
