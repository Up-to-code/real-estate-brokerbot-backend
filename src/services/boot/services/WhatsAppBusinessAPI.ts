// send-campaign.ts
import { PrismaClient } from '@prisma/client';
import { startOfDay } from 'date-fns';
import { WhatsAppBusinessAPI, WhatsAppMessagePayload, WhatsAppMessageComponent, WhatsAppParameter } from './whatsapp-api-types'; // Adjust import path as needed

const prisma = new PrismaClient();

const WA_PHONE_NUMBER_ID = process.env.WA_PHONE_NUMBER_ID!;
const WA_ACCESS_TOKEN = process.env.WA_ACCESS_TOKEN!;
 
 
export async function sendWhatsAppTemplateCampaign(campaignId: string): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        template: true,
        clients: true,
      },
    });

    if (!campaign) {
      return { success: false, error: "Campaign not found" };
    }

    if (campaign.type !== 'Template' || !campaign.template) {
      return { success: false, error: "Campaign is not based on a template" };
    }

    const today = startOfDay(new Date());
    const stat = await prisma.dailyMessageStat.findUnique({ where: { date: today } });
    const messagesSentToday = stat?.count || 0;

    const maxPerDay = 1000;
    const remainingQuota = maxPerDay - messagesSentToday;

    if (remainingQuota <= 0) {
      return { success: false, error: "Daily message limit reached" };
    }

    const clientsToSend = campaign.clients.slice(0, remainingQuota);
    let sentCount = 0;

    for (const client of clientsToSend) {
      const payload: WhatsAppMessagePayload = {
        messaging_product: 'whatsapp',
        to: client.phoneNumber,
        type: 'template',
        template: {
          name: campaign.template.name,
          language: {
            code: campaign.template.language || 'en',
          },
          components: [
            {
              type: 'body',
              parameters: campaign.template.variables.map((variable) => {
                const value = extractVariableValue(variable, client);
                return {
                  type: 'text',
                  text: String(value),
                } satisfies WhatsAppParameter;
              }),
            },
          ],
        },
      };

      // Send message through WhatsApp Business API
      const res = await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WA_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        console.log(`✅ Sent to ${client.phoneNumber}`);
        sentCount++;
      } else {
        console.warn(`❌ Failed for ${client.phoneNumber}:`, data);
      }
    }

    // Update stats
    await prisma.dailyMessageStat.upsert({
      where: { date: today },
      create: { date: today, count: sentCount },
      update: { count: { increment: sentCount } },
    });

    await prisma.campaign.update({
      where: { id: campaign.id },
      data: {
        sentCount: { increment: sentCount },
        lastSentAt: new Date(),
        status: 'Completed',
      },
    });

    return {
      success: true,
      message: `Sent ${sentCount} WhatsApp messages from campaign`,
    };
  } catch (error) {
    console.error("sendWhatsAppTemplateCampaign error:", error);
    return { success: false, error: "Failed to send campaign" };
  }
}

function extractVariableValue(key: string, client: any): string {
  switch (key) {
    case 'name':
      return client.name;
    case 'phone':
      return client.phone;
    default:
      return '';
  }
}
