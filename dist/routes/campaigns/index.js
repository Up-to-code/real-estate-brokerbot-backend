"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("../../controllers/campaigns/index");
const router = express_1.default.Router();
router.get("/", index_1.getAllCampaigns);
router.post("/", index_1.createCampaign);
router.get("/:id", index_1.getCampaignById);
router.put("/:id", index_1.updateCampaign);
router.delete("/:id", index_1.deleteCampaign);
router.post("/:id/send", index_1.sendCampaign);
exports.default = router;
