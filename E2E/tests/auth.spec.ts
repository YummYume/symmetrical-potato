import { expect, test } from '@playwright/test';

test('Register empty', async ({ page }) => {
  // Navigate
  await page.goto('/register');

  // Get form
  const formLocator = page.locator('form:not([action])');

  // Add novalidate
  await formLocator.evaluate((el) => el.setAttribute('novalidate', 'novalidate'));

  // Submit
  await page.click('button[type="submit"]');

  // Check for errors
  await expect(page.locator('[id="email-error"]')).toBeAttached()
  await expect(page.locator('[id="username-error"]')).toBeAttached()
  await expect(page.locator('[id="password-error"]')).toBeAttached()
  await expect(page.locator('[id="email-error"]')).toBeAttached()
  await expect(page.locator('[id="reason-error"]')).toBeAttached()
});

test('Register', async ({ page }) => {
  let status = null;

  // Listen to the 'response' event
  page.on('response', (response) => {
    if (response.url().includes('login')) {
      status = response.status();
    }
  });

  // Navigate
  await page.goto('/register');

  // Fill form
  await page.fill('input[name="email"]', 'johndoe@gmail.com');
  await page.fill('input[name="username"]', 'John Doe');
  await page.fill('input[name="password"]', '&J3hyLztj??Jc!#4');
  await page.fill('input[name="passwordConfirm"]', '&J3hyLztj??Jc!#4');
  await page.fill('textarea[name="reason"]', 'This is my reason');

  // Submit and wait for navigation
  await page.click('button[type="submit"]');
  await page.waitForURL('/login');

  // Check if the response status is OK
  expect(status).toBe(200);
});

test('Login', async ({ page }) => {
  let status = null;

  // Listen to the 'response' event
  page.on('response', (response) => {
    if (response.url().includes('dashboard')) {
      status = response.status();
    }
  });

  // Navigate
  await page.goto('/login');

  // Fill form
  await page.fill('input[name="username"]', 'dallas');
  await page.fill('input[name="password"]', 'xxx');

  // Submit and wait for navigation
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');

  // Check if the response status is OK
  expect(status).toBe(200);
});
