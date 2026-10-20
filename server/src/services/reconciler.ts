/**
 * Bank Statement CSV / Text Reconciler Helper
 * 
 * Auto-suggests candidate matches from pasted bank statement text or CSV rows by:
 * 1. Exact 12-digit UTR match
 * 2. Exact paise-level unique amount match (e.g. Rs 999.37)
 * 3. Order reference match in transaction remarks (e.g. 'SPIDY-7K3Q9')
 * 
 * IMPORTANT SECURITY INVARIANT:
 * This helper ONLY generates suggestions. A human admin MUST explicitly click "Approve"
 * to trigger the delivery flow. It never automatically approves orders.
 */

import { db } from '../db';
import { PaiseAllocator } from './paiseAllocator';

export interface BankStatementLine {
  rawLine: string;
  extractedUtr?: string;
  extractedAmountCents?: number;
  extractedReference?: string;
}

export interface ReconciliationMatch {
  rawLine: string;
  orderId: string;
  orderReference: string;
  buyerEmail: string;
  plan: string;
  orderAmountFormatted: string;
  submittedUtr?: string;
  statementUtr?: string;
  matchType: 'EXACT_UTR_AND_AMOUNT' | 'EXACT_UTR' | 'EXACT_PAISE_AMOUNT' | 'ORDER_REF_IN_NARRATION';
  confidencePercent: number;
  explanation: string;
}

export class BankStatementReconciler {
  /**
   * Parses raw statement text or CSV content and maps candidate lines.
   */
  static parseStatementText(content: string): BankStatementLine[] {
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    const parsed: BankStatementLine[] = [];

    for (const line of lines) {
      // 1. Extract potential 12-digit UTR (standard UPI transaction reference)
      const utrMatch = line.match(/\b([0-9]{12})\b/);

      // 2. Extract potential Spidy order reference (e.g. SPIDY-7K3Q9)
      const refMatch = line.match(/\b(SPIDY-[A-Z0-9]{4,8})\b/i);

      // 3. Extract amounts (e.g. 999.37, 999.00, 999)
      // Searches for numbers with optional decimal places
      const amountMatches = line.match(/\b([1-9][0-9]{2,4}(?:\.[0-9]{2})?)\b/g);
      let extractedAmountCents: number | undefined;

      if (amountMatches) {
        for (const amtStr of amountMatches) {
          const val = parseFloat(amtStr);
          // Look for amounts within our known plan range (Rs 900 to Rs 1200)
          if (val >= 900 && val <= 1200) {
            extractedAmountCents = Math.round(val * 100);
            break;
          }
        }
      }

      parsed.push({
        rawLine: line,
        extractedUtr: utrMatch ? utrMatch[1] : undefined,
        extractedAmountCents,
        extractedReference: refMatch ? refMatch[1].toUpperCase() : undefined,
      });
    }

    return parsed;
  }

  /**
   * Compares parsed statement lines against currently pending or open orders.
   */
  static reconcile(statementText: string): ReconciliationMatch[] {
    const parsedLines = this.parseStatementText(statementText);
    const openOrders = db.getAllOrders().filter(
      (o) => o.status === 'pending_verification' || o.status === 'created'
    );

    const matches: ReconciliationMatch[] = [];
    const matchedOrderIds = new Set<string>();

    for (const item of parsedLines) {
      for (const order of openOrders) {
        if (matchedOrderIds.has(order.id)) continue;

        const payment = db.getPaymentByOrderId(order.id);
        const submittedUtr = payment?.utr;

        // Condition 1: Both UTR and Exact Amount match (100% confidence)
        if (
          item.extractedUtr &&
          submittedUtr &&
          item.extractedUtr === submittedUtr &&
          item.extractedAmountCents &&
          item.extractedAmountCents === order.total_amount_cents
        ) {
          matches.push({
            rawLine: item.rawLine,
            orderId: order.id,
            orderReference: order.reference,
            buyerEmail: order.buyer_email,
            plan: order.plan,
            orderAmountFormatted: PaiseAllocator.formatAmountINR(order.total_amount_cents),
            submittedUtr,
            statementUtr: item.extractedUtr,
            matchType: 'EXACT_UTR_AND_AMOUNT',
            confidencePercent: 100,
            explanation: `Exact match: UTR (${submittedUtr}) and exact amount (${PaiseAllocator.formatAmountINR(order.total_amount_cents)}) match statement entry.`,
          });
          matchedOrderIds.add(order.id);
          break;
        }

        // Condition 2: 12-digit UTR matches submitted payment record (95% confidence)
        if (item.extractedUtr && submittedUtr && item.extractedUtr === submittedUtr) {
          matches.push({
            rawLine: item.rawLine,
            orderId: order.id,
            orderReference: order.reference,
            buyerEmail: order.buyer_email,
            plan: order.plan,
            orderAmountFormatted: PaiseAllocator.formatAmountINR(order.total_amount_cents),
            submittedUtr,
            statementUtr: item.extractedUtr,
            matchType: 'EXACT_UTR',
            confidencePercent: 95,
            explanation: `UTR match: 12-digit reference ${submittedUtr} matches statement.`,
          });
          matchedOrderIds.add(order.id);
          break;
        }

        // Condition 3: Unique Paise Amount matches an open order (90% confidence)
        // With UNIQUE_AMOUNT_MATCHING, no two open orders have the same paise cents!
        if (
          order.paise_offset > 0 &&
          item.extractedAmountCents &&
          item.extractedAmountCents === order.total_amount_cents
        ) {
          matches.push({
            rawLine: item.rawLine,
            orderId: order.id,
            orderReference: order.reference,
            buyerEmail: order.buyer_email,
            plan: order.plan,
            orderAmountFormatted: PaiseAllocator.formatAmountINR(order.total_amount_cents),
            submittedUtr,
            statementUtr: item.extractedUtr,
            matchType: 'EXACT_PAISE_AMOUNT',
            confidencePercent: 90,
            explanation: `Unique paise match: ${PaiseAllocator.formatAmountINR(order.total_amount_cents)} matches the unique allocated amount for this order.`,
          });
          matchedOrderIds.add(order.id);
          break;
        }

        // Condition 4: Order Reference found in bank narration (85% confidence)
        if (
          item.extractedReference &&
          item.extractedReference === order.reference.toUpperCase()
        ) {
          matches.push({
            rawLine: item.rawLine,
            orderId: order.id,
            orderReference: order.reference,
            buyerEmail: order.buyer_email,
            plan: order.plan,
            orderAmountFormatted: PaiseAllocator.formatAmountINR(order.total_amount_cents),
            submittedUtr,
            statementUtr: item.extractedUtr,
            matchType: 'ORDER_REF_IN_NARRATION',
            confidencePercent: 85,
            explanation: `Order reference ${order.reference} detected in statement remarks.`,
          });
          matchedOrderIds.add(order.id);
          break;
        }
      }
    }

    return matches;
  }
}
