import { Router } from "express";
import { Handle_Message_webhook, verifyWebhook } from "../../../controllers/whatsapp";

const router = Router();

router.get("/", verifyWebhook);
router.post("/", Handle_Message_webhook);

export default router;
