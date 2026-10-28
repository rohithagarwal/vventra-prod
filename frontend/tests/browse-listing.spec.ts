import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Browse and Listing Pages Zero-Listing Production State', () => {
  const artifactDir = 'C:/Users/rohit/.gemini/antigravity/brain/805df1dc-3c11-45cd-8996-1ea9aea20024';

  test.beforeEach(async ({ page }) => {
    // Authenticate user via localStorage so AuthGuard lets us through
    await page.addInitScript(() => {
      localStorage.setItem('vve-stage', 'verified');
      localStorage.setItem('vve-access-token', 'valid-bearer-token');
      localStorage.setItem('vve-role', 'investor');
      localStorage.setItem('vve-user', JSON.stringify({ id: 'u_1', email: 'member@vventra.com', role: 'investor', status: 'active' }));
    });
  });

  test('Browse page loads, renders 0 opportunities count and reference empty state', async ({ page }) => {
    await page.route('**/api/**/opportunities*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ total: 0, items: [] }),
      });
    });
    await page.goto('/browse');
    await page.waitForLoadState('networkidle');

    // Title / Header
    const heading = page.locator('h1');
    await expect(heading).toContainText('Curated opportunities');

    // Check filter pills
    const pills = page.locator('.bfilter');
    await expect(pills).toHaveCount(10);
    await expect(pills.first()).toHaveText('All');

    // Check opportunity count is 0
    await expect(page.locator('.browse-count')).toContainText('0 opportunities');

    // Check empty state
    const emptyState = page.locator('.platform-empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState.locator('h3')).toContainText('No published opportunities yet');
    await expect(emptyState.locator('p')).toContainText('Approved listings will appear automatically when they are published');

    // No dummy opp-cards rendered
    await expect(page.locator('.opp-card')).toHaveCount(0);

    // Screenshot browse page in zero-listing state
    await page.screenshot({ path: path.join(artifactDir, 'showcase_browse_page_empty.png'), fullPage: true });
  });

  test('Listing page renders clean zero-state when no published opportunity is selected', async ({ page }) => {
    await page.goto('/listing');
    await page.waitForLoadState('networkidle');

    // Check empty state
    const emptyState = page.locator('.platform-empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState.locator('h1')).toContainText('No published opportunities yet');

    // Screenshot listing detail page
    await page.screenshot({ path: path.join(artifactDir, 'showcase_listing_page_empty.png'), fullPage: true });
  });

  test('Guest access to /browse and /listing redirects to /login', async ({ page }) => {
    // Clear storage to act as guest
    await page.addInitScript(() => {
      localStorage.clear();
    });

    // Visit /browse as guest
    await page.goto('/browse');
    await expect(page).toHaveURL(/.*login.*/);

    // Visit /listing as guest
    await page.goto('/listing');
    await expect(page).toHaveURL(/.*login.*/);
  });
});