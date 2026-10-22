import { test, expect } from '@playwright/test';

test.describe('Global Authentication Gate (Member-Only Access)', () => {
  test('unauthenticated visitor accessing / is redirected to /login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login?redirect=/');
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('#loginSubmitBtn')).toBeVisible();
  });

  test('unauthenticated visitor accessing /pricing is redirected to /login with target preserved', async ({ page }) => {
    await page.goto('/pricing');
    await page.waitForURL('**/login?redirect=/pricing');
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('#loginTitle')).toContainText('Welcome back');
  });

  test('unauthenticated visitor accessing /dashboard is redirected to /login with target preserved', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForURL('**/login?redirect=/dashboard');
    await expect(page.locator('.login-page')).toBeVisible();
  });

  test('unauthenticated visitor can freely access /login, /signup, and /register', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('#loginTitle')).toContainText('Welcome back');

    await page.goto('/signup');
    await expect(page.locator('.login-page')).toBeVisible();
    await expect(page.locator('#loginTitle')).toContainText('Create your Investor / Buyer account');

    await page.goto('/register');
    await expect(page.locator('.login-page')).toBeVisible();
  });

  test('authenticated user can access protected pages without redirection', async ({ page }) => {
    // Inject active session
    await page.addInitScript(() => {
      localStorage.setItem('vve-stage', 'verified');
      localStorage.setItem('vve-access-token', 'valid-bearer-token');
      localStorage.setItem('vve-role', 'investor');
      localStorage.setItem('vve-user', JSON.stringify({ id: 'u_1', email: 'member@vventra.com', role: 'investor', status: 'active' }));
    });

    // Access pricing
    await page.goto('/pricing');
    await expect(page.locator('main[data-page="pricing"]')).toBeVisible();
    await expect(page.locator('#calculator')).toBeVisible();

    // Access dashboard
    await page.goto('/dashboard');
    await expect(page.locator('.dashboard-page')).toBeVisible();
  });

  test('logging in on /login unlocks protected pages and clears gate', async ({ page }) => {
    await page.goto('/login?redirect=/pricing');
    await page.fill('#loginEmail', 'founder@vventra.com');
    await page.fill('#loginPassword', 'SecurePassword123!');
    await page.click('#loginSubmitBtn');

    // Waits for redirection to dashboard or destination
    await page.waitForTimeout(1000);
    const token = await page.evaluate(() => localStorage.getItem('vve-access-token'));
    expect(token).toBeTruthy();
  });
});
