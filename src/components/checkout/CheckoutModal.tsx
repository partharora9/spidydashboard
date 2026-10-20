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
  Folder,
  Video,
  Sparkles,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';
import type { Plan } from '../../data/plans';
import { PRICE, FORMATTED_PRICE, UPI_ID, UPI_PAYEE_NAME, PLAN_NAME } from '../../config/pricing';

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
  accessLinks?: any[];
}

export const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const [step, setStep] = useState<CheckoutStep>('DETAILS');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [consent, setConsent] = useState(false);
  const [utr, setUtr] = useState('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
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
          setOrder((prev) => (prev ? { ...prev, accessUrl: data.accessUrl, accessLinks: data.accessLinks } : prev));
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

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot file is too large (maximum 5MB).');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshotData(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Step 1: Submit name, email, phone, college & consent -> Server creates order
  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!college.trim()) {
      setError('Please enter your college or university name.');
      return;
    }
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
          plan: 'student_edition',
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          college: college.trim(),
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

  // Step 2: Submit 12-digit UTR + optional screenshot
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
          email: email.trim().toLowerCase(),
          screenshot: screenshotData || undefined,
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
      const accessLinks = data?.accessLinks;
      if (accessUrl || accessLinks) {
        setOrder((prev) => (prev ? { ...prev, accessUrl, accessLinks } : prev));
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
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-md overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[560px] bg-white rounded-t-[24px] sm:rounded-[24px] shadow-[0_25px_80px_rgba(0,0,0,0.25)] border border-black/[0.08] overflow-hidden max-h-[92dvh] flex flex-col pb-safe my-0 sm:my-8"
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-2 shrink-0" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#F8F9FA] border-b border-black/[0.06] shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#2563EB]/15 text-[#2563EB]">
              <Lock className="w-4 h-4 stroke-[2.2]" />
            </span>
            <span className="font-headline font-semibold text-[15px] text-[#0B0B14]">
              SpidyDashboard Student Checkout
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

          {/* STEP 1: BUYER DETAILS (Name, Email, Phone, College) & CONSENT */}
          {step === 'DETAILS' && (
            <form onSubmit={handleInitiateOrder} className="space-y-4">
              {/* Plan Summary Card */}
              <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#3B82F6]/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                    Selected Plan
                  </span>
                  <h4 className="text-[16px] font-bold text-[#0B0B14]">{PLAN_NAME}</h4>
                  <p className="text-[12px] text-gray-600 mt-0.5">
                    Windows Setup.exe, setup guide, walkthrough video & academic pack
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[22px] font-bold text-[#0B0B14]">{FORMATTED_PRICE}</div>
                  <span className="text-[11px] text-gray-500 font-medium">one-time payment</span>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2 text-[15px] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1">
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
                  placeholder="e.g. rahul@university.edu or rahul@gmail.com"
                  className="w-full px-3.5 py-2 text-[15px] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                />
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Your secure, tokenized download links will be delivered directly to this address.
                </p>
              </div>

              {/* Phone & College Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2 text-[15px] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1">
                    College / University <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. IIT Delhi / DTU / VIT"
                    className="w-full px-3.5 py-2 text-[15px] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Legal & Privacy Consent Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB] border-gray-300"
                  />
                  <span className="text-[12px] text-gray-600 leading-relaxed">
                    I agree to the{' '}
                    <a href="/terms" target="_blank" className="text-[#2563EB] underline font-medium">
                      Terms of Service
                    </a>
                    ,{' '}
                    <a href="/privacy" target="_blank" className="text-[#2563EB] underline font-medium">
                      Privacy Policy
                    </a>
                    , and acknowledge the strict{' '}
                    <a href="/refund" target="_blank" className="text-[#2563EB] underline font-medium">
                      No Refund Policy
                    </a>{' '}
                    (all digital software sales are strictly final and non-refundable).
                  </span>
                </label>
              </div>

              {/* Trust Callout */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[12px] text-gray-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  No payment gateway fees. Directly pay via official UPI ({UPI_ID}) and verify with UTR.
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white font-semibold text-[15px] shadow-[0_4px_14px_rgba(37,99,235,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span>Generating UPI Payment Code...</span>
                ) : (
                  <>
                    <span>Proceed to UPI Payment ({FORMATTED_PRICE})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT INSTRUCTIONS (QR & UTR + Screenshot Upload) */}
          {step === 'PAYMENT' && order && (
            <div className="space-y-4">
              {/* Top Countdown & Ref Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Order Ref:</span>
                  <span className="font-mono text-[14px] font-bold text-[#0B0B14]">{order.reference}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(order.reference, setCopiedRef)}
                    className="p-1 text-gray-400 hover:text-black cursor-pointer"
                    title="Copy reference"
                  >
                    {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 font-mono text-[12.5px] font-medium bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{timeLeft}</span>
                </div>
              </div>

              {/* Exact Amount Banner (Rs 999) */}
              <div className="p-3.5 rounded-2xl bg-[#0B0F19] text-white text-center">
                <span className="text-[11.5px] uppercase tracking-wider text-gray-400">Exact Amount to Pay:</span>
                <div className="text-[32px] font-mono font-bold text-[#60A5FA] mt-0.5 tracking-tight flex items-center justify-center gap-2">
                  <span>{FORMATTED_PRICE}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(PRICE), setCopiedAmount)}
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Copy exact amount"
                  >
                    {copiedAmount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11.5px] text-gray-300 mt-0.5">
                  One-time payment for <strong>{PLAN_NAME}</strong>
                </p>
              </div>

              {/* QR Code and Payee UPI ID */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center py-1">
                {order.qrCodeDataUrl ? (
                  <div className="p-2.5 bg-white rounded-2xl border-2 border-gray-200 shadow-md text-center shrink-0">
                    <img
                      src={order.qrCodeDataUrl}
                      alt="UPI QR Code"
                      className="w-[175px] h-[175px] object-contain mx-auto"
                    />
                    <span className="text-[10.5px] font-medium text-gray-600 font-mono mt-1 block">
                      Scan with GPay / PhonePe / Paytm
                    </span>
                  </div>
                ) : null}

                <div className="flex-1 space-y-2.5 w-full">
                  {/* Direct Payee UPI ID with 1-Click Copy */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200">
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-blue-900 mb-0.5">
                      Payee UPI ID
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[14px] font-bold text-[#0B0B14] select-all">
                        {UPI_ID}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(UPI_ID, setCopiedVpa)}
                        className="py-1 px-2.5 rounded-lg bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 text-[11.5px] font-semibold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                      >
                        {copiedVpa ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedVpa ? 'Copied' : 'Copy UPI'}</span>
                      </button>
                    </div>
                    <span className="text-[11px] text-gray-500 block mt-0.5">Payee Name: {UPI_PAYEE_NAME}</span>
                  </div>

                  <a
                    href={order.upiUri || `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${PRICE}&cu=INR&tn=${order.reference}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-[13.5px] flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pay with UPI App (Mobile)</span>
                  </a>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-[11.5px] text-gray-600 space-y-0.5">
                    <div>1. Open Google Pay, PhonePe, Paytm, or BHIM.</div>
                    <div>2. Transfer <strong>{FORMATTED_PRICE}</strong> to: <strong className="font-mono text-gray-900">{UPI_ID}</strong></div>
                    <div>3. Enter Remark / Note: <strong>{order.reference}</strong></div>
                  </div>
                </div>
              </div>

              {/* Step 3 Form: Enter 12-Digit UTR + Optional Screenshot */}
              <form onSubmit={handleSubmitUtr} className="pt-2 border-t border-gray-100 space-y-3">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1">
                    Enter 12-Digit UTR / Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 428819204918 (12 digits)"
                    className="w-full px-3.5 py-2 font-mono text-[16px] tracking-wider rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Shown in your bank/UPI app payment receipt as "UPI Ref No" or "UTR".
                  </p>
                </div>

                {/* Optional Screenshot Upload */}
                <div>
                  <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1">
                    Payment Screenshot <span className="text-gray-400 font-normal">(Optional, helps faster verification)</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 text-[12.5px] font-medium text-gray-700 transition-colors">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span>{screenshotName ? 'Change Screenshot' : 'Upload Screenshot'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                        onChange={handleScreenshotChange}
                      />
                    </label>
                    {screenshotName && (
                      <span className="text-[12px] text-emerald-600 font-medium inline-flex items-center gap-1 truncate max-w-[200px]">
                        <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{screenshotName}</span>
                      </span>
                    )}
                  </div>
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
                      <span>I Have Paid — Submit for Verification</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 3: PENDING VERIFICATION */}
          {step === 'PENDING' && order && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 text-[#2563EB] mx-auto flex items-center justify-center">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <h3 className="text-[20px] font-bold text-[#0B0B14]">Payment Pending Verification</h3>
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order Reference:</span>
                  <span className="font-mono font-bold text-gray-900">{order.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan:</span>
                  <span className="font-semibold text-gray-900">{PLAN_NAME}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-600">{FORMATTED_PRICE}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Student Name:</span>
                  <span className="font-medium text-gray-900">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">College:</span>
                  <span className="font-medium text-gray-900">{college}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Email:</span>
                  <span className="font-medium text-gray-900">{email}</span>
                </div>
              </div>

              <p className="text-[13.5px] text-gray-600 leading-relaxed max-w-[420px] mx-auto">
                Your payment reference has been recorded as <strong>Pending verification</strong>. Parth Arora will manually verify your 12-digit UTR against bank records and approve your order. Your secure download links will be emailed directly to <strong>{email}</strong>.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
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
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11.5px] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Payment Approved & Verified</span>
              </div>
              <h3 className="text-[20px] font-bold text-[#0B0B14]">Download Unlocked!</h3>
              <p className="text-[13.5px] text-gray-600 max-w-[460px] mx-auto">
                Thank you! Your payment for <strong>{PLAN_NAME}</strong> has been approved. You have unlocked immediate access to your installer and study materials below:
              </p>

              {/* Delivery Links List */}
              <div className="space-y-3 pt-1 text-left max-w-[500px] mx-auto">
                {(order.accessLinks || []).map((linkItem: any, idx: number) => (
                  <div
                    key={linkItem.label || idx}
                    className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-200 text-left space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          {linkItem.type === 'installer' ? (
                            <Download className="w-3.5 h-3.5" />
                          ) : linkItem.type === 'video' ? (
                            <Video className="w-3.5 h-3.5" />
                          ) : (
                            <Folder className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-bold text-[13px] text-gray-900 truncate">
                            {linkItem.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11.5px] text-gray-600">
                      {linkItem.description}
                    </p>

                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(linkItem.url);
                          setCopiedLinkIndex(idx);
                          setTimeout(() => setCopiedLinkIndex(null), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-white text-[12px] font-medium text-gray-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedLinkIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                      <a
                        href={linkItem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-[12px] inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Download / Access</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

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
                  className="py-2.5 px-6 rounded-full bg-[#0B0B14] text-white text-[13px] font-medium hover:bg-black transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: EXPIRED SESSION */}
          {step === 'EXPIRED' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-[19px] font-bold text-[#0B0B14]">Order Session Expired</h3>
              <p className="text-[14px] text-gray-600 max-w-[400px] mx-auto">
                This 30-minute checkout window has elapsed. If you have already transferred ₹999, do not worry — contact
                Parth Arora with your UTR and we will manually verify and deliver your package.
              </p>
              <button
                type="button"
                onClick={() => setStep('DETAILS')}
                className="py-2.5 px-6 rounded-full bg-[#2563EB] text-white text-[14px] font-semibold"
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
