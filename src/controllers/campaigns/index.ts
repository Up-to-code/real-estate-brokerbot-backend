import { Request, Response } from "express";
import { sendWhatsAppTemplateCampaign } from "../../services/boot/services/WhatsAppBusinessAPI";
import { prisma } from "../../lib/prisma";

export const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        clients: true,
        template: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json({ success: true, data: campaigns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to get campaigns" });
  }
};

export const getCampaignById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        clients: true,
        template: true,
      },
    });
    if (!campaign)
      return res
        .status(404)
        .json({ success: false, error: "Campaign not found" });

    res.json({ success: true, data: campaign });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to get campaign" });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  const {
    name,
    type,
    status,
    audience,
    message,
    templateId,
    clientIds = [],
  } = req.body;
  if (!name || !type || !status || !audience) {
    return res
      .status(400)
      .json({ success: false, error: "Missing required fields" });
  }

  try {
    let selectedClients;

    // Handle different audience types
    switch (audience) {
      case "all":
        selectedClients = await prisma.client.findMany({
          select: { id: true },
        });
        break;
      case "active":
        selectedClients = await prisma.client.findMany({
          where: {
            lastActive: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Active in last 30 days
            },
          },
          select: { id: true },
        });
        break;
      case "inactive":
        selectedClients = await prisma.client.findMany({
          where: {
            lastActive: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Inactive for more than 30 days
            },
          },
          select: { id: true },
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error:
            "Invalid audience type. Must be 'all', 'active', 'inactive', or 'custom'",
        });
    }

    const campaign = await prisma.campaign.create({
      data: {
        name,
        type,
        status,
        audience,
        message,
        templateId,
        clients: {
          connect: selectedClients,
        },
      },
      include: {
        clients: true,
        template: true,
      },
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to create campaign" });
  }
};

export const updateCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    type,
    status,
    audience,
    message,
    templateId,
    clientIds = [],
  } = req.body;

  try {
    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return res
        .status(404)
        .json({ success: false, error: "Campaign not found" });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;
    if (status) updateData.status = status;
    if (audience) updateData.audience = audience;
    if (type === "Custom" && message) updateData.message = message;
    if (type === "Template" && templateId) updateData.templateId = templateId;
    if (clientIds) {
      updateData.clients = {
        set: clientIds.map((clientId: string) => ({ id: clientId })),
      };
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        template: true,
        clients: true,
      },
    });

    if (status === "Active") {
      await sendWhatsAppTemplateCampaign(id);
    }

    res.json({
      success: true,
      data: updatedCampaign,
      message: "Campaign updated successfully",
    });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update campaign" });
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.campaign.delete({ where: { id } });
    res.json({ success: true, message: "Campaign deleted" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete campaign" });
  }
};

export const sendCampaign = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await sendWhatsAppTemplateCampaign(id);
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to send campaign" });
  }
};
