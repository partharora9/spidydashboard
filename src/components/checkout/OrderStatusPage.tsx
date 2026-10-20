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
  Folder,
  Video,
  Sparkles,
} from 'lucide-react';

interface OrderStatusPageProps {
  reference: string;
}

export const OrderStatusPage = ({ reference }: OrderStatusPageProps) => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
  const [copiedAllLinks, setCopiedAllLinks] = useState(false);

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

      <main className="max-w-[720px] mx-auto px-6 pt-[calc(var(--header-h)+env(safe-area-inset-top,0px)+24px)] lg:pt-[calc(var(--header-h)+64px)] pb-16 sm:pb-24 w-full">
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
              {order.status === 'approved' && (() => {
                const isComplete = order.plan === 'complete';
                const linksToDisplay: any[] = order.accessLinks || (order.accessUrl ? [{
                  id: 'direct-mega',
                  label: isComplete ? 'Complete Package Download' : 'MEGA Dashboard Repository Download',
                  url: order.accessUrl,
                  description: isComplete
                    ? 'Complete kit archive download.'
                    : 'Complete step-by-step setup guide, architecture documentation, and walkthrough video tour archive.',
                  badge: 'Direct Download',
                  iconType: 'mega',
                }] : []);

                const copyAll = () => {
                  const allText = isComplete
                    ? `SpidyDashboard Complete Kit (₹799) Delivery Package:
1. Google Drive Complete Kit (Source Code, IEEE Report, PPTX, Viva):
${linksToDisplay[0]?.url || ''}

2. Video Walkthrough & Architecture Tour:
${linksToDisplay[1]?.url || ''}

3. MEGA Repository Mirror:
${linksToDisplay[2]?.url || ''}`
                    : linksToDisplay[0]?.url || '';

                  navigator.clipboard.writeText(allText);
                  setCopiedAllLinks(true);
                  setTimeout(() => setCopiedAllLinks(false), 2000);
                };

                return (
                  <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-center space-y-6">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                      <Check className="w-7 h-7 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[12px] font-bold mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Direct Fulfillment Unlocked</span>
                      </div>
                      <h3 className="font-bold text-[22px] text-emerald-950">Payment Verified & Approved!</h3>
                      <p className="text-[14px] text-emerald-800 max-w-[540px] mx-auto mt-1">
                        {isComplete
                          ? 'Your payment for SpidyDashboard Complete Kit (₹799) has been confirmed. You have unlocked immediate access to all source code, academic reports, viva defense questions, and video walkthroughs below.'
                          : 'Your payment for SpidyDashboard Standard (₹499) has been confirmed. You have unlocked immediate dashboard repository access below.'}
                      </p>
                    </div>

                    {/* Unlocked Delivery Cards */}
                    <div className="space-y-3.5 pt-1 text-left max-w-[580px] mx-auto">
                      {linksToDisplay.map((linkItem, idx) => (
                        <div
                          key={linkItem.id}
                          className="p-4 rounded-xl bg-white border border-emerald-200/90 shadow-xs hover:border-emerald-300 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                {linkItem.iconType === 'drive_folder' ? (
                                  <Folder className="w-4 h-4 stroke-[2.2]" />
                                ) : linkItem.iconType === 'video' ? (
                                  <Video className="w-4 h-4 stroke-[2.2]" />
                                ) : (
                                  <Download className="w-4 h-4 stroke-[2.2]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-[14px] text-gray-900 truncate">
                                    {linkItem.label}
                                  </h4>
                                </div>
                                <span className="inline-block text-[10.5px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5">
                                  {linkItem.badge}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-[12.5px] text-gray-600 leading-relaxed">
                            {linkItem.description}
                          </p>

                          <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-gray-100">
                            <div className="font-mono text-[11px] text-gray-400 truncate max-w-[280px] select-all hidden sm:block">
                              {linkItem.url}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(linkItem.url);
                                  setCopiedLinkIndex(idx);
                                  setTimeout(() => setCopiedLinkIndex(null), 2000);
                                }}
                                className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-[12px] font-medium text-gray-700 inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
                                className="flex-1 sm:flex-initial px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-[12.5px] inline-flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                              >
                                <span>Open Access</span>
                                <ExternalLink className="w-3.5 h-3.5 opacity-90" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Copy All Button (for Complete kit multi-links) */}
                      {linksToDisplay.length > 1 && (
                        <div className="pt-2 flex justify-center">
                          <button
                            type="button"
                            onClick={copyAll}
                            className="px-4 py-2 rounded-full bg-white border border-emerald-300 hover:bg-emerald-50/50 text-[12.5px] font-semibold text-emerald-800 inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                          >
                            {copiedAllLinks ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-600" />
                                <span>All 3 Delivery Links Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 text-emerald-700" />
                                <span>Copy All Complete Kit Delivery Links</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Instructions Card */}
                    <div className="p-4 rounded-xl bg-white/80 border border-emerald-100 text-[12px] text-emerald-950 max-w-[580px] mx-auto text-left space-y-1.5">
                      <p className="font-bold text-emerald-950">📦 Package Contents & Quick Start:</p>
                      <ul className="text-emerald-800 list-disc list-inside space-y-0.5">
                        {isComplete ? (
                          <>
                            <li>Access the Google Drive folder above to download the full source code, reports (PDF & DOCX), PPT, and viva defense Q&A.</li>
                            <li>Watch the included video walkthrough for setup guidance and live reconnaissance demonstration.</li>
                            <li>MEGA repository mirror is also available above for high-speed direct archive download.</li>
                          </>
                        ) : (
                          <>
                            <li>Click the open access button above to open the secure MEGA repository.</li>
                            <li>Download and extract the archive to your machine.</li>
                            <li>Refer to the included setup guide and video tour to get started.</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                );
              })()}

              {order.status === 'pending_verification' && (
                <div className="p-6 rounded-2xl bg-blue-50/90 border border-blue-200 text-[13px] text-blue-900 space-y-4">
                  <div className="flex items-center gap-2 font-semibold text-blue-950 text-[15px]">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span>Payment Recorded — Under Manual Verification</span>
                  </div>
                  <p className="leading-relaxed">
                    Your 12-digit UTR has been submitted. Parth Arora (SOC Analyst) will manually verify this transaction against bank records.
                  </p>

                  <div className="pt-2 border-t border-blue-200/80 text-[12px] text-blue-800">
                    <p>
                      🔒 To ensure licensing and protect package integrity, links are not provided before payment verification. Once your payment is verified, Parth Arora will provide your delivery links manually to your registered email.
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
