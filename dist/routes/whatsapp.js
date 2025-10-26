"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whatsapp_1 = require("../controllers/whatsapp");
const router = (0, express_1.Router)();
router.post("/send-property-pdf", whatsapp_1.sendPropertyPdf);
exports.default = router;
