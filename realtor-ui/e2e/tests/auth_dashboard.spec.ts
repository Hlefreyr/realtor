import { test, expect } from '@playwright/test';

test.describe('Authentication & Role-Based Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8081');
  });

  test('Standard user login, sidebar navigation, settings view, and logout flow', async ({
    page,
  }) => {
    // 1. Open Login Modal
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('login-modal-content')).toBeVisible();

    // 2. Fill User credentials and submit (user@realtor.com)
    await page.getByTestId('login-email-input').fill('user@realtor.com');
    await page.getByTestId('login-password-input').fill('user');
    await page.getByTestId('login-submit-button').click();

    // 3. Verify user badge in Header & Dashboard view container
    await expect(page.getByTestId('user-email-badge')).toHaveText('user@realtor.com');
    await expect(page.getByTestId('dashboard-layout-container')).toBeVisible();
    await expect(page.getByTestId('dashboard-view-container')).toBeVisible();

    // 4. Verify Sidebar items (Dashboard & Settings visible, Admin Panel hidden)
    const sidebar = page.getByTestId('sidebar-container');
    await expect(sidebar).toBeVisible();
    await expect(page.getByTestId('sidebar-item-dashboard')).toBeVisible();
    await expect(page.getByTestId('sidebar-item-settings')).toBeVisible();
    await expect(page.getByTestId('sidebar-item-admin')).not.toBeVisible();

    // 5. Navigate to Settings View
    await page.getByTestId('sidebar-item-settings').click();
    await expect(page.getByTestId('settings-view-container')).toBeVisible();

    // 6. Toggle Sidebar Collapse State
    const toggleBtn = page.getByTestId('sidebar-toggle-button');
    await toggleBtn.click();

    // 7. Log Out
    await page.getByTestId('logout-button').click();
    await expect(page.getByTestId('landing-hero-container')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('Admin user login, admin panel access, and elevated dashboard control', async ({
    page,
  }) => {
    // 1. Open Login Modal
    await page.getByTestId('login-button').click();
    await expect(page.getByTestId('login-modal-content')).toBeVisible();

    // 2. Fill Admin credentials and submit (admin@realtor.com)
    await page.getByTestId('login-email-input').fill('admin@realtor.com');
    await page.getByTestId('login-password-input').fill('admin');
    await page.getByTestId('login-submit-button').click();

    // 3. Verify admin user badge
    await expect(page.getByTestId('user-email-badge')).toHaveText('admin@realtor.com');
    await expect(page.getByTestId('dashboard-layout-container')).toBeVisible();

    // 4. Verify Admin Panel sidebar item is present and click it
    await expect(page.getByTestId('sidebar-item-admin')).toBeVisible();
    await page.getByTestId('sidebar-item-admin').click();

    // 5. Verify Admin View renders correctly
    await expect(page.getByTestId('admin-view-container')).toBeVisible();

    // 6. Log out
    await page.getByTestId('logout-button').click();
    await expect(page.getByTestId('login-button')).toBeVisible();
  });

  test('Responsive viewport dashboard rendering', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.getByTestId('login-button').click();
    await page.getByTestId('login-email-input').fill('user@realtor.com');
    await page.getByTestId('login-password-input').fill('user');
    await page.getByTestId('login-submit-button').click();

    await expect(page.getByTestId('dashboard-layout-container')).toBeVisible();
    await expect(page.getByTestId('user-email-badge')).toHaveText('user@realtor.com');
  });
});
