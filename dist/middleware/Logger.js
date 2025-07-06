"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const config_1 = require("../config/config");
const requestLogger = (req, res, next) => {
    if (config_1.config.isDevelopment) {
        const start = Date.now();
        res.on('finish', () => {
            const duration = Date.now() - start;
            const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
            const resetColor = '\x1b[0m';
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${statusColor}${res.statusCode}${resetColor} - ${duration}ms`);
        });
    }
    next();
};
exports.requestLogger = requestLogger;
