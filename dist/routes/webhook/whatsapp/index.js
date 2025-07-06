"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const whatsapp_1 = require("../../../controllers/whatsapp");
const router = (0, express_1.Router)();
router.get("/", whatsapp_1.verifyWebhook);
router.post("/", whatsapp_1.Handle_Message_webhook);
exports.default = router;
