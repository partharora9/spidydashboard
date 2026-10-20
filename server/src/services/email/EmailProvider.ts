/**
 * Transactional Email Provider
 * Supports Resend, AWS SES, and local console logging.
 * STRICT PRIVACY: Transactional only, no marketing without explicit opt-in, no file attachments (links only).
 */

import { env } from '../../config/env';

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailProvider {
  sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string }>;
}

export class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId: string }> {
    const id = `msg_${Date.now()}`;
    console.log('\n================== [TRANSACTIONAL EMAIL DISPATCHED] ==================');
    console.log(`To: ${message.to}`);
    console.log(`Subject: ${message.subject}`);
    console.log('--- Plaintext Preview ---');
    console.log(message.text.slice(0, 350) + (message.text.length > 350 ? '...' : ''));
    console.log('======================================================================\n');
    return { success: true, messageId: id };
  }
}

export class ResendEmailProvider implements EmailProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string }> {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.EMAIL_FROM,
          to: message.to,
          subject: message.subject,
          text: message.text,
          html: message.html || `<div style="font-family: sans-serif; white-space: pre-wrap;">${message.text}</div>`,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error('[Resend] Email dispatch failed:', err);
        return { success: false };
      }

      const data = (await res.json()) as { id: string };
      return { success: true, messageId: data.id };
    } catch (err) {
      console.error('[Resend] Network error sending email:', err);
      return { success: false };
    }
  }
}

import nodemailer, { type Transporter } from 'nodemailer';

export class GmailEmailProvider implements EmailProvider {
  private transporter: Transporter;

