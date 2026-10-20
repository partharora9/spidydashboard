import { LegalPageLayout } from './LegalPageLayout';

export const RefundPage = () => {
  return (
    <LegalPageLayout
      title="No Refund Policy"
      subtitle="Strict policy regarding digital software installers and electronic study pack delivery."
      lastUpdated="October 20, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">1. Strict No Refund Policy</h2>
        <p>
          Due to the digital and irrevocable nature of software installers, study guides, and instant access delivery,
          <strong> all purchases of SpidyDashboard, Student Edition are strictly final and non-refundable under any circumstances.</strong>
        </p>
        <p>
          Once payment is verified and download links are dispatched, the digital files cannot be returned or revoked. There are <strong>no refunds, returns, chargebacks, or exchanges</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">2. Review Before Purchasing</h2>
        <p>
          We encourage all prospective buyers to carefully review the complete module catalog (233+ modules), system requirements, and feature list prior to initiating a purchase.
        </p>
        <p>
          If you have any questions regarding software compatibility, dependencies, or system features, please contact Parth Arora prior to sending payment.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">3. Contact & Support</h2>
        <p>
          For pre-purchase questions, technical assistance, or setup inquiries, reach out directly:
          <br />
          <strong>Parth Arora (SOC Analyst)</strong>
          <br />
          Email: <a href="mailto:parthxcore@gmail.com" className="text-[#4F8FF7] hover:underline font-semibold">parthxcore@gmail.com</a>
        </p>
      </section>
    </LegalPageLayout>
  );
};
