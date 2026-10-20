import { useState } from 'react';
import { DocsLayout } from '../docs/DocsLayout';
import { CodeBlock } from '../product/CodeBlock';

export const RestApiCliPage = () => {
  const [activeSidebarId, setActiveSidebarId] = useState('overview');
  const [activeTocId, setActiveTocId] = useState('overview');
  const [langTab, setLangTab] = useState<'curl' | 'python'>('curl');

  const sidebarSections = [
    {
      title: 'REST API V1',
      items: [
        { id: 'overview', label: 'API Architecture & Base URL' },
        { id: 'authentication', label: 'Authentication & Headers' },
        { id: 'start-scan', label: 'Start a Scan (/api/v1/scans)' },
        { id: 'check-status', label: 'Check Status (/scans/{id}/status)' },
        { id: 'get-results', label: 'Get Correlated Results' },
        { id: 'export-api', label: 'Export Data Endpoints' },
      ],
    },
    {
      title: 'COMMAND LINE (CLI)',
      items: [
        { id: 'cli-usage', label: 'CLI Flags & Options (sf.py)' },
        { id: 'cli-automation', label: 'Headless Scripting' },
      ],
    },
    {
      title: 'DEVSECOPS PIPELINE',
      items: [
        { id: 'cicd-example', label: 'GitHub Actions CI/CD Pipeline' },
        { id: 'errors', label: 'Error Codes & HTTP Responses' },
      ],
    },
  ];

  const tocItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'authentication', label: 'Authentication' },
    { id: 'start-scan', label: 'Start a Scan' },
    { id: 'check-status', label: 'Check Status' },
    { id: 'get-results', label: 'Get Results' },
    { id: 'cli-usage', label: 'CLI Usage' },
    { id: 'cicd-example', label: 'CI/CD Pipeline' },
    { id: 'errors', label: 'Errors' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSidebarId(id);
    setActiveTocId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <DocsLayout
      title="REST API & CLI Reference"
      subtitle="Programmatically trigger reconnaissance scans, inspect live progress, correlate threats, and integrate OSINT security gates into CI/CD pipelines."
      readingTime="8 min read"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Documentation', href: '/docs/getting-started' },
        { label: 'REST API & CLI' },
      ]}
      sidebarSections={sidebarSections}
      activeSidebarId={activeSidebarId}
      onSelectSidebar={scrollToSection}
      tocItems={tocItems}
      activeTocId={activeTocId}
      onSelectToc={scrollToSection}
    >
      {/* SECTION 1: OVERVIEW */}
      <section id="overview" className="pt-4 scroll-mt-28">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          1. API Architecture &amp; Base URL
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          SpidyDashboard provides two REST interfaces:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-[14px] font-sans text-[#444444] mb-6">
          <li>
            <strong>FastAPI Analytics Bridge (Recommended):</strong> Running on <code>http://127.0.0.1:8000/api/v1</code> with modern Pydantic schemas, typed responses, and WebSocket streams.
          </li>
          <li>
            <strong>SpiderFoot Core Engine:</strong> Running on <code>http://127.0.0.1:5001</code> providing direct CherryPy REST endpoints (e.g. <code>/startscan</code>, <code>/scanstatus</code>, <code>/scancorrelations</code>).
          </li>
        </ul>

        <div className="p-4 rounded-xl bg-[#0B0F19] text-white font-mono text-[13px] border border-white/[0.08]">
          <span className="text-gray-400">Base URL: </span>
          <span className="text-[#38BDF8]">http://127.0.0.1:8000/api/v1</span>
        </div>
      </section>

      {/* SECTION 2: AUTHENTICATION */}
      <section id="authentication" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          2. Authentication &amp; Headers
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          By default, local developer bridge instances listen on loopback (<code>127.0.0.1</code>) without requiring headers. When hosting in shared environments, enable master token verification via the <code>/auth/settings</code> endpoint:
        </p>

        <CodeBlock
          language="http"
          filename="Request Headers"
          code={`POST /api/v1/scans HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: application/json
X-API-Key: YOUR_BRIDGE_MASTER_TOKEN`}
        />
      </section>

      {/* SECTION 3: START SCAN */}
      <section id="start-scan" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-mono text-[12px] font-bold">
            POST
          </span>
          <h2 className="font-headline font-semibold text-[22px] text-[#0B0B14]">
            /api/v1/scans
          </h2>
        </div>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          Initiate a new asynchronous reconnaissance scan against a target domain, IP, CIDR, email, or username.
        </p>

        {/* Parameters Table: Desktop Table + Mobile Stacked Cards */}
        <div className="hidden sm:block bg-white rounded-xl border border-black/[0.08] overflow-x-auto mb-5 text-[13px]">
          <table className="w-full text-left">
            <thead className="bg-[#F8F9FD] text-[11px] font-mono uppercase text-gray-500 border-b border-black/[0.06]">
              <tr>
                <th className="p-3">Field</th>
                <th className="p-3">Type</th>
                <th className="p-3">Required</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] font-mono">
              <tr>
                <td className="p-3 text-[#4F8FF7]">target</td>
                <td className="p-3 text-gray-600">string</td>
                <td className="p-3 text-rose-600">Yes</td>
                <td className="p-3 font-sans text-gray-700">Target identifier (e.g. <code>target.com</code>, <code>198.51.100.0/24</code>)</td>
              </tr>
              <tr>
                <td className="p-3 text-[#4F8FF7]">scan_name</td>
                <td className="p-3 text-gray-600">string</td>
                <td className="p-3 text-rose-600">Yes</td>
                <td className="p-3 font-sans text-gray-700">Friendly name for this scan instance</td>
              </tr>
              <tr>
                <td className="p-3 text-[#4F8FF7]">use_case</td>
                <td className="p-3 text-gray-600">string</td>
                <td className="p-3 text-gray-500">No (default: passive)</td>
                <td className="p-3 font-sans text-gray-700">One of: <code>passive</code>, <code>footprint</code>, <code>investigate</code>, <code>all</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Key/Value Cards (< 640px) */}
        <div className="sm:hidden space-y-3 mb-5">
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-2 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#4F8FF7]">target</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold uppercase">Required</span>
            </div>
            <div className="text-[12px] text-gray-500 font-mono">Type: string</div>
            <p className="text-[13px] text-gray-700">Target identifier (e.g. <code>target.com</code>, <code>198.51.100.0/24</code>)</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-2 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#4F8FF7]">scan_name</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold uppercase">Required</span>
            </div>
            <div className="text-[12px] text-gray-500 font-mono">Type: string</div>
            <p className="text-[13px] text-gray-700">Friendly name for this scan instance</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-2 text-[14px]">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#4F8FF7]">use_case</span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold uppercase">Optional</span>
            </div>
            <div className="text-[12px] text-gray-500 font-mono">Type: string (default: passive)</div>
            <p className="text-[13px] text-gray-700">One of: <code>passive</code>, <code>footprint</code>, <code>investigate</code>, <code>all</code></p>
          </div>
        </div>

        {/* Code Tabs */}
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => setLangTab('curl')}
            className={`px-3 py-1 rounded text-[12px] font-mono cursor-pointer ${
              langTab === 'curl' ? 'bg-[#0B0B14] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            curl
          </button>
          <button
            type="button"
            onClick={() => setLangTab('python')}
            className={`px-3 py-1 rounded text-[12px] font-mono cursor-pointer ${
              langTab === 'python' ? 'bg-[#0B0B14] text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            Python (requests)
          </button>
        </div>

        {langTab === 'curl' ? (
          <CodeBlock
            language="bash"
            filename="curl Request"
            code={`curl -X POST "http://127.0.0.1:8000/api/v1/scans" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target": "targetcorp.com",
    "scan_name": "CI-Perimeter-Check",
    "use_case": "passive"
  }'`}
          />
        ) : (
          <CodeBlock
            language="python"
            filename="Python Request"
            code={`import requests

payload = {
    "target": "targetcorp.com",
    "scan_name": "CI-Perimeter-Check",
    "use_case": "passive"
}

res = requests.post("http://127.0.0.1:8000/api/v1/scans", json=payload)
data = res.json()
scan_id = data["scan_id"]
print(f"Scan initiated: {scan_id}")`}
          />
        )}

        <CodeBlock
          language="json"
          filename="Response (200 OK)"
          code={`{
  "scan_id": "SCAN_1729348910",
  "status": "RUNNING",
  "target": "targetcorp.com",
  "use_case": "passive",
  "created_at": "2026-10-19T14:20:10Z"
}`}
        />
      </section>

      {/* SECTION 4: CHECK STATUS */}
      <section id="check-status" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-mono text-[12px] font-bold">
            GET
          </span>
          <h2 className="font-headline font-semibold text-[22px] text-[#0B0B14]">
            /api/v1/scans/&#123;scan_id&#125;/status
          </h2>
        </div>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          Poll real-time scan progress, total events discovered, and active module count.
        </p>

        <CodeBlock
          language="bash"
          filename="curl Request"
          code='curl -s "http://127.0.0.1:8000/api/v1/scans/SCAN_1729348910/status"'
        />

        <CodeBlock
          language="json"
          filename="Response (200 OK)"
          code={`{
  "scan_id": "SCAN_1729348910",
  "status": "FINISHED",
  "total_events": 892,
  "unique_entities": 48,
  "duration_seconds": 44.2,
  "modules_run": 149,
  "errors_count": 0
}`}
        />
      </section>

      {/* SECTION 5: GET RESULTS */}
      <section id="get-results" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-mono text-[12px] font-bold">
            GET
          </span>
          <h2 className="font-headline font-semibold text-[22px] text-[#0B0B14]">
            /api/v1/scans/&#123;scan_id&#125;/correlations
          </h2>
        </div>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          Retrieve multi-source correlated findings with severity rankings (CRITICAL, HIGH, MEDIUM, LOW).
        </p>

        <CodeBlock
          language="json"
          filename="Sample Response"
          code={`[
  {
    "id": "CORR_412",
    "severity": "HIGH",
    "title": "Multiple Threat Feeds Confirm Malicious IP",
    "target": "vpn.targetcorp.com (198.51.100.44)",
    "rule": "SF_CORR_084",
    "sources": ["sfp_virustotal", "sfp_abuseipdb", "sfp_shodan"],
    "evidence_count": 3
  }
]`}
        />
      </section>

      {/* SECTION 6: CLI USAGE */}
      <section id="cli-usage" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          6. Command Line Interface (sf.py)
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          SpiderFoot includes a full-featured CLI script (<code>sf.py</code>) supporting headless terminal executions:
        </p>

        {/* CLI Table: Desktop Table + Mobile Stacked Cards */}
        <div className="hidden sm:block bg-white rounded-xl border border-black/[0.08] overflow-x-auto mb-5 text-[13px]">
          <table className="w-full text-left font-mono">
            <thead className="bg-[#F8F9FD] text-[11px] uppercase text-gray-500 border-b border-black/[0.06]">
              <tr>
                <th className="p-3">Flag</th>
                <th className="p-3">Argument</th>
                <th className="p-3 font-sans">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              <tr>
                <td className="p-3 text-[#4F8FF7]">-s TARGET</td>
                <td className="p-3 text-gray-600">string</td>
                <td className="p-3 font-sans text-gray-700">Seed target identifier (domain, IP, username, email)</td>
              </tr>
              <tr>
                <td className="p-3 text-[#4F8FF7]">-u PROFILE</td>
                <td className="p-3 text-gray-600">all|footprint|investigate|passive</td>
                <td className="p-3 font-sans text-gray-700">Pre-configured use case profile</td>
              </tr>
              <tr>
                <td className="p-3 text-[#4F8FF7]">-m MODS</td>
                <td className="p-3 text-gray-600">comma list</td>
                <td className="p-3 font-sans text-gray-700">Specific modules to enable (e.g. <code>sfp_crt,sfp_whois</code>)</td>
              </tr>
              <tr>
                <td className="p-3 text-[#4F8FF7]">-o FORMAT</td>
                <td className="p-3 text-gray-600">json|csv|tab</td>
                <td className="p-3 font-sans text-gray-700">Output structure format (default: tab)</td>
              </tr>
              <tr>
                <td className="p-3 text-[#4F8FF7]">-C SCAN_ID</td>
                <td className="p-3 text-gray-600">string</td>
                <td className="p-3 font-sans text-gray-700">Run correlation engine rules against existing scan ID</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked CLI Flags (< 640px) */}
        <div className="sm:hidden space-y-3 mb-5">
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-1.5 text-[14px]">
            <div className="font-mono font-bold text-[#4F8FF7] text-[15px]">-s TARGET</div>
            <div className="text-[12px] text-gray-500 font-mono">Argument: string</div>
            <p className="text-[13px] text-gray-700">Seed target identifier (domain, IP, username, email)</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-1.5 text-[14px]">
            <div className="font-mono font-bold text-[#4F8FF7] text-[15px]">-u PROFILE</div>
            <div className="text-[12px] text-gray-500 font-mono">Argument: all | footprint | investigate | passive</div>
            <p className="text-[13px] text-gray-700">Pre-configured use case profile</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-1.5 text-[14px]">
            <div className="font-mono font-bold text-[#4F8FF7] text-[15px]">-m MODS</div>
            <div className="text-[12px] text-gray-500 font-mono">Argument: comma list</div>
            <p className="text-[13px] text-gray-700">Specific modules to enable (e.g. <code>sfp_crt,sfp_whois</code>)</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-1.5 text-[14px]">
            <div className="font-mono font-bold text-[#4F8FF7] text-[15px]">-o FORMAT</div>
            <div className="text-[12px] text-gray-500 font-mono">Argument: json | csv | tab (default: tab)</div>
            <p className="text-[13px] text-gray-700">Output structure format</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-1.5 text-[14px]">
            <div className="font-mono font-bold text-[#4F8FF7] text-[15px]">-C SCAN_ID</div>
            <div className="text-[12px] text-gray-500 font-mono">Argument: string</div>
            <p className="text-[13px] text-gray-700">Run correlation engine rules against existing scan ID</p>
          </div>
        </div>

        <CodeBlock
          language="bash"
          filename="Terminal"
          code={`# Run headless passive scan and stream json output
python sf.py -s targetcorp.com -u passive -o json > target_recon.json`}
        />
      </section>

      {/* SECTION 7: CI/CD PIPELINE EXAMPLE */}
      <section id="cicd-example" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          7. GitHub Actions Security Gate Pipeline
        </h2>
        <p className="font-sans text-[15px] text-[#444444] leading-relaxed mb-4">
          Automate perimeter checks before releasing to production. This workflow triggers a scan, polls until completion, and fails the build if high-risk findings are correlated:
        </p>

        <CodeBlock
          language="yaml"
          filename=".github/workflows/osint-recon-gate.yml"
          code={`name: Perimeter OSINT Security Gate

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 2 * * 1' # Run every Monday at 2 AM UTC

jobs:
  recon-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Dependencies
        run: |
          pip install -r requirements.txt

      - name: Execute Passive Perimeter Scan
        run: |
          python sf.py -s targetcorp.com -u passive -o json > scan_results.json

      - name: Gate on Critical / High Risks
        run: |
          python -c '
          import json, sys
          with open("scan_results.json") as f:
              findings = json.load(f)
          # Check for high-severity correlations
          criticals = [x for x in findings if x.get("type") in ["MALICIOUS_IP", "LEAKED_CREDENTIAL"]]
          if criticals:
              print(f"FAILED: Found {len(criticals)} critical exposure events!")
              sys.exit(1)
          print("SUCCESS: 0 critical perimeter exposures detected.")
          '`}
        />
      </section>

      {/* SECTION 8: ERRORS */}
      <section id="errors" className="pt-6 scroll-mt-28 border-t border-black/[0.06]">
        <h2 className="font-headline font-semibold text-[24px] text-[#0B0B14] mb-3">
          8. HTTP Status Codes &amp; Errors
        </h2>
        {/* HTTP Errors Table: Desktop Table + Mobile Stacked Cards */}
        <div className="hidden sm:block bg-white rounded-xl border border-black/[0.08] overflow-x-auto text-[13px]">
          <table className="w-full text-left font-mono">
            <thead className="bg-[#F8F9FD] text-[11px] uppercase text-gray-500 border-b border-black/[0.06]">
              <tr>
                <th className="p-3">Status</th>
                <th className="p-3 font-sans">Meaning</th>
                <th className="p-3 font-sans">Remediation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              <tr>
                <td className="p-3 text-emerald-600 font-bold">200 OK</td>
                <td className="p-3 font-sans">Request processed successfully</td>
                <td className="p-3 font-sans text-gray-500">None</td>
              </tr>
              <tr>
                <td className="p-3 text-amber-600 font-bold">400 Bad Request</td>
                <td className="p-3 font-sans">Invalid target identifier or unknown use case</td>
                <td className="p-3 font-sans text-gray-500">Check target string format</td>
              </tr>
              <tr>
                <td className="p-3 text-amber-600 font-bold">404 Not Found</td>
                <td className="p-3 font-sans">Scan ID does not exist in SQLite database</td>
                <td className="p-3 font-sans text-gray-500">Verify scan ID via <code>GET /api/v1/scans</code></td>
              </tr>
              <tr>
                <td className="p-3 text-rose-600 font-bold">500 Server Error</td>
                <td className="p-3 font-sans">Internal engine or database error</td>
                <td className="p-3 font-sans text-gray-500">Inspect logs at <code>/api/v1/scans/&#123;id&#125;/logs</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Stacked Error Cards (< 640px) */}
        <div className="sm:hidden space-y-3">
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-1.5 text-[14px]">
            <div className="font-mono font-bold text-emerald-600 text-[15px]">200 OK</div>
            <div className="text-gray-800 font-medium">Request processed successfully</div>
            <div className="text-[12px] text-gray-500">Remediation: None</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-1.5 text-[14px]">
            <div className="font-mono font-bold text-amber-600 text-[15px]">400 Bad Request</div>
            <div className="text-gray-800 font-medium">Invalid target identifier or unknown use case</div>
            <div className="text-[12px] text-gray-500">Remediation: Check target string format</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-1.5 text-[14px]">
            <div className="font-mono font-bold text-amber-600 text-[15px]">404 Not Found</div>
            <div className="text-gray-800 font-medium">Scan ID does not exist in SQLite database</div>
            <div className="text-[12px] text-gray-500">Remediation: Verify scan ID via <code>GET /api/v1/scans</code></div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-2xs space-y-1.5 text-[14px]">
            <div className="font-mono font-bold text-rose-600 text-[15px]">500 Server Error</div>
            <div className="text-gray-800 font-medium">Internal engine or database error</div>
            <div className="text-[12px] text-gray-500">Remediation: Inspect logs at <code>/api/v1/scans/&#123;id&#125;/logs</code></div>
          </div>
        </div>

        <div className="p-4 mt-6 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[14px]">
          <h4 className="font-semibold text-blue-950">API Integration Support &amp; CI/CD Pipelines</h4>
          <p className="mt-1 text-blue-800">
            Need custom webhooks, automated SIEM pipelines, or software integration assistance? Contact Parth Arora directly at{' '}
            <a href="mailto:parthxcore@gmail.com" className="font-semibold underline hover:text-blue-900">
              parthxcore@gmail.com
            </a>.
          </p>
        </div>
      </section>
    </DocsLayout>
  );
};

export default RestApiCliPage;
