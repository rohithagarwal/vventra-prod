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

  test('displays invalid sign when invalid email is entered', async ({ page }) => {
    const emailInput = page.locator('#loginEmail');
    
    // Type an invalid email
    await emailInput.fill('invalidemail');
    await emailInput.blur();

    // Verify invalid sign: class 'is-invalid' and error message visible
    await expect(emailInput).toHaveClass(/is-invalid/);
    await expect(page.locator('#loginEmailError')).toContainText('Please enter a valid email address');
    await expect(page.locator('.login-input-icon.error')).toBeVisible();

    // Type a valid email
    await emailInput.fill('founder@vventra.com');
    await emailInput.blur();

    // Verify valid sign: class 'is-valid' and green checkmark
    await expect(emailInput).toHaveClass(/is-valid/);
    await expect(page.locator('#loginEmailError')).toBeHidden();
    await expect(page.locator('.login-input-icon.valid')).toBeVisible();
  });

  test('validates password constraints checklist and confirmation in signup mode', async ({ page }) => {
    // Navigate directly to /signup
    await page.goto('http://localhost:3000/signup');
    await expect(page.locator('#passwordConstraints')).toBeVisible();

    const passwordInput = page.locator('#loginPassword');
    
    // Partially satisfying requirements: only length and lowercase
    await passwordInput.fill('abcdefgh');
    const constraintsBox = page.locator('#passwordConstraints');
    await expect(constraintsBox).toContainText('Weak');

    // Add uppercase, number, and special symbol to satisfy all constraints
    await passwordInput.fill('StrongPass123!');
    await expect(constraintsBox).toContainText('Strong');
    await expect(constraintsBox.locator('.constraint-badge.met')).toHaveCount(4);

    // Test confirm password mismatch
    const confirmInput = page.locator('#loginPasswordConfirm');
    await confirmInput.fill('DifferentPass123!');
    await confirmInput.blur();
    await expect(confirmInput).toHaveClass(/is-invalid/);
    await expect(page.locator('#loginConfirmError')).toContainText('Passwords do not match');

    // Test confirm password match
    await confirmInput.fill('StrongPass123!');
    await confirmInput.blur();
    await expect(confirmInput).toHaveClass(/is-valid/);
    await expect(page.locator('#loginConfirmError')).toBeHidden();
  });

  test('navigates directly to /signup and renders in Create Account mode', async ({ page }) => {
    await page.goto('http://localhost:3000/signup');
    await expect(page.locator('#loginTitle')).toContainText('Create your Investor / Buyer account');
    await expect(page.locator('#loginConfirmField')).toBeVisible();
    await expect(page.locator('#passwordConstraints')).toBeVisible();
    await expect(page.locator('#loginSubmitBtn')).toContainText('Create Investor / Buyer account');
    await expect(page.locator('#loginLinkedinBtn')).toBeVisible();
  });
});


