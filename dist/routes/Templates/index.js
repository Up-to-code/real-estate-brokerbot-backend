"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../../services/Templates/index");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const templates = await (0, index_1.getTemplates)();
    res.json(templates);
});
router.get("/:id", async (req, res) => {
    const template = await (0, index_1.getTemplateById)(req.params.id);
    res.json(template);
});
router.post("/", async (req, res) => {
    const template = await (0, index_1.createTemplate)(req.body);
    res.json(template);
});
router.put("/:id", async (req, res) => {
    const template = await (0, index_1.updateTemplate)(req.params.id, req.body);
    res.json(template);
});
router.delete("/:id", async (req, res) => {
    const template = await (0, index_1.deleteTemplate)(req.params.id);
    res.json(template);
});
exports.default = router;
