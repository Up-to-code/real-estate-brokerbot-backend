import { Request, Response } from "express";
import { sendWhatsAppTemplateCampaign } from "../../services/boot/services/WhatsAppBusinessAPI";
import { prisma } from "../../lib/prisma";

/**
 * Get all campaigns with client count and included templates.
 */
export const getAllCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        templates: true, // Corrected relation
        _count: {
          select: {
            clients: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedCampaigns = campaigns.map((campaign) => {
      const { _count, ...rest } = campaign as any;
      return {
        ...rest,
        clientCount: _count?.clients ?? 0,
      };
    });

    res.json({ success: true, data: transformedCampaigns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to get campaigns" });
  }
};

/**
 * Get a single campaign by ID with client count and included templates.
 */
export const getCampaignById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        templates: true, // Corrected relation
        _count: {
          select: {
            clients: true,
          },
        },
      },
    });

    if (!campaign)
      return res
        .status(404)
        .json({ success: false, error: "Campaign not found" });

    const { _count, ...rest } = campaign as any;
    const transformedCampaign = {
      ...rest,
      clientCount: _count?.clients ?? 0,
    };

    res.json({ success: true, data: transformedCampaign });
    return;
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to get campaign" });
  }
};

/**
 * Create a campaign, connecting clients and templates properly.
 */
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
    let selectedClients: { id: string }[] = [];

    // Handle audience types
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
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
          select: { id: true },
        });
        break;

      case "inactive":
        selectedClients = await prisma.client.findMany({
          where: {
            lastActive: {
              lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // More than 30 days inactive
            },
          },
          select: { id: true },
        });
        break;

      case "custom":
        if (!Array.isArray(clientIds) || clientIds.length === 0) {
          return res.status(400).json({
            success: false,
            error: "clientIds must be a non-empty array for custom audience",
          });
        }
        selectedClients = clientIds.map((id: string) => ({ id }));
        break;

      default:
        return res.status(400).json({
          success: false,
          error: "Invalid audience type. Must be 'all', 'active', 'inactive', or 'custom'",
        });
    }

    const campaignData: any = {
      name,
      type,
      status,
      audience,
      message,
      clients: {
        connect: selectedClients,
      },
    };

    // Campaign-Template M:N relation fix: use templates.connect
    if (templateId) {
      campaignData.templates = {
        connect: [{ id: templateId }],
      };
    }

    const campaign = await prisma.campaign.create({
      data: campaignData,
      include: {
        clients: true,
        templates: true,
      },
    });

    return res.status(201).json({ success: true, data: campaign });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create campaign" });
  }
};

/**
 * Update an existing campaign, clients & templates M:N.
 */
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
    if (clientIds && Array.isArray(clientIds)) {
      updateData.clients = {
        set: clientIds.map((clientId: string) => ({ id: clientId })),
      };
    }
    // Update templates relation (set for single template based on templateId)
    if (templateId) {
      updateData.templates = {
        set: [{ id: templateId }],
      };
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        templates: true,
        clients: true,
      },
    });

    // Optionally trigger sending if status is now "active"
    if (status === "active") {
      await sendWhatsAppTemplateCampaign(id);
    }

    res.json({
      success: true,
      data: updatedCampaign,
      message: "Campaign updated successfully",
    });
    return;
  } catch (error) {
    console.error("Error updating campaign:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to update campaign" });
  }
};

/**
 * Delete a campaign by ID.
 */
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

/**
 * Send a campaign by ID.
 */
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
