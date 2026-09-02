import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = '/home/peterk/.gemini/antigravity/brain/746d6c24-57c2-4aa8-bf07-8df04a8ad529';

test('capture screenshots for walkthrough artifact', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('http://localhost:8081');

  // 1. Landing Page
  await expect(page.getByTestId('header-container')).toBeVisible();
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'landing_page_screenshot.png'),
    fullPage: true,
  });

  // 2. Login Modal
  await page.getByTestId('login-button').click();
  await expect(page.getByTestId('login-modal-content')).toBeVisible();
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'login_modal_screenshot.png'),
    fullPage: true,
  });

  // 3. User Dashboard View
  await page.getByTestId('login-email-input').fill('user@realtor.com');
  await page.getByTestId('login-password-input').fill('user');
  await page.getByTestId('login-submit-button').click();
  await expect(page.getByTestId('dashboard-view-container')).toBeVisible();
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'dashboard_view_screenshot.png'),
    fullPage: true,
  });

  // 4. Admin Panel View
  await page.getByTestId('logout-button').click();
  await page.getByTestId('login-button').click();
  await page.getByTestId('login-email-input').fill('admin@realtor.com');
  await page.getByTestId('login-password-input').fill('admin');
  await page.getByTestId('login-submit-button').click();
  await page.getByTestId('sidebar-item-admin').click();
  await expect(page.getByTestId('admin-view-container')).toBeVisible();
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'admin_panel_screenshot.png'),
    fullPage: true,
  });
});
