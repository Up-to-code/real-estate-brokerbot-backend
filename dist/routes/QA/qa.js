"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const QA_ai_1 = require("../../controllers/ai/QA-ai");
const router = express_1.default.Router();
router.get("/", async (req, res) => {
    try {
        const data = await (0, QA_ai_1.getQAs)(req, res);
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "فشل في جلب البيانات" });
    }
});
router.post("/", async (req, res) => {
    try {
        const data = await (0, QA_ai_1.CreateQA)(req, res);
        res.status(201).json(data);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "فشل في الإنشاء" });
    }
});
router.put("/:id", async (req, res) => {
    try {
        req.body.id = req.params.id;
        const data = await (0, QA_ai_1.UpdateQA)(req, res);
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "فشل في التحديث" });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const data = await (0, QA_ai_1.DeleteQA)(req, res);
        res.json(data);
    }
    catch (err) {
        console.error(err);
        res.status(400).json({ error: "فشل في الحذف" });
    }
});
exports.default = router;
