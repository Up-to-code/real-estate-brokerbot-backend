"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const main_1 = __importDefault(require("../../controllers/main"));
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const dashboardStatistics = await (0, main_1.default)();
    res.json(dashboardStatistics);
});
exports.default = router;
