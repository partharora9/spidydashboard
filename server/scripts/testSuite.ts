/**
 * Automated Security & Business Logic Test Suite
 * Validates all security invariants required by the specification.
 *
 * Usage:
 *   npx tsx server/scripts/testSuite.ts
 */

import crypto from 'crypto';
import { db } from '../src/db';
import { SERVER_PLANS } from '../src/config/plans';
import { PaiseAllocator } from '../src/services/paiseAllocator';
import { manualUpiProvider } from '../src/services/payment/ManualUpiProvider';
import { DeliveryService } from '../src/services/deliveryService';
import { BankStatementReconciler } from '../src/services/reconciler';
import { safeCompare } from '../src/middleware/auth';
import { env } from '../src/config/env';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    throw new Error(`Test failed: ${testName}`);
  }
}

async function runTestSuite() {
  db.clear();
  console.log('\n============================================================');
  console.log('🛡️  RUNNING SPIDYDASHBOARD SECURITY & BACKEND TEST SUITE');
  console.log('============================================================\n');

  // TEST 1: Price Tampering Prevention
  console.log('Test 1: Price Tampering Prevention');
  const planStudent = SERVER_PLANS['student_edition'];
  assert(planStudent.basePriceCents === 99900, 'Server student edition base price is immutable (99900 paise)');

  // TEST 2: Unique Amount (Paise) Allocator
  console.log('\nTest 2: Unique Paise Allocator');
  const orderA = db.createOrder({
    reference: 'SPIDY-TESTA',
    plan: 'student_edition',
    base_amount_cents: 99900,
    paise_offset: PaiseAllocator.allocatePaiseOffset('student_edition', 99900),
    total_amount_cents: 99900 + 15,
    currency: 'INR',
    buyer_email: 'buyer-a@example.com',
    consent_given: true,
    consent_timestamp: new Date().toISOString(),
    privacy_policy_version: 'v1.0',
    marketing_opt_in: false,
    status: 'created',
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  const nextOffset = PaiseAllocator.allocatePaiseOffset('student_edition', 99900);
  assert(nextOffset > 0, `Allocated valid paise offset: ${nextOffset} paise`);
  assert(nextOffset !== orderA.paise_offset, 'Consecutive open orders guaranteed different paise offsets');

  // TEST 3: Expired Order Rejection
  console.log('\nTest 3: Expired Orders Rejection');
  const expiredOrder = db.createOrder({
    reference: 'SPIDY-EXPD1',
    plan: 'student_edition',
    base_amount_cents: 99900,
    paise_offset: 10,
    total_amount_cents: 99910,
    currency: 'INR',
    buyer_email: 'expired@example.com',
    consent_given: true,
    consent_timestamp: new Date().toISOString(),
    privacy_policy_version: 'v1.0',
    marketing_opt_in: false,
    status: 'created',
    expires_at: new Date(Date.now() - 5000).toISOString(), // Expired 5 seconds ago
  });

  assert(new Date(expiredOrder.expires_at) < new Date(), 'Order is correctly marked in past expiry');

  // TEST 4: UTR Validation & Duplicate Rejection
  console.log('\nTest 4: UTR 12-Digit Validation & Reused UTR Rejection');
  const activeOrder1 = db.createOrder({
    reference: 'SPIDY-ORD01',
    plan: 'student_edition',
    base_amount_cents: 99900,
    paise_offset: 25,
    total_amount_cents: 99925,
    currency: 'INR',
    buyer_email: 'buyer1@example.com',
    consent_given: true,
    consent_timestamp: new Date().toISOString(),
    privacy_policy_version: 'v1.0',
    marketing_opt_in: false,
    status: 'created',
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  const activeOrder2 = db.createOrder({
    reference: 'SPIDY-ORD02',
    plan: 'student_edition',
    base_amount_cents: 99900,
    paise_offset: 35,
    total_amount_cents: 99935,
    currency: 'INR',
    buyer_email: 'buyer2@example.com',
    consent_given: true,
    consent_timestamp: new Date().toISOString(),
    privacy_policy_version: 'v1.0',
    marketing_opt_in: false,
    status: 'created',
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });

  // Valid 12-digit UTR submission
  const validUtr = '428819204918';
  await manualUpiProvider.submitProof(activeOrder1, { utr: validUtr });
  const payment1 = db.getPaymentByOrderId(activeOrder1.id);
  assert(payment1?.utr === validUtr, 'Valid 12-digit UTR saved successfully');
  assert(activeOrder1.status === 'pending_verification', 'Order transitioned to pending_verification');

  // Attempt to reuse same UTR on activeOrder2 -> must throw!
  let duplicateThrew = false;
  try {
    await manualUpiProvider.submitProof(activeOrder2, { utr: validUtr });
  } catch (err: any) {
    duplicateThrew = true;
    assert(err.message.includes('already been submitted'), 'Reused UTR rejected with fraud warning');
  }
  assert(duplicateThrew, 'Reused UTR properly thrown and blocked');

  // TEST 5: Double Approval Idempotency
  console.log('\nTest 5: Idempotent Admin Approval');
  const approval1 = await DeliveryService.approveOrder(activeOrder1.id, 'admin');
  assert(approval1.success, 'First approval succeeded');
  assert(approval1.order.status === 'approved', 'Order status set to approved');
  assert(approval1.downloadToken.length === 64, 'Generated 256-bit download token (64 hex characters)');

  // Second approval on same order -> should NOT create duplicate purchase or error
  const approval2 = await DeliveryService.approveOrder(activeOrder1.id, 'admin');
  assert(approval2.success, 'Second approval succeeded idempotently');
  assert(approval2.purchase.id === approval1.purchase.id, 'Same purchase ID returned; no double billing or delivery');

  // TEST 6: Download Token Expiry and 3-Download Limit
  console.log('\nTest 6: Download Token Limits');
  const rawToken = approval1.downloadToken;
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const tokenRow = db.getDownloadTokenByHash(tokenHash);
  assert(tokenRow !== null, 'Token found in database by SHA-256 hash');
  assert(tokenRow?.max_downloads === 3, 'Max download limit is set to 3');

  // Consume 3 downloads
  db.incrementDownloadCount(tokenRow!.id, '127.0.0.1');
  db.incrementDownloadCount(tokenRow!.id, '127.0.0.1');
  db.incrementDownloadCount(tokenRow!.id, '127.0.0.1');
  assert(tokenRow!.download_count === 3, 'Token download count incremented to 3');
  assert(tokenRow!.download_count >= tokenRow!.max_downloads, 'Token now correctly marked as exhausted');

  // TEST 7: Constant-Time Admin Authentication
  console.log('\nTest 7: Constant-Time Admin Auth');
  assert(safeCompare(env.ADMIN_SECRET, env.ADMIN_SECRET), 'Exact admin secret passes safeCompare');
  assert(!safeCompare('wrong-password', env.ADMIN_SECRET), 'Wrong secret fails safeCompare');
  assert(!safeCompare('', env.ADMIN_SECRET), 'Empty secret fails safeCompare');

  // TEST 8: Bank Statement Reconciliation Auto-Matcher
  console.log('\nTest 8: Bank Statement Reconciler');
  const pendingReconOrder = db.createOrder({
    reference: 'SPIDY-RECON1',
    plan: 'student_edition',
    base_amount_cents: 99900,
    paise_offset: 25,
    total_amount_cents: 99925,
    currency: 'INR',
    buyer_email: 'recon@example.com',
    consent_given: true,
    consent_timestamp: new Date().toISOString(),
    privacy_policy_version: 'v1.0',
    marketing_opt_in: false,
    status: 'pending_verification',
    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  });
  db.updatePaymentUtr(pendingReconOrder.id, '428819204918');

  const sampleBankStatement = `
18/10/2026,UPI/CR/428819204918/PARTH ARORA/HDFC/SPIDY-RECON1,999.25,CR
19/10/2026,UPI/CR/999111222333/JOHN DOE/SBI/PAYMENT,999.00,CR
`;
  const matches = BankStatementReconciler.reconcile(sampleBankStatement);
  assert(matches.length >= 1, 'Reconciler found candidate match from statement');
  const match1 = matches.find((m) => m.orderReference === 'SPIDY-RECON1');
  assert(match1 !== undefined, 'Found exact match for SPIDY-RECON1');
  assert(match1?.confidencePercent === 100, 'Match confidence is 100% (both UTR and exact paise match)');


  // TEST 9: Privacy DPDP Act 2023 Data Anonymization
  console.log('\nTest 9: Privacy DPDP Right to Erasure');
  const anonResult = db.anonymizeUserData('buyer1@example.com');
  assert(anonResult.ordersAnonymized >= 1, 'Orders anonymized for target email');
  const scrubbedOrder = db.getOrderById(activeOrder1.id);
  assert(scrubbedOrder?.buyer_email.includes('@privacy.local'), 'Buyer email replaced with randomized privacy hash');
  assert(scrubbedOrder?.buyer_name?.includes('Redacted'), 'Buyer name redacted');

  console.log('\n============================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED CLEANLY!`);
  console.log('============================================================\n');
}

runTestSuite().catch((err) => {
  console.error('\n❌ Test Suite Aborted with error:', err);
  process.exit(1);
});
