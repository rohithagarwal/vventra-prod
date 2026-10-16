import { test, expect } from '@playwright/test';

test.describe('Navbar Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        return route.abort();
      }
      return route.continue();
    });
  });

  test('renders top navbar with reference brand logos and correct navigation links', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const nav = page.locator('nav.top');
    await expect(nav).toBeVisible();

    // Brand logo
    const lightLogo = page.locator('.brand-logo-light');
    const darkLogo = page.locator('.brand-logo-dark');
    await expect(lightLogo).toBeAttached();
    await expect(darkLogo).toBeAttached();

    // In default light mode, light logo is visible, dark logo is hidden
    await expect(lightLogo).toBeVisible();
    await expect(darkLogo).not.toBeVisible();

    // Nav links
    const navLinks = page.locator('.nav-links a');
    await expect(page.locator('.nav-links a[data-route="dashboard"]')).toHaveText('Dashboard');
    await expect(page.locator('.nav-links a[data-route="trust"]')).toHaveText('Trust');
    await expect(page.locator('.nav-links a[data-route="playbook"]')).toHaveText('Playbook');
    await expect(page.locator('.nav-links a[data-route="faq"]')).toHaveText('FAQ');
    await expect(page.locator('.nav-links a[data-route="pricing"]')).toHaveText('Pricing');
    await expect(page.locator('.nav-links a[data-route="browse"]')).toHaveText('Opportunities');
    await expect(page.locator('.nav-links a[data-route="terms"]')).toHaveText('Terms');

    // Architecture should NOT exist in nav links
    await expect(page.locator('.nav-links a[data-route="architecture"]')).toHaveCount(0);

    // List an opportunity is hidden in investor mode
    const listLink = page.locator('.nav-links a[data-route="list"]');
    await expect(listLink).not.toBeVisible();
  });

  test('toggles dark and light mode with theme button', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    const themeToggle = page.locator('#theme-toggle');
    await expect(themeToggle).toBeVisible();

    // Toggle to dark
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // In dark mode, dark logo is visible, light logo is hidden
    await expect(page.locator('.brand-logo-dark')).toBeVisible();
    await expect(page.locator('.brand-logo-light')).not.toBeVisible();

    // Toggle back to light
    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('.brand-logo-light')).toBeVisible();
    await expect(page.locator('.brand-logo-dark')).not.toBeVisible();
  });

  test('shows Log in button for guest, and active route highlight on /pricing and /terms', async ({ page }) => {
    // Pricing page
    await page.goto('/pricing');
    await page.waitForTimeout(500);
    const pricingLink = page.locator('.nav-links a[data-route="pricing"]');
    await expect(pricingLink).toHaveClass(/active/);

    const loginBtn = page.locator('#navLoginBtn');
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toHaveText('Log in');

    // Terms page
    await page.goto('/terms');
    await page.waitForTimeout(500);
    const termsLink = page.locator('.nav-links a[data-route="terms"]');
    await expect(termsLink).toHaveClass(/active/);
  });

  test('shows Verify identity pill when in applied stage', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('vve-stage', 'applied');
      window.dispatchEvent(new Event('storage'));
    });
    await page.reload();
    await page.waitForTimeout(500);

    const appliedPill = page.locator('.nav-account-pill.applied');
    await expect(appliedPill).toBeVisible();
    await expect(appliedPill).toHaveText('Verify identity');
  });

  test('shows List an opportunity when logged in, and navigates directly to /list without login prompt', async ({ page }) => {
    await page.goto('/');
    // Set user as logged in
    await page.evaluate(() => {
      localStorage.setItem('vve-stage', 'applied');
      localStorage.setItem('vve-role', 'architect');
      window.dispatchEvent(new Event('storage'));
    });
    await page.reload();
    await page.waitForTimeout(500);

    const listLink = page.locator('.nav-links a[data-route="list"]');
    await expect(listLink).toBeVisible();
    await expect(listLink).toHaveText('List an opportunity');
    await expect(listLink).toHaveAttribute('href', '/list');

    // Click link -> navigates directly to /list
    await listLink.click();
    await page.waitForURL('**/list');

    // On /list, verify composer is visible and NO login prompt appears
    await expect(page.locator('.list-page')).toBeVisible();
    await expect(page.locator('.list-page h1')).toContainText('Compose your listing');
    await expect(page.locator('#listComposer')).toBeVisible();
    await expect(page.locator('#listPreview')).toBeVisible();
  });
});
