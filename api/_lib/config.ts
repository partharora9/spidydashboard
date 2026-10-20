/**
 * EMAIL DELIVERABILITY & BACKEND CONFIGURATION
 * Strict environment parsing for Resend, sender identities, and notification channels.
 */

export interface AppEmailConfig {
  resendApiKey: string;
  ownerEmail: string;
  mailDomain: string;
  fromRequests: string;
  fromHello: string;
  replyToHello: string;
  ntfyTopic?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  resendWebhookSecret?: string;
  adminSecret: string;
}

export function getEmailConfig(): AppEmailConfig {
  const mailDomain = process.env.MAIL_DOMAIN || 'spidydashboard.com';
  const ownerEmail = process.env.OWNER_EMAIL || process.env.GMAIL_USER || 'parthxcore@gmail.com';
  const fromRequests = process.env.FROM_REQUESTS || `SpidyDashboard <requests@mail.${mailDomain}>`;
  const fromHello = process.env.FROM_HELLO || `SpidyDashboard <hello@mail.${mailDomain}>`;
  const replyToHello = process.env.REPLY_TO_HELLO || 'parthxcore@gmail.com';
  const resendApiKey = process.env.RESEND_API_KEY || '';
  const ntfyTopic = process.env.NTFY_TOPIC || 'spidydashboard-requests';
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const resendWebhookSecret = process.env.RESEND_WEBHOOK_SECRET || '';
  const adminSecret = process.env.ADMIN_SECRET || 'dev-admin-secret-key-32-chars-long!';

  return {
    resendApiKey,
    ownerEmail,
    mailDomain,
    fromRequests,
    fromHello,
    replyToHello,
    ntfyTopic,
    telegramBotToken,
    telegramChatId,
    resendWebhookSecret,
    adminSecret,
  };
}
