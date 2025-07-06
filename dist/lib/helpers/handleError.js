"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message });
};
exports.default = handleError;
