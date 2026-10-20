import { useState, useEffect } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import {
  Download,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export const RecoveryPage = () => {
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [reference, setReference] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadData, setDownloadData] = useState<{
    downloadToken: string;
    downloadUrl: string;
    expiresAt: string;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    // Check if query params contain ref
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setReference(refParam.toUpperCase());
    }
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/recovery/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request recovery code.');
      }

      setStep('VERIFY');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/recovery/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference: reference.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          code: code.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      setDownloadData(data);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#0B0B14] font-sans antialiased flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[560px] mx-auto px-6 pt-[calc(var(--header-h)+env(safe-area-inset-top,0px)+24px)] lg:pt-[calc(var(--header-h)+64px)] pb-16 sm:pb-24 w-full">
        <div className="bg-white rounded-[24px] border border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-7 sm:p-9 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#F2F4FD] text-[#4F8FF7] mx-auto flex items-center justify-center">
              <KeyRound className="w-7 h-7 stroke-[2]" />
            </div>
            <h1 className="text-[26px] font-bold text-[#0B0B14]">Get My Files (File Recovery)</h1>
            <p className="text-[14px] text-gray-500 max-w-[420px] mx-auto">
              Returning buyer? Enter your order reference and email to generate a fresh, secure 15-minute download link.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'REQUEST' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1.5">Order Reference</label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={(e) => setReference(e.target.value.toUpperCase())}
                  placeholder="e.g. SPIDY-7K3Q9"
                  className="w-full px-4 py-2.5 font-mono text-[15px] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F8FF7]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1.5">Purchase Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="The email you used during checkout"
                  className="w-full px-4 py-2.5 text-[15px] rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F8FF7]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#4F8FF7] hover:bg-[#3D82EE] text-white font-semibold text-[15px] shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Sending Code...' : 'Send 6-Digit Email Code'}
              </button>
            </form>
          )}

          {step === 'VERIFY' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-[13px] text-blue-900">
                A 6-digit verification code has been dispatched to <strong>{email}</strong>. Check your inbox and spam folder.
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#0B0B14] mb-1.5">Enter 6-Digit Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 font-mono text-[20px] tracking-[6px] text-center rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4F8FF7]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="py-3 px-5 rounded-full border border-gray-300 text-[14px] text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex-1 py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[15px] shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify Code & Issue Link'}
                </button>
              </div>
            </form>
          )}

          {step === 'SUCCESS' && downloadData && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-[20px] font-bold text-gray-900">Your Download Link is Ready!</h2>
              <p className="text-[13px] text-gray-500">
                Valid for 15 minutes. Maximum 3 downloads per link.
              </p>

              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-left space-y-2">
                <div className="text-[12px] font-bold uppercase text-gray-400">Download Link</div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={downloadData.downloadUrl}
                    className="w-full bg-white px-3 py-2 text-[12px] font-mono border rounded-lg text-gray-600"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(downloadData.downloadUrl);
                      setCopiedToken(true);
                      setTimeout(() => setCopiedToken(false), 2000);
                    }}
                    className="p-2 border rounded-lg hover:bg-white text-gray-500"
                    title="Copy Link"
                  >
                    {copiedToken ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <a
                href={downloadData.downloadUrl}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-b from-[#5B9BFA] to-[#3B7FF0] hover:from-[#4E91F5] hover:to-[#3174E6] text-white font-semibold text-[16px] inline-flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(79,143,247,0.35)] transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Start Download (Release ZIP)</span>
              </a>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
