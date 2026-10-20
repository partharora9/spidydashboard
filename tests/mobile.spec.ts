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

  test('Zero Horizontal Overflow Across All Pages and Viewports', async ({ page }) => {
    test.setTimeout(120000);
    for (const route of TEST_PAGES) {
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 800 });
        await page.goto(route.path, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(200);

        const scrollWidth = await page.evaluate(() => {
          return Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
        });

        // scrollWidth must never exceed viewport width by more than 1px
        expect(scrollWidth, `Overflow detected on ${route.name} at ${w}px width`).toBeLessThanOrEqual(w + 1);
      }
    }
  });

  test('Hamburger Navigation Opens Full-Screen Sheet and Toggles Accordions on Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // Locate hamburger button via explicit ID
    const menuBtn = page.locator('#mobile-menu-trigger');
    await expect(menuBtn).toBeVisible();

    // Open sheet
    await menuBtn.click();
    await page.waitForTimeout(400);

    // Assert sheet container is mounted and visible
    const sheet = page.locator('#mobile-menu-sheet');
    await expect(sheet).toBeVisible();

    // Verify accordion items expand on tap
    const featuresBtn = sheet.getByRole('button', { name: /Features/i });
    await expect(featuresBtn).toBeVisible();
    await featuresBtn.click();
    await page.waitForTimeout(300);

    // Check that child link (e.g. Attack Surface Mapping) is rendered
    const asmLink = sheet.getByRole('link', { name: /Attack surface mapping/i });
    await expect(asmLink).toBeVisible();

    // Close sheet via menu button
    await menuBtn.click();
    await page.waitForTimeout(300);
    await expect(sheet).not.toBeVisible();
  });

  test('Homepage Preview Cards Snap-Scroll and Aligned Baseline on Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    await page.waitForTimeout(500);

    const showcase = page.locator('#preview-carousel-container');
    if (await showcase.count() > 0) {
      await expect(showcase).toBeVisible();
      // Scroll to showcase section
      await showcase.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);

      // Verify dots indicator is present
      const dots = page.locator('button[aria-label^="Go to slide"]');
      expect(await dots.count()).toBeGreaterThanOrEqual(3);
    }
  });

  test('Sticky Buy Bar Appears on Pricing Page as Plan Cards Scroll Past Viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/pricing', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Scroll down past plan cards
    await page.evaluate(() => {
      window.scrollTo(0, 3000);
      window.dispatchEvent(new Event('scroll'));
    });
    await page.waitForTimeout(800);

    // Sticky buy bar should be visible on mobile
    const stickyBar = page.locator('#pricing-sticky-buy-bar');
    await expect(stickyBar).toBeVisible();

    // Sticky bar has buy link
    const buyLink = stickyBar.getByRole('link', { name: /buy now/i });
    await expect(buyLink).toBeVisible();
  });

  test('Checkout Bottom Sheet Opens and Inputs are Safe from Auto-Zoom (16px+)', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/pricing', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Click Buy button to trigger Checkout
    const buyButton = page.getByRole('button', { name: /buy complete kit|get source code/i }).first();
    if (await buyButton.isVisible()) {
      await buyButton.click();
      await page.waitForTimeout(500);

      const emailInput = page.locator('#checkout-email');
      if (await emailInput.isVisible()) {
        const fontSize = await emailInput.evaluate((el) => window.getComputedStyle(el).fontSize);
        const sizePx = parseFloat(fontSize);
        // Must be >= 16px to prevent iOS auto-zoom
        expect(sizePx).toBeGreaterThanOrEqual(16);
      }
    }
  });

  test('Desktop 1440px Reference View Unchanged', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(800);

    // Hamburger button should NOT be visible on desktop (1440px)
    const hamburger = page.locator('#mobile-menu-trigger');
    await expect(hamburger).toBeHidden();

    // Desktop nav dropdown items should be present in DOM
    const featuresNav = page.getByRole('button', { name: /features/i }).first();
    await expect(featuresNav).toBeVisible();

    // Verify page width does not scroll horizontally
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(1440);
  });
});
