const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5173';

const VIEWPORTS = [
  { name: '320px', width: 320, height: 600, isMobile: true },
  { name: '360px', width: 360, height: 800, isMobile: true },
  { name: '390px', width: 390, height: 844, isMobile: true },
  { name: '414px', width: 414, height: 896, isMobile: true },
  { name: '768px', width: 768, height: 1024, isMobile: false },
  { name: '1024px', width: 1024, height: 768, isMobile: false },
  { name: '1440px', width: 1440, height: 900, isMobile: false },
  { name: 'landscape-390', width: 844, height: 390, isMobile: true },
];

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'pricing', path: '/pricing' },
  { name: 'about', path: '/about' },
  { name: 'attack-surface', path: '/features/attack-surface-mapping' },
  { name: 'threat-intel', path: '/features/threat-intelligence' },
  { name: 'footprinting', path: '/features/automated-footprinting' },
  { name: 'modules', path: '/modules' },
  { name: 'custom-sdk', path: '/modules/custom-sdk' },
  { name: 'getting-started', path: '/docs/getting-started' },
  { name: 'rest-api-cli', path: '/docs/rest-api-cli' },
];

async function runAudit(phase = 'before') {
  const auditDir = path.join(__dirname, '..', 'audit', phase);
  fs.mkdirSync(auditDir, { recursive: true });

  const browser = await chromium.launch();
  const results = [];

  console.log(`=== STARTING ${phase.toUpperCase()} AUDIT ON ${BASE_URL} ===\n`);

  for (const pageInfo of PAGES) {
    for (const vp of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile,
        deviceScaleFactor: 2,
      });

      const page = await context.newPage();
      try {
        await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000); // Allow animations & layout to settle

        // Check horizontal overflow
        const overflowData = await page.evaluate(() => {
          const docEl = document.documentElement;
          const body = document.body;
          const winWidth = window.innerWidth;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const hasOverflow = scrollWidth > winWidth + 1;

          let offending = [];
          if (hasOverflow) {
            const allElements = document.querySelectorAll('*');
            for (const el of allElements) {
              const r = el.getBoundingClientRect();
              if (r.right > winWidth + 2) {
                // Determine selector
                let sel = el.tagName.toLowerCase();
                if (el.id) sel += `#${el.id}`;
                else if (el.className && typeof el.className === 'string') {
                  const firstClass = el.className.trim().split(/\s+/)[0];
                  if (firstClass) sel += `.${firstClass}`;
                }
                offending.push({
                  selector: sel,
                  className: (el.className || '').toString().slice(0, 60),
                  tag: el.tagName.toLowerCase(),
                  overflowPx: Math.round(r.right - winWidth),
                  width: Math.round(r.width),
                });
              }
            }
          }

          // Small touch targets (<44x44)
          const touchElements = [];
          const interactives = document.querySelectorAll('button, a, input, select');
          for (const el of interactives) {
            const r = el.getBoundingClientRect();
            // visible only
            if (r.width > 0 && r.height > 0 && (r.width < 44 || r.height < 44)) {
              let text = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || '').slice(0, 30).trim();
              touchElements.push({
                tag: el.tagName.toLowerCase(),
                text,
                width: Math.round(r.width),
                height: Math.round(r.height),
              });
            }
          }

          // Font sizes < 14px
          const smallTextElements = [];
          const textNodes = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6, a, button, li, th, td');
          for (const el of textNodes) {
            const fs = parseFloat(window.getComputedStyle(el).fontSize);
            if (fs > 0 && fs < 14 && (el.innerText || '').trim().length > 0) {
              smallTextElements.push({
                tag: el.tagName.toLowerCase(),
                fontSize: `${fs}px`,
                sample: (el.innerText || '').slice(0, 25).trim(),
              });
            }
          }

          return {
            winWidth,
            scrollWidth,
            hasOverflow,
            offending: offending.slice(0, 8),
            touchCount: touchElements.length,
            touchSamples: touchElements.slice(0, 5),
            smallTextCount: smallTextElements.length,
            smallTextSamples: smallTextElements.slice(0, 5),
          };
        });

        // Screenshot
        const screenshotPath = path.join(auditDir, `${pageInfo.name}_${vp.name}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });

        results.push({
          page: pageInfo.name,
          path: pageInfo.path,
          viewport: vp.name,
          width: vp.width,
          ...overflowData,
        });

        if (overflowData.hasOverflow) {
          console.log(`[OVERFLOW DETECTED] ${pageInfo.name} @ ${vp.name}: scrollWidth=${overflowData.scrollWidth} > innerWidth=${overflowData.winWidth}`);
          for (const off of overflowData.offending) {
            console.log(`   -> ${off.selector} (width: ${off.width}px, overflow: +${off.overflowPx}px) class: ${off.className}`);
          }
        }
      } catch (err) {
        console.error(`Error auditing ${pageInfo.name} @ ${vp.name}:`, err.message);
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();

  const reportPath = path.join(__dirname, '..', 'audit', `${phase}_report.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\nAudit complete! Saved report to ${reportPath}\n`);
  return results;
}

runAudit(process.argv[2] || 'before');
