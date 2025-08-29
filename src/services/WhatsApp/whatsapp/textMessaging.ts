import { WhatsAppConfig, WhatsAppResponse, SendOptions } from './types';
import { makeApiRequest } from './httpClient';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Daily message limit
const DAILY_MESSAGE_LIMIT = 1000;

/**
 * Get or create today's message statistics
 */
async function getTodayStats(): Promise<{ id: string; count: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of day

  let stat = await prisma.dailyMessageStat.findUnique({
    where: { date: today }
  });

  if (!stat) {
    stat = await prisma.dailyMessageStat.create({
      data: {
        date: today,
        count: 0
      }
    });
  }

  return { id: stat.id, count: stat.count };
}

/**
 * Check if daily message limit has been reached
 */
async function checkDailyLimit(): Promise<{ canSend: boolean; remaining: number }> {
  const stats = await getTodayStats();
  const remaining = DAILY_MESSAGE_LIMIT - stats.count;
  
  return {
    canSend: remaining > 0,
    remaining: Math.max(0, remaining)
  };
}

/**
 * Increment daily message count
 */
async function incrementMessageCount(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyMessageStat.upsert({
    where: { date: today },
    update: { count: { increment: 1 } },
    create: {
      date: today,
      count: 1
    }
  });
}

/**
 * Sends a simple text message with daily limit check
 */
export async function sendText(
  config: WhatsAppConfig,
  to: string,
  message: string,
  options: SendOptions = {}
): Promise<WhatsAppResponse> {
  // Check daily limit before sending
  const limitCheck = await checkDailyLimit();
  
  if (!limitCheck.canSend) {
    throw new Error(`Daily message limit of ${DAILY_MESSAGE_LIMIT} reached. Try again tomorrow.`);
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: {
      preview_url: options.previewUrl || false,
      body: message
    }
  };

  // Add reply context if provided
  if (options.replyToMessageId) {
    payload.context = { message_id: options.replyToMessageId };
  }

  try {
    const response = await makeApiRequest(config, 'messages', payload);
    
    // Only increment count if message was sent successfully
    if (response.messages && response.messages.length > 0) {
      await incrementMessageCount();
    }
    
    return response;
  } catch (error) {
    // Don't increment count on failed sends
    throw error;
  }
}

/**
 * Get current daily message statistics
 */
export async function getDailyMessageStats(): Promise<{
  sent: number;
  remaining: number;
  limit: number;
  resetTime: Date;
}> {
  const stats = await getTodayStats();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return {
    sent: stats.count,
    remaining: Math.max(0, DAILY_MESSAGE_LIMIT - stats.count),
    limit: DAILY_MESSAGE_LIMIT,
    resetTime: tomorrow
  };
}

/**
 * Reset daily message count (for testing or manual reset)
 */
export async function resetDailyMessageCount(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyMessageStat.upsert({
    where: { date: today },
    update: { count: 0 },
    create: {
      date: today,
      count: 0
    }
  });
}

// Cleanup old records (run this periodically)
export async function cleanupOldMessageStats(daysToKeep: number = 30): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

  await prisma.dailyMessageStat.deleteMany({
    where: {
      date: {
        lt: cutoffDate
      }
    }
  });
}