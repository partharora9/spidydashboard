import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Send,
  Globe,
  Shield,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal = ({ isOpen, onClose }: ContactModalProps) => {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('parthxcore@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a brief message.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          message: message.trim(),
          plan: 'standard',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to dispatch message. You can email parthxcore@gmail.com directly.');
      }
    } catch {
      setError('Network connection error. Please email parthxcore@gmail.com directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenGmail = () => {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=parthxcore@gmail.com&su=${encodeURIComponent(
      'Inquiry: SpidyDashboard OSINT & Source Code'
    )}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
          className="relative w-full max-w-[560px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 my-auto"
        >
          {/* Top Decorative Header */}
          <div className="relative bg-gradient-to-r from-blue-600 via-[#4F8FF7] to-indigo-600 p-6 sm:p-7 text-white">
            <button
              onClick={onClose}
              aria-label="Close contact modal"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">
                  Developer Direct Contact
                </span>
                <h3 className="text-[22px] font-bold text-white tracking-tight leading-tight">
                  Connect with Parth Arora
                </h3>
              </div>
            </div>
            <p className="text-blue-100 text-[13px] leading-relaxed max-w-[430px]">
              SOC Analyst &amp; Creator of SpidyDashboard. Direct email for purchasing, source code inquiries, and technical support.
            </p>
          </div>

          <div className="p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Primary Email Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/80 to-indigo-50/40 border border-blue-200/70 shadow-xs">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-700 font-mono mb-1.5">
                Official Direct Email Address
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="font-mono text-[16px] sm:text-[17px] font-bold text-[#0B0B14] select-all break-all">
                  parthxcore@gmail.com
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                      copied
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-200'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-gray-500" />
                        <span>Copy Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons: Open in Gmail & Native Mail */}
              <div className="mt-3.5 pt-3 border-t border-blue-200/50 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenGmail}
                  className="px-4 py-2 rounded-xl bg-[#4F8FF7] hover:bg-[#3E82ED] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Compose in Gmail Web</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </button>

                <a
                  href="mailto:parthxcore@gmail.com?subject=Inquiry: SpidyDashboard OSINT"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 text-[13px] font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-gray-500" />
                  <span>Default Mail App</span>
                </a>
              </div>
            </div>

            {/* Quick Send Message Form */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[15px] font-bold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#4F8FF7]" />
                  <span>Or Send a Message Directly Here:</span>
                </h4>
              </div>

              {submitted ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <Check className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h5 className="font-bold text-emerald-950 text-[16px]">Message Sent!</h5>
                  <p className="text-[13px] text-emerald-800 leading-relaxed max-w-[380px] mx-auto">
                    Your inquiry has been dispatched to <strong>parthxcore@gmail.com</strong>. Parth Arora will review and reply to your email shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="mt-2 text-[12px] font-semibold text-emerald-700 underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[13px]">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F8FF7] text-[14px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                        Your Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F8FF7] text-[14px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                      Your Message / Inquiry <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Hi Parth, I'm interested in purchasing SpidyDashboard / have a question regarding..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4F8FF7] text-[14px] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-[#0B0B14] hover:bg-gray-800 active:scale-[0.99] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Direct Message to Parth</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Quick Links Row */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500">
              <span className="font-medium text-gray-700">Online Profiles:</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://partharora-soc.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4F8FF7] hover:underline flex items-center gap-1 font-medium"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Portfolio</span>
                </a>
                <span>&bull;</span>
                <a
                  href="https://www.linkedin.com/in/parth-arora-1343b5368/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4F8FF7] hover:underline flex items-center gap-1 font-medium"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
