import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
  Clock,
  ArrowRight,
  AlertCircle,
  Lock,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { Plan } from '../../data/plans';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan;
}

type CheckoutStep = 'DETAILS' | 'PAYMENT' | 'PENDING' | 'APPROVED' | 'EXPIRED' | 'REJECTED';

interface OrderData {
  orderId: string;
  reference: string;
  planName: string;
  exactAmountFormatted: string;
  totalAmountCents: number;
  expiresAt: string;
  upiUri: string;
  vpa?: string;
  qrCodeDataUrl: string;
  accessUrl?: string;
}

export const CheckoutModal = ({ isOpen, onClose, plan }: CheckoutModalProps) => {
  const [step, setStep] = useState<CheckoutStep>('DETAILS');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedMega, setCopiedMega] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('30:00');

  // Countdown timer for open order
  useEffect(() => {
    if (!order?.expiresAt || step !== 'PAYMENT') return;

    const interval = setInterval(() => {
      const remainingMs = new Date(order.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft('00:00');
        setStep('EXPIRED');
        clearInterval(interval);
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.expiresAt, step]);

  // Real-time polling for payment approval while in PENDING step
  useEffect(() => {
    if (step !== 'PENDING' || !order?.reference) return;

    let isMounted = true;
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${order.reference}/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'approved' && isMounted) {
          setOrder((prev) => (prev ? { ...prev, accessUrl: data.accessUrl } : prev));
          setStep('APPROVED');
          clearInterval(pollInterval);
        }
      } catch {
        // Silently retry on next tick
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [step, order?.reference]);

  if (!isOpen) return null;

  // Step 1: Submit email & consent -> Server creates order with authoritative price
  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consent) {
      setError('You must accept the Terms of Service and acknowledge the strict No Refund Policy to proceed.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.id,
          email,
          name: name || undefined,
          consent: true,
        }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Checkout server unreachable (HTTP ${res.status}). Please check server connection.`);
      }

      if (!res.ok) {
        throw new Error(data?.error || `Failed to initiate order (HTTP ${res.status}).`);
      }

      setOrder(data);
      setStep('PAYMENT');
    } catch (err: any) {
      setError(err.message || 'Network error creating order.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit 12-digit UTR
  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setError(null);

    const cleanUtr = utr.trim();
    if (!/^[0-9]{12}$/.test(cleanUtr)) {
      setError('UTR / Transaction ID must be exactly 12 numeric digits.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.reference}/utr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          utr: cleanUtr,
          email,
        }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server returned invalid response (HTTP ${res.status}).`);
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to submit payment reference.');
      }

      const accessUrl = data?.accessUrl;
      if (accessUrl) {
        setOrder((prev) => (prev ? { ...prev, accessUrl } : prev));
        setStep('APPROVED');
      } else {
        setStep('PENDING');
      }
    } catch (err: any) {
      setError(err.message || 'Error submitting UTR.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[560px] bg-white rounded-t-[24px] sm:rounded-[24px] shadow-[0_25px_80px_rgba(0,0,0,0.25)] border border-black/[0.08] overflow-hidden max-h-[90dvh] flex flex-col pb-safe my-0 sm:my-8"
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#F8F9FA] border-b border-black/[0.06] shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#4F8FF7]/15 text-[#4F8FF7]">
              <Lock className="w-4 h-4 stroke-[2.2]" />
            </span>
            <span className="font-headline font-semibold text-[15px] text-[#0B0B14]">
              Secure Source Code Checkout
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close checkout"
            className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-black/[0.05] transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: BUYER DETAILS & CONSENT */}
          {step === 'DETAILS' && (
            <form onSubmit={handleInitiateOrder} className="space-y-5">
              {/* Plan Summary Card */}
              <div className="p-4 rounded-2xl bg-[#F2F4FD] border border-[#4F8FF7]/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#4F8FF7]">Selected Plan</span>
                  <h4 className="text-[17px] font-semibold text-[#0B0B14]">{plan.name}</h4>
                  <p className="text-[12px] text-gray-500 mt-0.5">{plan.descriptor}</p>
                </div>
                <div className="text-right">
                  <div className="text-[22px] font-bold text-[#0B0B14]">{plan.formattedPrice}</div>
                  <span className="text-[11px] text-gray-500">one-time payment</span>
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1.5">
                  Delivery Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-2.5 text-[16px] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F8FF7] focus:border-transparent transition-all"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Your encrypted download token will be sent to this email upon payment verification.
                </p>
              </div>

              {/* Optional Name */}
              <div>
                <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1.5">
                  Full Name <span className="text-gray-400 font-normal">(Optional, for license)</span>
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Parth Arora"
                  className="w-full px-4 py-2.5 text-[16px] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F8FF7] focus:border-transparent transition-all"
                />
              </div>

              {/* Legal & Privacy Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#4F8FF7] focus:ring-[#4F8FF7] border-gray-300"
                  />
                  <span className="text-[12px] text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-[#4F8FF7] underline">
                      Terms of Service
                    </a>
                    ,{' '}
                    <a href="/privacy" target="_blank" className="text-[#4F8FF7] underline">
                      Privacy Policy
                    </a>
                    , and acknowledge the strict{' '}
                    <a href="/refund" target="_blank" className="text-[#4F8FF7] underline">
                      No Refund Policy
                    </a>{' '}
                    (all digital source code sales are strictly final and non-refundable).
                  </span>
                </label>
              </div>

              {/* Trust Callout */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[12px] text-gray-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  We never see or store your UPI PIN or bank credentials. Payment is verified via bank statement.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] hover:from-[#4E91F5] hover:to-[#3174E6] text-white font-semibold text-[15px] shadow-[0_4px_14px_rgba(79,143,247,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating Payment Reference...</span>
                ) : (
                  <>
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT INSTRUCTIONS (QR & UTR) */}
          {step === 'PAYMENT' && order && (
            <div className="space-y-5">
              {/* Top Countdown & Ref Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Order:</span>
                  <span className="font-mono text-[14px] font-bold text-[#0B0B14]">{order.reference}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(order.reference, setCopiedRef)}
                    className="p-1 text-gray-400 hover:text-black"
                    title="Copy reference"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 font-mono text-[13px] font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}</span>
                </div>
              </div>

              {/* Exact Amount Banner with Unique Paise Highlight */}
              <div className="p-4 rounded-2xl bg-[#0B0F19] text-white text-center">
                <span className="text-[12px] uppercase tracking-wider text-gray-400">Exact Amount to Transfer:</span>
                <div className="text-[32px] font-mono font-bold text-[#4F8FF7] mt-0.5 tracking-tight flex items-center justify-center gap-2">
                  <span>{order.exactAmountFormatted}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(order.exactAmountFormatted.replace('₹', ''), setCopiedAmount)}
                    className="text-gray-400 hover:text-white transition-colors"
                    title="Copy exact amount"
                  >
                    {copiedAmount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[12px] text-amber-300/90 mt-1">
                  ⚠️ Please transfer the <strong>exact amount including paise</strong> so your payment is automatically
                  matched with your order in our bank records!
                </p>
              </div>

              {/* QR Code and UPI App Button */}
              <div className="flex flex-col sm:flex-row items-center gap-5 justify-center py-2">
                {order.qrCodeDataUrl ? (
                  <div className="p-3 bg-white rounded-2xl border-2 border-gray-200 shadow-md text-center shrink-0">
                    <img
                      src={order.qrCodeDataUrl}
                      alt="UPI QR Code"
                      className="w-[190px] h-[190px] object-contain mx-auto"
                    />
                    <span className="text-[11px] font-medium text-gray-600 font-mono mt-1.5 block">
                      Scan with GPay / PhonePe / Paytm / BHIM
                    </span>
                  </div>
                ) : null}

                <div className="flex-1 space-y-3 w-full">
                  {/* Direct Payee UPI ID with 1-Click Copy */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-blue-900 mb-1">
                      Direct Payee UPI ID
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[14px] font-bold text-[#0B0B14] select-all">
                        {order.vpa || '8700383626@axl'}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(order.vpa || '8700383626@axl', setCopiedVpa)}
                        className="py-1 px-2.5 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-[12px] font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                      >
                        {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedVpa ? 'Copied' : 'Copy UPI'}</span>
                      </button>
                    </div>
                  </div>

                  <a
                    href={order.upiUri}
                    className="w-full py-3 px-4 rounded-xl bg-[#4F8FF7] hover:bg-[#3D82EE] text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pay with UPI App (Mobile)</span>
                  </a>

                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[12px] text-gray-600 space-y-1">
                    <div className="font-semibold text-gray-800">Transfer Instructions:</div>
                    <div>1. Open Google Pay, PhonePe, Paytm, or BHIM.</div>
                    <div>2. Scan QR or transfer to: <strong className="font-mono text-gray-900">{order.vpa || '8700383626@axl'}</strong></div>
                    <div>3. Pay exact amount: <strong>{order.exactAmountFormatted}</strong></div>
                    <div>4. Add remark/note: <strong>{order.reference}</strong></div>
                  </div>
                </div>
              </div>

              {/* Step 3: Enter 12-Digit UTR Form */}
              <form onSubmit={handleSubmitUtr} className="pt-2 border-t border-gray-100 space-y-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1">
                    Enter 12-Digit UTR / UPI Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 428819204918 (12 digits)"
                    className="w-full px-4 py-2.5 font-mono text-[16px] tracking-wider rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F8FF7]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Found in your bank app payment receipt as "UPI Ref No" or "UTR".
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || utr.length !== 12}
                  className="w-full py-3.5 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[15px] shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Submitting Reference...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>I Have Paid — Submit UTR for Verification</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: PENDING VERIFICATION */}
          {step === 'PENDING' && order && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#4F8FF7] mx-auto flex items-center justify-center">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-[20px] font-bold text-[#0B0B14]">Payment Under Verification</h3>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Reference:</span>
                  <span className="font-mono font-bold text-gray-900">{order.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan:</span>
                  <span className="font-semibold text-gray-900">{order.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-600">{order.exactAmountFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Email:</span>
                  <span className="font-medium text-gray-900">{email}</span>
                </div>
              </div>

              <p className="text-[14px] text-gray-600 leading-relaxed max-w-[420px] mx-auto">
                Delivery happens after I verify your payment against my bank statement (usually within a few hours). You
                will receive an email confirmation at <strong>{email}</strong> with your secure download link.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`/orders/${order.reference}`}
                  className="py-2.5 px-5 rounded-full border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50"
                >
                  View Order Status Online
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-full bg-[#0B0B14] text-white text-[13px] font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: APPROVED & DELIVERY ACCESS */}
          {step === 'APPROVED' && order && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h3 className="text-[20px] font-bold text-[#0B0B14]">Payment Verified & Approved!</h3>
              <p className="text-[14px] text-gray-600 max-w-[440px] mx-auto">
                Thank you! Your payment for <strong>{order.planName || plan.name}</strong> has been successfully reconciled.
              </p>

              {/* Approved Direct Download Link */}
              {order.accessUrl ? (
                <div className="space-y-4 pt-1">
                  <div className="flex justify-center">
                    <a
                      href={order.accessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto py-3.5 px-7 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-[15px] inline-flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      <span>Access SpidyDashboard Repository</span>
                      <ExternalLink className="w-4 h-4 opacity-80" />
                    </a>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-left flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Direct Access Link
                      </span>
                      <span className="block font-mono text-[12px] text-gray-700 truncate select-all">
                        {order.accessUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          order.accessUrl!,
                          setCopiedMega
                        )
                      }
                      className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-white text-[12px] font-medium text-gray-700 flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      {copiedMega ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[12px] text-emerald-900 text-left space-y-1">
                    <p className="font-semibold text-emerald-950">📦 Next Steps:</p>
                    <p className="text-emerald-800">
                      Download the archive from MEGA, extract the files, and open the included setup guide. A confirmation receipt has also been dispatched to <strong>{email}</strong>.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-left text-[13px] text-blue-900 space-y-2">
                  <p className="font-semibold text-blue-950">Delivery Email Dispatched</p>
                  <p>
                    Your Complete Kit release archive and customized license have been sent to <strong>{email}</strong>. You can also view or recover your files anytime.
                  </p>
                </div>
              )}

              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={`/orders/${order.reference}`}
                  className="py-2.5 px-5 rounded-full border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
                >
                  <span>View Order Status & Receipt</span>
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-full bg-[#0B0B14] text-white text-[13px] font-medium hover:bg-black transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: EXPIRED SESSION */}
          {step === 'EXPIRED' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-[19px] font-bold text-[#0B0B14]">Order Session Expired</h3>
              <p className="text-[14px] text-gray-600 max-w-[400px] mx-auto">
                This 30-minute checkout window has elapsed. If you have already transferred funds, do not worry — contact
                Parth Arora with your UTR and we will manually approve and deliver your files.
              </p>
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="py-2.5 px-6 rounded-full bg-[#4F8FF7] text-white text-[14px] font-semibold"
              >
                Start New Order
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
