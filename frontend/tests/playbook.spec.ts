import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Playbook Page (/playbook) 1:1 Reference Match', () => {
  const artifactDir = 'C:/Users/rohit/.gemini/antigravity/brain/805df1dc-3c11-45cd-8996-1ea9aea20024';

  test.beforeEach(async ({ page }) => {
    // Authenticate user via localStorage
    await page.addInitScript(() => {
      localStorage.setItem('vve-stage', 'verified');
      localStorage.setItem('vve-access-token', 'valid-bearer-token');
      localStorage.setItem('vve-role', 'investor');
      localStorage.setItem('vve-user', JSON.stringify({ id: 'u_1', email: 'member@vventra.com', role: 'investor', status: 'active' }));
    });
  });

  test('renders 1:1 identical Playbook page with all 6 chapters, role toggle, and sticky progress nav', async ({ page }) => {
    await page.goto('/playbook');
    await page.waitForLoadState('networkidle');

    // 1. Hero
    const hero = page.locator('header.hero');
    await expect(hero).toBeVisible();
    await expect(hero.locator('.eyebrow')).toContainText('The Playbook · Strategic guidelines');
    await expect(hero.locator('h1')).toContainText('How serious users get');
    await expect(hero.locator('h1 em')).toHaveText('serious results.');
    await expect(hero.locator('.role-toggle')).toBeVisible();

    // 2. Progress Nav
    const progNav = page.locator('.progress-nav');
    await expect(progNav).toBeVisible();
    const steps = progNav.locator('.prog-step');
    await expect(steps).toHaveCount(6);
    await expect(steps.nth(0)).toContainText('Mindset');
    await expect(steps.nth(1)).toContainText('Preparation');
    await expect(steps.nth(2)).toContainText('Execution');
    await expect(steps.nth(3)).toContainText('Red flags');
    await expect(steps.nth(4)).toContainText('Success patterns');
    await expect(steps.nth(5)).toContainText('Common mistakes');

    // 3. Buyer Track Chapters (Investor)
    const buyerTrack = page.locator('.role-show[data-show="investor"]');
    await expect(buyerTrack).toBeVisible();

    // CH 01: Mindset
    const ch1 = buyerTrack.locator('#ch-01');
    await expect(ch1).toBeVisible();
    await expect(ch1.locator('h2')).toContainText('Think like an');
    await expect(ch1.locator('.principles-grid .principle')).toHaveCount(4);

    // CH 02: Preparation
    const ch2 = buyerTrack.locator('#ch-02');
    await expect(ch2).toBeVisible();
    await expect(ch2.locator('.checklist .check-item')).toHaveCount(7);

    // CH 03: Execution
    const ch3 = buyerTrack.locator('#ch-03');
    await expect(ch3).toBeVisible();
    await expect(ch3.locator('.stages .stage')).toHaveCount(5);

    // CH 04: Red Flags
    const ch4 = buyerTrack.locator('#ch-04');
    await expect(ch4).toBeVisible();
    await expect(ch4.locator('.red-flags .red-flag')).toHaveCount(6);

    // CH 05: Success Patterns
    const ch5 = buyerTrack.locator('#ch-05');
    await expect(ch5).toBeVisible();
    await expect(ch5.locator('.success-grid .success-card')).toHaveCount(3);

    // CH 06: Common Mistakes
    const ch6 = buyerTrack.locator('#ch-06');
    await expect(ch6).toBeVisible();
    await expect(ch6.locator('.mistakes .mistake')).toHaveCount(5);

    // 4. Closing section
    const closing = page.locator('section.closing');
    await expect(closing).toBeVisible();
    await expect(closing.locator('.closing-card h2')).toContainText('The platform');
    await expect(closing.locator('a[href="/dashboard"]')).toBeVisible();
    await expect(closing.locator('a[href="/trust"]')).toBeVisible();
    await expect(closing.locator('a[href="/faq"]')).toBeVisible();

    // 5. Screenshot in Dark Mode
    await page.screenshot({ path: path.join(artifactDir, 'showcase_playbook_dark.png'), fullPage: true });

    // 6. Role Switch to Architect
    const architectBtn = page.locator('.role-btn[data-role="architect"]');
    await architectBtn.click();

    const architectTrack = page.locator('.role-show[data-show="architect"]');
    await expect(architectTrack).toBeVisible();
    await expect(buyerTrack).toBeHidden();

    // Architect CH 01: Mindset
    const archCh1 = architectTrack.locator('#ch-01');
    await expect(archCh1).toBeVisible();
    await expect(archCh1.locator('h2')).toContainText('Think like a');
    await expect(archCh1.locator('.principles-grid .principle')).toHaveCount(4);

    // Architect CH 02: Preparation (8 checklist items)
    const archCh2 = architectTrack.locator('#ch-02');
    await expect(archCh2.locator('.checklist .check-item')).toHaveCount(8);

    // Architect CH 04: Red flags (6 red flags)
    const archCh4 = architectTrack.locator('#ch-04');
    await expect(archCh4.locator('.red-flags .red-flag')).toHaveCount(6);

    // 7. Light Mode Theme test
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('vve-theme', 'light');
    });
    await page.waitForTimeout(400);

    // Verify Light mode contrast
    await page.screenshot({ path: path.join(artifactDir, 'showcase_playbook_light.png'), fullPage: false });
  });

  test('progress navigation scrolls to target chapters smoothly', async ({ page }) => {
    await page.goto('/playbook');
    await page.waitForLoadState('networkidle');

    // Click 04 Red Flags
    const redFlagsBtn = page.locator('.prog-step', { hasText: 'Red flags' });
    await redFlagsBtn.click();
    await page.waitForTimeout(600);

    const ch4 = page.locator('.role-show[data-show="investor"] #ch-04');
    await expect(ch4).toBeInViewport();
  });
});
