import { LegalPageLayout } from './LegalPageLayout';

export const TermsPage = () => {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="Terms governing the one-time purchase, license grant, and authorized use of SpidyDashboard, Student Edition."
      lastUpdated="October 19, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">1. Acceptance of Terms</h2>
        <p>
          By purchasing, downloading, accessing, or executing SpidyDashboard, you agree to be bound by
          these Terms of Service. If you do not agree to these terms, do not complete the purchase or download the release
          files.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">2. Description of Product & Delivery</h2>
        <p>
          SpidyDashboard is an open-source intelligence (OSINT) and attack surface reconnaissance dashboard engine created by
          Parth Arora (SOC Analyst), incorporating modules derived from SpiderFoot (MIT License).
        </p>
        <p>
          The product is provided as <strong>SpidyDashboard, Student Edition (₹999 one-time payment)</strong>. It includes a
          standalone Windows Setup.exe installer, PDF setup &amp; usage guide, walkthrough video link, and project report / PPT / viva Q&amp;A
          study pack. No SaaS subscription, hosted cloud server, or recurring fees apply. Delivery is completed digitally via a
          secure download link after manual bank verification.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">3. License Grant & Restrictions</h2>
        <p>
          Upon verified payment approval, you receive a non-exclusive, non-transferable, revocable license for{' '}
          <strong>personal, academic, and educational use</strong> of the installed software:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>No Resale or Redistribution:</strong> You may not re-license, sell, rent, lease, or redistribute the installer package, study materials, or documentation to third parties.</li>
          <li><strong>Personal Educational Use:</strong> The software and materials are provided for individual academic and defensive research.</li>
          <li><strong>Attribution:</strong> You must retain embedded notices and author attribution.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">4. Authorized & Legal Reconnaissance Policy</h2>
        <p>
          SpidyDashboard contains capabilities for network querying, port enumeration, banner grabbing, and DNS interrogation.
          You explicitly agree that:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>You will execute scans only against systems, networks, and domains that you personally own or have formal written authorization to assess.</li>
          <li>You will comply with the Information Technology Act, 2000 (India), the Computer Fraud and Abuse Act (CFAA), and applicable local cybersecurity legislation.</li>
          <li>The author (Parth Arora) disclaims all legal liability for unauthorized, negligent, or malicious scanning activities conducted by purchasers.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">5. Payment Verification & Order Expiry</h2>
        <p>
          Payments are processed via manual UPI transfer to the seller's verified VPA. Orders have a 30-minute session expiry.
          Delivery is triggered after manual verification against bank statement deposits. Submitting duplicate, fake, or
          tampered transaction references (UTRs) is strictly prohibited and constitutes fraud.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">6. Strict No Refund Policy</h2>
        <p>
          Due to the digital and irrevocable nature of software installers and academic packs, all sales and payments are strictly final and non-refundable. There are no returns, refunds, or exchanges under any circumstances once payment is completed or access is dispatched.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">7. Contact & Grievance Officer</h2>
        <p>
          For licensing questions or support, contact:
          <br />
          <strong>Parth Arora</strong>
          <br />
          Email: <a href="mailto:parthxcore@gmail.com" className="text-[#4F8FF7]">parthxcore@gmail.com</a>
          <br />
          Portfolio: <a href="https://partharora-soc.vercel.app/" target="_blank" className="text-[#4F8FF7]">partharora-soc.vercel.app</a>
        </p>
      </section>
    </LegalPageLayout>
  );
};
