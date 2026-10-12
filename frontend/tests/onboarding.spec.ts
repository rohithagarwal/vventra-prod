import { test, expect } from '@playwright/test';

test.describe('vvEntra Member Onboarding Flow', () => {
  test('Clicking Create Investor / Buyer Account on /signup navigates to /onboarding', async ({ page }) => {
    await page.goto('/signup');

    // Enter valid email and password matching requirements
    await page.fill('#loginEmail', 'investor@firm.com');
    await page.fill('#loginPassword', 'SecurePass123!');
    await page.fill('#loginPasswordConfirm', 'SecurePass123!');

    // Submit signup
    const submitBtn = page.locator('#loginSubmitBtn');
    await expect(submitBtn).toContainText('Create Investor / Buyer account');
    await submitBtn.click();

    // Verify navigation to onboarding page
    await page.waitForURL('**/onboarding?role=investor');
    await expect(page.locator('#onboardingKicker')).toHaveText('Investor account setup');
    await expect(page.locator('.onboarding-view.active h2')).toContainText('First, the person behind the work.');

    // Verify Navbar shows applied "Verify identity" pill
    const verifyPill = page.locator('nav.top .nav-account-pill.applied').first();
    await expect(verifyPill).toBeVisible();
    await expect(verifyPill).toHaveText('Verify identity');

    // Wait for styling and fonts to render, then take screenshot
    await page.waitForTimeout(500);
    await page.screenshot({
      path: 'C:\\Users\\rohit\\.gemini\\antigravity\\brain\\805df1dc-3c11-45cd-8996-1ea9aea20024\\onboarding_step1_preview.png',
      fullPage: true,
    });
  });

  test('Step 1 validation and navigation to Step 2 & 3', async ({ page }) => {
    await page.goto('/onboarding?role=investor');

    // Check step 1 validation when clicking Continue with empty fields
    const nextBtn = page.locator('#onboardingNext');
    await nextBtn.click();
    await expect(page.locator('#onboardingError')).toContainText('Please complete your name, professional focus, and location to continue.');

    // Fill Step 1 fields
    await page.fill('#onboardingName', 'Alexander Vance');
    await page.fill('#onboardingHeadline', 'Growth investor, operator-investor');
    await page.fill('#onboardingLocation', 'San Francisco, CA, USA');
    await nextBtn.click();

    // Verify Step 2 is active
    await expect(page.locator('.onboarding-view[data-onboarding-view="2"]')).toHaveClass(/active/);
    await expect(page.locator('#onboardingProgressText')).toHaveText('Step 2 of 3');

    // Check chip validation
    await nextBtn.click();
    await expect(page.locator('#onboardingError')).toContainText('Choose at least one area of expertise or focus to continue.');

    // Select sector chips
    await page.locator('[data-onboarding-chip="B2B SaaS"]').click();
    await page.locator('[data-onboarding-chip="AI & automation"]').click();
    await nextBtn.click();

    // Verify Step 3 is active
    await expect(page.locator('.onboarding-view[data-onboarding-view="3"]')).toHaveClass(/active/);
    await expect(page.locator('#onboardingProgressText')).toHaveText('Step 3 of 3');
    await expect(nextBtn).toHaveText('Finish profile');

    // Fill Step 3 fields
    await page.fill('#onboardingIntent', 'Looking for vertical B2B SaaS assets with $500k ARR and proprietary distribution.');
    await page.selectOption('#onboardingRange', '$50,000 – $250,000');
    await page.selectOption('#onboardingTimeline', 'Within 3 months');

    // Finish profile
    await nextBtn.click();
    await page.waitForTimeout(700);
  });
});
