import { Router } from "express";
import { sendPropertyPdf } from "../controllers/whatsapp";

const router = Router();

// POST /api/v1/whatsapp/send-property-pdf
router.post("/send-property-pdf", sendPropertyPdf);

export default router; 