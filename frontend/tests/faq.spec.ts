import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('FAQ Page (/faq) 1:1 Reference Match', () => {
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

  test('renders 1:1 identical FAQ page with Hero, Tab Switcher, Buyer Track (24 questions), Accordions, and Contact Card', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');

    // 1. Hero
    const hero = page.locator('header.hero');
    await expect(hero).toBeVisible();
    await expect(hero.locator('.eyebrow')).toHaveText('Questions answered · honestly');
    await expect(hero.locator('h1')).toContainText('Everything you need');
    await expect(hero.locator('h1 em')).toHaveText('before');
    await expect(hero.locator('#faq-search-input')).toBeVisible();
    await expect(hero.locator('#faq-count')).toHaveText('24 questions');

    // 2. Tab Switcher
    const tabsWrap = page.locator('.tabs-wrap');
    await expect(tabsWrap).toBeVisible();
    await expect(tabsWrap).toHaveAttribute('data-tab', 'buyer');
    await expect(tabsWrap.locator('.tab-btn[data-tab="buyer"]')).toHaveClass(/active/);
    await expect(tabsWrap.locator('.tab-btn[data-tab="architect"]')).not.toHaveClass(/active/);

    // 3. Buyer Track
    const buyerTrack = page.locator('#track-buyer');
    await expect(buyerTrack).toBeVisible();
    await expect(buyerTrack.locator('.faq-intro h3')).toContainText('buyers and investors');

    // 4 Categories in Buyer track
    const buyerCats = buyerTrack.locator('.faq-category');
    await expect(buyerCats).toHaveCount(4);
    await expect(buyerCats.nth(0).locator('.cat-num')).toHaveText('01');
    await expect(buyerCats.nth(0).locator('.cat-title')).toContainText('Getting');
    await expect(buyerCats.nth(1).locator('.cat-num')).toHaveText('02');
    await expect(buyerCats.nth(1).locator('.cat-title')).toContainText('Payment');
    await expect(buyerCats.nth(2).locator('.cat-num')).toHaveText('03');
    await expect(buyerCats.nth(2).locator('.cat-title')).toContainText('Using the');
    await expect(buyerCats.nth(3).locator('.cat-num')).toHaveText('04');
    await expect(buyerCats.nth(3).locator('.cat-title')).toContainText('Disputes');

    // Total 24 questions in Buyer track
    const buyerItems = buyerTrack.locator('.faq-item');
    await expect(buyerItems).toHaveCount(24);

    // 4. Accordion Toggle Interaction
    const firstItem = buyerItems.first();
    await expect(firstItem).not.toHaveClass(/open/);
    await firstItem.locator('.faq-q').click();
    await expect(firstItem).toHaveClass(/open/);
    await firstItem.locator('.faq-q').click();
    await expect(firstItem).not.toHaveClass(/open/);

    // 5. Contact Section / Channels
    const contact = page.locator('section.contact-section');
    await expect(contact).toBeVisible();
    await expect(contact.locator('h2')).toContainText("Didn't find your");
    await expect(contact.locator('.channel')).toHaveCount(3);
    await expect(contact.locator('a[data-route="trust"]')).toHaveAttribute('href', '/trust');

    // Capture visual verification screenshot
    await page.screenshot({ path: path.join(artifactDir, 'showcase_faq_page.png'), fullPage: true });
  });

  test('tab switching toggles between Buyer (24 questions) and Architect (22 questions) tracks', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');

    // Initial state: Buyer
    await expect(page.locator('#track-buyer')).toBeVisible();
    await expect(page.locator('#faq-count')).toHaveText('24 questions');

    // Click As an Architect
    await page.locator('.tab-btn[data-tab="architect"]').click();
    await expect(page.locator('.tabs-wrap')).toHaveAttribute('data-tab', 'architect');
    await expect(page.locator('#track-architect')).toBeVisible();
    await expect(page.locator('#faq-count')).toHaveText('22 questions');

    // Check Architect track categories
    const archCats = page.locator('#track-architect .faq-category');
    await expect(archCats).toHaveCount(4);
    await expect(archCats.nth(0).locator('.cat-title')).toContainText('Listing');
    await expect(archCats.nth(1).locator('.cat-title')).toContainText('Pricing');
    await expect(archCats.nth(2).locator('.cat-title')).toContainText('IP');
    await expect(archCats.nth(3).locator('.cat-title')).toContainText('Disputes');

    // Switch back to Buyer
    await page.locator('.tab-btn[data-tab="buyer"]').click();
    await expect(page.locator('.tabs-wrap')).toHaveAttribute('data-tab', 'buyer');
    await expect(page.locator('#track-buyer')).toBeVisible();
    await expect(page.locator('#faq-count')).toHaveText('24 questions');
  });

  test('real-time search filters questions and shows empty state when no match', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('#faq-search-input');
    await searchInput.fill('escrow');

    // Should filter items and update count
    const countText = await page.locator('#faq-count').textContent();
    expect(countText).toMatch(/\d+ questions?/);
    await expect(page.locator('#no-results')).not.toHaveClass(/show/);

    // Search with non-existent query
    await searchInput.fill('xyznonexistentquery999');
    await expect(page.locator('#faq-count')).toHaveText('0 questions');
    await expect(page.locator('#no-results')).toHaveClass(/show/);
    await expect(page.locator('#no-results h2')).toContainText('No questions match');

    // Clear search
    await searchInput.fill('');
    await expect(page.locator('#faq-count')).toHaveText('24 questions');
    await expect(page.locator('#no-results')).not.toHaveClass(/show/);
  });

  test('Navbar FAQ link routes directly to /faq and activates active highlight', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const faqLink = page.locator('nav.top .nav-links a[data-route="faq"]').first();
    await expect(faqLink).toBeVisible();
    await expect(faqLink).toHaveAttribute('href', '/faq');

    await faqLink.click();
    await page.waitForURL('**/faq');
    expect(page.url()).toContain('/faq');

    await expect(page.locator('nav.top .nav-links a[data-route="faq"]').first()).toHaveClass(/active/);
  });
});
