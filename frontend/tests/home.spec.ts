import { test, expect } from '@playwright/test';

test.describe('Home Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main branding', async ({ page }) => {
    const title = page.locator('h1');
    await expect(title).toContainText('HELPDESK');
    await expect(title).toContainText('MANAGER');
    
    const subtitle = page.getByText(/Optimización técnica/i);
    await expect(subtitle).toBeVisible();
  });

  test('should have the three main functional cards', async ({ page }) => {
    // Wait for at least one heading to be visible to ensure hydration is complete
    const firstCardHeading = page.getByRole('heading', { name: 'Contadores', exact: true });
    await expect(firstCardHeading).toBeVisible({ timeout: 10000 });
    
    const cards = page.locator('main h3');
    await expect(cards).toHaveCount(3);
    await expect(page.getByRole('heading', { name: 'STC', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recursos', exact: true })).toBeVisible();
  });

  test('should navigate to Contadores module', async ({ page }) => {
    await page.getByRole('heading', { name: 'Contadores' }).click();
    await expect(page).toHaveURL(/\/contadores/);
  });

  test('should navigate to STC module', async ({ page }) => {
    await page.getByRole('heading', { name: 'STC' }).click();
    await expect(page).toHaveURL(/\/stc/);
  });

  test('should navigate to Recursos module', async ({ page }) => {
    await page.getByRole('heading', { name: 'Recursos' }).click();
    await expect(page).toHaveURL(/\/recursos/);
  });

  test('should have the theme toggle', async ({ page }) => {
    const toggle = page.getByLabel('Toggle theme');
    await expect(toggle).toBeVisible();
  });
});
