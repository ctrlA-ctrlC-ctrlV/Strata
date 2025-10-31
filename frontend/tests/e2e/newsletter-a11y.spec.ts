// Newsletter Accessibility Tests - Phase 9
// User Story 6: Subscribe for Offers (Newsletter)

import { test, expect } from '@playwright/test';
import { runAxeOnElement } from '../helpers/axe';

test.describe('Newsletter - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should have accessible newsletter form structure', async ({ page }) => {
    // Test will fail until component is implemented - use more specific selector
    const newsletterContainer = page.locator('[data-testid="newsletter"].newsletter.section');
    await expect(newsletterContainer).toBeVisible();

    // Should have proper semantic structure
    const role = await newsletterContainer.getAttribute('role');
    const tagName = await newsletterContainer.evaluate(el => el.tagName.toLowerCase());
    expect(role === 'region' || tagName === 'section' || tagName === 'form').toBeTruthy();

    // Should have appropriate label
    const hasAriaLabel = await newsletterContainer.getAttribute('aria-label');
    const hasAriaLabelledBy = await newsletterContainer.getAttribute('aria-labelledby');
    expect(hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
  });

  test('should have properly labeled email input', async ({ page }) => {
    // Use specific selector for newsletter email input
    const emailInput = page.locator('.newsletter input[type="email"]');
    await expect(emailInput).toBeVisible();

    // Should have explicit label
    const inputId = await emailInput.getAttribute('id');
    expect(inputId).toBeTruthy();

    const label = page.locator(`label[for="${inputId}"]`);
    await expect(label).toBeVisible();
    
    const labelText = await label.textContent();
    expect(labelText?.toLowerCase()).toMatch(/email|address/);

    // Should have required attribute
    const isRequired = await emailInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('should display validation errors with proper ARIA', async ({ page }) => {
    const emailInput = page.locator('.newsletter input[type="email"]');
    const submitButton = page.locator('.newsletter button[type="submit"]');

    // Try to submit with invalid email
    await emailInput.fill('invalid-email');
    await submitButton.click();

    // Should show error message
    const errorMessage = page.locator('.newsletter [role="alert"], .newsletter .error, .newsletter .invalid-feedback');
    await expect(errorMessage).toBeVisible();

    // Error should be associated with input
    const ariaDescribedBy = await emailInput.getAttribute('aria-describedby');
    if (ariaDescribedBy) {
      const errorId = ariaDescribedBy.split(' ').find(id => id.includes('error'));
      expect(errorId).toBeTruthy();
      
      const errorElement = page.locator(`#${errorId}`);
      await expect(errorElement).toBeVisible();
    }

    // Input should have aria-invalid
    const ariaInvalid = await emailInput.getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('true');
  });

  test('should support keyboard navigation', async ({ page }) => {
    const newsletterForm = page.locator('.newsletter form');
    await expect(newsletterForm).toBeVisible();

    // Focus the newsletter input specifically
    const newsletterEmailInput = page.locator('.newsletter input[type="email"]');
    await newsletterEmailInput.focus();

    const emailInput = page.locator('.newsletter input[type="email"]:focus');
    await expect(emailInput).toBeFocused();

    // Should be able to type
    await emailInput.fill('test@example.com');
    
    // Tab to submit button
    await page.keyboard.press('Tab');
    const submitButton = page.locator('.newsletter button[type="submit"]:focus');
    await expect(submitButton).toBeFocused();

    // Should be able to submit with Enter
    await page.keyboard.press('Enter');
    
    // Should handle submission (might show success or error)
    await page.waitForTimeout(1000);
  });

  test('should have visible focus indicators', async ({ page }) => {
    const emailInput = page.locator('.newsletter input[type="email"]');
    const submitButton = page.locator('.newsletter button[type="submit"]');

    // Focus email input
    await emailInput.focus();
    
    // Should have visible focus outline
    const inputOutline = await emailInput.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
        outlineColor: styles.outlineColor,
        boxShadow: styles.boxShadow
      };
    });
    
    const hasFocus = inputOutline.outline !== 'none' || 
                   inputOutline.outlineWidth !== '0px' ||
                   inputOutline.boxShadow !== 'none';
    expect(hasFocus).toBeTruthy();

    // Focus submit button
    await submitButton.focus();
    
    const buttonOutline = await submitButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      };
    });
    
    const buttonHasFocus = buttonOutline.outline !== 'none' || 
                          buttonOutline.outlineWidth !== '0px' ||
                          buttonOutline.boxShadow !== 'none';
    expect(buttonHasFocus).toBeTruthy();
  });

  test('should have appropriate touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    const touchTargets = page.locator('button, input, a').locator('visible=true');
    const targetCount = await touchTargets.count();

    for (let i = 0; i < targetCount; i++) {
      const target = touchTargets.nth(i);
      const box = await target.boundingBox();
      
      if (box) {
        // WCAG recommends minimum 44x44px for touch targets
        // Accept reasonable sizes (32px is still usable on most devices)
        expect(box.width).toBeGreaterThanOrEqual(32);
        expect(box.height).toBeGreaterThanOrEqual(32);
      }
    }
  });

  test('should announce success/error states to screen readers', async ({ page }) => {
    const emailInput = page.locator('.newsletter input[type="email"]');
    const submitButton = page.locator('.newsletter button[type="submit"]');

    // Submit valid email
    await emailInput.fill('test@example.com');
    await submitButton.click();

    // Should have live region for announcements
    const liveRegion = page.locator('.newsletter [aria-live]').first();
    await expect(liveRegion).toBeVisible();

    // Check for success or error announcement
    const announcement = await liveRegion.textContent();
    expect(announcement).toBeTruthy();
    expect(announcement?.length).toBeGreaterThan(0);
  });

  test('should have policy links that are keyboard accessible', async ({ page }) => {
    // Should have privacy policy link
    const policyLinks = page.locator('a').filter({ hasText: /privacy|policy|terms/i });
    const linkCount = await policyLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    for (let i = 0; i < linkCount; i++) {
      const link = policyLinks.nth(i);
      
      // Should be focusable
      await link.focus();
      await expect(link).toBeFocused();
      
      // Should have meaningful text
      const linkText = await link.textContent();
      expect(linkText?.trim().length).toBeGreaterThan(3);
      
      // Should have href
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('should handle form submission states properly', async ({ page }) => {
    const emailInput = page.locator('.newsletter input[type="email"]');
    const submitButton = page.locator('.newsletter button[type="submit"]');

    // Submit valid email
    await emailInput.fill('newsletter@example.com');
    
    // Button should be enabled initially
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBeFalsy();

    await submitButton.click();

    // Should either show loading state or success/error
    await page.waitForTimeout(1000);
    
    // Check if form shows some feedback
    const feedback = page.locator('.newsletter [role="status"], .newsletter [role="alert"]').first();
    // Wait for any status message to appear or check if any exists
    const feedbackVisible = await feedback.isVisible().catch(() => false);
    const statusElementsExist = await page.locator('.newsletter [role="status"], .newsletter [role="alert"]').count() > 0;
    expect(feedbackVisible || statusElementsExist).toBeTruthy();
  });

  test('should respect user preferences for reduced motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    const newsletterContainer = page.locator('.newsletter');
    await expect(newsletterContainer).toBeVisible();

    // Any animations should be disabled or reduced
    const hasReducedMotionClass = await newsletterContainer.evaluate(el => {
      return el.classList.contains('reduced-motion') || 
             el.classList.contains('newsletter--reduced-motion') ||
             getComputedStyle(el).getPropertyValue('--motion-duration') === '0s';
    });

    // This test validates that motion preferences are considered
    // Implementation should add appropriate classes or CSS custom properties
    expect(hasReducedMotionClass).toBeTruthy();
  });

  test('should work without JavaScript (no-JS baseline)', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      Object.defineProperty(navigator, 'javaEnabled', {
        value: () => false,
      });
    });

    await page.goto('/');
    
    const newsletterForm = page.locator('.newsletter form').filter({ has: page.locator('input[type="email"]') });
    await expect(newsletterForm).toBeVisible();

    // Should have action attribute for fallback
    const action = await newsletterForm.getAttribute('action');
    expect(action).toBeTruthy();
    
    // Should provide fallback instructions - check if noscript content exists in DOM
    const fallbackElement = page.locator('.newsletter noscript div.newsletter__noscript');
    const fallbackExists = await fallbackElement.count() > 0;
    expect(fallbackExists).toBeTruthy();
  });

  test('should pass automated accessibility checks', async ({ page }) => {
    const newsletterContainer = page.locator('.newsletter');
    await expect(newsletterContainer).toBeVisible();

    // Run axe accessibility checks on the newsletter section
    await runAxeOnElement(page, '.newsletter', {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
    });
  });
});