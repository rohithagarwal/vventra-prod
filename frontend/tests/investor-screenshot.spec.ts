import { test } from '@playwright/test';
import path from 'path';

test('Capture Investor Dashboard with Opportunities Section', async ({ page }) => {
  const artifactDir = 'C:/Users/rohit/.gemini/antigravity/brain/805df1dc-3c11-45cd-8996-1ea9aea20024';

  await page.addInitScript(() => {
    localStorage.setItem('vve-stage', 'verified');
    localStorage.setItem('vve-access-token', 'valid-bearer-token');
    localStorage.setItem('vve-role', 'investor');
    localStorage.setItem('vve-user', JSON.stringify({ id: 'u_1', email: 'investor@vventra.com', role: 'investor', status: 'active' }));
  });

  await page.goto('/dashboard?role=investor');
  await page.waitForLoadState('networkidle');

  // Scroll down to Section 04 and Section 05
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1000);

  // Take screenshot of Investor Dashboard Opportunities Section
  const picksSection = page.locator('.picks-section');
  await picksSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(artifactDir, 'showcase_investor_dashboard_opportunities.png'), fullPage: false });
});
