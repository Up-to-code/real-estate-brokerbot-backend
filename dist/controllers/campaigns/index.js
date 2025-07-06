"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCampaign = exports.deleteCampaign = exports.updateCampaign = exports.createCampaign = exports.getCampaignById = exports.getAllCampaigns = void 0;
const WhatsAppBusinessAPI_1 = require("../../services/boot/services/WhatsAppBusinessAPI");
const prisma_1 = require("../../lib/prisma");
const getAllCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma_1.prisma.campaign.findMany({
            include: {
                template: true,
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
        const transformedCampaigns = campaigns.map((campaign) => ({
            ...campaign,
            clientCount: campaign._count.clients,
            _count: undefined,
        }));
        res.json({ success: true, data: transformedCampaigns });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to get campaigns" });
    }
};
exports.getAllCampaigns = getAllCampaigns;
const getCampaignById = async (req, res) => {
    const { id } = req.params;
    try {
        const campaign = await prisma_1.prisma.campaign.findUnique({
            where: { id },
            include: {
                template: true,
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
        const transformedCampaign = {
            ...campaign,
            clientCount: campaign._count.clients,
            _count: undefined,
        };
        res.json({ success: true, data: transformedCampaign });
        return;
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Failed to get campaign" });
    }
};
exports.getCampaignById = getCampaignById;
const createCampaign = async (req, res) => {
    const { name, type, status, audience, message, templateId, clientIds = [], } = req.body;
    if (!name || !type || !status || !audience) {
        return res
            .status(400)
            .json({ success: false, error: "Missing required fields" });
    }
    try {
        let selectedClients = [];
        switch (audience) {
            case "all":
                selectedClients = await prisma_1.prisma.client.findMany({
                    select: { id: true },
                });
                break;
            case "active":
                selectedClients = await prisma_1.prisma.client.findMany({
                    where: {
                        lastActive: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        },
                    },
                    select: { id: true },
                });
                break;
            case "inactive":
                selectedClients = await prisma_1.prisma.client.findMany({
                    where: {
                        lastActive: {
                            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
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
                selectedClients = clientIds.map((id) => ({ id }));
                break;
            default:
                return res.status(400).json({
                    success: false,
                    error: "Invalid audience type. Must be 'all', 'active', 'inactive', or 'custom'",
                });
        }
        const campaign = await prisma_1.prisma.campaign.create({
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
        return res.status(201).json({ success: true, data: campaign });
    }
    catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ success: false, error: "Failed to create campaign" });
    }
};
exports.createCampaign = createCampaign;
const updateCampaign = async (req, res) => {
    const { id } = req.params;
    const { name, type, status, audience, message, templateId, clientIds = [], } = req.body;
    try {
        const existingCampaign = await prisma_1.prisma.campaign.findUnique({
            where: { id },
        });
        if (!existingCampaign) {
            return res
                .status(404)
                .json({ success: false, error: "Campaign not found" });
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (type)
            updateData.type = type;
        if (status)
            updateData.status = status;
        if (audience)
            updateData.audience = audience;
        if (type === "Custom" && message)
            updateData.message = message;
        if (type === "Template" && templateId)
            updateData.templateId = templateId;
        if (clientIds) {
            updateData.clients = {
                set: clientIds.map((clientId) => ({ id: clientId })),
            };
        }
        const updatedCampaign = await prisma_1.prisma.campaign.update({
            where: { id },
            data: updateData,
            include: {
                template: true,
                clients: true,
            },
        });
        console.log("status", status);
        if (status === "active") {
            await (0, WhatsAppBusinessAPI_1.sendWhatsAppTemplateCampaign)(id);
        }
        res.json({
            success: true,
            data: updatedCampaign,
            message: "Campaign updated successfully",
        });
        return;
    }
    catch (error) {
        console.error("Error updating campaign:", error);
        return res.status(500).json({ success: false, error: "Failed to update campaign" });
    }
};
exports.updateCampaign = updateCampaign;
const deleteCampaign = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma_1.prisma.campaign.delete({ where: { id } });
        res.json({ success: true, message: "Campaign deleted" });
    }
    catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ success: false, error: "Failed to delete campaign" });
    }
};
exports.deleteCampaign = deleteCampaign;
const sendCampaign = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await (0, WhatsAppBusinessAPI_1.sendWhatsAppTemplateCampaign)(id);
        if (result.success) {
            res.json({ success: true, message: result.message });
        }
        else {
            res.status(400).json({ success: false, error: result.error });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to send campaign" });
    }
};
exports.sendCampaign = sendCampaign;
