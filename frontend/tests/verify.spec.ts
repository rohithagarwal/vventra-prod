import { test, expect } from '@playwright/test';

test.describe('Live Video Verification (/verify)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear previous verification state
    await page.goto('/verify?role=architect');
    await page.evaluate(() => {
      localStorage.removeItem('vve-vvideo');
      localStorage.removeItem('vve-vvid');
      localStorage.removeItem('vve-stage');
      localStorage.setItem('vve-vlinkedin', 'true');
      localStorage.setItem('vve-vbank', 'true');
      localStorage.setItem('vve-role', 'architect');
    });
    await page.reload();
    await page.waitForTimeout(400);
  });

  test('renders video verification step with requirements badges and start buttons', async ({ page }) => {
    const videoStep = page.locator('.verify-step[data-vstep="video"]');
    await expect(videoStep).toBeVisible();
    await expect(videoStep).toHaveClass(/active/);

    const title = videoStep.locator('.vstep-title');
    await expect(title).toContainText('Live video verification');

    const startBtn = page.locator('#vvStartBtn');
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toHaveText('Start 2-minute verification');

    // Badges inside placeholder
    await expect(page.locator('.vv-placeholder')).toContainText('Camera');
    await expect(page.locator('.vv-placeholder')).toContainText('Microphone');
  });

  test('launches video recording and displays live REC badge, audio meter, face guide and checklist', async ({ page }) => {
    const startBtn = page.locator('#vvStartBtn');
    await startBtn.click();

    // Verify video element mounts and live recording starts
    const vvFrame = page.locator('#vvFrame');
    await expect(vvFrame).toHaveClass(/live/);

    const recBadge = page.locator('#vvRec');
    await expect(recBadge).toBeVisible();
    await expect(recBadge).toContainText('REC');

    // Face guide oval exists
    await expect(page.locator('.vv-face-guide')).toBeVisible();

    // Audio meter exists
    await expect(page.locator('.vv-audio-meter')).toBeVisible();

    // Prompt 1 is active
    const prompt = page.locator('#vvPrompt');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText('State your full legal name');

    // Checklist step 1 is active
    const chk1 = page.locator('.vv-chk[data-vv="name"]');
    await expect(chk1).toHaveClass(/active/);
  });

  test('stops recording, reviews video, and submits to API successfully', async ({ page }) => {
    // Start recording
    await page.locator('#vvStartBtn').click();
    await expect(page.locator('#vvRec')).toBeVisible();
    await page.waitForTimeout(1000);

    // Click Stop & Review
    const stopBtn = page.locator('.vv-actions button', { hasText: 'Stop & Review Recording' });
    await expect(stopBtn).toBeVisible();
    await stopBtn.click();

    // Review player should now be visible
    const reviewVideo = page.locator('video.vv-review-video');
    await expect(reviewVideo).toBeVisible();

    const reviewBadge = page.locator('.vv-review-badge');
    await expect(reviewBadge).toBeVisible();
    await expect(reviewBadge).toContainText('Video recorded');

    // Retake and Confirm buttons are visible
    const retakeBtn = page.locator('#vvRetakeBtn');
    const submitBtn = page.locator('#vvSubmitBtn');
    await expect(retakeBtn).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Submit verification
    await submitBtn.click();

    // Check step updates to complete
    const stepState = page.locator('[data-state-for="video"]');
    await expect(stepState).toHaveText('Complete');
    await expect(page.locator('.verify-step[data-vstep="video"] .vstep-num')).toHaveText('✓');

    // Video check complete banner
    await expect(page.locator('.verify-step[data-vstep="video"]')).toContainText('Video check complete');
    await expect(page.locator('.verify-step[data-vstep="video"]')).toContainText('Liveness confirmed');

    // Progress bar advances and final submit button is enabled
    const finalSubmitBtn = page.locator('#verifySubmitBtn');
    await expect(finalSubmitBtn).toBeEnabled();
  });

  test('retake button re-arms camera and restarts live recording', async ({ page }) => {
    await page.locator('#vvStartBtn').click();
    await page.waitForTimeout(600);

    // Stop to enter review
    await page.locator('.vv-actions button', { hasText: 'Stop & Review Recording' }).click();
    await expect(page.locator('#vvRetakeBtn')).toBeVisible();

    // Click Retake
    await page.locator('#vvRetakeBtn').click();

    // Should return to recording mode
    await expect(page.locator('#vvRec')).toBeVisible();
    await expect(page.locator('.vv-face-guide')).toBeVisible();
  });
});
