/**
 * Gmail Auto-Responder Daemon
 * Automatically monitors the Gmail inbox (parthxcore@gmail.com) via IMAP,
 * detects incoming inquiries or purchase requests, and auto-replies
 * with SpidyDashboard access links, plan information, and UPI payment details.
 * 
 * "No need to open browser — 100% automated Gmail responses."
 */

import imaps from 'imap-simple';
import { emailService } from './EmailProvider';
import { env } from '../../config/env';

export class GmailAutoResponder {
  private static isRunning = false;
  private static pollTimer: NodeJS.Timeout | null = null;
  private static repliedMessageIds = new Set<string>();

  private static getImapConfig() {
    return {
      imap: {
        user: env.GMAIL_USER,
        password: env.GMAIL_APP_PASSWORD,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 8000,
      },
    };
  }

  /**
   * Starts the background Gmail auto-responder polling loop
   */
  public static start(intervalMs: number = 25000) {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('🤖 [Gmail Auto-Responder] Service initialized.');
    console.log(`📬 Monitoring inbox for: ${env.GMAIL_USER} (polling every ${intervalMs / 1000}s)`);

    // Run first check after a brief 3s delay
    setTimeout(() => {
      this.checkInboxAndReply();
    }, 3000);

    // Continuous polling
    this.pollTimer = setInterval(() => {
      this.checkInboxAndReply();
    }, intervalMs);
  }

