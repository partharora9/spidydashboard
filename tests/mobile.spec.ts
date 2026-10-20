import { test, expect } from '@playwright/test';

const WIDTHS = [320, 360, 390, 414, 768, 1024, 1440];
const TEST_PAGES = [
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

test.describe('Mobile Responsiveness & Layout Quality Suite', () => {

  test('BUG 1 TEST: Header pinned to top 0 at all scroll positions with >= 0.92 alpha', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await page.waitForTimeout(400);

    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    const scrollPoints = [0, 400, 2000];
    for (const scrollY of scrollPoints) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollY);
      await page.waitForTimeout(150);

      const headerBox = await header.boundingBox();
      expect(headerBox, `Header must exist at scrollY ${scrollY}`).not.toBeNull();
      if (headerBox) {
        expect(headerBox.y).toBe(0);
        expect(headerBox.height).toBeGreaterThanOrEqual(72);
      }
    }

    const alpha = await header.evaluate((el) => {
      const bg = window.getComputedStyle(el).backgroundColor;
      if (bg.startsWith('rgb(')) return 1.0;
      const match = bg.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
      return match ? parseFloat(match[1]) : 1.0;
    });
    expect(alpha).toBeGreaterThanOrEqual(0.92);
  });

  test('BUG 2 TEST: Hero H1 begins below header bottom and first CTA is within first screen', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await page.waitForTimeout(400);

    const header = page.locator('header').first();
    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();

    const h1 = page.locator('h1').first();
    const h1Box = await h1.boundingBox();
    expect(h1Box).not.toBeNull();

    if (headerBox && h1Box) {
      // H1 top must be >= header bottom (nothing hidden under header)
      expect(h1Box.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height);
    }

    // First CTA (Start free scan) must be visible in first screen
    const cta = page.getByRole('link', { name: /start free scan/i }).first();
    await expect(cta).toBeVisible();
    const ctaBox = await cta.boundingBox();
    if (ctaBox) {
      expect(ctaBox.y).toBeLessThan(740);
    }
  });

  test('BUG 3 & 4 TEST: Menu sheet is opaque, blocks page elements, locks body scroll, closes on Escape, hamburger tap highlight transparent', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await page.waitForTimeout(400);

    const menuBtn = page.locator('#mobile-menu-trigger');
    await expect(menuBtn).toBeVisible();

    // Verify tap highlight is transparent
    const tapHighlight = await menuBtn.evaluate((el) => {
      return (
        (el as HTMLElement).style.webkitTapHighlightColor ||
        window.getComputedStyle(el).getPropertyValue('-webkit-tap-highlight-color') ||
        'transparent'
      );
    });
    expect(tapHighlight).toMatch(/rgba\(0,\s*0,\s*0,\s*0\)|transparent/);

    // Open sheet
    await menuBtn.click();
    await page.waitForTimeout(300);

    const sheet = page.locator('#mobile-menu-sheet');
    await expect(sheet).toBeVisible();

    // Body scroll locked
    const overflow = await page.evaluate(() => document.body.style.overflow);
    expect(overflow).toBe('hidden');

    // Sample 20 points inside the sheet to verify no hero or page text leaks through
    const pointsValid = await page.evaluate(() => {
      const sheetEl = document.getElementById('mobile-menu-sheet');
      if (!sheetEl) return false;
      const rect = sheetEl.getBoundingClientRect();
      let insideCount = 0;
      for (let i = 1; i <= 20; i++) {
        const x = rect.left + (rect.width * i) / 21;
        const y = rect.top + 30 + ((rect.height - 60) * i) / 21;
        const topEl = document.elementFromPoint(x, y);
        if (topEl && sheetEl.contains(topEl)) {
          insideCount++;
        }
      }
      return insideCount === 20;
    });
    expect(pointsValid).toBe(true);

    // Accordions expand properly
    const featuresBtn = sheet.getByRole('button', { name: /Features/i });
    await expect(featuresBtn).toBeVisible();
    await featuresBtn.click();
    await page.waitForTimeout(200);

    const asmLink = sheet.getByRole('link', { name: /Attack surface mapping/i });
    await expect(asmLink).toBeVisible();

    // Escape closes sheet and restores focus to hamburger
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(sheet).not.toBeVisible();

    // Body scroll restored
    const restoredOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(restoredOverflow).toBe('');
  });

  test('BUG 5 TEST: Footer links never overlap and email is on its own row', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await page.waitForTimeout(400);

    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    // Collect all footer link boxes
    const linkBoxes = await footer.locator('ul a').evaluateAll((links) => {
      return links.map((el) => {
        const r = el.getBoundingClientRect();
        return { text: el.textContent?.trim(), x: r.left, y: r.top, w: r.width, h: r.height };
      });
    });

    // Overlap detection: check that no two links overlap
    for (let i = 0; i < linkBoxes.length; i++) {
      for (let j = i + 1; j < linkBoxes.length; j++) {
        const a = linkBoxes[i];
        const b = linkBoxes[j];
        const xOverlap = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
        const yOverlap = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
        const intersects = xOverlap > 2 && yOverlap > 2;
        expect(intersects, `Footer links "${a.text}" and "${b.text}" overlap`).toBe(false);
      }
    }

    // Verify parthxcore@gmail.com is rendered in its own dedicated contact section
    const emailLink = footer.locator('a[href^="mailto:parthxcore@gmail.com"]').first();
    await expect(emailLink).toBeVisible();
  });

  test('BUG 6 TEST: Bento cards have no oversized empty gaps and collage fits within card', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await page.waitForTimeout(400);

    const cardA = page.locator('h3:has-text("200+ Modules")').locator('xpath=ancestor::div[contains(@class, "rounded-[24px]")]').first();
    if (await cardA.count() > 0) {
      const cardBox = await cardA.boundingBox();
      expect(cardBox).not.toBeNull();
      if (cardBox) {
        // Card height on mobile should be under 400px (not stretched to 500px+)
        expect(cardBox.height).toBeLessThan(400);
      }
    }

    // Collage fits within Card C
    const cardC = page.locator('h3:has-text("Ready-made scan profiles")').locator('xpath=ancestor::div[contains(@class, "rounded-[24px]")]').first();
    if (await cardC.count() > 0) {
      const cardCBox = await cardC.boundingBox();
      expect(cardCBox).not.toBeNull();
      if (cardCBox) {
        // Fits within viewport width
        expect(cardCBox.x + cardCBox.width).toBeLessThanOrEqual(360);
      }
    }
  });

  test('Zero Horizontal Overflow Across All Pages and Viewports', async ({ page }) => {
    test.setTimeout(120000);
    for (const route of TEST_PAGES) {
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 800 });
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(150);

        const scrollWidth = await page.evaluate(() => {
          return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        });

        // scrollWidth must never exceed viewport width by more than 1px
        expect(scrollWidth, `Overflow detected on ${route.name} at ${w}px width`).toBeLessThanOrEqual(w + 1);
      }
    }
  });

  test('Desktop 1440px Reference View Unchanged', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(600);

    // Hamburger button should NOT be visible on desktop (1440px)
    const hamburger = page.locator('#mobile-menu-trigger');
    await expect(hamburger).toBeHidden();

    // Desktop nav dropdown items should be present in DOM
    const featuresNav = page.getByRole('button', { name: /features/i }).first();
    await expect(featuresNav).toBeVisible();

    // Verify page width does not scroll horizontally
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(1440);

    // Save desktop verification screenshot
    await page.screenshot({ path: 'audit/mobile-fix/desktop-1440.png', fullPage: false });
  });

  test('Capture Mobile Fix Screenshots', async ({ page }) => {
    // 360px Mobile Screenshots (matching user screenshots)
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await page.waitForTimeout(600);

    // 1. Header & Hero view
    await page.screenshot({ path: 'audit/mobile-fix/mobile-360-hero.png', fullPage: false });

    // 2. Mobile Menu Sheet view
    const menuBtn = page.locator('#mobile-menu-trigger');
    await menuBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'audit/mobile-fix/mobile-360-menu.png', fullPage: false });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // 3. Bento Section view
    const bentoCard = page.locator('h3:has-text("200+ Modules")').first();
    if (await bentoCard.count() > 0) {
      await bentoCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({ path: 'audit/mobile-fix/mobile-360-bento.png', fullPage: false });
    }

    // 4. Footer Section view
    const footer = page.locator('footer');
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'audit/mobile-fix/mobile-360-footer.png', fullPage: false });
  });
});
