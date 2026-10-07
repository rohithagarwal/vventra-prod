import { test, expect } from '@playwright/test';

test.describe('Login & Registration Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
  });

  test('renders the exact demo page elements', async ({ page }) => {
    await expect(page.locator('#loginTitle')).toContainText('Welcome back');
    await expect(page.locator('.login-kicker')).toContainText('Member access');
    await expect(page.locator('#loginGoogleBtn')).toBeVisible();
    await expect(page.locator('#loginLinkedinBtn')).toBeVisible();
    await expect(page.locator('#loginEmail')).toBeVisible();
    await expect(page.locator('#loginPassword')).toBeVisible();
    await expect(page.locator('#loginSubmitBtn')).toContainText('Sign in as Investor / Buyer');
  });

  test('switches roles between Investor and Architect', async ({ page }) => {
    const architectBtn = page.locator('button[data-login-role="architect"]');
    await architectBtn.click();
    await expect(page.locator('#loginSubmitBtn')).toContainText('Sign in as Architect / Creator');
    await expect(page.locator('#loginIntroCopy')).toContainText('Sign in as an architect');

    const investorBtn = page.locator('button[data-login-role="investor"]');
    await investorBtn.click();
    await expect(page.locator('#loginSubmitBtn')).toContainText('Sign in as Investor / Buyer');
  });

  test('toggles between Sign In and Create Account modes', async ({ page }) => {
    const modeBtn = page.locator('#loginFooter button');
    await modeBtn.click(); // switches to Create account

    await expect(page.locator('#loginTitle')).toContainText('Create your Investor / Buyer account');
    await expect(page.locator('#loginConfirmField')).toBeVisible();
    await expect(page.locator('#loginSubmitBtn')).toContainText('Create Investor / Buyer account');

    // Switch back to log in
    await page.locator('#loginFooter button').click();
    await expect(page.locator('#loginTitle')).toContainText('Welcome back');
    await expect(page.locator('#loginConfirmField')).toBeHidden();
  });

  test('toggles password visibility', async ({ page }) => {
    const passwordInput = page.locator('#loginPassword');
    const toggleBtn = page.locator('#loginPasswordToggle');

    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await toggleBtn.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
