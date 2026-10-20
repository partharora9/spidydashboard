/**
 * Payment Gateway Stub Provider (e.g. Cashfree, PhonePe, Razorpay, Instamojo)
 *
 * Demonstrates how a commercial gateway drops into SpidyDashboard seamlessly:
 * 1. Implement PaymentProvider interface.
 * 2. On createPaymentRequest: calls gateway REST API to create a checkout session / order.
 * 3. On webhook callback: gateway verifies webhook signature, calls deliveryService.approveAndDeliver(orderId).
 * The core checkout, storage, tokenized delivery, and DPDP privacy logic require ZERO changes!
 */

import {
  type PaymentProvider,
  type PaymentRequestResult,
  type PaymentSubmissionData,
  type PaymentVerificationResult,
} from './PaymentProvider';
import { type OrderRow } from '../../db';
import { PaiseAllocator } from '../paiseAllocator';

export class GatewayStubProvider implements PaymentProvider {
  readonly id = 'gateway_stub';
  readonly name = 'Automated Payment Gateway (Cashfree / PhonePe / Razorpay Stub)';

  async createPaymentRequest(order: OrderRow): Promise<PaymentRequestResult> {
    const formattedAmount = PaiseAllocator.formatAmountINR(order.total_amount_cents);

    // In a real gateway implementation:
    // const response = await fetch('https://api.cashfree.com/pg/orders', {
    //   headers: { 'x-client-id': env.GATEWAY_KEY, 'x-client-secret': env.GATEWAY_SECRET },
    //   body: JSON.stringify({ order_id: order.id, order_amount: order.total_amount_cents / 100, ... })
    // });
    // return { redirectUrl: response.payment_link, ... };

    const mockSessionId = `session_stub_${order.reference}`;
    const redirectUrl = `https://checkout.gateway.example/pay/${mockSessionId}`;

    return {
      provider: this.id,
      redirectUrl,
      exactAmountFormatted: formattedAmount,
      reference: order.reference,
      instructions: `Redirecting to automated payment gateway for instant delivery...`,
    };
  }

  async submitProof(_order: OrderRow, _data: PaymentSubmissionData): Promise<PaymentVerificationResult> {
    // When using a real gateway, webhook signature verification handles this automatically:
    // verifyWebhookSignature(req.headers['x-webhook-signature'], req.rawBody);
    return {
      success: true,
      status: 'approved',
      message: 'Automated gateway confirms payment instant settlement.',
    };
  }

  async refund(order: OrderRow, reason: string): Promise<{ success: boolean; message: string }> {
    // Real gateway: await fetch(`https://api.cashfree.com/pg/orders/${order.id}/refunds`, ...)
    return {
      success: true,
      message: `Gateway API refund initiated for order ${order.reference}: ${reason}`,
    };
  }
}

export const gatewayStubProvider = new GatewayStubProvider();
