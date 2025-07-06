"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMiddleware = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const config_1 = require("../config/config");
const Logger_1 = require("./Logger");
const setupMiddleware = (app) => {
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)(config_1.config.cors));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use(Logger_1.requestLogger);
};
exports.setupMiddleware = setupMiddleware;