  constructor(user: string, pass: string) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  async sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string }> {
    try {
      const info = await this.transporter.sendMail({
        from: env.EMAIL_FROM || `Parth Arora <${env.GMAIL_USER}>`,
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      console.log(`[Gmail SMTP] Dispatched automated email to: ${message.to} (ID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error('[Gmail SMTP] Failed to send email via Gmail:', err.message || err);
      return { success: false };
    }
  }
}

export const emailService: EmailProvider =
  env.EMAIL_PROVIDER === 'gmail' && env.GMAIL_USER && env.GMAIL_APP_PASSWORD
    ? new GmailEmailProvider(env.GMAIL_USER, env.GMAIL_APP_PASSWORD)
    : env.EMAIL_PROVIDER === 'resend' && env.RESEND_API_KEY
    ? new ResendEmailProvider(env.RESEND_API_KEY)
    : new ConsoleEmailProvider();

/**
 * Standard Email Templates
 */
export const EmailTemplates = {
  orderPendingBuyer(orderRef: string, planName: string, amountFormatted: string) {
    const subject = `[SpidyDashboard] Payment Verification Pending (${orderRef})`;
    const text = `Hello,\n\nWe have received your payment reference for ${planName} (${amountFormatted}).\n\nOrder Reference: ${orderRef}\n\nYour transaction is currently undergoing bank statement verification. Manual verification is typically completed within a few hours. Once verified, you will immediately receive your secure download token.\n\nThank you for supporting SpidyDashboard.\n\nParth Arora (SOC Analyst)\nSpidyDashboard Reconnaissance\nPrivacy & Terms: ${env.CLIENT_ORIGIN}/privacy`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0B0B14; line-height: 1.6;">
        <h2 style="color: #4F8FF7; margin-bottom: 8px;">SpidyDashboard</h2>
        <h3 style="margin-top: 0;">Payment Verification Pending</h3>
        <p>Hello,</p>
        <p>We have successfully received your payment reference for <strong>${planName}</strong> (${amountFormatted}).</p>
        <div style="background: #F5F5F7; padding: 16px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; font-family: monospace; font-size: 15px;"><strong>Order Reference:</strong> ${orderRef}</p>
        </div>
        <p>Your transaction is currently undergoing manual bank statement verification (typically within a few hours). You will receive an immediate email with your secure download link once confirmed.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 28px 0;" />
        <p style="font-size: 12px; color: #6B7280;">This is a transactional email regarding your SpidyDashboard order. <a href="${env.CLIENT_ORIGIN}/privacy" style="color: #4F8FF7;">Privacy Policy</a> &bull; <a href="${env.CLIENT_ORIGIN}/terms" style="color: #4F8FF7;">Terms of Service</a></p>
      </div>
    `;
    return { subject, text, html };
  },

  orderApprovedDelivery(
    orderRef: string,
    planName: string,
    downloadLink: string,
    checksum: string,
    expiryMins: number,
    deliveryLinks?: { label: string; url: string; description?: string }[]
  ) {
    const subject = `[SpidyDashboard] Your Desktop Application & Study Material Access (${orderRef})`;

    let linksText = '';
    let linksHtml = '';

    if (deliveryLinks && deliveryLinks.length > 0) {
      linksText = '\n\nYOUR UNLOCKED PACKAGE LINKS:\n' +
        deliveryLinks.map((l, i) => `${i + 1}. ${l.label}:\n${l.url}\n(${l.description || ''})`).join('\n\n') + '\n';

      linksHtml = `
        <div style="background: #F0FDF4; border: 1px solid #86EFAC; padding: 20px; border-radius: 14px; margin: 20px 0;">
          <h4 style="margin: 0 0 12px 0; color: #166534; font-size: 16px;">🎁 Unlocked Package & Download Access:</h4>
          ${deliveryLinks.map((l) => `
            <div style="background: #FFFFFF; border: 1px solid #BBF7D0; border-radius: 10px; padding: 14px; margin-bottom: 10px;">
              <div style="font-weight: bold; color: #15803D; font-size: 14px; margin-bottom: 4px;">${l.label}</div>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #4B5563;">${l.description || ''}</p>
              <a href="${l.url}" style="display: inline-block; background: #16A34A; color: #FFFFFF; font-weight: 600; text-decoration: none; padding: 8px 18px; border-radius: 20px; font-size: 13px;">Open & Download &rarr;</a>
              <div style="margin-top: 6px; font-family: monospace; font-size: 11px; color: #6B7280; word-break: break-all;">${l.url}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    const text = `Hello,\n\nYour payment for ${planName} has been verified and approved!\n\nOrder Reference: ${orderRef}${linksText}\nDirect Platform Download Link:\n${downloadLink}\n\nIMPORTANT SECURITY NOTICES:\n- File SHA-256 Checksum: ${checksum}\n- Token Link Expiry: 48 hours (max 3 downloads)\n- A personalized LICENSE-BUYER.txt is embedded with your order reference.\n\nNeed to re-download later? Visit our recovery portal anytime: ${env.CLIENT_ORIGIN}/recover\n\nThank you for purchasing SpidyDashboard.\n\nParth Arora (SOC Analyst)\nSpidyDashboard Reconnaissance`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0B0B14; line-height: 1.6;">
        <h2 style="color: #4F8FF7; margin-bottom: 8px;">SpidyDashboard</h2>
        <h3 style="margin-top: 0; color: #10B981;">Your Order Has Been Approved!</h3>
        <p>Hello,</p>
        <p>Your payment for <strong>${planName}</strong> has been successfully verified.</p>
        
        ${linksHtml}

        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 16px; border-radius: 14px; margin: 20px 0; text-align: center;">
          <a href="${downloadLink}" style="display: inline-block; background: #2563EB; color: #FFFFFF; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 30px; font-size: 15px;">Direct Platform Token Download</a>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748B;">Valid for 48 hours &bull; Maximum 3 downloads</p>
        </div>

        <div style="background: #F5F5F7; padding: 14px; border-radius: 12px; margin: 20px 0; font-size: 12px;">
          <p style="margin: 0 0 4px 0;"><strong>SHA-256 Release Checksum:</strong></p>
          <code style="word-break: break-all; color: #374151;">${checksum}</code>
        </div>

        <p style="font-size: 13px; color: #4B5563;">Returning buyers can also recover access anytime using our <a href="${env.CLIENT_ORIGIN}/recover" style="color: #4F8FF7;">Recovery Portal</a> with an email code.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 28px 0;" />
        <p style="font-size: 12px; color: #6B7280;">Built on SpiderFoot, MIT License. Created by Parth Arora (SOC Analyst). <a href="${env.CLIENT_ORIGIN}/privacy" style="color: #4F8FF7;">Privacy Policy</a></p>
      </div>
    `;
    return { subject, text, html };
  },

  orderRejected(orderRef: string, reason: string) {
    const subject = `[SpidyDashboard] Order Verification Notice (${orderRef})`;
    const text = `Hello,\n\nYour order (${orderRef}) could not be verified for the following reason:\n${reason}\n\nIf you believe this is an error or your transaction completed successfully, please reply to this email with your bank statement screenshot or contact Parth Arora directly.\n\nThank you,\nSpidyDashboard Support`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0B0B14; line-height: 1.6;">
        <h2 style="color: #EF4444; margin-bottom: 8px;">SpidyDashboard</h2>
        <h3 style="margin-top: 0;">Order Verification Update</h3>
        <p>Hello,</p>
        <p>Your order <strong>${orderRef}</strong> could not be verified:</p>
        <div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 14px; margin: 20px 0; color: #991B1B;">
          ${reason}
        </div>
        <p>If you have already paid or believe this is an error, please reach out to us with your bank reference details.</p>
      </div>
    `;
    return { subject, text, html };
  },

  otpVerificationCode(targetEmail: string, code: string, purposeText: string) {
    const subject = `[SpidyDashboard] Your Verification Code: ${code}`;
    const text = `Hello,\n\nYour one-time verification code for ${purposeText} is: ${code}\n\nThis code will expire in ${env.OTP_EXPIRY_MINUTES} minutes. If you did not request this, please ignore this email.\n\nSpidyDashboard Security`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0B0B14; line-height: 1.6;">
        <h2 style="color: #4F8FF7; margin-bottom: 8px;">SpidyDashboard</h2>
        <h3>One-Time Verification Code</h3>
        <p>Use the following 6-digit code for <strong>${purposeText}</strong>:</p>
        <div style="background: #F5F5F7; padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center;">
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0B0B14;">${code}</span>
        </div>
        <p style="font-size: 13px; color: #6B7280;">Expires in ${env.OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.</p>
      </div>
    `;
    return { subject, text, html };
  },

  adminNewOrderAlert(orderRef: string, planName: string, amountFormatted: string, utr: string, buyerEmail: string) {
    const subject = `🔔 [ACTION REQUIRED] New Payment for Verification: ${orderRef} (${amountFormatted})`;
    const text = `New pending order awaiting admin verification!\n\nReference: ${orderRef}\nPlan: ${planName}\nAmount: ${amountFormatted}\nUTR: ${utr}\nBuyer Email: ${buyerEmail}\nTime: ${new Date().toISOString()}\n\nVerify with your bank app, then approve in your Admin Panel: ${env.CLIENT_ORIGIN}/admin`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h3>🔔 New Order Awaiting Bank Statement Verification</h3>
        <ul>
          <li><strong>Reference:</strong> ${orderRef}</li>
          <li><strong>Plan:</strong> ${planName}</li>
          <li><strong>Exact Amount:</strong> ${amountFormatted}</li>
          <li><strong>UTR:</strong> <code>${utr}</code></li>
          <li><strong>Buyer Email:</strong> ${buyerEmail}</li>
        </ul>
        <p><a href="${env.CLIENT_ORIGIN}/admin" style="display:inline-block; padding: 10px 20px; background: #4F8FF7; color: #fff; text-decoration: none; border-radius: 20px;">Open Admin Panel</a></p>
      </div>
    `;
    return { subject, text, html };
  },
};
