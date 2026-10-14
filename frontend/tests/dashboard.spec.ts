import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage
    await page.goto('/dashboard');
    await page.evaluate(() => localStorage.clear());
  });

  test('renders dashboard with 1:1 intelligence terminal layout', async ({ page }) => {
    await page.goto('/dashboard');

    // Page wrapper & hero title
    await expect(page.locator('.dashboard-page')).toBeVisible();
    await expect(page.locator('h1.display')).toContainText('View the market');
    await expect(page.locator('.eyebrow')).toContainText('Intelligence Terminal');

    // Role toggle centerpiece
    const roleToggle = page.locator('#role-toggle');
    await expect(roleToggle).toBeVisible();
    const investorBtn = roleToggle.locator('button[data-role="investor"]');
    const architectBtn = roleToggle.locator('button[data-role="architect"]');
    await expect(investorBtn).toBeVisible();
    await expect(architectBtn).toBeVisible();

    // Default role is investor
    await expect(investorBtn).toHaveClass(/active/);
    await expect(page.locator('.dash-greeting .role-show[data-show="investor"]')).toBeVisible();

    // Live Metrics Strip
    await expect(page.locator('.metrics-strip')).toBeVisible();
    await expect(page.locator('#inv-m1')).toBeVisible();

    // Live Deal Feed & Heatmap
    await expect(page.locator('#deal-feed')).toBeVisible();
    await expect(page.locator('#heatmap')).toBeVisible();

    // Demand Chart SVG elements
    await expect(page.locator('#demand-line')).toBeVisible();
  });

  test('toggles role perspective between Investor and Architect', async ({ page }) => {
    await page.goto('/dashboard');

    const roleToggle = page.locator('#role-toggle');
    const architectBtn = roleToggle.locator('button[data-role="architect"]');
    const investorBtn = roleToggle.locator('button[data-role="investor"]');

    // Switch to Architect
    await architectBtn.click();
    await expect(architectBtn).toHaveClass(/active/);
    await expect(investorBtn).not.toHaveClass(/active/);

    // Document & main data-role updated
    await expect(page.locator('html')).toHaveAttribute('data-role', 'architect');
    await expect(page.locator('.dashboard-page')).toHaveAttribute('data-role', 'architect');

    // Architect greeting & terminal content visible
    await expect(page.locator('.dash-greeting .role-show[data-show="architect"]')).toBeVisible();
    await expect(page.locator('#whatToListModule')).toBeVisible();

    // Switch back to Investor
    await investorBtn.click();
    await expect(investorBtn).toHaveClass(/active/);
    await expect(page.locator('html')).toHaveAttribute('data-role', 'investor');
    await expect(page.locator('.dash-greeting .role-show[data-show="investor"]')).toBeVisible();
  });

  test('interacts with What Should I List recommender', async ({ page }) => {
    await page.goto('/dashboard?role=architect');

    const wslModule = page.locator('#whatToListModule');
    await expect(wslModule).toBeVisible();

    // Check results are rendered
    await expect(page.locator('#wslResults .wsl-card')).toHaveCount(4);
    await expect(page.locator('#wslCtaText')).toContainText('Top match:');

    // Click another option e.g. Moderate capital
    const midBtn = wslModule.locator('.wsl-options[data-wsl="capital"] button[data-val="mid"]');
    await midBtn.click();
    await expect(midBtn).toHaveClass(/active/);

    // Results remain populated with 4 cards
    await expect(page.locator('#wslResults .wsl-card')).toHaveCount(4);
  });

  test('toggles dashboard filter pills', async ({ page }) => {
    await page.goto('/dashboard');

    const filters = page.locator('.dash-filters');
    await expect(filters).toBeVisible();

    const pill30 = filters.locator('button:has-text("30-day")');
    const pill7 = filters.locator('button:has-text("7-day")');

    await pill30.click();
    await expect(pill30).toHaveClass(/active/);
    await expect(pill7).not.toHaveClass(/active/);

    const pillAi = filters.locator('button:has-text("AI · Tech")');
    const pillAll = filters.locator('button:has-text("All sectors")');

    await pillAi.click();
    await expect(pillAi).toHaveClass(/active/);
    await expect(pillAll).not.toHaveClass(/active/);
  });
});
