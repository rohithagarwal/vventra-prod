import { test, expect } from '@playwright/test';

test.describe('Live Opportunity Listing and Dashboard Stats Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    // Only set default auth tokens if not already present; do NOT wipe localStorage on subsequent navigations
    await page.addInitScript(() => {
      if (!localStorage.getItem('vve-access-token')) {
        localStorage.setItem('vve-stage', 'verified');
        localStorage.setItem('vve-access-token', 'valid-test-token');
        localStorage.setItem('vve-role', 'investor');
        localStorage.setItem('vve-user', JSON.stringify({
          id: 'u_tester',
          email: 'tester@vventra.com',
          role: 'investor',
          status: 'active'
        }));
      }
    });
  });

  test('starts at zero listings, lists an opportunity on /list, and verifies dashboard dynamically updates with live stats', async ({ page }) => {
    // Explicitly start with clean slate for this test
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('vve-opportunities');
      localStorage.removeItem('vve-composed-listing');
    });

    // 1. Visit /dashboard initially - verify zero stats
    await page.goto('/dashboard');
    await expect(page.locator('#inv-m1')).toHaveText('0');
    await expect(page.locator('#inv-m2')).toHaveText('0');
    await expect(page.locator('#inv-m3')).toHaveText('0');
    await expect(page.locator('#deal-feed')).toContainText('No platform listings yet');
    await expect(page.locator('.picks-grid .platform-empty-state')).toBeVisible();

    // 2. Visit /browse - verify zero opportunities empty state
    await page.goto('/browse');
    await expect(page.locator('.browse-count')).toContainText('0 opportunities');
    await expect(page.locator('.platform-empty-state')).toBeVisible();

    // 3. Visit /list and compose an opportunity
    await page.goto('/list');
    await page.evaluate(() => {
      localStorage.setItem('vve-role', 'architect');
    });

    const submitBtn = page.locator('#lsubSubmitBtn');
    await expect(submitBtn).toBeDisabled();

    // Fill the 5 required fields
    await page.locator('input[data-fid="title"]').fill('AI Logistics Routing Engine');
    await page.locator('textarea[data-fid="hook"]').fill('Autonomous dispatch and routing system reducing freight deadhead miles by 42%.');
    await page.locator('input[data-fid="price"]').fill('45000');
    await page.locator('textarea[data-fid="thesis"]').fill('Cross-border trucking carriers lack dynamic load-matching infrastructure. This engine captures $1.2B carrier TAM.');
    await page.locator('textarea[data-fid="problem"]').fill('Dispatcher manual phone calls result in 28% empty return trips and $18k lost revenue per rig annually.');

    // Price calculates $4,500 unlock fee (10%)
    await expect(page.locator('#pvUnlock')).toHaveText('$4,500');

    // Submit for review
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Success screen appears
    await expect(page.locator('#listSubmitSuccess')).toBeVisible();

    // Set role to investor to view investor dashboard
    await page.evaluate(() => {
      localStorage.setItem('vve-role', 'investor');
    });

    // 4. Navigate back to /dashboard via the button or direct navigation
    await page.locator('#lsubPreviewBtn').click();
    await page.waitForURL('**/dashboard');

    // 5. Verify live stats dynamically updated on Dashboard!
    await expect(page.locator('#inv-m1')).toHaveText('1');
    await expect(page.locator('#inv-m1-d')).toHaveText('+1 today');
    await expect(page.locator('#inv-m2')).toHaveText('1');
    await expect(page.locator('#inv-m3')).toHaveText('1');

    // Deal feed now streams the live opportunity
    const dealFeed = page.locator('#deal-feed');
    await expect(dealFeed).toContainText('AI Logistics Routing Engine');
    await expect(dealFeed).toContainText('$4,500');

    // Thesis match callout updated
    await expect(page.locator('.role-show[data-show="investor"] .insight-callout')).toContainText('1 listing matched your thesis');

    // Picks grid shows the opportunity card
    const pickCard = page.locator('.picks-grid .pick-card').first();
    await expect(pickCard).toBeVisible();
    await expect(pickCard).toContainText('AI Logistics Routing Engine');

    // 6. Navigate to /browse - verify card is listed
    await page.goto('/browse');
    await expect(page.locator('.browse-count')).toContainText('1 opportunity');
    const oppCard = page.locator('.opp-card').first();
    await expect(oppCard).toBeVisible();
    await expect(oppCard.locator('.opp-title')).toHaveText('AI Logistics Routing Engine');
    await expect(oppCard.locator('.op-unlock')).toHaveText('$4,500');

    // 7. Click the opportunity card to open /listing?id=...
    await oppCard.click();
    await page.waitForURL(/.*\/listing\?id=.*/);

    // Verify opportunity detail view
    await expect(page.locator('.listing-main-title')).toHaveText('AI Logistics Routing Engine');
    await expect(page.locator('aside')).toContainText('$4,500');
    await expect(page.locator('text=Cross-border trucking carriers lack dynamic load-matching')).toBeVisible();
  });
});
