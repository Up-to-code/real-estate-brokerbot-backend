"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    database: {
        url: process.env.DATABASE_URL || 'sqlite://./db.sqlite',
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    cors: {
        origin: '*',
        credentials: true,
    },
    rateLimit: {
        windowMs: 15 * 60 * 1000,
        max: 100,
    },
};
console.log('CORS allowed origins:', process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']);
