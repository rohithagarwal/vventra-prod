import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Trust Architecture Page (/trust) 1:1 Reference Match', () => {
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

  test('renders 1:1 identical Trust page with all 9 sections and exact reference structure', async ({ page }) => {
    await page.goto('/trust');
    await page.waitForLoadState('networkidle');

    // 1. Hero
    const hero = page.locator('header.hero');
    await expect(hero).toBeVisible();
    await expect(hero.locator('h1')).toContainText('Trust is engineered');
    await expect(hero.locator('.hero-pills .pill')).toHaveCount(4);

    // 2. Section 01: The trust paradox
    const paradox = page.locator('section.paradox-section');
    await expect(paradox).toBeVisible();
    await expect(paradox.locator('.section-marker .name')).toHaveText('The trust paradox');
    await expect(paradox.locator('.paradox-card')).toHaveCount(2);
    await expect(paradox.locator('.paradox-vs')).toHaveText('vs');
    await expect(paradox.locator('.paradox-resolution')).toBeVisible();

    // 3. Section 02: The five layers
    const layers = page.locator('section.layers-section');
    await expect(layers).toBeVisible();
    await expect(layers.locator('.section-marker .name')).toHaveText('The five layers');
    await expect(layers.locator('.layer-card')).toHaveCount(5);

    // 4. Section 03: Escrow flow diagram
    const escrow = page.locator('section.escrow-section');
    await expect(escrow).toBeVisible();
    await expect(escrow.locator('.section-marker .name')).toHaveText('Escrow flow · visualised');
    await expect(escrow.locator('.flow-step')).toHaveCount(5);

    // 5. Section 04: Staged reveal mechanism
    const staged = page.locator('section.reveal-section');
    await expect(staged).toBeVisible();
    await expect(staged.locator('.section-marker .name')).toHaveText('Staged reveal mechanism');
    await expect(staged.locator('.tier-card')).toHaveCount(5);

    // 6. Section 05: Refund policy
    const refund = page.locator('section.refund-section');
    await expect(refund).toBeVisible();
    await expect(refund.locator('.section-marker .name')).toHaveText('Refund policy');
    await expect(refund.locator('.refund-card')).toHaveCount(2);

    // 7. Section 06: Dispute resolution
    const dispute = page.locator('section.dispute-section');
    await expect(dispute).toBeVisible();
    await expect(dispute.locator('.section-marker .name')).toHaveText('Dispute resolution');
    await expect(dispute.locator('.timeline-node')).toHaveCount(5);

    // 8. Section 07: Premium guarantee tier
    const guarantee = page.locator('section.guarantee-section');
    await expect(guarantee).toBeVisible();
    await expect(guarantee.locator('.section-marker .name')).toHaveText('Premium tier');

    // 9. Section 08: Infrastructure partners
    const partners = page.locator('section.partners-section');
    await expect(partners).toBeVisible();
    await expect(partners.locator('.section-marker .name')).toHaveText('Infrastructure partners');
    await expect(partners.locator('.partner-card')).toHaveCount(4);

    // 10. Section 09: FAQ accordion
    const faq = page.locator('section.faq-section');
    await expect(faq).toBeVisible();
    await expect(faq.locator('.section-marker .name')).toHaveText('Frequently asked');
    const faqItems = faq.locator('.faq-item');
    await expect(faqItems).toHaveCount(7);

    // Test FAQ expansion
    const firstQ = faqItems.first().locator('.faq-q');
    await firstQ.click();
    await expect(faqItems.first()).toHaveClass(/open/);

    // 11. Final CTA
    const cta = page.locator('section#cta.final');
    await expect(cta).toBeVisible();
    await expect(cta.locator('h2')).toContainText('Now you know exactly how it works');

    // Capture visual verification screenshot
    await page.screenshot({ path: path.join(artifactDir, 'showcase_trust_page.png'), fullPage: true });
  });

  test('Navbar Trust link navigates directly to /trust and activates active link', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const trustLink = page.locator('nav.top .nav-links a[data-route="trust"]').first();
    await expect(trustLink).toBeVisible();
    await expect(trustLink).toHaveAttribute('href', '/trust');

    await trustLink.click();
    await page.waitForURL('**/trust');
    expect(page.url()).toContain('/trust');

    // Active state highlighted
    await expect(page.locator('nav.top .nav-links a[data-route="trust"]').first()).toHaveClass(/active/);
  });
});
