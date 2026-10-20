/**
 * Manual UPI Payment Provider with Admin Verification
 * 
 * SECURITY & PRIVACY NOTICE:
 * A UPI ID (VPA) inherently reveals the recipient's bank-registered name to the payer in their UPI app.
 * It may also reveal a mobile number if using phone-based VPAs (e.g. 9876543210@paytm).
 * RECOMMENDATION: Use a dedicated business VPA (e.g. spidydashboard@okhdfcbank) to protect personal mobile number.
 */

import QRCode from 'qrcode';
import {
  type PaymentProvider,
  type PaymentRequestResult,
  type PaymentSubmissionData,
  type PaymentVerificationResult,
} from './PaymentProvider';
import { db, type OrderRow } from '../../db';
import { env } from '../../config/env';
import { PaiseAllocator } from '../paiseAllocator';

export class ManualUpiProvider implements PaymentProvider {
  readonly id = 'manual_upi';
  readonly name = 'Manual UPI with Admin Bank Statement Verification';

  async createPaymentRequest(order: OrderRow): Promise<PaymentRequestResult> {
    const vpa = env.MERCHANT_UPI_ID;
    const payeeName = env.MERCHANT_NAME;
    const exactAmount = (order.total_amount_cents / 100).toFixed(2);
    const orderRef = order.reference;
    const cleanVpa = vpa.trim();

    // NPCI UPI Specification: pa parameter MUST keep literal '@' (e.g. 8700383626@axl).
    // Encoding '@' as '%40' prevents GPay / PhonePe / Paytm scanners from recognizing the VPA.
    const upiUri = `upi://pay?pa=${cleanVpa}&pn=${encodeURIComponent(payeeName)}&am=${exactAmount}&cu=INR&tn=${encodeURIComponent(orderRef)}`;

    // Generate QR Code data URL (errorCorrectionLevel 'M' gives optimal scannability from monitor screens)
    let qrCodeDataUrl: string;
    try {
      qrCodeDataUrl = await QRCode.toDataURL(upiUri, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 320,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (err) {
      console.error('[ManualUpiProvider] QR Generation failed:', err);
      qrCodeDataUrl = '';
    }

    const exactAmountFormatted = PaiseAllocator.formatAmountINR(order.total_amount_cents);

    return {
      provider: this.id,
      vpa: cleanVpa,
      upiUri,
      qrCodeDataUrl,
      exactAmountFormatted,
      reference: orderRef,
      instructions: `Scan with Google Pay, PhonePe, Paytm, or BHIM. Transfer exactly ${exactAmountFormatted} with note ${orderRef}.`,
    };
  }

  async submitProof(order: OrderRow, data: PaymentSubmissionData): Promise<PaymentVerificationResult> {
    const utr = data.utr?.trim();

    if (!utr) {
      throw new Error('UTR (12-digit transaction ID) is required.');
    }

    // Strict 12-digit validation standard for Indian UPI banking
    if (!/^\d{12}$/.test(utr)) {
      throw new Error('Invalid UTR format. A valid UPI transaction ID (UTR) must be exactly 12 numeric digits.');
    }

    // Check for duplicate UTRs across all other orders (prevents replay / fraud)
    const existing = db.getPaymentByUtr(utr);
    if (existing && existing.order_id !== order.id) {
      const existingOrder = db.getOrderById(existing.order_id);
      if (existingOrder && existingOrder.status !== 'rejected') {
        throw new Error('This UTR / Transaction ID has already been submitted for another order. Fraudulent submissions are blocked.');
      }
    }

    // Record payment submission
    db.updatePaymentUtr(order.id, utr);

    // Transition order state to pending_verification
    db.updateOrderStatus(order.id, 'pending_verification');

    // Create audit log entry
    db.createAudit({
      action: 'SUBMIT_UTR',
      order_reference: order.reference,
      actor: `buyer:${order.buyer_email}`,
      details: {
        utr_masked: `${utr.slice(0, 3)}******${utr.slice(9)}`, // Never log full UTR
        amount_cents: order.total_amount_cents,
      },
    });

    return {
      success: true,
      status: 'pending_verification',
      message: 'Payment reference submitted. Your order is now awaiting bank statement verification.',
    };
  }

  async refund(order: OrderRow, reason: string): Promise<{ success: boolean; message: string }> {
    db.updateOrderStatus(order.id, 'refunded', { rejection_reason: reason });
    db.createAudit({
      action: 'MARK_REFUNDED',
      order_reference: order.reference,
      actor: 'admin',
      details: { reason },
    });
    return {
      success: true,
      message: 'Order marked as refunded. Please process the UPI refund manually through your bank app.',
    };
  }
}

export const manualUpiProvider = new ManualUpiProvider();
