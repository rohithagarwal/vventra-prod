import { test, expect } from '@playwright/test';

test.describe('Home / Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) {
        return route.abort();
      }
      return route.continue();
    });
  });

  test('renders the full identical landing page with all 10 sections', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // 1. Ticker
    const ticker = page.locator('.ticker');
    await expect(ticker).toBeVisible();
    await expect(page.locator('#ticker-label')).toHaveText('Live');
    await expect(page.locator('#ticker-track')).toBeVisible();

    // 2. Navigation
    await expect(page.locator('nav.top')).toBeVisible();
    await expect(page.locator('.brand-logo-light')).toBeVisible();
    await expect(page.locator('.nav-role-pill')).toBeVisible();
    await expect(page.locator('#theme-toggle')).toBeVisible();

    // 3. Hero Section
    await expect(page.locator('#hero-canvas')).toBeVisible();
    await expect(page.locator('.hero h1')).toContainText('Where vision and ventures');
    await expect(page.locator('.hero .lead')).toContainText('A private network where execution-ready opportunities meet operators');
    await expect(page.locator('.search-bar')).toBeVisible();
    await expect(page.locator('.search-input')).toBeVisible();
    await expect(page.locator('.search-btn')).toContainText('Discover');

    // 4. Index Bar values
    await expect(page.locator('#ix-index')).toHaveText('20');
    await expect(page.locator('#ix-live')).toHaveText('12');
    await expect(page.locator('#ix-cap')).toHaveText('$1,100,000');
    await expect(page.locator('#ix-avg')).toHaveText('$4,725');
    await expect(page.locator('#ix-arch')).toHaveText('10');
    await expect(page.locator('#ix-deals')).toHaveText('3');

    // 5. Market Section (14 sectors)
    const market = page.locator('#market');
    await expect(market).toBeVisible();
    await expect(market.locator('h3').first()).toContainText("What's in demand right now");
    await expect(market.locator('.bars-card')).toBeVisible();
    await expect(market.locator('.bar-wrap')).toHaveCount(14);
    await expect(market.locator('.quad-card')).toBeVisible();

    // 6. Demand Section
    const demand = page.locator('section.demand-section');
    await expect(demand).toBeVisible();
    await expect(demand.locator('h2')).toContainText('Where buyer demand is outpacing supply');
    await expect(demand.locator('#ds-rows')).toBeVisible();
    await expect(demand.locator('#gauge')).toBeVisible();
    await expect(demand.locator('#investor-feed')).toBeVisible();

    // 7. Pulse Section
    const pulse = page.locator('section.pulse-section');
    await expect(pulse).toBeVisible();
    await expect(pulse.locator('#pulse-grid')).toBeVisible();
    await expect(pulse.locator('.pulse-card')).toHaveCount(8);

    // 8. Audience Section
    const audience = page.locator('section.audience-section');
    await expect(audience).toBeVisible();
    await expect(audience.locator('h2')).toContainText('Which side are you on?');
    await expect(audience.locator('.audience-card')).toHaveCount(2);

    // 9. Platform Preview
    const preview = page.locator('section.preview-section');
    await expect(preview).toBeVisible();
    await expect(preview.locator('#mini-svg')).toBeVisible();
    await expect(preview.locator('#tape-track')).toBeVisible();

    // 10. Featured Opportunities (6 cards)
    const opportunities = page.locator('section#opportunities');
    await expect(opportunities).toBeVisible();
    await expect(opportunities.locator('.opp-card')).toHaveCount(6);

    // 11. How it works
    const how = page.locator('section#how');
    await expect(how).toBeVisible();
    await expect(how.locator('.how-step')).toHaveCount(4);

    // 12. Trust Architecture
    const trust = page.locator('section#trust');
    await expect(trust).toBeVisible();
    await expect(trust.locator('.trust-card')).toHaveCount(4);

    // 13. Final CTA
    const cta = page.locator('section#cta.final');
    await expect(cta).toBeVisible();
    await expect(cta.locator('h2')).toContainText('Enter the network.');

    // 14. Footer
    await expect(page.locator('footer')).toBeVisible();
  });

  test('switches theme and role on home page', async ({ page }) => {
    await page.goto('/');
    
    // Toggle role
    const roleBtn = page.locator('.nav-role-pill');
    await roleBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-role', 'architect');
    await roleBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-role', 'investor');

    // Toggle theme
    const themeBtn = page.locator('#theme-toggle');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});
