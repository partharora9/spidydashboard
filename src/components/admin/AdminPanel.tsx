import { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  Download,
  RefreshCw,
  LogOut,
  Copy,
  ExternalLink,
  Folder,
  Video,
} from 'lucide-react';

export const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'reconciler' | 'all' | 'audit'>('pending');
  const [orders, setOrders] = useState<any[]>([]);
  const [counts, setCounts] = useState<any>({ total: 0, pending: 0, approved: 0 });
  const [planDeliveryLinks, setPlanDeliveryLinks] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bank Statement Reconciler State
  const [statementText, setStatementText] = useState('');
  const [reconcileMatches, setReconcileMatches] = useState<any[]>([]);
  const [reconciling, setReconciling] = useState(false);

  // Reject Modal State
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('UTR / Transaction ID not found in bank statement.');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 401 || res.status === 403) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      setOrders(data.orders || []);
      setCounts(data.counts || {});
      setPlanDeliveryLinks(data.planDeliveryLinks || null);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit');
      const data = await res.json();
      setAuditLogs(data.auditLogs || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret: secretInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setIsAuthenticated(true);
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAuthenticated(false);
  };

  const handleApprove = async (orderId: string) => {
    if (!confirm('Approve this payment and trigger source code delivery email?')) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const targetOrder = pendingOrders.find((o) => o.id === orderId) || orders.find((o) => o.id === orderId);
      const isComplete = targetOrder?.plan === 'complete';
      const cLinks = targetOrder?.deliveryLinks || planDeliveryLinks?.complete?.links || [];
      const sUrl = targetOrder?.primaryDeliveryUrl || planDeliveryLinks?.standard?.primaryUrl || data.downloadUrl;
      const deliveryMsg = isComplete
        ? `Delivery Links for Complete Kit (₹799):\n1. Google Drive Package:\n${cLinks[0]?.url || 'Drive link ready'}\n\n2. Video Walkthrough:\n${cLinks[1]?.url || 'Video link ready'}\n\n3. MEGA Repository Mirror:\n${cLinks[2]?.url || 'MEGA link ready'}`
        : `Delivery Link (Standard ₹499):\n${sUrl}`;
      alert(`Order approved successfully!\n\n${deliveryMsg}`);
      fetchOrders();
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectOrderId) return;
    try {
      const res = await fetch(`/api/admin/orders/${rejectOrderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRejectOrderId(null);
      fetchOrders();
    } catch (err: any) {
      alert(`Rejection error: ${err.message}`);
    }
  };

  const handleRunReconciler = async () => {
    if (!statementText.trim()) return;
    setReconciling(true);
    try {
      const res = await fetch('/api/admin/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statementText }),
      });
      const data = await res.json();
      setReconcileMatches(data.matches || []);
    } catch (err: any) {
      alert(`Reconciler error: ${err.message}`);
    } finally {
      setReconciling(false);
    }
  };

  // If not logged in, show secure login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-[#141824] border border-white/[0.08] rounded-[24px] p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#4F8FF7]/15 text-[#4F8FF7] mx-auto flex items-center justify-center">
              <Shield className="w-6 h-6 stroke-[2]" />
            </div>
            <h1 className="text-[22px] font-bold">Admin Console</h1>
            <p className="text-[13px] text-gray-400">Enter ADMIN_SECRET token to authenticate session.</p>
          </div>

          {error && <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-[13px]">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[12px] font-mono uppercase text-gray-400 mb-1">Admin Secret Token</label>
              <input
                type="password"
                required
                value={secretInput}
                onChange={(e) => setSecretInput(e.target.value)}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.12] text-white font-mono text-[14px] focus:outline-none focus:border-[#4F8FF7]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#4F8FF7] hover:bg-[#3D82EE] font-semibold text-[15px] transition-all cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending_verification');

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-[#0B0B14] font-sans">
      {/* Top Admin Navbar */}
      <header className="bg-white border-b border-black/[0.06] sticky top-0 z-30 px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-[#0B0B14] text-white">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-[17px] font-bold text-[#0B0B14]">SpidyDashboard Admin</h1>
              <span className="text-[11px] text-gray-400 font-mono">Manual UPI Bank Reconciliation</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                fetchOrders();
                fetchAuditLogs();
              }}
              className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <a
              href="/api/admin/export"
              className="py-1.5 px-3.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[13px] font-medium text-gray-700 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </a>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1400px] mx-auto p-6 space-y-6">
        {/* KPI Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-sm">
            <span className="text-[12px] font-bold uppercase tracking-wider text-amber-600">Pending Verification</span>
            <div className="text-[28px] font-bold text-gray-900 mt-1">{counts.pending || 0}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-sm">
            <span className="text-[12px] font-bold uppercase tracking-wider text-emerald-600">Approved Orders</span>
            <div className="text-[28px] font-bold text-gray-900 mt-1">{counts.approved || 0}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-sm">
            <span className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Open Sessions</span>
            <div className="text-[28px] font-bold text-gray-900 mt-1">{counts.created || 0}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-sm">
            <span className="text-[12px] font-bold uppercase tracking-wider text-[#4F8FF7]">Total Transactions</span>
            <div className="text-[28px] font-bold text-gray-900 mt-1">{counts.total || 0}</div>
          </div>
        </div>

        {/* Manual Delivery Quick Actions */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white border border-[#4F8FF7]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-[#4F8FF7] text-white">
                <Shield className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-[13.5px] text-gray-900">Manual Delivery Links Quick Dispatch</span>
            </div>
            <p className="text-[12px] text-gray-600 mt-0.5">
              Copy verified fulfillment links to manually paste into WhatsApp, Email, or chat for verified buyers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                const cLinks = planDeliveryLinks?.complete?.links || [];
                const text = `SpidyDashboard Complete Kit (₹799) Delivery Package:
1. Google Drive Package (Source Code, Reports, PPT, Viva):
${cLinks[0]?.url || ''}

2. Video Walkthrough & Tour:
${cLinks[1]?.url || ''}

3. MEGA Download Mirror:
${cLinks[2]?.url || ''}

Setup guide & license are included in the package. If you need any assistance, reach out directly!`;
                navigator.clipboard.writeText(text);
                alert('Copied Complete Kit (₹799) fulfillment message with all 3 links to clipboard!');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-blue-200 hover:border-blue-300 text-[12px] font-semibold text-blue-900 inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#4F8FF7]" />
              <span>Copy ₹799 Kit Links</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const sUrl = planDeliveryLinks?.standard?.primaryUrl || '';
                const text = `SpidyDashboard Standard (₹499) Delivery Link:
${sUrl}

Complete step-by-step setup guide and walkthrough video tour are included in the package.`;
                navigator.clipboard.writeText(text);
                alert('Copied Standard (₹499) fulfillment link to clipboard!');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-gray-300 text-[12px] font-semibold text-gray-800 inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-gray-600" />
              <span>Copy ₹499 Standard Link</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 space-x-6 text-[15px] font-medium">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 relative cursor-pointer ${
              activeTab === 'pending' ? 'text-[#4F8FF7] border-b-2 border-[#4F8FF7]' : 'text-gray-500 hover:text-black'
            }`}
          >
            Pending Verification ({counts.pending || 0})
          </button>
          <button
            onClick={() => setActiveTab('reconciler')}
            className={`pb-3 relative cursor-pointer ${
              activeTab === 'reconciler' ? 'text-[#4F8FF7] border-b-2 border-[#4F8FF7]' : 'text-gray-500 hover:text-black'
            }`}
          >
            Bank Statement Reconciler
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 relative cursor-pointer ${
              activeTab === 'all' ? 'text-[#4F8FF7] border-b-2 border-[#4F8FF7]' : 'text-gray-500 hover:text-black'
            }`}
          >
            All Orders & Search
          </button>
          <button
            onClick={() => {
              setActiveTab('audit');
              fetchAuditLogs();
            }}
            className={`pb-3 relative cursor-pointer ${
              activeTab === 'audit' ? 'text-[#4F8FF7] border-b-2 border-[#4F8FF7]' : 'text-gray-500 hover:text-black'
            }`}
          >
            Audit Trail
          </button>
        </div>

        {/* TAB 1: PENDING ORDERS TABLE */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[16px] text-gray-900">Orders Awaiting Bank Verification</h3>
                <p className="text-[12px] text-gray-500">
                  Compare the exact amount and 12-digit UTR with your bank app before approving.
                </p>
              </div>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p>All caught up! No orders currently pending verification.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-200">
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Plan</th>
                      <th className="py-3 px-4">Exact Amount</th>
                      <th className="py-3 px-4">Submitted UTR</th>
                      <th className="py-3 px-4">Buyer Email</th>
                      <th className="py-3 px-4">Submitted Time</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-sans">
                    {pendingOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{order.reference}</td>
                        <td className="py-3.5 px-4 font-semibold capitalize">{order.plan}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{order.formattedAmount}</td>
                        <td className="py-3.5 px-4 font-mono bg-gray-50 font-medium text-gray-800">
                          {order.payment?.utr || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">{order.buyer_email}</td>
                        <td className="py-3.5 px-4 text-gray-500 text-[12px]">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              const isComplete = order.plan === 'complete';
                              const cLinks = order.deliveryLinks?.length ? order.deliveryLinks : planDeliveryLinks?.complete?.links || [];
                              const sUrl = order.primaryDeliveryUrl || planDeliveryLinks?.standard?.primaryUrl;
                              const link = isComplete
                                ? `SpidyDashboard Complete Kit (₹799) Delivery Links:
1. Google Drive Package (Source Code, Reports, PPT, Viva):
${cLinks[0]?.url || ''}

2. Video Walkthrough & Tour:
${cLinks[1]?.url || ''}

3. MEGA Download Mirror:
${cLinks[2]?.url || ''}`
                                : `SpidyDashboard Standard (₹499) Delivery Link:\n${sUrl || ''}`;
                              navigator.clipboard.writeText(link);
                              alert(`Copied ${isComplete ? 'Complete Kit (₹799)' : 'Standard (₹499)'} delivery link(s):\n\n${link}`);
                            }}
                            className="py-1.5 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-[12px] transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Copy customer delivery link(s)"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Links</span>
                          </button>
                          <button
                            onClick={() => handleApprove(order.id)}
                            className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[12px] shadow-sm transition-all cursor-pointer"
                          >
                            Approve & Deliver
                          </button>
                          <button
                            onClick={() => setRejectOrderId(order.id)}
                            className="py-1.5 px-3 rounded-lg bg-gray-100 hover:bg-red-50 text-red-600 font-medium text-[12px] transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BANK STATEMENT RECONCILER */}
        {activeTab === 'reconciler' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-[17px] text-gray-900">Bulk Bank Statement Reconciliation Helper</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                  Copy and paste statement lines or CSV text from your bank app (HDFC, SBI, ICICI, etc.). The engine
                  auto-extracts 12-digit UTRs and exact paise amounts to suggest candidate matches. A human click is
                  strictly required to approve.
                </p>
              </div>

              <textarea
                rows={6}
                value={statementText}
                onChange={(e) => setStatementText(e.target.value)}
                placeholder="Paste statement text or CSV rows here, e.g.:&#10;19/10/2026,UPI/CR/428819204918/PARTH ARORA/HDFC/SPIDY-7K3Q9,499.37,CR"
                className="w-full p-4 rounded-xl border border-gray-300 font-mono text-[13px] focus:outline-none focus:ring-2 focus:ring-[#4F8FF7]"
              />

              <button
                onClick={handleRunReconciler}
                disabled={reconciling || !statementText.trim()}
                className="py-2.5 px-6 rounded-xl bg-[#4F8FF7] hover:bg-[#3D82EE] text-white font-semibold text-[14px] disabled:opacity-50 cursor-pointer"
              >
                {reconciling ? 'Scanning Statement...' : 'Scan Statement for Matches'}
              </button>
            </div>

            {/* Reconciliation Candidate Results */}
            {reconcileMatches.length > 0 && (
              <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
                <div className="p-4 bg-emerald-50 border-b border-emerald-100 font-semibold text-emerald-900 text-[14px] flex items-center justify-between">
                  <span>Found {reconcileMatches.length} Candidate Matches in Statement</span>
                  <span className="text-[12px] font-normal">Human verification & approval required</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
                        <th className="py-3 px-4">Order Ref</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Statement UTR</th>
                        <th className="py-3 px-4">Confidence</th>
                        <th className="py-3 px-4">Explanation</th>
                        <th className="py-3 px-4 text-right">Approve</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reconcileMatches.map((m, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{m.orderReference}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-600">{m.orderAmountFormatted}</td>
                          <td className="py-3.5 px-4 font-mono">{m.statementUtr || '—'}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                              {m.confidencePercent}% MATCH
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600 text-[12px]">{m.explanation}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleApprove(m.orderId)}
                              className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[12px]"
                            >
                              Confirm & Deliver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ALL ORDERS & SEARCH */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-[16px] text-gray-900">All Order Records</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <th className="py-3 px-4">Ref</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Buyer Email</th>
                    <th className="py-3 px-4">UTR</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Delivery Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono font-bold">{o.reference}</td>
                      <td className="py-3 px-4 capitalize">{o.plan}</td>
                      <td className="py-3 px-4 font-mono font-semibold">{o.formattedAmount}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                            o.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'pending_verification'
                              ? 'bg-amber-100 text-amber-800'
                              : o.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{o.buyer_email}</td>
                      <td className="py-3 px-4 font-mono text-[12px]">{o.payment?.utr || '—'}</td>
                      <td className="py-3 px-4 text-gray-400 text-[12px]">
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {o.plan === 'complete' ? (() => {
                          const cLinks = o.deliveryLinks?.length ? o.deliveryLinks : planDeliveryLinks?.complete?.links || [];
                          return (
                            <div className="flex items-center justify-end gap-1.5">
                              {cLinks[0]?.url && (
                                <a
                                  href={cLinks[0].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded bg-blue-50 text-[11px] font-semibold text-[#4F8FF7] hover:bg-blue-100 transition-colors inline-flex items-center gap-1"
                                  title="Google Drive Complete Kit"
                                >
                                  <Folder className="w-3 h-3" />
                                  <span>Drive Kit</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                </a>
                              )}
                              {cLinks[1]?.url && (
                                <a
                                  href={cLinks[1].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded bg-indigo-50 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors inline-flex items-center gap-1"
                                  title="Walkthrough Video (MP4)"
                                >
                                  <Video className="w-3 h-3" />
                                  <span>Video</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                </a>
                              )}
                              {cLinks[2]?.url && (
                                <a
                                  href={cLinks[2].url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2 py-1 rounded bg-emerald-50 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
                                  title="MEGA Download Mirror"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>MEGA</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                </a>
                              )}
                            </div>
                          );
                        })() : (() => {
                          const sUrl = o.primaryDeliveryUrl || planDeliveryLinks?.standard?.primaryUrl;
                          return sUrl ? (
                            <a
                              href={sUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] font-semibold text-[#4F8FF7] hover:underline inline-flex items-center gap-1"
                            >
                              <span>MEGA Download</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Pending Approval</span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[16px] text-gray-900">Immutable Security Audit Trail</h3>
                <p className="text-[12px] text-gray-500">Every admin decision, download, and OTP is recorded.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">Action</th>
                    <th className="py-2.5 px-4">Order Ref</th>
                    <th className="py-2.5 px-4">Actor</th>
                    <th className="py-2.5 px-4">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-bold text-gray-900">{log.action}</td>
                      <td className="py-2.5 px-4 text-[#4F8FF7]">{log.order_reference || '—'}</td>
                      <td className="py-2.5 px-4 text-gray-600">{log.actor}</td>
                      <td className="py-2.5 px-4 text-gray-400">{log.ip_address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* REJECT MODAL */}
        {rejectOrderId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-[440px] w-full p-6 space-y-4 shadow-xl">
              <h3 className="text-[18px] font-bold text-gray-900">Reject Order Verification</h3>
              <p className="text-[13px] text-gray-600">Select a rejection reason to include in the email notification:</p>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-[14px]"
              >
                <option value="UTR / Transaction ID not found in bank statement records.">UTR not found in bank statement</option>
                <option value="Amount paid does not match the exact order total.">Incorrect amount paid</option>
                <option value="Duplicate or already used transaction reference.">Duplicate reference</option>
                <option value="Fraudulent or invalid submission detected.">Fraudulent submission</option>
              </select>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setRejectOrderId(null)}
                  className="py-2 px-4 rounded-lg border border-gray-300 text-[13px]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectConfirm}
                  className="py-2 px-4 rounded-lg bg-red-600 text-white font-medium text-[13px]"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
