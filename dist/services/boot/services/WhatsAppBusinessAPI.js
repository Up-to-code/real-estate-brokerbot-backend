"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppTemplateCampaign = sendWhatsAppTemplateCampaign;
const client_1 = require("@prisma/client");
const date_fns_1 = require("date-fns");
const prisma = new client_1.PrismaClient();
const WA_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WA_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const MAX_MESSAGES_PER_DAY = parseInt(process.env.MAX_MESSAGES_PER_DAY || '1000', 10);
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10', 10);
const BATCH_DELAY_MS = parseInt(process.env.BATCH_DELAY_MS || '1000', 10);
async function sendWhatsAppTemplateCampaign(campaignId) {
    const startTime = Date.now();
    try {
        if (!campaignId || typeof campaignId !== "string" || !campaignId.trim()) {
            return { success: false, error: "Campaign ID is required" };
        }
        const campaignWithTemplateResult = await fetchCampaignWithValidation(campaignId);
        if (!campaignWithTemplateResult.success) {
            return campaignWithTemplateResult;
        }
        const campaign = campaignWithTemplateResult.data;
        const quotaCheck = await checkDailyQuota();
        if (!quotaCheck.success) {
            return quotaCheck;
        }
        const { remainingQuota } = quotaCheck;
        if (typeof remainingQuota !== "number") {
            return { success: false, error: "Failed to determine remaining quota" };
        }
        console.log(`📊 Daily quota: ${remainingQuota} messages remaining`);
        const clientsResult = await getTargetClients(campaign);
        if (!clientsResult.success) {
            return clientsResult;
        }
        const clientsToSend = clientsResult.clients || [];
        const actualTargets = Math.min(clientsToSend.length, remainingQuota);
        console.log(`🎯 Targeting ${actualTargets} clients (${clientsToSend.length} total, ${remainingQuota} quota)`);
        if (actualTargets === 0) {
            return {
                success: true,
                message: "No clients to send to",
                sentCount: 0,
                failedCount: 0,
                details: {
                    totalTargets: clientsToSend.length,
                    remainingQuota
                }
            };
        }
        const results = await sendMessagesInBatches(clientsToSend.slice(0, actualTargets), campaign);
        await updateCampaignStats(campaign.id, results, startTime);
        const sentCount = results.filter(r => r.success).length;
        const failedCount = results.filter(r => !r.success).length;
        return {
            success: true,
            message: `Campaign completed: ${sentCount} sent, ${failedCount} failed`,
            sentCount,
            failedCount,
            details: {
                totalTargets: clientsToSend.length,
                remainingQuota
            }
        };
    }
    catch (error) {
        console.error("❌ Campaign send error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}
async function fetchCampaignWithValidation(campaignId) {
    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                templates: true,
                clients: true,
            }
        });
        if (!campaign) {
            return { success: false, error: "Campaign not found" };
        }
        if (campaign.type !== "Template") {
            return { success: false, error: "Campaign must be of type 'Template'" };
        }
        const template = campaign.templates?.length ? campaign.templates[0] : undefined;
        if (!template) {
            return { success: false, error: "Campaign template not found" };
        }
        if (typeof template.name !== "string" || !template.name.trim()) {
            return { success: false, error: "Template name is missing" };
        }
        const campaignWithTemplate = {
            ...campaign,
            template
        };
        return { success: true, data: campaignWithTemplate };
    }
    catch (error) {
        console.error("Database error fetching campaign:", error);
        return { success: false, error: "Failed to fetch campaign from database" };
    }
}
async function checkDailyQuota() {
    try {
        const today = (0, date_fns_1.startOfDay)(new Date());
        const stat = await prisma.dailyMessageStat.findUnique({
            where: { date: today }
        });
        const messagesSentToday = stat?.count || 0;
        const remainingQuota = MAX_MESSAGES_PER_DAY - messagesSentToday;
        if (remainingQuota <= 0) {
            return {
                success: false,
                error: `Daily message limit of ${MAX_MESSAGES_PER_DAY} reached (${messagesSentToday} sent today)`
            };
        }
        return { success: true, remainingQuota };
    }
    catch (error) {
        console.error("Error checking daily quota:", error);
        return { success: false, error: "Failed to check daily message quota" };
    }
}
async function getTargetClients(campaign) {
    try {
        const audienceType = typeof campaign.audience === "string" ? campaign.audience.toLowerCase() : 'selected';
        let clients = [];
        const baseWhere = { type: 'Client' };
        switch (audienceType) {
            case 'all':
                clients = await prisma.client.findMany({ where: baseWhere });
                break;
            case 'active':
                clients = await prisma.client.findMany({
                    where: {
                        ...baseWhere,
                        lastActive: {
                            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        }
                    },
                });
                break;
            case 'inactive':
                clients = await prisma.client.findMany({
                    where: {
                        ...baseWhere,
                        lastActive: {
                            lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                        }
                    },
                });
                break;
            default: {
                const selectedIds = Array.isArray(campaign.clients) && campaign.clients.length > 0
                    ? campaign.clients.map((client) => client.id)
                    : [];
                if (selectedIds.length === 0) {
                    return { success: false, error: "No clients selected for campaign" };
                }
                clients = await prisma.client.findMany({
                    where: {
                        ...baseWhere,
                        id: { in: selectedIds },
                    },
                });
                break;
            }
        }
        const validClients = clients.filter(client => {
            const hasValidPhone = client.phoneNumber &&
                typeof client.phoneNumber === 'string' &&
                client.phoneNumber.trim().length > 0;
            if (!hasValidPhone) {
                console.warn(`⚠️ Skipping client ${client.id}: Invalid phone number`);
            }
            return hasValidPhone;
        });
        console.log(`👥 Found ${validClients.length} valid clients (${clients.length - validClients.length} invalid phone numbers)`);
        return { success: true, clients: validClients };
    }
    catch (error) {
        console.error("Error fetching target clients:", error);
        return { success: false, error: "Failed to fetch target clients" };
    }
}
async function sendMessagesInBatches(clients, campaign) {
    const results = [];
    for (let i = 0; i < clients.length; i += BATCH_SIZE) {
        const batch = clients.slice(i, i + BATCH_SIZE);
        const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(clients.length / BATCH_SIZE);
        console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} messages)`);
        const batchPromises = batch.map(client => sendSingleMessage(client, campaign));
        const batchResults = await Promise.allSettled(batchPromises);
        batchResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            }
            else {
                const client = batch[index];
                results.push({
                    success: false,
                    clientId: client.id,
                    phoneNumber: client.phoneNumber,
                    error: result.reason?.message || 'Unknown error'
                });
                console.error(`❌ Batch error for ${client.phoneNumber}:`, result.reason);
            }
        });
        if (i + BATCH_SIZE < clients.length) {
            await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
        }
    }
    return results;
}
async function sendSingleMessage(client, campaign) {
    const template = campaign.template;
    if (!template || !template.name) {
        return {
            success: false,
            clientId: client.id,
            phoneNumber: client.phoneNumber,
            error: "Template data missing in campaign"
        };
    }
    try {
        const parameters = Array.isArray(template.variables)
            ? template.variables.map((variable) => ({
                type: 'text',
                text: String(extractVariableValue(variable, client) || ''),
            }))
            : [];
        const payload = {
            messaging_product: 'whatsapp',
            to: client.phoneNumber,
            type: 'template',
            template: {
                name: template.name,
                language: {
                    code: template.language || 'ar',
                },
                components: parameters.length > 0 ? [
                    {
                        type: 'body',
                        parameters,
                    },
                ] : [],
            },
        };
        const response = await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_NUMBER_ID}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`✅ Message sent to ${client.phoneNumber}`);
            return {
                success: true,
                clientId: client.id,
                phoneNumber: client.phoneNumber,
                messageId: data.messages?.[0]?.id,
            };
        }
        else {
            const errorMsg = data.error?.message || `HTTP ${response.status}`;
            console.warn(`❌ Failed to send to ${client.phoneNumber}: ${errorMsg}`);
            return {
                success: false,
                clientId: client.id,
                phoneNumber: client.phoneNumber,
                error: errorMsg,
            };
        }
    }
    catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Network error';
        console.error(`❌ Exception sending to ${client.phoneNumber}:`, errorMsg);
        return {
            success: false,
            clientId: client.id,
            phoneNumber: client.phoneNumber,
            error: errorMsg,
        };
    }
}
async function updateCampaignStats(campaignId, results, startTime) {
    try {
        const sentCount = results.filter(r => r.success).length;
        const today = (0, date_fns_1.startOfDay)(new Date());
        const duration = Date.now() - startTime;
        await prisma.dailyMessageStat.upsert({
            where: { date: today },
            create: { date: today, count: sentCount },
            update: { count: { increment: sentCount } },
        });
        await prisma.campaign.update({
            where: { id: campaignId },
            data: {
                sentCount: { increment: sentCount },
                lastSentAt: new Date(),
                status: 'Completed',
            },
        });
        console.log(`📈 Updated stats: ${sentCount} messages sent in ${Math.round(duration / 1000)}s`);
    }
    catch (error) {
        console.error("❌ Failed to update campaign stats:", error);
    }
}
function extractVariableValue(key, client) {
    const value = (() => {
        switch (key.toLowerCase()) {
            case 'name':
                return client.name || client.firstName || client.fullName;
            case 'phone':
            case 'phonenumber':
                return client.phoneNumber || client.phone;
            case 'firstname':
                return client.firstName;
            case 'lastname':
                return client.lastName;
            case 'email':
                return client.email;
            case 'company':
                return client.company;
            default:
                return client[key] || client[key.toLowerCase()];
        }
    })();
    return value ? String(value).trim() : '';
}
