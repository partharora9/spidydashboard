import { useState, useEffect } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  Clock,
  XCircle,
  Download,
  Copy,
  Check,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface OrderStatusPageProps {
  reference: string;
}

export const OrderStatusPage = ({ reference }: OrderStatusPageProps) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedMega, setCopiedMega] = useState(false);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/orders/${reference}/status`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch order status');
      }
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Auto poll every 15s if in pending status
    const interval = setInterval(() => {
      if (order?.status === 'pending_verification' || order?.status === 'created') {
        fetchStatus();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [reference, order?.status]);

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#0B0B14] font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[720px] mx-auto px-6 py-16 sm:py-24 w-full">
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-[#4F8FF7] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 font-mono text-[14px]">Loading order status for {reference}...</p>
          </div>
        ) : error ? (
          <div className="p-8 rounded-[24px] bg-white border border-red-200 shadow-sm text-center space-y-4">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-[22px] font-bold text-[#0B0B14]">Order Not Found</h2>
            <p className="text-gray-600 text-[14px]">{error}</p>
            <a
              href="/pricing"
              className="inline-block py-2.5 px-6 rounded-full bg-[#4F8FF7] text-white text-[14px] font-semibold"
            >
              Return to Pricing
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] border border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Header Banner */}
            <div
              className={`p-6 sm:p-8 text-white ${
                order.status === 'approved'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
                  : order.status === 'pending_verification'
                  ? 'bg-gradient-to-r from-[#1E293B] to-[#0F172A]'
                  : 'bg-gradient-to-r from-amber-600 to-orange-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/15">
                  Order Status
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[14px] font-bold">{order.reference}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(order.reference);
                      setCopiedRef(true);
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="text-white/80 hover:text-white"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <h1 className="text-[26px] sm:text-[32px] font-bold leading-tight">
                {order.status === 'approved' && 'Payment Verified & Approved'}
                {order.status === 'pending_verification' && 'Awaiting Bank Statement Verification'}
                {order.status === 'created' && 'Order Created — Awaiting Payment'}
                {order.status === 'rejected' && 'Order Verification Rejected'}
                {order.status === 'expired' && 'Order Session Expired'}
              </h1>

              <p className="mt-2 text-white/80 text-[14px]">
                {order.status === 'approved' && 'Your software release and personal license are ready for download.'}
                {order.status === 'pending_verification' &&
                  'Your 12-digit UTR is being matched with bank statements. Typically completed within a few hours.'}
              </p>
            </div>

            {/* Details Grid */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100 text-[14px]">
                <div>
                  <span className="text-gray-400 text-[12px] uppercase tracking-wider block font-medium">Plan</span>
                  <span className="font-semibold text-gray-900 mt-1 block">{order.planName}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[12px] uppercase tracking-wider block font-medium">
                    Exact Amount Paid
                  </span>
                  <span className="font-mono font-bold text-gray-900 mt-1 block">{order.amountFormatted}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[12px] uppercase tracking-wider block font-medium">Created</span>
                  <span className="text-gray-700 mt-1 block">
                    {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 text-[12px] uppercase tracking-wider block font-medium">UTR Record</span>
                  <span className="font-mono text-gray-700 mt-1 block">
                    {order.utrMasked ? order.utrMasked : 'Not submitted yet'}
                  </span>
                </div>
              </div>

              {/* Status Specific Actions */}
              {order.status === 'approved' && (
                <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-5">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                    <Check className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[20px] text-emerald-950">Payment Verified & Approved!</h3>
                    <p className="text-[14px] text-emerald-800 max-w-[500px] mx-auto mt-1">
                      {order.plan === 'standard' || order.accessUrl
                        ? 'Your payment for SpidyDashboard Standard has been successfully confirmed. You have unlocked immediate dashboard files access below.'
                        : 'Your SpidyDashboard Complete package has been verified. Download instructions and license have been dispatched to your email.'}
                    </p>
                  </div>

                  {/* Approved Order Direct Access Link */}
                  {order.accessUrl && (
                    <div className="space-y-4 pt-1">
                      <div className="flex justify-center">
                        <a
                          href={order.accessUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3.5 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-[15px] inline-flex items-center gap-2.5 shadow-md shadow-emerald-600/25 transition-all cursor-pointer"
                        >
                          <Download className="w-5 h-5" />
                          <span>Access SpidyDashboard Repository</span>
                          <ExternalLink className="w-4 h-4 opacity-80" />
                        </a>
                      </div>

                      {/* Direct URL Box with Copy */}
                      <div className="max-w-[520px] mx-auto bg-white p-3 rounded-xl border border-emerald-200 text-left flex items-center justify-between gap-3 shadow-xs">
                        <div className="min-w-0 flex-1">
                          <span className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Direct Access Link
                          </span>
                          <span className="block font-mono text-[12px] text-gray-700 truncate select-all">
                            {order.accessUrl}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(order.accessUrl!, setCopiedMega)}
                          className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-[12px] font-medium text-gray-700 flex items-center gap-1.5 shrink-0 transition-colors"
                        >
                          {copiedMega ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white/70 border border-emerald-100 text-[12px] text-emerald-900 max-w-[520px] mx-auto text-left space-y-1">
                        <p className="font-semibold text-emerald-950">📦 Package Contents & Instructions:</p>
                        <p className="text-emerald-800">
                          1. Click the green button above to open the secure MEGA repository.<br/>
                          2. Download and extract the archive to your machine.<br/>
                          3. Refer to the included setup guide and video walkthrough to get started.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Complete Kit / Token Recovery */}
                  {order.plan !== 'standard' && !order.accessUrl && (
                    <div className="flex justify-center gap-3 pt-2">
                      <a
                        href={`/recover?ref=${order.reference}`}
                        className="py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[14px] inline-flex items-center gap-2 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Get Download Link via Email Code</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {order.status === 'pending_verification' && (
                <div className="p-6 rounded-2xl bg-blue-50/90 border border-blue-200 text-[13px] text-blue-900 space-y-4">
                  <div className="flex items-center gap-2 font-semibold text-blue-950 text-[15px]">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Payment Recorded — Under Fast Verification</span>
                  </div>
                  <p className="leading-relaxed">
                    Your 12-digit UTR has been submitted. Parth Arora (SOC Analyst) will reconcile this with the bank statement.
                  </p>

                  <div className="pt-2 border-t border-blue-200/80 text-[12px] text-blue-800">
                    <p>
                      🔒 Once reconciled, your access credentials and repository link will be activated here and dispatched directly to your registered email.
                    </p>
                  </div>
                </div>
              )}

              {/* Printable Invoice Link */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={`/orders/${order.reference}/invoice`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#4F8FF7] hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  <span>View & Print Official Invoice</span>
                </a>

                <a
                  href="/recover"
                  className="text-[13px] text-gray-500 hover:text-black transition-colors"
                >
                  Returning buyer? File recovery portal &rarr;
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
