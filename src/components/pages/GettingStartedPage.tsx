import { useState } from 'react';
import { DocsLayout } from '../docs/DocsLayout';
import { CodeBlock } from '../product/CodeBlock';
import { Callout } from '../product/Callout';
import { DocsChecklist } from '../docs/DocsChecklist';

export const GettingStartedPage = () => {
  const [activeSidebarId, setActiveSidebarId] = useState('requirements');
  const [activeTocId, setActiveTocId] = useState('requirements');
  const [osTab, setOsTab] = useState<'windows' | 'posix'>('windows');

  const sidebarSections = [
    {
      title: 'GETTING STARTED',
      items: [
        { id: 'requirements', label: 'System Requirements' },
        { id: 'install', label: 'Installation & Setup' },
        { id: 'first-run', label: 'First Run (python run.py)' },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'first-scan', label: 'Launching Your First Scan' },
        { id: 'reading-results', label: 'Interpreting Results' },
        { id: 'exporting', label: 'Exporting Data (CSV/JSON)' },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        { id: 'troubleshooting', label: 'Troubleshooting & FAQ' },
        { id: 'authorized-use', label: 'Authorized Use Policy' },
      ],
    },
  ];

  const tocItems = [
    { id: 'requirements', label: 'Requirements' },
    { id: 'install', label: 'Installation' },
    { id: 'first-run', label: 'Launch System' },
    { id: 'first-scan', label: 'First Recon Scan' },
    { id: 'reading-results', label: 'Read Results' },
    { id: 'exporting', label: 'Export Data' },
    { id: 'checklist', label: 'Deployment Checklist' },
    { id: 'troubleshooting', label: 'Troubleshooting' },
    { id: 'authorized-use', label: 'Legal & Authorized Use' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSidebarId(id);
    setActiveTocId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const checklistItems = [
    { id: 'python-check', label: 'Verified Python 3.9+ installed and added to PATH' },
    { id: 'venv-created', label: 'Created and activated Python virtual environment (.venv)' },
    { id: 'deps-installed', label: 'Installed dependencies from requirements.txt' },
    { id: 'system-launched', label: 'Executed python run.py and verified Web UI at port 5173' },
    { id: 'first-scan-run', label: 'Executed first test scan in Passive mode against own domain' },
    { id: 'results-exported', label: 'Exported test scan results in JSON / CSV format' },
  ];

  return (
    <DocsLayout
      title="Getting Started Guide"
      subtitle="Run your first automated open source intelligence reconnaissance scan with SpidyDashboard in under two minutes."
      readingTime="5 min read"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Documentation', href: '/docs/getting-started' },
        { label: 'Getting Started Guide' },
      ]}
      sidebarSections={sidebarSections}
      activeSidebarId={activeSidebarId}
      onSelectSidebar={scrollToSection}
      tocItems={tocItems}
      activeTocId={activeTocId}
      onSelectToc={scrollToSection}
    >
      {/* Authorized Use Callout Banner */}
      <Callout type="authorized" title="Strict Legal Compliance & Authorized Scanning">
        Only scan targets, domains, IP addresses, and digital assets that you own or have explicit, written legal authorization to test. Unauthorized active scanning may violate computer crime laws and network provider terms of service.
      </Callout>

      {/* SECTION 1: REQUIREMENTS */}
      <section id="requirements" className="pt-4 scroll-mt-28">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          1. System Requirements
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          SpidyDashboard runs natively on Windows, macOS, and Linux. Ensure your host machine meets the minimum system specifications:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-black/[0.06]">
            <span className="text-[11px] font-mono uppercase text-gray-500 block">Runtime</span>
            <span className="font-headline font-semibold text-[16px] text-[#0B0B14] mt-0.5 block">
              Python 3.9 — 3.12
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-black/[0.06]">
            <span className="text-[11px] font-mono uppercase text-gray-500 block">Memory</span>
            <span className="font-headline font-semibold text-[16px] text-[#0B0B14] mt-0.5 block">
              2 GB RAM minimum
            </span>
          </div>
          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-black/[0.06]">
            <span className="text-[11px] font-mono uppercase text-gray-500 block">Storage</span>
            <span className="font-headline font-semibold text-[16px] text-[#0B0B14] mt-0.5 block">
              500 MB (SQLite db)
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 2: INSTALLATION */}
      <section id="install" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          2. Installation &amp; Virtual Environment
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          Extract your SpidyDashboard source code directory and initialize a clean Python virtual environment to avoid dependency conflicts:
        </p>

        {/* OS Tabs */}
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setOsTab('windows')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-mono font-medium transition-colors cursor-pointer ${
              osTab === 'windows' ? 'bg-[#0B0B14] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Windows (PowerShell)
          </button>
          <button
            type="button"
            onClick={() => setOsTab('posix')}
            className={`px-3 py-1.5 rounded-lg text-[13px] font-mono font-medium transition-colors cursor-pointer ${
              osTab === 'posix' ? 'bg-[#0B0B14] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Linux &amp; macOS (bash/zsh)
          </button>
        </div>

        {osTab === 'windows' ? (
          <CodeBlock
            language="powershell"
            filename="PowerShell Console"
            code={`# 1. Navigate to project root
cd "C:\\spidydashboard"

# 2. Create isolated Python virtual environment
python -m venv .venv

# 3. Activate the virtual environment
.\\.venv\\Scripts\\Activate.ps1

# 4. Install SpiderFoot and Bridge dependencies
pip install -r requirements.txt`}
          />
        ) : (
          <CodeBlock
            language="bash"
            filename="Terminal"
            code={`# 1. Navigate to project root
cd ~/spidydashboard

# 2. Create isolated Python virtual environment
python3 -m venv .venv

# 3. Activate the virtual environment
source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt`}
          />
        )}
      </section>

      {/* SECTION 3: FIRST RUN */}
      <section id="first-run" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          3. Launching SpidyDashboard (python run.py)
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          SpidyDashboard features a unified launcher script (<code>run.py</code>) that automatically starts all three required architectural services in coordination:
        </p>

        <CodeBlock
          language="bash"
          filename="Terminal / PowerShell"
          code="python run.py"
        />

        <div className="mt-4 p-5 rounded-2xl bg-[#F8F9FD] border border-black/[0.06]">
          <h4 className="font-headline font-semibold text-[15px] text-[#0B0B14] mb-2">
            Services Initialized by run.py:
          </h4>
          <ul className="space-y-2 text-[14px] font-sans text-[#444444]">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <strong>SpiderFoot Core:</strong> Running on <code>http://127.0.0.1:5001</code> (CherryPy engine).
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <strong>FastAPI Analytics Bridge:</strong> Running on <code>http://127.0.0.1:8000</code> (REST API &amp; WebSocket).
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <strong>Vite Dashboard UI:</strong> Automatically opens your browser to <code>http://localhost:5173</code>.
            </li>
          </ul>
        </div>
      </section>

      {/* SECTION 4: LAUNCHING YOUR FIRST SCAN */}
      <section id="first-scan" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          4. Running Your First Recon Scan
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          You can initiate scans through the Web UI or directly via the command-line interface. For your very first scan, use the <strong>Passive</strong> use case:
        </p>

        <CodeBlock
          language="bash"
          filename="CLI Passive Scan Command"
          code="python sf.py -s yourdomain.com -u passive -o json"
        />

        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mt-4">
          In the Web UI:
        </p>
        <ol className="list-decimal pl-6 space-y-2 text-[14px] font-sans text-[#444444]">
          <li>Navigate to <strong>New Scan</strong> in the top navigation bar.</li>
          <li>Enter a descriptive <strong>Scan Name</strong> (e.g. <code>Audit-Q4-Target</code>).</li>
          <li>Input your seed <strong>Scan Target</strong> (domain, IP, or CIDR).</li>
          <li>Select the <strong>Passive</strong> use case pill to ensure stealth operation.</li>
          <li>Click <strong>Run Scan Now</strong>.</li>
        </ol>
      </section>

      {/* SECTION 5: READING RESULTS */}
      <section id="reading-results" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          5. Interpreting Dashboard Findings
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          As modules execute, data streams into your dashboard in real-time across four distinct perspectives:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-black/[0.06] shadow-sm">
            <span className="font-headline font-semibold text-[15px] text-[#0B0B14] block">
              Asset Topology Graph
            </span>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              Interactive node visualization showing parents, children, and discovered perimeter relationships.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.06] shadow-sm">
            <span className="font-headline font-semibold text-[15px] text-[#0B0B14] block">
              Correlations Matrix
            </span>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              Prioritized list of multi-source findings ranked by risk severity (Critical, High, Medium, Low).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.06] shadow-sm">
            <span className="font-headline font-semibold text-[15px] text-[#0B0B14] block">
              Data Entity Browser
            </span>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              Filterable tabular views of all DNS records, IP addresses, emails, and credentials discovered.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.06] shadow-sm">
            <span className="font-headline font-semibold text-[15px] text-[#0B0B14] block">
              Live Console Logs
            </span>
            <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
              Real-time terminal stream mirroring backend queries, rate-limit pauses, and module diagnostics.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: EXPORTING */}
      <section id="exporting" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          6. Exporting Findings
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          Export full scan datasets for offline analysis, SIEM ingestion, or executive reporting:
        </p>

        <CodeBlock
          language="bash"
          filename="CLI Export Example"
          code={`# Export scan results directly to CSV
python sf.py -s targetcorp.com -u footprint -o csv > results.csv

# Export scan results directly to JSON
python sf.py -s targetcorp.com -u footprint -o json > results.json`}
        />
      </section>

      {/* INTERACTIVE PROGRESS CHECKLIST */}
      <div id="checklist">
        <DocsChecklist storageKey="getting_started" items={checklistItems} />
      </div>

      {/* SECTION 7: TROUBLESHOOTING */}
      <section id="troubleshooting" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          7. Troubleshooting &amp; Diagnostics
        </h2>

        <div className="space-y-4 text-[14px] font-sans">
          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-black/[0.06]">
            <h4 className="font-semibold text-[#0B0B14]">Port 5001 or 8000 already occupied?</h4>
            <p className="mt-1 text-gray-600">
              Run <code>netstat -ano | findstr :5001</code> on Windows or <code>lsof -i :5001</code> on Linux to inspect existing processes. <code>run.py</code> automatically handles clean shutdowns on Ctrl+C.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#F8F9FD] border border-black/[0.06]">
            <h4 className="font-semibold text-[#0B0B14]">Database locked error?</h4>
            <p className="mt-1 text-gray-600">
              SpidyDashboard enables SQLite WAL (Write-Ahead Logging) mode by default for concurrent reads and writes. Ensure no external SQLite browser has locked <code>spiderfoot.db</code> in exclusive mode.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60">
            <h4 className="font-semibold text-blue-950">Need Deployment Help or Source Code Support?</h4>
            <p className="mt-1 text-blue-800">
              Reach out directly to creator Parth Arora (SOC Analyst) at{' '}
              <a href="mailto:parthxcore@gmail.com" className="font-semibold underline hover:text-blue-900">
                parthxcore@gmail.com
              </a>{' '}
              for instant troubleshooting, module integration, or custom setup guidance.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 8: AUTHORIZED USE POLICY */}
      <section id="authorized-use" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          8. Authorized Use &amp; MIT License Notice
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          SpidyDashboard is an analytical interface built on the open-source SpiderFoot reconnaissance framework, licensed under the <strong>MIT License</strong>.
        </p>
        <div className="p-4 rounded-xl bg-[#F8F9FD] border border-black/[0.06] text-[13px] font-mono text-gray-600">
          Built on SpiderFoot, MIT License (c) Steve Micallef and contributors.
          SpidyDashboard analytics enhancements (c) 2026 Parth Arora, SOC Analyst.
        </div>
      </section>
    </DocsLayout>
  );
};

export default GettingStartedPage;
