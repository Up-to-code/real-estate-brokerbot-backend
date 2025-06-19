import { Router } from "express";
import mainRouter from "./main/index";
import propertiesRouter from "./properties/index";
import webhookRouter from "./webhook/whatsapp/index";
import clientsRouter from "./Clients/index";
import qaRouter from "./QA/qa";
import templatesRouter from "./Templates/index";
import campaignsRouter from "./campaigns/index";
const router = Router();

//  main route
//  main route
//  @description Get dashboard statistics
//  @returns {Object} 200 OK
//  @route GET /api/v1/
router.use("/", mainRouter);
router.use("/webhook/whatsapp", webhookRouter);
router.use("/properties", propertiesRouter);
router.use("/clients", clientsRouter);
router.use("/qa", qaRouter);
router.use("/templates", templatesRouter);
router.use("/campaigns", campaignsRouter);

export default router;