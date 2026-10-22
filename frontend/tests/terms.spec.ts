import { test, expect } from '@playwright/test';

test.describe('Terms and Policy Page (/terms)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('vve-stage', 'applied');
      localStorage.setItem('vve-role', 'investor');
    });
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        return route.abort();
      }
      return route.continue();
    });
  });

  test('renders 1:1 identical terms page with all 10 sections and exact content', async ({ page }) => {
    await page.goto('/terms');
    await page.waitForTimeout(500);

    // Section Head
    const marker = page.locator('.terms-page .section-marker');
    await expect(marker.locator('.num')).toHaveText('03');
    await expect(marker.locator('.name')).toHaveText('Platform terms');

    const h1 = page.locator('.terms-page h1.display');
    await expect(h1).toContainText('Terms and policy.');
    await expect(h1.locator('em')).toHaveText('policy.');

    await expect(page.locator('.terms-page .lead')).toContainText(
      'These are the rules that govern every interaction on vvEntra. Read them before you participate. By applying for access, you agree to these terms.'
    );

    await expect(page.locator('.terms-page')).toContainText('Last updated: June 2026 · Version 1.0');

    // All 10 sections
    const expectedSections = [
      { num: '01', title: 'Platform role', snippet: 'vvEntra is a facilitator.' },
      { num: '02', title: 'Architect responsibility', snippet: 'Architects must submit original content.' },
      { num: '03', title: 'Buyer responsibility', snippet: 'Buyers may not copy, redistribute, resell, or repurpose' },
      { num: '04', title: 'Payment terms', snippet: 'All transactions on vvEntra follow a two-stage structure.' },
      { num: '05', title: 'Refund policy', snippet: 'The unlock fee is non-refundable once you have accessed' },
      { num: '06', title: '7-day engagement window', snippet: 'Once a buyer unlocks an opportunity, both parties have 7 calendar days' },
      { num: '07', title: 'Intellectual property', snippet: 'Ownership of the opportunity, blueprint, and all associated documentation' },
      { num: '08', title: 'Dispute handling', snippet: 'Either party may raise a formal dispute within 7 calendar days' },
      { num: '09', title: 'Account policy', snippet: 'Each individual may hold only one vvEntra account.' },
      { num: '10', title: 'Privacy and data', snippet: 'vvEntra collects only the information necessary to operate the platform' },
    ];

    const sectionElements = page.locator('.terms-section');
    await expect(sectionElements).toHaveCount(10);

    for (let i = 0; i < expectedSections.length; i++) {
      const sec = sectionElements.nth(i);
      const expected = expectedSections[i];

      await expect(sec.locator('.terms-section-num')).toHaveText(expected.num);
      await expect(sec.locator('.terms-h2')).toHaveText(expected.title);
      await expect(sec.locator('.terms-section-content')).toContainText(expected.snippet);
    }

    // Terms Footer
    const termsFooter = page.locator('.terms-footer');
    await expect(termsFooter).toBeVisible();
    await expect(termsFooter.locator('.terms-footer-copy')).toContainText(
      '© 2026 vvEntra. All rights reserved. These terms are subject to change.'
    );

    const applyBtn = termsFooter.locator('a[data-route="apply"]');
    await expect(applyBtn).toHaveText('Apply for access →');
    await expect(applyBtn).toHaveAttribute('href', '/signup');
  });

  test('clicking apply CTA on terms page navigates to /signup', async ({ page }) => {
    await page.goto('/terms');
    const applyBtn = page.locator('.terms-footer a[data-route="apply"]');
    await applyBtn.click();
    await page.waitForURL('**/signup');
    expect(page.url()).toContain('/signup');
  });

  test('navbar and footer Terms links navigate to /terms', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Navbar Terms link
    const navTerms = page.locator('nav.top .nav-links a[data-route="terms"]');
    await expect(navTerms).toBeVisible();
    await navTerms.click();
    await page.waitForURL('**/terms');
    expect(page.url()).toContain('/terms');

    // Go back to home and test footer
    await page.goto('/');
    const footerTerms = page.locator('footer .footer-links a[href="/terms"]');
    await expect(footerTerms).toBeVisible();
    await footerTerms.click();
    await page.waitForURL('**/terms');
    expect(page.url()).toContain('/terms');
  });

  test('theme toggle works cleanly on /terms', async ({ page }) => {
    await page.goto('/terms');
    const toggle = page.locator('#theme-toggle');
    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await toggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
