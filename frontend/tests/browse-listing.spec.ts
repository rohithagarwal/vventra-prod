import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Browse and Listing Pages 1:1 Reference Match', () => {
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

  test('Browse page loads, renders catalog, filter pills, and navigation', async ({ page }) => {
    await page.goto('/browse');
    await page.waitForLoadState('networkidle');

    // Title / Header
    const heading = page.locator('h1');
    await expect(heading).toContainText('Curated opportunities');

    // Check filter pills
    const pills = page.locator('.bfilter');
    await expect(pills).toHaveCount(10);
    await expect(pills.first()).toHaveText('All');

    // Check opportunity cards count (6 initial items)
    const cards = page.locator('.browse-grid .opp-card');
    await expect(cards).toHaveCount(6);

    // Filter by SaaS
    await page.click('button.bfilter:has-text("SaaS")');
    await expect(page.locator('.browse-count')).toContainText('1');
    await expect(page.locator('.browse-grid .opp-card')).toHaveCount(1);

    // Reset filter
    await page.click('button.bfilter:has-text("All")');
    await expect(page.locator('.browse-count')).toContainText('6');
    await expect(page.locator('.browse-grid .opp-card')).toHaveCount(6);

    // Screenshot browse page
    await page.screenshot({ path: path.join(artifactDir, 'showcase_browse_page.png'), fullPage: true });

    // Click first card to navigate to listing detail
    await cards.first().click();
    await page.waitForURL('**/listing');
    expect(page.url()).toContain('/listing');
  });

  test('Listing dossier page loads with complete 6 sections and interactive unlock card', async ({ page }) => {
    await page.goto('/listing');
    await page.waitForLoadState('networkidle');

    // Check listing header
    await expect(page.locator('.listing-id')).toContainText('ASSET-7741-B');
    await expect(page.locator('.listing-title')).toContainText('Autonomous Backend Operations System');

    // Check key stat row
    await expect(page.locator('.listing-stats')).toBeVisible();
    await expect(page.locator('.listing-stats')).toContainText('$2,800');

    // Check sticky sidebar cards
    await expect(page.locator('.listing-sidebar')).toBeVisible();
    await expect(page.locator('.snapshot-card')).toBeVisible();
    await expect(page.locator('.unlock-mini-card')).toBeVisible();
    await expect(page.locator('.unlock-mini-card')).toContainText('$2,800');

    // Check Back to opportunities link
    const backLink = page.locator('.back-link');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/browse');

    // Check all 6 core sections exist and are populated
    await expect(page.getByRole('heading', { name: 'Investment thesis' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The problem' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Market gap' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'The architect' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Engagement model' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Why now' })).toBeVisible();

    // Screenshot listing detail page
    await page.screenshot({ path: path.join(artifactDir, 'showcase_listing_detail_page.png'), fullPage: true });
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
