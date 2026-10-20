/**
 * SpidyDashboard Secure Checkout & Delivery Server
 */

import express, { type Request, type Response, type NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { securityHeaders, corsMiddleware } from './middleware/security';

import orderRoutes from './routes/orderRoutes';
import downloadRoutes from './routes/downloadRoutes';
import recoveryRoutes from './routes/recoveryRoutes';
import privacyRoutes from './routes/privacyRoutes';
import adminRoutes from './routes/adminRoutes';
import { emailService } from './services/email/EmailProvider';
import { GmailAutoResponder } from './services/email/GmailAutoResponder';

export const app = express();

// 1. Security Headers (CSP, HSTS, noSniff)
app.use(securityHeaders);

// 2. Strict CORS
app.use(corsMiddleware);

// 3. Cookie Parser
app.use(cookieParser(env.ADMIN_SESSION_SECRET));

// 4. Body Parsers with tight payload size limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 5. Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SpidyDashboard Secure Checkout API',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    uniqueAmountMatching: env.UNIQUE_AMOUNT_MATCHING,
  });
});

// 6. Mount API Routers
app.use('/api', orderRoutes);
app.use('/api', downloadRoutes);
app.use('/api', recoveryRoutes);
app.use('/api', privacyRoutes);
app.use('/api', adminRoutes);

// Instant Inquiry / Access Request Endpoint (Uses deliverability-optimized sender)
app.post('/api/inquiry', async (req: Request, res: Response) => {
  try {
    const { email, plan, name, message } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const planName = 'SpidyDashboard, Student Edition (₹999)';

    // Always notify owner of new leads
    const ownerInbox = process.env.OWNER_EMAIL || process.env.ADMIN_ALERT_EMAIL;
    if (ownerInbox) {
      await emailService.sendEmail({
        to: ownerInbox,
        subject: `🔔 [New Website Lead] ${planName} from ${email.trim()}`,
        text: `New Purchase Lead received on SpidyDashboard Website!\n\nEmail: ${email.trim()}\nPlan Requested: ${planName}\nName: ${name || 'Student'}\nMessage: ${message && typeof message === 'string' && message.trim() ? message.trim() : 'Email link request'}\nDate: ${new Date().toLocaleString()}\n\nReply directly to this email to follow up with the student.`,
      }).catch((e) => console.warn('[Inquiry forward warning]:', e));
    }

    const result = await emailService.sendEmail({
      to: email.trim(),
      subject: `[SpidyDashboard] Direct Access & Purchase Details for ${planName}`,
      text: `Hello,

Thank you for your interest in ${planName} created by Parth Arora (SOC Analyst).

Here is your package and purchase information:

📦 SPIDYDASHBOARD, STUDENT EDITION (₹999)
- Windows Setup.exe installer of the dashboard (standalone, nothing extra to install)
- Setup and usage guide (PDF)
- Walkthrough video link
- Project report, PPT and viva Q&A pack
- Lifetime use of the installed version

💳 PAYMENT & DIRECT ACCESS INSTRUCTIONS:
- UPI ID: 8700383626@axl
- Payee Name: Parth Arora
- Amount: ₹999 (one-time payment)

🔒 ACCESS DELIVERY:
To maintain software integrity, access links are delivered directly after payment confirmation.
Once paid, reply to this email with your 12-digit UTR number or payment screenshot. Parth Arora will personally verify and directly dispatch your private package download links!

Best regards,
Parth Arora (SOC Analyst)
hello@spidydashboard.com
UPI: 8700383626@axl
`,
      html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0B0B14; line-height: 1.6;">
  <div style="border-bottom: 2px solid #4F8FF7; padding-bottom: 12px; margin-bottom: 20px;">
    <h2 style="color: #4F8FF7; margin: 0; font-size: 22px;">SpidyDashboard</h2>
    <span style="font-size: 13px; color: #6B7280;">Automated OSINT & Attack Surface Engine &bull; Student Edition</span>
  </div>

  <p>Hello,</p>
  <p>Thank you for requesting access to <strong>${planName}</strong>. Here is your package and purchase information:</p>

  <div style="background: #F4F8FF; border: 1px solid #CFE2FF; border-radius: 14px; padding: 18px; margin: 18px 0;">
    <h3 style="margin: 0 0 10px 0; color: #1E3A8A; font-size: 17px;">📦 Package Deliverables (₹999 One-Time)</h3>
    <ul style="margin: 8px 0; padding-left: 20px; font-size: 13px; color: #374151;">
      <li>Windows Setup.exe installer of the dashboard (runs standalone with nothing extra to install)</li>
      <li>Setup and usage guide (PDF)</li>
      <li>Walkthrough video link</li>
      <li>Project report, PPT and viva Q&A pack</li>
      <li>Lifetime use of the installed version</li>
    </ul>
  </div>

  <div style="background: #FEF3C7; border: 1px solid #FCD34D; border-radius: 12px; padding: 16px; margin: 20px 0;">
    <h4 style="margin: 0 0 8px 0; color: #92400E; font-size: 15px;">💳 UPI Payment Details:</h4>
    <p style="margin: 4px 0; font-size: 15px; font-family: monospace;"><strong>UPI ID:</strong> 8700383626@axl</p>
    <p style="margin: 4px 0; font-size: 14px;"><strong>Payee Name:</strong> Parth Arora</p>
    <p style="margin: 4px 0; font-size: 14px;"><strong>Amount:</strong> ₹999 (one-time payment)</p>
    <p style="margin: 10px 0 0 0; font-size: 12px; color: #78350F; background: #FDE68A; padding: 8px 12px; border-radius: 8px;">
      👉 After paying, reply to this email with your 12-digit UTR number or screenshot to receive your download links directly.
    </p>
  </div>

  <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
  <p style="margin: 0; font-size: 13px; font-weight: bold;">Parth Arora (SOC Analyst)</p>
  <p style="margin: 2px 0; font-size: 12px; color: #6B7280;">Email: hello@spidydashboard.com &bull; UPI: 8700383626@axl</p>
</div>
`,
    });

    return res.json({
      success: result.success,
      message: 'Payment instructions and direct access details have been dispatched to your email!',
    });
  } catch (err: any) {
    console.error('[Inquiry API Error]:', err);
    return res.status(500).json({ error: 'Failed to dispatch email. Please try again or email hello@spidydashboard.com directly.' });
  }
});

// 7. 404 Handler for unmatched API routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// 8. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server] Unhandled error:', err.message || err);
  res.status(err.status || 500).json({
    error: env.NODE_ENV === 'production' ? 'An unexpected error occurred. Please try again.' : err.message,
  });
});

// Start listening if run directly
if (process.env.NODE_ENV !== 'test') {
  const PORT = env.PORT;
  app.listen(PORT, () => {
    console.log(`\n🛡️  SpidyDashboard Checkout Engine running on port ${PORT}`);
    console.log(`🌐 Client Origin: ${env.CLIENT_ORIGIN}`);
    console.log(`📧 Outgoing Email Service: Active (Gmail SMTP: ${env.GMAIL_USER})`);
    console.log(`💳 UPI Provider: Manual UPI (VPA: ${env.MERCHANT_UPI_ID.slice(0, 4)}***)`);
    console.log(`🔐 Admin Panel API: http://localhost:${PORT}/api/admin\n`);

    // Start background Gmail auto-responder daemon
    if (env.GMAIL_AUTO_RESPONDER && env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
      GmailAutoResponder.start(25000); // Check inbox every 25 seconds
    }
  });
}
