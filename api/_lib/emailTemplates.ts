/**
 * EMAIL TEMPLATE BUILDER
 * Deliverability-focused, multipart templates with strict anti-spam compliance,
 * balanced text-to-HTML ratio, and injection-proof sanitization.
 */

import { escapeHtml, defangUrls, stripHeaderInjection } from './sanitizer';

export interface EmailPayload {
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
}

export interface RequestEmailContext {
  reference: string;
  planId: string;
  planName: string;
  amountFormatted: string;
  buyerName: string;
  buyerEmail: string;
  buyerMessage?: string;
  mailDomain: string;
  timestamp?: string;
}

/**
 * Builds Email (A): Owner Notification to Parth's Gmail
 * Purpose: Notifies the owner of a new buyer request with full details,
 * defanged links, and validated reply-to.
 */
export function buildOwnerNotificationEmail(ctx: RequestEmailContext): EmailPayload {
  const sanitizedRef = stripHeaderInjection(ctx.reference);
  const cleanPlan = stripHeaderInjection(ctx.planName);
  const cleanBuyerName = stripHeaderInjection(ctx.buyerName) || 'Customer';
  const cleanBuyerEmail = stripHeaderInjection(ctx.buyerEmail);

  // Defang buyer description/message
  const { defanged: defangedMessage, hasLinks } = defangUrls(ctx.buyerMessage || '');
  const escapedMessage = escapeHtml(defangedMessage);

  // Subject: strictly formatted, no buyer-supplied text, no spam words, stable pattern
  const subject = `New request ${sanitizedRef} (${cleanPlan})`;

  const dateHeader = new Date().toUTCString();
  const messageId = `<owner.${sanitizedRef.toLowerCase()}.${Date.now()}@mail.${ctx.mailDomain}>`;

  // Headers: Valid RFC 5322, no Auto-Submitted on owner email (preserves Gmail priority)
  const headers: Record<string, string> = {
    'Message-ID': messageId,
    'Date': dateHeader,
    'MIME-Version': '1.0',
    'Content-Language': 'en-US',
    'X-Entity-Ref-ID': sanitizedRef,
  };

  // Plain-Text Part (approx. 110-140 words, balanced)
  const text = `SpidyDashboard New Request Notification

Reference: ${sanitizedRef}
Plan: ${cleanPlan}
Amount: ${ctx.amountFormatted}
Buyer Name: ${cleanBuyerName}
Buyer Email: ${cleanBuyerEmail}

Buyer Message:
${hasLinks ? '[WARNING: Contains a link, do not click]\n' : ''}${defangedMessage ? defangedMessage : 'No additional message provided.'}

Next Step:
Verify payment against bank records (UTR) and provide fulfillment links from the admin panel:
https://spidydashboard.${ctx.mailDomain}/admin

--
SpidyDashboard Internal Operations
Automated system notification for owner review.`;

  // Clean, dark-mode safe HTML Part (600px max, system fonts, 16px text)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.5; color: #111111;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 28px 24px;">
    
    <div style="border-bottom: 2px solid #2563EB; padding-bottom: 14px; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827;">New Purchase Request</h2>
      <span style="font-size: 14px; color: #6B7280; font-family: monospace;">${escapeHtml(sanitizedRef)}</span>
    </div>

    <p style="margin: 0 0 16px 0;">You have received a new verified request for SpidyDashboard.</p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <tr style="border-bottom: 1px solid #F3F4F6;">
        <td style="padding: 8px 0; color: #6B7280; width: 140px;">Reference:</td>
        <td style="padding: 8px 0; font-weight: 600; font-family: monospace; color: #111827;">${escapeHtml(sanitizedRef)}</td>
      </tr>
      <tr style="border-bottom: 1px solid #F3F4F6;">
        <td style="padding: 8px 0; color: #6B7280;">Plan:</td>
        <td style="padding: 8px 0; font-weight: 600; color: #111827;">${escapeHtml(cleanPlan)} (${escapeHtml(ctx.amountFormatted)})</td>
      </tr>
      <tr style="border-bottom: 1px solid #F3F4F6;">
        <td style="padding: 8px 0; color: #6B7280;">Buyer:</td>
        <td style="padding: 8px 0; color: #111827;">${escapeHtml(cleanBuyerName)} &lt;${escapeHtml(cleanBuyerEmail)}&gt;</td>
      </tr>
    </table>

    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; margin-bottom: 22px;">
      <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; color: #6B7280; display: block; margin-bottom: 6px;">Buyer Notes:</span>
      ${
        hasLinks
          ? '<p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 700; color: #DC2626;">[Contains a link, do not click]</p>'
          : ''
      }
      <div style="font-family: monospace; font-size: 13px; color: #374151; white-space: pre-wrap; word-break: break-word;">${escapedMessage || 'No additional note provided.'}</div>
    </div>

    <p style="margin: 0 0 20px 0; font-size: 15px;">
      Hit Reply to email the buyer directly, or manage this order in your admin dashboard:
    </p>

    <div style="margin-bottom: 24px;">
      <a href="https://spidydashboard.${escapeHtml(ctx.mailDomain)}/admin" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
        Open Admin Panel
      </a>
    </div>

    <div style="border-top: 1px solid #E5E7EB; padding-top: 14px; font-size: 12px; color: #9CA3AF;">
      You are receiving this operational alert because you are the administrator of SpidyDashboard.
    </div>

  </div>
</body>
</html>`;

  return { subject, html, text, headers };
}

/**
 * Builds Email (B): Buyer Confirmation Email
 * Purpose: Confirms receipt of the buyer's request with personal, conversational tone,
 * clear summary table, next steps, and legitimate inbox-placement optimization.
 */
export function buildBuyerConfirmationEmail(ctx: RequestEmailContext): EmailPayload {
  const sanitizedRef = stripHeaderInjection(ctx.reference);
  const cleanPlan = stripHeaderInjection(ctx.planName);
  const cleanBuyerName = stripHeaderInjection(ctx.buyerName) || 'there';

  // Subject: simple, respectful, stable reference pattern, no spam triggers
  const subject = `We received your request ${sanitizedRef}`;

  const dateHeader = new Date().toUTCString();
  const messageId = `<buyer.${sanitizedRef.toLowerCase()}.${Date.now()}@mail.${ctx.mailDomain}>`;

  // Headers: Valid RFC 5322, with Auto-Submitted header for buyer automated confirmation
  const headers: Record<string, string> = {
    'Message-ID': messageId,
    'Date': dateHeader,
    'MIME-Version': '1.0',
    'Content-Language': 'en-US',
    'Auto-Submitted': 'auto-generated',
    'X-Entity-Ref-ID': sanitizedRef,
  };

  // Plain-Text Part (conversational, first-person, ~120 words)
  const text = `Hi ${cleanBuyerName},

Thank you for your interest in SpidyDashboard. I have received your request and recorded your reference details.

Request Details:
- Reference: ${sanitizedRef}
- Plan: ${cleanPlan}
- Amount: ${ctx.amountFormatted}

Next Step:
I review requests and bank transfers manually to verify payment details and issue secure package links. Once verified, your personalized delivery links will be sent to this email address.

If you have already transferred the payment or have any questions about the setup, reply directly to this email with your transaction ID or note.

Best regards,
Parth Arora
Security Analyst & Creator of SpidyDashboard
parthxcore@gmail.com

--
You are receiving this because you submitted a request on spidydashboard.${ctx.mailDomain}.
Privacy Policy: https://spidydashboard.${ctx.mailDomain}/privacy`;

  // HTML Part (clean, 16px, dark-mode friendly, single link to status page)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F8F9FA; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #111111;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 12px; padding: 28px 24px;">
    
    <div style="border-bottom: 2px solid #2563EB; padding-bottom: 12px; margin-bottom: 20px;">
      <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827;">SpidyDashboard</h2>
      <span style="font-size: 13px; color: #6B7280;">Automated Reconnaissance Dashboard</span>
    </div>

    <p style="margin: 0 0 16px 0;">Hi ${escapeHtml(cleanBuyerName)},</p>

    <p style="margin: 0 0 16px 0;">
      Thank you for your interest in SpidyDashboard. I have received your request and recorded your reference details below:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
      <tr style="border-bottom: 1px solid #F3F4F6;">
        <td style="padding: 8px 0; color: #6B7280; width: 140px;">Order Reference:</td>
        <td style="padding: 8px 0; font-weight: 600; font-family: monospace; color: #111827;">${escapeHtml(sanitizedRef)}</td>
      </tr>
      <tr style="border-bottom: 1px solid #F3F4F6;">
        <td style="padding: 8px 0; color: #6B7280;">Selected Package:</td>
        <td style="padding: 8px 0; font-weight: 600; color: #111827;">${escapeHtml(cleanPlan)}</td>
      </tr>
      <tr style="border-bottom: 1px solid #F3F4F6;">
        <td style="padding: 8px 0; color: #6B7280;">Total:</td>
        <td style="padding: 8px 0; font-weight: 600; color: #111827;">${escapeHtml(ctx.amountFormatted)}</td>
      </tr>
    </table>

    <div style="background-color: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #1F2937;">Next Step</h3>
      <p style="margin: 0; font-size: 14px; color: #4B5563;">
        Payments are verified manually against bank records. Once verified, your personalized package access links will be delivered directly to this email address.
      </p>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 14px; color: #4B5563;">
      Reply directly to this email if anything looks wrong or if you have already transferred your payment reference.
    </p>

    <div style="margin-bottom: 24px;">
      <a href="https://spidydashboard.${escapeHtml(ctx.mailDomain)}/orders/${escapeHtml(sanitizedRef)}" style="display: inline-block; background-color: #111827; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 8px;">
        View Order Status Online
      </a>
    </div>

    <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111827;">Parth Arora</p>
    <p style="margin: 0 0 20px 0; font-size: 13px; color: #6B7280;">Creator of SpidyDashboard</p>

    <div style="border-top: 1px solid #E5E7EB; padding-top: 14px; font-size: 12px; color: #9CA3AF; line-height: 1.4;">
      <p style="margin: 0 0 4px 0;">You are receiving this because you submitted a request on spidydashboard.${escapeHtml(ctx.mailDomain)}.</p>
      <p style="margin: 0;">Contact: parthxcore@gmail.com &bull; <a href="https://spidydashboard.${escapeHtml(ctx.mailDomain)}/privacy" style="color: #6B7280; text-decoration: underline;">Privacy Policy</a></p>
    </div>

  </div>
</body>
</html>`;

  return { subject, html, text, headers };
}
