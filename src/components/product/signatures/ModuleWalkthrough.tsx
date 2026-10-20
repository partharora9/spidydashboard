import { useState } from 'react';
import { Download } from 'lucide-react';
import { CodeBlock } from '../CodeBlock';

const SAMPLE_MODULE_CODE = `# -*- coding: utf-8 -*-
# SpidyDashboard / SpiderFoot Custom Intelligence Plugin
from spiderfoot import SpiderFootPlugin, SpiderFootEvent

class sfp_custom_intel(SpiderFootPlugin):
    meta = {
        'name': "Custom Threat Intel",
        'summary': "Query internal threat feed for malicious IP addresses.",
        'useCases': ["Investigate", "Passive"],
        'categories': ["Reputation Systems"]
    }

    opts = {
        'api_key': "",
        'threshold': 75
    }

    def setup(self, sfc, userOpts=dict()):
        self.sf = sfc
        for opt in list(userOpts.keys()):
            self.opts[opt] = userOpts[opt]

    # 1. Declare event types to consume as input
    def watchedEvents(self):
        return ["IP_ADDRESS", "IPV6_ADDRESS"]

    # 2. Declare event types this module emits
    def producedEvents(self):
        return ["MALICIOUS_IP", "THREAT_SCORE"]

    # 3. Handle incoming event and query intelligence
    def handleEvent(self, event):
        eventData = event.data
        if eventData in self.tempStorage():
            return
        self.tempStorage()[eventData] = True

        # Query public or private intelligence feed
        url = f"https://api.internal-intel.local/v1/ip/{eventData}"
        res = self.sf.fetchUrl(url, timeout=15)
        if res['code'] == "200" and res['content']:
            score = int(res['content'])
            if score >= self.opts['threshold']:
                # 4. Emit correlated finding to engine
                evt = SpiderFootEvent(
                    "MALICIOUS_IP",
                    f"Malicious IP detected: {eventData} (Score: {score})",
                    self.__name__,
                    event
                )
                self.notifyListeners(evt)`;

const STEPS = [
  {
    id: 'declare',
    stepNumber: '01',
    title: 'Declare Plugin & Metadata',
    summary: 'Subclass SpiderFootPlugin, define name, categories, and configurable options dict.',
    lines: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
  },
  {
    id: 'watch',
    stepNumber: '02',
    title: 'Watch & Produce Events',
    summary: 'Define watchedEvents() to subscribe to incoming findings, and producedEvents() to register outputs.',
    lines: [21, 22, 23, 24, 25, 26, 27],
  },
  {
    id: 'fetch',
    stepNumber: '03',
    title: 'Fetch Threat Data',
    summary: 'Use self.sf.fetchUrl() with built-in caching, proxy support, and user-agent rotation.',
    lines: [29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
  },
  {
    id: 'emit',
    stepNumber: '04',
    title: 'Emit Findings to Engine',
    summary: 'Instantiate SpiderFootEvent and call self.notifyListeners(evt) to feed downstream modules.',
    lines: [40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
  },
];

export const ModuleWalkthrough = () => {
  const [activeStepId, setActiveStepId] = useState('declare');
  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  const downloadTemplate = () => {
    const blob = new Blob([SAMPLE_MODULE_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sfp_custom_intel.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative w-full max-w-[1200px] mx-auto px-6 mt-20 sm:mt-28 overflow-visible select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center max-w-[760px] mx-auto mb-12">
        <div className="inline-flex items-center gap-2 border border-[#0B0B14] rounded-full px-3.5 py-1 mb-4 bg-transparent">
          <span className="font-sans text-[12px] font-medium tracking-[0.06em] uppercase text-[#0B0B14]">
            SDK CODE ARCHITECTURE
          </span>
        </div>
        <h2 className="font-headline font-semibold text-[32px] sm:text-[44px] text-[#0B0B14] tracking-[-0.03em] leading-tight">
          Synchronized Module Walkthrough
        </h2>
        <p className="mt-3 font-sans text-[16px] text-[#555555]">
          A SpiderFoot plugin is a 30-line Python class. Click any step below to see the exact lifecycle methods in action.
        </p>

        {/* Download Button */}
        <button
          type="button"
          onClick={downloadTemplate}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] text-[#0B0B14] font-sans text-[14px] font-medium transition-colors border border-black/[0.08] cursor-pointer"
        >
          <Download className="w-4 h-4 text-[#4F8FF7]" />
          <span>Download sfp_custom_intel.py Template</span>
        </button>
      </div>

      {/* Grid: Left Walkthrough Steps -> Right Synchronized Code Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Steps List */}
        <div className="lg:col-span-5 space-y-3.5">
          {STEPS.map((step) => {
            const isSelected = activeStepId === step.id;
            return (
              <div
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`p-5 rounded-[20px] transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#F2F4FD] border-[#4F8FF7] shadow-[0_8px_25px_rgba(79,143,247,0.15)]'
                    : 'bg-white border-black/[0.06] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`font-mono text-[12px] font-bold px-2 py-0.5 rounded ${
                      isSelected ? 'bg-[#4F8FF7] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    STEP {step.stepNumber}
                  </span>
                  {isSelected && <span className="text-[11px] font-mono text-[#4F8FF7]">Active Focus</span>}
                </div>
                <h3 className="font-headline font-semibold text-[17px] text-[#0B0B14]">
                  {step.title}
                </h3>
                <p className="mt-1 text-[13px] text-[#555555] font-sans leading-relaxed">
                  {step.summary}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right Column: CodeBlock with active line highlighting */}
        <div className="lg:col-span-7">
          <CodeBlock
            code={SAMPLE_MODULE_CODE}
            language="python"
            filename="spiderfoot/modules/sfp_custom_intel.py"
            highlightLines={activeStep.lines}
          />
        </div>
      </div>
    </section>
  );
};
