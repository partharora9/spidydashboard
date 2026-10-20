const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const WIDTHS = [320, 360, 390, 414, 768, 1024, 1440];

const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'About', path: '/about' },
  { name: 'Attack Surface Mapping', path: '/features/attack-surface-mapping' },
  { name: 'Threat Intelligence', path: '/features/threat-intelligence' },
  { name: 'Automated Footprinting', path: '/features/automated-footprinting' },
  { name: 'Modules Catalog', path: '/modules' },
  { name: 'Custom Modules SDK', path: '/modules/custom-sdk' },
  { name: 'Getting Started', path: '/docs/getting-started' },
  { name: 'REST API & CLI', path: '/docs/rest-api-cli' },
];

async function detectOverflow() {
  const browser = await chromium.launch();
  console.log(`\n================== HORIZONTAL OVERFLOW DETECTOR ==================`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Testing widths: ${WIDTHS.join(', ')} px\n`);

  let totalViolations = 0;

  for (const p of PAGES) {
    console.log(`\n📄 Checking page: ${p.name} (${p.path})`);
    for (const w of WIDTHS) {
      const page = await browser.newPage({
        viewport: { width: w, height: 800 },
        isMobile: w < 1024,
      });

      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const overflowReport = await page.evaluate((width) => {
        // Temporarily disable overflow-x clipping to uncover true element overflow
        document.body.style.overflowX = 'visible';
        document.documentElement.style.overflowX = 'visible';

        const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        const hasOverflow = scrollWidth > width + 2;

        const offenders = [];
        if (hasOverflow) {
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const r = el.getBoundingClientRect();
            if (r.right > width + 2 || r.width > width + 2) {
              let sel = el.tagName.toLowerCase();
              if (el.id) sel += '#' + el.id;
              else if (el.className && typeof el.className === 'string') {
                const parts = el.className.trim().split(/\s+/).filter(c => !c.includes(':') && !c.includes('['));
                if (parts[0]) sel += '.' + parts[0];
              }
              offenders.push({
                selector: sel,
                width: Math.round(r.width),
                right: Math.round(r.right),
                excessPx: Math.round(Math.max(r.right - width, r.width - width)),
                className: (el.className || '').toString().slice(0, 70),
              });
            }
          }
        }

        return {
          scrollWidth,
          hasOverflow,
          offenders: offenders.slice(0, 6),
        };
      }, w);

      if (overflowReport.hasOverflow) {
        totalViolations++;
        console.log(`  ❌ [OVERFLOW] at ${w}px: scrollWidth = ${overflowReport.scrollWidth}px (+${overflowReport.scrollWidth - w}px excess)`);
        for (const off of overflowReport.offenders) {
          console.log(`     -> ${off.selector} (width: ${off.width}px, right: ${off.right}px, excess: +${off.excessPx}px) [${off.className}]`);
        }
      } else {
        console.log(`  ✓ [CLEAN] at ${w}px`);
      }

      await page.close();
    }
  }

  await browser.close();
  console.log(`\n================== AUDIT SUMMARY ==================`);
  console.log(`Total width/page combinations with horizontal overflow: ${totalViolations}`);
  console.log(`====================================================\n`);
}

detectOverflow().catch(err => {
  console.error('Overflow detector failed:', err);
  process.exit(1);
});