  public static stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isRunning = false;
    console.log('⏹️ [Gmail Auto-Responder] Stopped.');
  }

  /**
   * Scans unread messages in the inbox and replies automatically
   */
  private static async checkInboxAndReply() {
    let connection: imaps.ImapSimple | null = null;
    try {
      connection = await imaps.connect(this.getImapConfig());
      await connection.openBox('INBOX');

      // Search for unseen messages from the last 48 hours only to avoid memory exhaustion
      const sinceDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const searchCriteria = ['UNSEEN', ['SINCE', sinceDate]];
      const fetchOptions = {
        bodies: ['HEADER'], // Fetch headers only, never stream giant text bodies into memory
        markSeen: false,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);

      if (messages.length === 0) {
        connection.end();
        return;
      }

      // Limit to latest 10 messages max to prevent memory spikes
      const recentMessages = messages.slice(-10);
      console.log(`📨 [Gmail Auto-Responder] Processing ${recentMessages.length} recent unread email(s).`);

      for (const message of recentMessages) {
        const header = message.parts.find((part) => part.which === 'HEADER');
        if (!header || !header.body) continue;

        const fromHeader = header.body.from?.[0] || '';
        const subject = header.body.subject?.[0] || 'Inquiry';
        const messageId = header.body['message-id']?.[0] || `${message.attributes.uid}`;

        // Extract sender email address from "Name <user@domain.com>" or "user@domain.com"
        const emailMatch = fromHeader.match(/<([^>]+)>/) || [null, fromHeader.trim()];
        const senderEmail = emailMatch[1]?.toLowerCase().trim();

        if (!senderEmail) continue;

        // Ignore self-emails, service bots, Google alerts, payment notifications, and mailer-daemons to avoid loops
        if (
          senderEmail === env.GMAIL_USER.toLowerCase().trim() ||
          senderEmail.includes('no-reply') ||
          senderEmail.includes('noreply') ||
          senderEmail.includes('mailer-daemon') ||
          senderEmail.includes('google.com') ||
          senderEmail.includes('razorpay.com') ||
          senderEmail.includes('github.com') ||
          senderEmail.includes('linkedin.com') ||
          senderEmail.includes('facebookmail.com') ||
          senderEmail.includes('notifications@') ||
          senderEmail.includes('support@') ||
          subject.includes('SpidyDashboard Access & Source Code Details') ||
          subject.includes('Verify your Email')
        ) {
          // Mark seen and skip
          await connection.addFlags(message.attributes.uid, '\\Seen');
          continue;
        }

        if (this.repliedMessageIds.has(messageId)) {
          await connection.addFlags(message.attributes.uid, '\\Seen');
          continue;
        }

        console.log(`🤖 [Gmail Auto-Responder] Auto-responding to ${senderEmail} (Subject: "${subject}")`);

        // Generate response
        const cleanSubject = subject.replace(/^Re:\s*/i, '');
        const replySubject = `Re: ${cleanSubject} — SpidyDashboard Access & Source Code Details`;

        const replyText = `Hello,

Thank you for reaching out regarding SpidyDashboard (OSINT & Attack Surface Dashboard created by Parth Arora, SOC Analyst).

Here is the package and purchase information:

============================================================
1. SPIDYDASHBOARD STANDARD (₹499)
============================================================
Includes:
- Complete step-by-step installation and local setup guide
- Comprehensive architecture and walkthrough video tour
- Full module catalog & documentation
- Personal & educational license

============================================================
2. SPIDYDASHBOARD COMPLETE KIT (₹799)
============================================================
Includes everything in Standard plus:
- Full SpiderFoot-based reconnaissance engine & dashboard source code
- Academic / Technical Project Report (PDF & DOCX)
- Professional PowerPoint presentation (PPTX)
- Viva defense questions & detailed answers

============================================================
PAYMENT & DIRECT ACCESS INSTRUCTIONS:
============================================================
- UPI ID: 8700383626@axl
- Payee Name: Parth Arora
- Amount: ₹499 (Standard) or ₹799 (Complete Kit)

🔒 DIRECT ACCESS DELIVERY:
Access download links are delivered directly after payment confirmation.
Once paid, simply reply to this email with your 12-digit UPI Reference / UTR number or payment screenshot. Parth Arora will personally verify and directly dispatch your private MEGA download repository access link!

If you have any questions or need custom deployment assistance, feel free to reply directly.

Best regards,
Parth Arora (SOC Analyst)
Creator of SpidyDashboard
parthxcore@gmail.com
UPI: 8700383626@axl
`;

        const replyHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; color: #0B0B14; line-height: 1.6;">
  <div style="border-bottom: 2px solid #4F8FF7; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #4F8FF7; margin: 0; font-size: 22px;">SpidyDashboard</h2>
    <span style="font-size: 13px; color: #6B7280;">Automated OSINT & Attack Surface Reconnaissance Engine</span>
  </div>

  <p>Hello,</p>
  <p>Thank you for reaching out regarding <strong>SpidyDashboard</strong>. Here is your package and purchase information:</p>

  <!-- Standard Plan Card -->
  <div style="background: #F4F8FF; border: 1px solid #CFE2FF; border-radius: 14px; padding: 18px; margin: 18px 0;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h3 style="margin: 0; color: #1E3A8A; font-size: 17px;">📦 SpidyDashboard Standard</h3>
      <span style="background: #4F8FF7; color: #ffffff; padding: 3px 10px; border-radius: 20px; font-weight: bold; font-size: 13px;">₹499 one-time</span>
    </div>
    <ul style="margin: 8px 0; padding-left: 20px; font-size: 13px; color: #374151;">
      <li>Step-by-step installation and local setup guide</li>
      <li>Architecture & walkthrough video tour</li>
      <li>Module catalog & docs</li>
      <li>Personal & educational license</li>
    </ul>
  </div>

  <!-- Complete Kit Card -->
  <div style="background: #FAFAFA; border: 1px solid #E5E7EB; border-radius: 14px; padding: 18px; margin: 18px 0;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <h3 style="margin: 0; color: #111827; font-size: 17px;">🚀 Complete Kit (Full Source Code & Viva)</h3>
      <span style="background: #111827; color: #ffffff; padding: 3px 10px; border-radius: 20px; font-weight: bold; font-size: 13px;">₹799 one-time</span>
    </div>
    <ul style="margin: 8px 0; padding-left: 20px; font-size: 13px; color: #374151;">
      <li>Full SpiderFoot-based engine & dashboard source code</li>
      <li>Academic & Technical Project Report (PDF & DOCX)</li>
      <li>Presentation Slides (PPTX)</li>
      <li>Viva defense questions & detailed answers</li>
    </ul>
  </div>

  <!-- Direct Delivery Information -->
  <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 16px; margin: 18px 0;">
    <h4 style="margin: 0 0 6px 0; color: #1E40AF; font-size: 15px;">🔒 Direct Access Delivery:</h4>
    <p style="margin: 0; font-size: 13px; color: #1E3A8A;">
      To prevent unauthorized access, repository access links are sent directly by Parth Arora after payment verification.
    </p>
  </div>

  <!-- Payment Details -->
  <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <h4 style="margin: 0 0 8px 0; color: #92400E; font-size: 15px;">💳 UPI Payment Details:</h4>
    <p style="margin: 3px 0; font-size: 15px; font-family: monospace;"><strong>UPI ID:</strong> 8700383626@axl</p>
    <p style="margin: 3px 0; font-size: 14px;"><strong>Payee Name:</strong> Parth Arora</p>
    <p style="margin: 3px 0; font-size: 14px;"><strong>Amount:</strong> ₹499 (Standard) or ₹799 (Complete Kit)</p>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #78350F; background: #FDE68A; padding: 8px 12px; border-radius: 8px;">
      👉 Once paid, reply to this email with your 12-digit UTR number or screenshot to receive your private MEGA download repository access directly!
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
  <p style="margin: 0; font-size: 13px; font-weight: bold;">Parth Arora (SOC Analyst)</p>
  <p style="margin: 2px 0; font-size: 12px; color: #6B7280;">Creator & Author, SpidyDashboard</p>
  <p style="margin: 2px 0; font-size: 12px; color: #6B7280;">Email: parthxcore@gmail.com &bull; UPI: 8700383626@axl</p>
</div>
`;

        const sendResult = await emailService.sendEmail({
          to: senderEmail,
          subject: replySubject,
          text: replyText,
          html: replyHtml,
        });

        if (sendResult.success) {
          this.repliedMessageIds.add(messageId);
          // Mark email as read in Gmail
          await connection.addFlags(message.attributes.uid, '\\Seen');
          console.log(`✅ [Gmail Auto-Responder] Successfully auto-replied to ${senderEmail}!`);
        }
      }

      connection.end();
    } catch (err: any) {
      console.error('[Gmail Auto-Responder] Polling notice:', err.message || err);
      if (connection) {
        try {
          connection.end();
        } catch {}
      }
    }
  }
}
