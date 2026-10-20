import { useState } from 'react';
import { LegalPageLayout } from './LegalPageLayout';
import { Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const PrivacyPage = () => {
  const [deleteEmail, setDeleteEmail] = useState('');
  const [deleteCode, setDeleteCode] = useState('');
  const [deleteStep, setDeleteStep] = useState<'INITIAL' | 'CODE_SENT' | 'DONE'>('INITIAL');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/privacy/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail }),
      });
      const data = await res.json();
      setDeleteStep('CODE_SENT');
      setMsg({ text: data.message || 'Verification code sent to your email.' });
    } catch (err: any) {
      setMsg({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/privacy/delete-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: deleteEmail, code: deleteCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDeleteStep('DONE');
      setMsg({ text: data.message });
    } catch (err: any) {
      setMsg({ text: err.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Data collection limits, zero telemetry policy, and DPDP Act 2023 compliance."
      lastUpdated="October 19, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">1. Data Minimization Principle</h2>
        <p>
          In accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> of India and global
          privacy standards, SpidyDashboard operates under strict data minimization:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>We Collect:</strong> Your email address (strictly required to deliver your release archive and verification tokens) and optional name.</li>
          <li><strong>Payment References:</strong> We store your 12-digit UPI UTR reference solely for financial reconciliation and fraud prevention.</li>
          <li><strong>We NEVER Collect:</strong> Your bank account number, debit/credit cards, UPI PIN, government ID, or phone numbers.</li>
          <li><strong>Zero Scanning Telemetry:</strong> When you run the SpidyDashboard software locally, zero targets, scan results, credentials, or findings are ever sent to our servers. All reconnaissance telemetry stays 100% on your local machine.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">2. Third-Party Data Processors</h2>
        <p>
          We employ only essential infrastructure providers to fulfill your digital delivery:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Transactional Email:</strong> Resend / AWS SES (used solely to dispatch verification codes and encrypted download links).</li>
          <li><strong>Private File Storage:</strong> Cloudflare R2 / AWS S3 (private encrypted bucket for release ZIP files).</li>
          <li><strong>Hosting & Security:</strong> Cloudflare Turnstile (for automated bot mitigation without tracking cookies).</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">3. Retention & Tax Compliance</h2>
        <p>
          Order records are retained for the minimum statutory period required for commercial tax accounting under Indian
          income tax laws. Once this period elapses, records are pruned automatically.
        </p>
      </section>

      {/* Self-Serve DPDP Act Right to Erasure Section */}
      <section className="mt-8 p-6 rounded-2xl bg-gray-50 border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-bold text-[17px]">
          <Trash2 className="w-5 h-5 text-red-500" />
          <span>Self-Service Right to Erasure (DPDP Act 2023)</span>
        </div>
        <p className="text-[13px] text-gray-600">
          You have the right to request permanent redaction and anonymization of your personal data from our active
          databases. Verify your identity with a one-time email code below to anonymize all associated records:
        </p>

        {msg && (
          <div
            className={`p-3 rounded-xl text-[13px] flex items-center gap-2 ${
              msg.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {msg.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {deleteStep === 'INITIAL' && (
          <form onSubmit={handleRequestDeletion} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={deleteEmail}
              onChange={(e) => setDeleteEmail(e.target.value)}
              placeholder="Enter your purchase email"
              className="flex-1 px-4 py-2 text-[14px] rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#4F8FF7]"
            />
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-[13px] shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Sending...' : 'Request Erasure Code'}
            </button>
          </form>
        )}

        {deleteStep === 'CODE_SENT' && (
          <form onSubmit={handleVerifyDeletion} className="space-y-3">
            <input
              type="text"
              required
              maxLength={6}
              value={deleteCode}
              onChange={(e) => setDeleteCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code sent to your email"
              className="w-full px-4 py-2 font-mono text-[16px] text-center tracking-[4px] rounded-xl border border-gray-300 bg-white"
            />
            <button
              type="submit"
              disabled={loading || deleteCode.length !== 6}
              className="w-full py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-[13px] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Anonymizing...' : 'Confirm Permanent Erasure'}
            </button>
          </form>
        )}

        {deleteStep === 'DONE' && (
          <div className="p-3 bg-emerald-100/50 rounded-xl text-emerald-800 text-[13px] font-medium">
            ✅ All active personal identifiers (name, email, IP) have been permanently anonymized.
          </div>
        )}
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-[20px] font-bold text-gray-900">4. Grievance Officer</h2>
        <p>
          In accordance with the DPDP Act 2023, the designated Grievance Officer for SpidyDashboard is:
          <br />
          <strong>Parth Arora (SOC Analyst)</strong>
          <br />
          Email: <a href="mailto:parthxcore@gmail.com" className="text-[#4F8FF7]">parthxcore@gmail.com</a>
        </p>
      </section>
    </LegalPageLayout>
  );
};
