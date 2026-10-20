import { LegalPageLayout } from './LegalPageLayout';

export const LicensePage = () => {
  return (
    <LegalPageLayout
      title="Software License Agreement"
      subtitle="Personal and educational use terms, SpiderFoot MIT attribution, and limitations."
      lastUpdated="October 19, 2026"
    >
      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">1. Software License Scope</h2>
        <p>
          SpidyDashboard is created by <strong>Parth Arora (SOC Analyst)</strong>. It provides an automated reconnaissance
          dashboard built on top of the SpiderFoot open source intelligence engine.
        </p>
        <p>
          Purchase of SpidyDashboard, Student Edition (₹999) grants the designated buyer a non-exclusive license for{' '}
          <strong>personal, research, academic, and non-commercial educational use</strong>.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">2. SpiderFoot Open Source Engine Attribution (MIT License)</h2>
        <p>
          This dashboard integrates and references modules from the SpiderFoot OSINT engine:
        </p>
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[12px] leading-relaxed text-gray-800">
          Copyright (c) 2012-2023, Steve Micallef &lt;steve@binarypool.com&gt; and SpiderFoot Contributors.
          <br /><br />
          Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
          documentation files (the "Software"), to deal in the Software without restriction, including without limitation
          the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software...
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">3. Commercial Restrictions</h2>
        <p>
          The buyer may NOT resell, repackage, white-label, or commercially redistribute this software package or study
          materials without entering into a separate commercial enterprise licensing agreement with Parth Arora.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-[20px] font-bold text-gray-900">4. Per-Buyer License Manifest</h2>
        <p>
          Every delivered release archive includes a signed <code>LICENSE-BUYER.txt</code> containing the order reference,
          buyer email, unique license key, and verification hash.
        </p>
      </section>
    </LegalPageLayout>
  );
};
