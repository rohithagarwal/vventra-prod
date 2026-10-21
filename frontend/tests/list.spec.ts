import { test, expect } from '@playwright/test';

test.describe('List an Opportunity Composer (/list)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        return route.abort();
      }
      return route.continue();
    });
  });

  test('unauthenticated guest is redirected to login when accessing /list', async ({ page }) => {
    await page.goto('/list');
    await page.waitForURL('**/login?redirect=/list');
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('#loginSubmitBtn')).toBeVisible();
  });

  test('authenticated user accesses /list and sees 1:1 composer layout', async ({ page }) => {
    await page.goto('/list');
    // Simulate authenticated session
    await page.evaluate(() => {
      localStorage.setItem('vve-stage', 'applied');
      localStorage.setItem('vve-role', 'architect');
      window.dispatchEvent(new Event('storage'));
    });
    await page.reload();
    await page.waitForTimeout(500);

    await expect(page.locator('.list-page')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Compose your listing');
    await expect(page.locator('.vis-legend')).toBeVisible();
    await expect(page.locator('#listComposer')).toBeVisible();
    await expect(page.locator('#listPreview')).toBeVisible();
  });

  test('live preview updates in real time and calculates unlock fee', async ({ page }) => {
    await page.goto('/list');
    await page.evaluate(() => {
      localStorage.setItem('vve-stage', 'applied');
      localStorage.setItem('vve-role', 'architect');
      window.dispatchEvent(new Event('storage'));
    });
    await page.reload();
    await page.waitForTimeout(500);

    // 1. Fill title
    const titleInput = page.locator('input[data-fid="title"]');
    await titleInput.fill('AI Automated Logistics Kernel');
    await expect(page.locator('#pvTitle')).toHaveText('AI Automated Logistics Kernel');

    // 2. Fill hook
    const hookTextarea = page.locator('textarea[data-fid="hook"]');
    await hookTextarea.fill('Autonomous routing system for cross-border freight.');
    await expect(page.locator('#pvHook')).toHaveText('Autonomous routing system for cross-border freight.');

    // 3. Fill price and check 10% unlock fee calculation
    const priceInput = page.locator('input[data-fid="price"]');
    await priceInput.fill('50000');
    await expect(page.locator('#unlockCalcVal')).toHaveText('$5,000');
    await expect(page.locator('#pvUnlock')).toHaveText('$5,000');
  });

  test('readiness checklist tracks completion and allows submission', async ({ page }) => {
    await page.goto('/list');
    await page.evaluate(() => {
      localStorage.setItem('vve-stage', 'applied');
      localStorage.setItem('vve-role', 'architect');
      window.dispatchEvent(new Event('storage'));
    });
    await page.reload();
    await page.waitForTimeout(500);

    const submitBtn = page.locator('#lsubSubmitBtn');
    await expect(submitBtn).toBeDisabled();

    // Fill all 5 required fields
    await page.locator('input[data-fid="title"]').fill('SaaS Infrastructure Deal');
    await page.locator('textarea[data-fid="hook"]').fill('High margin infrastructure software platform.');
    await page.locator('input[data-fid="price"]').fill('30000');
    await page.locator('textarea[data-fid="thesis"]').fill('Large market whitespace with 300 active enterprise pilot agreements.');
    await page.locator('textarea[data-fid="problem"]').fill('Manual reconciliation takes 40 hours per month for mid-market CFOs.');

    // Submit button should now be enabled
    await expect(submitBtn).toBeEnabled();

    // Click submit
    await submitBtn.click();

    // Success screen appears
    const successCard = page.locator('#listSubmitSuccess');
    await expect(successCard).toBeVisible();
    await expect(successCard.locator('h2')).toHaveText('Listing submitted for review');
    await expect(page.locator('#lsubPreviewBtn')).toBeVisible();
    await expect(page.locator('#lsubEditBtn')).toBeVisible();
  });
});
