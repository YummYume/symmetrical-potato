import { expect, test } from '@playwright/test';

test('login', async ({ page }) => {
  // Navigate
  await page.goto('/login');

  // Fill form
  await page.fill('input[name="username"]', 'dallas');
  await page.fill('input[name="password"]', 'xxx');

  // Submit
  await page.click('button[type="submit"]');

  // Wait
  await page.waitForURL('/dashboard');

  expect(page.url()).toContain('/dashboard');
});
