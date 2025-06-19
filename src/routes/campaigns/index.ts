import express from "express";
import {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign
} from "../../controllers/campaigns/index";

const router = express.Router();

// /api/campaigns
router.get("/", getAllCampaigns);
router.post("/", createCampaign);

// /api/campaigns/:id
router.get("/:id", getCampaignById);
router.put("/:id", updateCampaign);
router.delete("/:id", deleteCampaign);

// /api/campaigns/:id/send
router.post("/:id/send", sendCampaign);

export default router;
