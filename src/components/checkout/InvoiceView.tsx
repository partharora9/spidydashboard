import { useState, useEffect } from 'react';
import { Printer, ArrowLeft } from 'lucide-react';

interface InvoiceViewProps {
  reference: string;
}

export const InvoiceView = ({ reference }: InvoiceViewProps) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${reference}/invoice`)
      .then((res) => {
        if (!res.ok) throw new Error('Invoice not found');
        return res.json();
      })
      .then((data) => setInvoice(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-mono text-[14px]">
        Generating invoice for {reference}...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="p-8 bg-white rounded-2xl border text-center space-y-3">
          <h2 className="text-[20px] font-bold text-red-600">Invoice Unavailable</h2>
          <p className="text-gray-600">{error || 'Order record not found.'}</p>
          <a href="/pricing" className="text-[#4F8FF7] underline text-[14px]">
            Return to SpidyDashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-4 sm:p-8 font-sans print:p-0 print:bg-white text-[#111111]">
      <div className="max-w-[780px] mx-auto space-y-4">
        {/* Print Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between print:hidden">
          <a
            href={`/orders/${reference}`}
            className="inline-flex items-center gap-1.5 text-[14px] text-gray-600 hover:text-black font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Order Status</span>
          </a>
          <button
            onClick={() => window.print()}
            className="py-2 px-5 rounded-full bg-[#0B0B14] hover:bg-black text-white text-[13px] font-semibold flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Invoice Paper Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-6">
          {/* Top Row: Merchant and Invoice Number */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-8">
            <div>
              <h1 className="text-[28px] font-bold text-[#0B0B14]">SpidyDashboard</h1>
              <p className="text-[13px] text-gray-500 mt-1">OSINT & Attack Surface Dashboard Engine</p>
              <div className="text-[12px] text-gray-600 mt-3 space-y-0.5">
                <div>Developer: {invoice.merchant.name}</div>
                <div>Role: SOC Analyst & Cybersecurity Practitioner</div>
                <div>Contact: hello@spidydashboard.com</div>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-400">Tax Invoice / Receipt</span>
              <div className="font-mono text-[18px] font-bold text-gray-900">{invoice.invoiceNumber}</div>
              <div className="text-[13px] text-gray-500">Date: {new Date(invoice.date).toLocaleDateString()}</div>
              <div className="pt-2">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                    invoice.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Status: {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-[13px]">
            <div>
              <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider block mb-1">Billed To</span>
              <div className="font-semibold text-gray-900 text-[15px]">{invoice.buyerName}</div>
              <div className="text-gray-600">{invoice.buyerEmail}</div>
            </div>
            <div>
              <span className="text-gray-400 font-bold uppercase text-[11px] tracking-wider block mb-1">
                Order & License Details
              </span>
              <div>
                Order Reference: <strong className="font-mono">{invoice.orderReference}</strong>
              </div>
              <div className="font-mono text-[12px] text-gray-600 mt-1">License: {invoice.licenseKey}</div>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto border-t border-b border-gray-100 py-4">
            <table className="w-full text-left text-[14px]">
              <thead>
                <tr className="text-gray-400 uppercase text-[11px] tracking-wider">
                  <th className="py-2">Item Description</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price (INR)</th>
                  <th className="py-2 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                <tr>
                  <td className="py-4">
                    <div className="font-semibold text-gray-900">{invoice.planName}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">
                      Standalone Windows desktop application (One-time download), setup guide & academic study pack.
                    </div>
                  </td>
                  <td className="py-4 text-center">1</td>
                  <td className="py-4 text-right font-mono">{invoice.amountFormatted}</td>
                  <td className="py-4 text-right font-mono font-bold text-gray-900">{invoice.amountFormatted}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end text-[14px]">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono">{invoice.amountFormatted}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes / GST:</span>
                <span className="font-mono">₹0.00*</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-[16px] border-t pt-2">
                <span>Total Paid:</span>
                <span className="font-mono text-emerald-600">{invoice.amountFormatted}</span>
              </div>
            </div>
          </div>

          {/* Legal Tax Footnote */}
          <div className="pt-6 border-t border-gray-100 text-[11px] text-gray-400 space-y-1">
            <p>
              * Note: Software sold directly as independent electronic software release. Goods & Services Tax (GST) registration
              threshold under Indian law is ₹20 Lakhs per annum. Check with your accountant regarding tax filing.
            </p>
            <p>Built on SpiderFoot, MIT License. Created by Parth Arora (SOC Analyst).</p>
          </div>
        </div>
      </div>
    </div>
  );
};
