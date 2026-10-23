import { test, expect } from '@playwright/test';

test.describe('Pricing Page (/pricing)', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('vve-stage', 'verified');
      localStorage.setItem('vve-access-token', 'test-token');
      localStorage.setItem('vve-role', 'investor');
      localStorage.setItem('vve-user', JSON.stringify({ id: 'u_test', email: 'investor@vventra.com', role: 'investor', status: 'active' }));
    });
  });

  test('renders 1:1 identical pricing page with all sections and elements', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });

    // Page wrapper & hero
    await expect(page.locator('main[data-page="pricing"]')).toBeVisible();
    await expect(page.locator('.eyebrow:has-text("Pricing")')).toBeVisible();

    // Role toggle
    const roleToggle = page.locator('#role-toggle');
    await expect(roleToggle).toBeVisible();
    await expect(roleToggle.locator('button[data-role="investor"]')).toBeVisible();
    await expect(roleToggle.locator('button[data-role="architect"]')).toBeVisible();

    // Hero title
    await expect(page.locator('h1.display.xl')).toContainText('Pay only when you find what you need');

    // Headline stat card
    await expect(page.locator('.headline-stat')).toBeVisible();
    await expect(page.locator('.stat-main')).toContainText('$0');

    // Live calculator
    await expect(page.locator('#calculator')).toBeVisible();
    await expect(page.locator('#calc-input')).toHaveValue('10000');
    await expect(page.locator('#r-unlock')).toHaveText('$1,000');
    await expect(page.locator('#r-opt1-b')).toHaveText('$10,000');
    await expect(page.locator('#r-opt2-b')).toHaveText('$7,300');
    await expect(page.locator('#r-opt3-b')).toHaveText('$5,500');

    // Flow diagram
    await expect(page.locator('#flow')).toBeVisible();
    await expect(page.locator('#flow-buyer-unlock')).toHaveText('$1,000');
    await expect(page.locator('#flow-buyer-listed')).toHaveText('$10,000');

    // Options grid
    await expect(page.locator('.options-grid')).toBeVisible();
    await expect(page.locator('.option-card')).toHaveCount(3);
    await expect(page.locator('#card1-buyer')).toHaveText('$10,000');
    await expect(page.locator('#card2-buyer')).toHaveText('$7,300');
    await expect(page.locator('#card3-buyer')).toHaveText('$5,500');

    // Dispute scenarios
    await expect(page.locator('.protection-section')).toBeVisible();
    await expect(page.locator('.scenario')).toHaveCount(4);
    await expect(page.locator('#d1-arch')).toHaveText('$8,100');

    // Rules accordion
    await expect(page.locator('.rules-section')).toBeVisible();
    await expect(page.locator('.rule-item')).toHaveCount(8);

    // Closing CTA
    await expect(page.locator('.closing')).toBeVisible();
    await expect(page.locator('.closing .btn-role')).toBeVisible();
  });

  test('toggles role perspective between Buyer and Architect on /pricing', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });

    const roleToggle = page.locator('#role-toggle');
    const architectBtn = roleToggle.locator('button[data-role="architect"]');
    const investorBtn = roleToggle.locator('button[data-role="investor"]');

    // Switch to Architect
    await architectBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-role', 'architect');

    // Hero title should reflect Architect text
    await expect(page.locator('h1.display.xl .r-arc')).toBeVisible();
    await expect(page.locator('h1.display.xl .r-arc')).toContainText('Keep 90% of everything you earn');
    await expect(page.locator('.stat-main .r-arc')).toBeVisible();
    await expect(page.locator('.stat-main .r-arc')).toContainText('90%');

    // Architect calculator numbers
    await expect(page.locator('#r-best')).toHaveText('$9,000');
    await expect(page.locator('#calc-arch-unlock-earn')).toHaveText('$900');
    await expect(page.locator('#calc-arch-exec-earn')).toHaveText('$8,100');
    await expect(page.locator('#r-opt1-a')).toHaveText('$9,000');
    await expect(page.locator('#r-opt2-a')).toHaveText('$6,570');
    await expect(page.locator('#r-opt3-a')).toHaveText('$4,950');

    // Switch back to Buyer
    await investorBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-role', 'investor');
    await expect(page.locator('h1.display.xl .r-inv')).toBeVisible();
    await expect(page.locator('h1.display.xl .r-inv')).toContainText('Pay only when you find what you need');
  });

  test('interacts with calculator slider and presets on /pricing', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });

    // Click $25k preset
    const preset25k = page.locator('.calc-preset[data-val="25000"]');
    await preset25k.click();

    // Verify recalculations for $25k
    await expect(page.locator('#calc-input')).toHaveValue('25000');
    await expect(page.locator('#r-unlock')).toHaveText('$2,500');
    await expect(page.locator('#r-opt1-b')).toHaveText('$25,000');
    await expect(page.locator('#r-opt2-b')).toHaveText('$18,250');
    await expect(page.locator('#r-opt3-b')).toHaveText('$13,750');

    // Verify option footers updated
    await expect(page.locator('#card1-buyer')).toHaveText('$25,000');
    await expect(page.locator('#card2-buyer')).toHaveText('$18,250');
    await expect(page.locator('#card3-buyer')).toHaveText('$13,750');
    await expect(page.locator('#based-on-price')).toHaveText('$25,000');

    // Input custom value $5,000
    await page.fill('#calc-input', '5000');
    await expect(page.locator('#r-unlock')).toHaveText('$500');
    await expect(page.locator('#r-opt1-b')).toHaveText('$5,000');
    await expect(page.locator('#r-opt2-b')).toHaveText('$3,650');
    await expect(page.locator('#r-opt3-b')).toHaveText('$2,750');
  });

  test('expands and collapses rule accordion items', async ({ page }) => {
    await page.goto('/pricing', { waitUntil: 'domcontentloaded' });

    const firstRule = page.locator('.rule-item').first();
    await expect(firstRule).not.toHaveClass(/open/);

    // Click to open
    await firstRule.locator('.rule-q').click();
    await expect(firstRule).toHaveClass(/open/);

    // Click again to close
    await firstRule.locator('.rule-q').click();
    await expect(firstRule).not.toHaveClass(/open/);
  });

  test('navbar pricing link routes to /pricing and verifies ticker removed', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    const pricingLink = page.locator('.nav-links a[data-route="pricing"]');
    await expect(pricingLink).toBeVisible();
    await pricingLink.click();

    await expect(page).toHaveURL(/\/pricing/);
    await expect(page.locator('.ticker')).toHaveCount(0);
  });
});
