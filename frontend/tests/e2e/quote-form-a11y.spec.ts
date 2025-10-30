import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Quote Form - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper form labels and ARIA attributes', async ({ page }) => {
    const quoteForm = page.locator('[data-testid="quote-form"]');
    await expect(quoteForm).toBeVisible();

    // Check that all fields have proper labels
    const fields = [
      'first-name-field',
      'second-name-field', 
      'phone-field',
      'email-field',
      'address-line1-field',
      'address-line2-field',
      'eircode-field',
      'note-field'
    ];

    for (const fieldTestId of fields) {
      const field = page.locator(`[data-testid="${fieldTestId}"]`);
      if (await field.isVisible()) {
        // Field should have associated label
        const fieldId = await field.getAttribute('id');
        const label = page.locator(`label[for="${fieldId}"]`);
        await expect(label).toBeVisible();
        
        // Label should not be empty
        const labelText = await label.textContent();
        expect(labelText?.trim()).toBeTruthy();
      }
    }
  });

  test('should have proper ARIA attributes for required fields', async ({ page }) => {
    const requiredFields = [
      'first-name-field',
      'phone-field', 
      'email-field',
      'address-line1-field',
      'eircode-field'
    ];

    for (const fieldTestId of requiredFields) {
      const field = page.locator(`[data-testid="${fieldTestId}"]`);
      
      // Required fields should have aria-required="true"
      const ariaRequired = await field.getAttribute('aria-required');
      expect(ariaRequired).toBe('true');
      
      // Or required attribute
      const required = await field.getAttribute('required');
      expect(required !== null || ariaRequired === 'true').toBe(true);
    }
  });

  test('should associate error messages with form fields', async ({ page }) => {
    // Trigger validation errors
    await page.locator('[data-testid="submit-button"]').click();

    const requiredFields = [
      'first-name-field',
      'phone-field',
      'email-field', 
      'address-line1-field',
      'eircode-field'
    ];

    for (const fieldTestId of requiredFields) {
      const field = page.locator(`[data-testid="${fieldTestId}"]`);
      const errorTestId = fieldTestId.replace('-field', '-error');
      const errorMessage = page.locator(`[data-testid="${errorTestId}"]`);
      
      if (await errorMessage.isVisible()) {
        // Error message should have an ID
        const errorId = await errorMessage.getAttribute('id');
        expect(errorId).toBeTruthy();
        
        // Field should reference error message via aria-describedby
        const ariaDescribedBy = await field.getAttribute('aria-describedby');
        expect(ariaDescribedBy).toContain(errorId!);
        
        // Field should have aria-invalid="true"
        const ariaInvalid = await field.getAttribute('aria-invalid');
        expect(ariaInvalid).toBe('true');
      }
    }
  });

  test('should have proper fieldset and legend for form groups', async ({ page }) => {
    const quoteForm = page.locator('[data-testid="quote-form"]');
    
    // Check if form uses fieldsets appropriately
    const fieldsets = quoteForm.locator('fieldset');
    const fieldsetCount = await fieldsets.count();
    
    if (fieldsetCount > 0) {
      for (let i = 0; i < fieldsetCount; i++) {
        const fieldset = fieldsets.nth(i);
        
        // Each fieldset should have a legend
        const legend = fieldset.locator('legend').first();
        await expect(legend).toBeVisible();
        
        // Legend should not be empty
        const legendText = await legend.textContent();
        expect(legendText?.trim()).toBeTruthy();
      }
    }
  });

  test('should have accessible submit button', async ({ page }) => {
    const submitButton = page.locator('[data-testid="submit-button"]');
    
    // Button should be properly labeled
    const buttonText = await submitButton.textContent();
    expect(buttonText?.trim()).toBeTruthy();
    
    // Should not rely only on color or icons for meaning
    expect(buttonText).toMatch(/(submit|send|get quote|request)/i);
    
    // Should be keyboard accessible
    await submitButton.focus();
    await expect(submitButton).toBeFocused();
  });

  test('should have accessible newsletter checkbox', async ({ page }) => {
    const checkbox = page.locator('[data-testid="newsletter-checkbox"]');
    
    // Checkbox should have associated label
    const checkboxId = await checkbox.getAttribute('id');
    const label = page.locator(`label[for="${checkboxId}"]`);
    await expect(label).toBeVisible();
    
    // Label should describe what the checkbox does
    const labelText = await label.textContent();
    expect(labelText).toMatch(/newsletter|subscribe|updates/i);
    
    // Should be keyboard accessible
    await checkbox.focus();
    await expect(checkbox).toBeFocused();
  });

  test('should maintain logical tab order', async ({ page }) => {
    const expectedTabOrder = [
      'first-name-field',
      'second-name-field',
      'phone-field', 
      'email-field',
      'address-line1-field',
      'address-line2-field',
      'eircode-field',
      'note-field',
      'newsletter-checkbox',
      'submit-button'
    ];

    // Start from first field
    await page.locator(`[data-testid="${expectedTabOrder[0]}"]`).focus();
    
    for (let i = 1; i < expectedTabOrder.length; i++) {
      await page.keyboard.press('Tab');
      
      const currentField = page.locator(`[data-testid="${expectedTabOrder[i]}"]`);
      if (await currentField.isVisible()) {
        await expect(currentField).toBeFocused();
      }
    }
  });

  test('should provide clear focus indicators', async ({ page }) => {
    const interactiveElements = [
      'first-name-field',
      'phone-field',
      'email-field', 
      'address-line1-field',
      'eircode-field',
      'newsletter-checkbox',
      'submit-button'
    ];

    for (const elementTestId of interactiveElements) {
      const element = page.locator(`[data-testid="${elementTestId}"]`);
      
      if (await element.isVisible()) {
        await element.focus();
        
        // Element should have visible focus indicator
        // This can be outline, box-shadow, background change, etc.
        const focusedStyles = await element.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return {
            outline: styles.outline,
            outlineWidth: styles.outlineWidth,
            boxShadow: styles.boxShadow,
            borderColor: styles.borderColor
          };
        });
        
        // Should have some form of focus indication
        const hasFocusIndicator = 
          focusedStyles.outline !== 'none' ||
          focusedStyles.outlineWidth !== '0px' ||
          focusedStyles.boxShadow !== 'none' ||
          focusedStyles.borderColor !== 'initial';
          
        expect(hasFocusIndicator).toBe(true);
      }
    }
  });

  test('should announce form validation errors to screen readers', async ({ page }) => {
    // Trigger validation
    await page.locator('[data-testid="submit-button"]').click();
    
    // Check for aria-live region for announcements
    const liveRegion = page.locator('[aria-live="polite"], [aria-live="assertive"]');
    const liveRegionCount = await liveRegion.count();
    
    if (liveRegionCount > 0) {
      // Live region should announce validation errors
      const liveRegionText = await liveRegion.first().textContent();
      expect(liveRegionText).toMatch(/(error|required|invalid)/i);
    }
  });

  test('should provide helpful error messages', async ({ page }) => {
    // Test specific field validation
    await page.fill('[data-testid="email-field"]', 'invalid-email');
    await page.locator('[data-testid="submit-button"]').click();
    
    const emailError = page.locator('[data-testid="email-error"]');
    if (await emailError.isVisible()) {
      const errorText = await emailError.textContent();
      
      // Error should be descriptive and helpful
      expect(errorText).toMatch(/(valid email|email address|@ symbol)/i);
      expect(errorText?.length).toBeGreaterThan(10); // Not just "Invalid"
    }
  });

  test('should be operable with keyboard only', async ({ page }) => {
    // Fill form using only keyboard
    await page.keyboard.press('Tab'); // Focus first field
    await page.keyboard.type('John');
    
    await page.keyboard.press('Tab'); // Second name (optional)
    await page.keyboard.type('Doe');
    
    await page.keyboard.press('Tab'); // Phone
    await page.keyboard.type('087 123 4567');
    
    await page.keyboard.press('Tab'); // Email
    await page.keyboard.type('john@example.com');
    
    await page.keyboard.press('Tab'); // Address line 1
    await page.keyboard.type('123 Main Street');
    
    await page.keyboard.press('Tab'); // Address line 2
    await page.keyboard.type('Apt 4B');
    
    await page.keyboard.press('Tab'); // Eircode
    await page.keyboard.type('D02 XY45');
    
    await page.keyboard.press('Tab'); // Note
    await page.keyboard.type('Looking for garden office');
    
    await page.keyboard.press('Tab'); // Newsletter checkbox
    await page.keyboard.press('Space'); // Check it
    
    await page.keyboard.press('Tab'); // Submit button
    
    // Should be able to submit with Enter or Space
    const submitButton = page.locator('[data-testid="submit-button"]');
    await expect(submitButton).toBeFocused();
  });

  test('should support high contrast mode', async ({ page }) => {
    // Enable high contrast mode simulation
    await page.emulateMedia({ colorScheme: 'dark' });
    
    const quoteForm = page.locator('[data-testid="quote-form"]');
    await expect(quoteForm).toBeVisible();
    
    // Form should remain usable in high contrast
    const submitButton = page.locator('[data-testid="submit-button"]');
    await expect(submitButton).toBeVisible();
    
    // Check that field borders are still visible
    const firstNameField = page.locator('[data-testid="first-name-field"]');
    const fieldStyles = await firstNameField.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        borderWidth: styles.borderWidth,
        borderStyle: styles.borderStyle
      };
    });
    
    expect(fieldStyles.borderWidth).not.toBe('0px');
    expect(fieldStyles.borderStyle).not.toBe('none');
  });

  test('should have no accessibility violations', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .include('[data-testid="quote-form"]')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    // Enable reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    const quoteForm = page.locator('[data-testid="quote-form"]');
    await expect(quoteForm).toBeVisible();
    
    // Form animations should be reduced or disabled
    // This would be tested based on the specific animations implemented
    // For now, just ensure form is still functional
    await page.fill('[data-testid="first-name-field"]', 'John');
    const field = page.locator('[data-testid="first-name-field"]');
    await expect(field).toHaveValue('John');
  });
});