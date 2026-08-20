import { test, expect } from '@playwright/test';

test('capture landing page screenshot', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:8081');

  await expect(page.getByTestId('header-container')).toBeVisible();
  await expect(page.getByTestId('hero-title')).toBeVisible();
  await expect(page.getByTestId('house-art-card')).toBeVisible();

  await page.screenshot({
    path: '/home/peterk/.gemini/antigravity/brain/b17a3b1a-ab05-4744-89bb-9543a727ac61/landing_page_screenshot.png',
    fullPage: true,
  });
});
