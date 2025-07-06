"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = exports.createError = void 0;
const config_1 = require("../config/config");
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
    });
};
exports.notFoundHandler = notFoundHandler;
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    if (config_1.config.isDevelopment) {
        console.error('Error:', {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
        });
    }
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(config_1.config.isDevelopment && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
