/**
 * Payment Provider Abstraction
 * Decouples the order lifecycle and file delivery from the underlying payment mechanism.
 * Current implementation: ManualUpiProvider (admin verified)
 * Future implementations: CashfreeProvider, PhonePeProvider, RazorpayProvider
 */

import { type OrderRow } from '../../db';

export interface PaymentRequestResult {
  provider: string;
  vpa?: string;
  upiUri?: string;
  qrCodeDataUrl?: string;
  redirectUrl?: string;
  exactAmountFormatted: string;
  reference: string;
  instructions: string;
}

export interface PaymentSubmissionData {
  utr?: string;
  screenshotBuffer?: Buffer;
  screenshotMimeType?: string;
  screenshotData?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: 'pending_verification' | 'approved' | 'rejected';
  message: string;
}

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;

  /**
   * Generates the payment intent, QR code, or checkout link for the given order.
   */
  createPaymentRequest(order: OrderRow): Promise<PaymentRequestResult>;

  /**
   * Submits proof of payment (e.g. UTR or transaction ID) from the buyer.
   */
  submitProof(order: OrderRow, data: PaymentSubmissionData): Promise<PaymentVerificationResult>;

  /**
   * Initiates a refund if supported by the provider.
   */
  refund(order: OrderRow, reason: string): Promise<{ success: boolean; message: string }>;
}
