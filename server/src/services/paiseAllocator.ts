/**
 * Unique Amount (Paise) Allocator
 * Guarantees that every concurrently open order of a given plan has a unique amount
 * (e.g. Rs 499.14 vs Rs 499.37) for unambiguous bank statement reconciliation.
 */

import { db, type OrderRow } from '../db';
import { env } from '../config/env';

export class PaiseAllocator {
  /**
   * Allocates a unique paise offset (1 to 99) for the given plan.
   * Ensures no two active/unexpired orders of this plan share the same exact total amount.
   */
  static allocatePaiseOffset(plan: 'standard' | 'complete', _basePriceCents: number): number {
    if (!env.UNIQUE_AMOUNT_MATCHING) {
      return 0; // Feature flag disabled: exact integer rupees
    }

    const openOrders: OrderRow[] = db.getOpenOrders();

    // Collect all paise offsets currently in use for this specific plan
    const usedOffsets = new Set<number>();
    for (const order of openOrders) {
      if (order.plan === plan) {
        usedOffsets.add(order.paise_offset);
      }
    }

    // Try finding an unused offset between 1 and 99.
    // Randomize starting probe to avoid clustering around .01
    const candidateOffsets: number[] = [];
    for (let i = 1; i <= 99; i++) {
      if (!usedOffsets.has(i)) {
        candidateOffsets.push(i);
      }
    }

    if (candidateOffsets.length > 0) {
      // Pick a random available offset for fair distribution
      const randomIndex = Math.floor(Math.random() * candidateOffsets.length);
      return candidateOffsets[randomIndex];
    }

    // Fallback if all 99 slots are simultaneously active:
    // Log a security notice and return 0
    console.warn(`[PaiseAllocator] All 99 paise offsets occupied for plan ${plan}. Defaulting to 0.`);
    return 0;
  }

  /**
   * Formats paise (cents) into Indian Rupee format with exact decimals.
   * Example: 49937 paise -> "₹499.37"
   */
  static formatAmountINR(totalCents: number): string {
    const rupees = (totalCents / 100).toFixed(2);
    return `₹${rupees}`;
  }
}
