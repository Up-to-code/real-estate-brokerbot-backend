"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const properties_1 = require("../../controllers/properties");
const router = (0, express_1.Router)();
router.get("/", async (req, res, next) => {
    try {
        const { page = "1", limit = "10", city, search, minPrice, maxPrice, } = req.query;
        const filters = {
            ...(city && { city: city }),
            ...(search && { search: search }),
            ...(minPrice && { minPrice: parseFloat(minPrice) }),
            ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
        };
        const result = await (0, properties_1.getProperties)(filters, parseInt(page), parseInt(limit));
        res.json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const property = await (0, properties_1.getPropertyById)(req.params.id);
        res.json({ success: true, data: property });
    }
    catch (error) {
        next(error);
    }
});
router.post("/", async (req, res, next) => {
    try {
        const property = await (0, properties_1.createProperty)(req.body);
        res.json({ success: true, data: property });
    }
    catch (error) {
        next(error);
    }
});
router.put("/:id", async (req, res, next) => {
    try {
        const property = await (0, properties_1.updateProperty)(req.params.id, req.body);
        res.json({ success: true, data: property });
    }
    catch (error) {
        next(error);
    }
});
router.delete("/:id", async (req, res, next) => {
    try {
        const property = await (0, properties_1.deleteProperty)(req.params.id);
        res.json({ success: true, data: property });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
