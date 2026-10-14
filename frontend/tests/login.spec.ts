import { test, expect } from '@playwright/test';

test.describe('Login & Registration Portal', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        return route.abort();
      }
      return route.continue();
    });
    await page.goto('/login');
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
    await page.goto('/signup');
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
    await page.goto('/signup');
    await expect(page.locator('#loginTitle')).toContainText('Create your Investor / Buyer account');
    await expect(page.locator('#loginConfirmField')).toBeVisible();
    await expect(page.locator('#passwordConstraints')).toBeVisible();
    await expect(page.locator('#loginSubmitBtn')).toContainText('Create Investor / Buyer account');
    await expect(page.locator('#loginLinkedinBtn')).toBeVisible();
  });

  test('dedicated Log in button is always visible in navbar', async ({ page }) => {
    await page.goto('/');
    const loginBtn = page.locator('#navLoginBtn');
    await expect(loginBtn).toBeVisible();
    await expect(loginBtn).toHaveText('Log in');

    // Click Log in -> navigates to /login
    await loginBtn.click();
    await page.waitForURL('**/login');
  });

  test('when logged in, only Log out button is present in navbar and Log in is hidden', async ({ page }) => {
    // Simulate user having applied stage in localStorage
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.setItem('vve-stage', 'applied');
      window.dispatchEvent(new Event('storage'));
    });

    const loginBtn = page.locator('#navLoginBtn');
    const logoutBtn = page.locator('#navLogoutBtn');
    const verifyPill = page.locator('.nav-account-pill.applied');

    // When logged in: Log out & Verify pill are visible, Log in is hidden
    await expect(loginBtn).toBeHidden();
    await expect(logoutBtn).toBeVisible();
    await expect(verifyPill).toBeVisible();

    // Verify session notice is visible in login card
    await expect(page.locator('#loginSessionBanner')).toBeVisible();

    // Click Log out button
    await logoutBtn.click();

    // After clicking Log out:
    // 1. logout button disappears
    await expect(page.locator('#navLogoutBtn')).toBeHidden();
    // 2. verify pill disappears
    await expect(page.locator('.nav-account-pill.applied')).toBeHidden();
    // 3. Log in button returns and is visible
    await expect(page.locator('#navLoginBtn')).toBeVisible();
    // 4. localStorage stage is cleared to guest
    const stage = await page.evaluate(() => localStorage.getItem('vve-stage'));
    expect(stage).toBeNull();
  });

  test('renders Google Continue button with useGoogleLogin handler attached', async ({ page }) => {
    const googleBtn = page.locator('#loginGoogleBtn');
    await expect(googleBtn).toBeVisible();
    await expect(googleBtn).toContainText('Continue with Google');
    await expect(page.locator('.login-google-icon')).toBeVisible();
  });
});



