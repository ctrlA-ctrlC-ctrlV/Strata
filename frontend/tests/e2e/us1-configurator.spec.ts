import { test, expect } from '@playwright/test';

test('US1: configure and see estimate', async ({ page }) => {
  await page.goto('/src/pages/products/configurator.html');
  await expect(page.getByText('Estimate:')).toBeVisible();
  await page.fill('#w', '4');
  await page.fill('#d', '5');
  await expect(page.getByText('Estimate:')).toBeVisible();
  await page.click('#summ');
  await expect(page.getByText('Summary')).toBeVisible();
});
