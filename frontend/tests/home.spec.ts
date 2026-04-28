import { test, expect } from '@playwright/test';

test.describe('Home Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main branding', async ({ page }) => {
    // Branding is split into two spans inside h1
    const title = page.locator('h1');
    await expect(title).toBeVisible();
    await expect(title).toContainText('HELPDESK');
    await expect(title).toContainText('MANAGER');
  });

  test('should have the three main functional cards', async ({ page }) => {
    // Wait for the grid to be visible
    const cards = page.locator('main h3');
    await expect(cards).toHaveCount(3);
    
    await expect(page.getByRole('heading', { name: 'Contadores', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'STC', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recursos', exact: true })).toBeVisible();
  });

  test('should navigate to Contadores module', async ({ page }) => {
    const card = page.locator('main').getByRole('link', { name: /Contadores/i });
    await card.click();
    await expect(page).toHaveURL(/\/contadores/);
  });

  test('should navigate to STC module', async ({ page }) => {
    const card = page.locator('main').getByRole('link', { name: /STC/i });
    await card.click();
    await expect(page).toHaveURL(/\/stc/);
  });

  test('should navigate to Recursos module', async ({ page }) => {
    const card = page.locator('main').getByRole('link', { name: /Recursos/i });
    await card.click();
    await expect(page).toHaveURL(/\/recursos/);
  });

  test('should have the theme toggle', async ({ page }) => {
    // Use first() because there are desktop and mobile toggles
    const toggle = page.getByLabel('Toggle theme').first();
    await expect(toggle).toBeVisible();
  });
});
