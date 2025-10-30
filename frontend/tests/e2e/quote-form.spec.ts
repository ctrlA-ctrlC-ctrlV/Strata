import { test, expect } from '@playwright/test';

test.describe('Quote Form - Validation and Submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display quote form with all required fields', async ({ page }) => {
    const quoteForm = page.locator('[data-testid="quote-form"]');
    await expect(quoteForm).toBeVisible();

    // Check required fields are present
    await expect(page.locator('[data-testid="first-name-field"]')).toBeVisible();
    await expect(page.locator('[data-testid="phone-field"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-field"]')).toBeVisible();
    await expect(page.locator('[data-testid="address-line1-field"]')).toBeVisible();
    await expect(page.locator('[data-testid="eircode-field"]')).toBeVisible();

    // Check optional fields are present
    await expect(page.locator('[data-testid="second-name-field"]')).toBeVisible();
    await expect(page.locator('[data-testid="address-line2-field"]')).toBeVisible();
    await expect(page.locator('[data-testid="note-field"]')).toBeVisible();

    // Check form controls
    await expect(page.locator('[data-testid="submit-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="newsletter-checkbox"]')).toBeVisible();
  });

  test('should validate required fields before submission', async ({ page }) => {
    const submitButton = page.locator('[data-testid="submit-button"]');
    await submitButton.click();

    // Should show validation errors for required fields
    await expect(page.locator('[data-testid="first-name-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="phone-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="address-line1-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="eircode-error"]')).toBeVisible();

    // Form should not be submitted
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('[data-testid="email-field"]', 'invalid-email');
    await page.locator('[data-testid="submit-button"]').click();

    await expect(page.locator('[data-testid="email-error"]')).toContainText('valid email');
  });

  test('should validate Irish phone number format', async ({ page }) => {
    await page.fill('[data-testid="phone-field"]', '123');
    await page.locator('[data-testid="submit-button"]').click();

    await expect(page.locator('[data-testid="phone-error"]')).toContainText('valid phone');
  });

  test('should validate Irish Eircode format', async ({ page }) => {
    await page.fill('[data-testid="eircode-field"]', 'INVALID');
    await page.locator('[data-testid="submit-button"]').click();

    await expect(page.locator('[data-testid="eircode-error"]')).toContainText('valid Eircode');
  });

  test('should submit form with valid data (no-JS fallback)', async ({ page }) => {
    // Disable JavaScript to test no-JS fallback
    await page.context().addInitScript(() => {
      Object.defineProperty(window, 'navigator', {
        value: { ...window.navigator, javaEnabled: () => false }
      });
    });

    await page.fill('[data-testid="first-name-field"]', 'John');
    await page.fill('[data-testid="phone-field"]', '087 123 4567');
    await page.fill('[data-testid="email-field"]', 'john@example.com');
    await page.fill('[data-testid="address-line1-field"]', '123 Main Street');
    await page.fill('[data-testid="eircode-field"]', 'D02 XY45');

    // Form should have mailto action as fallback
    const form = page.locator('[data-testid="quote-form"]');
    const action = await form.getAttribute('action');
    expect(action).toMatch(/^mailto:/);
  });

  test('should submit form with JS enhancement', async ({ page }) => {
    await page.fill('[data-testid="first-name-field"]', 'John');
    await page.fill('[data-testid="phone-field"]', '087 123 4567');
    await page.fill('[data-testid="email-field"]', 'john@example.com');
    await page.fill('[data-testid="address-line1-field"]', '123 Main Street');
    await page.fill('[data-testid="eircode-field"]', 'D02 XY45');
    await page.fill('[data-testid="note-field"]', 'Looking for a garden office');

    // Mock API response for JS-enhanced submission
    await page.route('**/api/quote-leads', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-lead-id',
          createdAt: new Date().toISOString()
        })
      });
    });

    await page.locator('[data-testid="submit-button"]').click();

    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Thank you');
  });

  test('should handle JS submission errors gracefully', async ({ page }) => {
    await page.fill('[data-testid="first-name-field"]', 'John');
    await page.fill('[data-testid="phone-field"]', '087 123 4567');
    await page.fill('[data-testid="email-field"]', 'john@example.com');
    await page.fill('[data-testid="address-line1-field"]', '123 Main Street');
    await page.fill('[data-testid="eircode-field"]', 'D02 XY45');

    // Mock API error response
    await page.route('**/api/quote-leads', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Validation failed'
        })
      });
    });

    await page.locator('[data-testid="submit-button"]').click();

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('error');
  });

  test('should include newsletter subscription when checked', async ({ page }) => {
    await page.fill('[data-testid="first-name-field"]', 'John');
    await page.fill('[data-testid="phone-field"]', '087 123 4567');
    await page.fill('[data-testid="email-field"]', 'john@example.com');
    await page.fill('[data-testid="address-line1-field"]', '123 Main Street');
    await page.fill('[data-testid="eircode-field"]', 'D02 XY45');

    // Check newsletter subscription
    await page.check('[data-testid="newsletter-checkbox"]');

    // Mock both API responses
    await page.route('**/api/quote-leads', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-lead-id', createdAt: new Date().toISOString() })
      });
    });

    await page.route('**/api/newsletter-subscriptions', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.locator('[data-testid="submit-button"]').click();

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('should clear form after successful submission', async ({ page }) => {
    await page.fill('[data-testid="first-name-field"]', 'John');
    await page.fill('[data-testid="phone-field"]', '087 123 4567');
    await page.fill('[data-testid="email-field"]', 'john@example.com');
    await page.fill('[data-testid="address-line1-field"]', '123 Main Street');
    await page.fill('[data-testid="eircode-field"]', 'D02 XY45');

    await page.route('**/api/quote-leads', async route => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-lead-id', createdAt: new Date().toISOString() })
      });
    });

    await page.locator('[data-testid="submit-button"]').click();

    // Form fields should be cleared
    await expect(page.locator('[data-testid="first-name-field"]')).toHaveValue('');
    await expect(page.locator('[data-testid="email-field"]')).toHaveValue('');
  });

  test('should scroll to form when header CTA is clicked', async ({ page }) => {
    const headerCTA = page.locator('[data-testid="header-quote-cta"]');
    await headerCTA.click();

    // Should scroll to quote form
    const quoteSection = page.locator('[data-testid="quote-section"]');
    await expect(quoteSection).toBeInViewport();

    // First field should be focused
    const firstNameField = page.locator('[data-testid="first-name-field"]');
    await expect(firstNameField).toBeFocused();
  });

  test('should show terms and privacy policy notice', async ({ page }) => {
    const termsNotice = page.locator('[data-testid="terms-privacy-notice"]');
    await expect(termsNotice).toBeVisible();
    await expect(termsNotice).toContainText('Terms of Service');
    await expect(termsNotice).toContainText('Privacy Policy');

    // Links should be present
    await expect(page.locator('[data-testid="terms-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="privacy-link"]')).toBeVisible();
  });
});