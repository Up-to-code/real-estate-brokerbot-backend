"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const safeQuery = async (query, fallback) => {
    try {
        return await query;
    }
    catch (error) {
        console.error("Database query failed:", error);
        return fallback;
    }
};
exports.default = safeQuery;
