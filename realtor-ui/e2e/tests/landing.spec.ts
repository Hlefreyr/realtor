import { test, expect } from '@playwright/test';

test.describe('Realtor Landing Page & Navigation E2E Tests', () => {
  test('should display top-right Login button, centered Realtor brand, house art, and search functionality', async ({
    page,
  }) => {
    await page.goto('http://localhost:8081');

    // 1. Check Root Layout & Header branding
    const header = page.getByTestId('header-container');
    await expect(header).toBeVisible();

    const headerLogo = page.getByTestId('header-logo');
    await expect(headerLogo).toBeVisible();
    await expect(headerLogo).toHaveText('Realtor');

    // 2. Verify Top-Right Login Button
    const loginButton = page.getByTestId('login-button');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toHaveText('Log In');

    // Click Login button to open Login Modal
    await loginButton.click();
    const modalContent = page.getByTestId('login-modal-content');
    await expect(modalContent).toBeVisible();

    // Close modal
    const closeBtn = page.getByTestId('close-modal-button');
    await closeBtn.click();
    await expect(modalContent).not.toBeVisible();

    // 3. Verify Centered "Realtor" Title & Subtitle
    const heroTitle = page.getByTestId('hero-title');
    await expect(heroTitle).toBeVisible();
    await expect(heroTitle).toHaveText('Realtor');

    const heroSubtitle = page.getByTestId('hero-subtitle');
    await expect(heroSubtitle).toBeVisible();
    await expect(heroSubtitle).toContainText('Discover your dream home');

    // 4. Verify Happy North American House Artwork
    const houseCard = page.getByTestId('house-art-card');
    await expect(houseCard).toBeVisible();

    const houseImage = page.getByTestId('house-art-image');
    await expect(houseImage).toBeVisible();

    // 5. Verify Search Bar Functionality
    const searchInput = page.getByTestId('search-input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('San Francisco, CA');
    await expect(searchInput).toHaveValue('San Francisco, CA');

    const searchButton = page.getByTestId('search-button');
    await expect(searchButton).toBeVisible();
    await searchButton.click();

    // 6. Verify GraphQL Backend Status Card
    const graphqlCard = page.getByTestId('graphql-status-card');
    await expect(graphqlCard).toBeVisible();
  });
});
