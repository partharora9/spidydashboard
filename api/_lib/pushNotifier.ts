/**
 * SECONDARY PUSH NOTIFICATION DISPATCHER
 * Zero-PII push notifications via ntfy.sh or Telegram bot.
 * Guarantees owner is immediately alerted even if an email lands in spam or provider has downtime.
 */

import { getEmailConfig } from './config';

export interface PushPayload {
  reference: string;
  planName: string;
  amountFormatted: string;
}

export async function sendOwnerPushNotification(payload: PushPayload): Promise<{ success: boolean; error?: string }> {
  const config = getEmailConfig();

  // Try ntfy.sh first if configured
  if (config.ntfyTopic) {
    try {
      const topicUrl = `https://ntfy.sh/${config.ntfyTopic}`;
      const res = await fetch(topicUrl, {
        method: 'POST',
        headers: {
          'Title': `New Request: ${payload.reference}`,
          'Priority': 'default',
          'Tags': 'shield,package',
          'Click': `https://spidydashboard.${config.mailDomain}/admin`,
        },
        body: `Reference: ${payload.reference}\nPlan: ${payload.planName} (${payload.amountFormatted})\nOpen admin panel to review and fulfill.`,
      });

      if (res.ok) {
        return { success: true };
      }
    } catch (err: any) {
      console.warn('[Push] ntfy.sh dispatch error:', err.message || err);
    }
  }

  // Fallback to Telegram Bot if configured
  if (config.telegramBotToken && config.telegramChatId) {
    try {
      const telegramUrl = `https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`;
      const messageText = `*SpidyDashboard Request Alert*\n\nReference: \`${payload.reference}\`\nPlan: ${payload.planName} (${payload.amountFormatted})\n\n[Open Admin Panel](https://spidydashboard.${config.mailDomain}/admin)`;

      const res = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.telegramChatId,
          text: messageText,
          parse_mode: 'Markdown',
        }),
      });

      if (res.ok) {
        return { success: true };
      }
    } catch (err: any) {
      console.warn('[Push] Telegram dispatch error:', err.message || err);
    }
  }

  return { success: false, error: 'No active push provider reached' };
}

/**
 * Emergency alert when a bounce or complaint occurs on the owner channel
 */
export async function sendOwnerEmergencyAlert(message: string): Promise<void> {
  const config = getEmailConfig();
  if (config.ntfyTopic) {
    try {
      await fetch(`https://ntfy.sh/${config.ntfyTopic}`, {
        method: 'POST',
        headers: {
          'Title': '⚠️ SpidyDashboard Email Alert',
          'Priority': 'urgent',
          'Tags': 'warning,skull',
        },
        body: message,
      });
    } catch {
      // Ignore background push error
    }
  }
}
