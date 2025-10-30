import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * Phase 6 - Testimonial Accessibility Tests
 * 
 * Tests for User Story 4: Build Trust - Testimonial controls
 * Validates testimonial navigation, keyboard accessibility, and screen reader support
 */

test.describe('Testimonials - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    // Wait for testimonial component to be visible
    await page.waitForSelector('[data-testid="testimonials"], .testimonials, #testimonials');
  });

  test('should have accessible testimonial container structure', async ({ page }) => {
    // Test will fail until component is implemented
    const testimonialsContainer = page.locator('[data-testid="testimonials"], .testimonials, #testimonials');
    await expect(testimonialsContainer).toBeVisible();
    
    // Should have proper role for testimonial region
    const role = await testimonialsContainer.getAttribute('role');
    expect(['region', 'group', 'list'].includes(role || '')).toBeTruthy();
    
    // Should have accessible name
    const ariaLabel = await testimonialsContainer.getAttribute('aria-label');
    const ariaLabelledBy = await testimonialsContainer.getAttribute('aria-labelledby');
    expect(ariaLabel || ariaLabelledBy).toBeTruthy();
    
    // If using aria-labelledby, the referenced element should exist
    if (ariaLabelledBy) {
      const labelElement = page.locator(`#${ariaLabelledBy}`);
      await expect(labelElement).toBeVisible();
    }
  });

  test('should have keyboard accessible navigation controls', async ({ page }) => {
    const testimonialsContainer = page.locator('[data-testid="testimonials"], .testimonials, #testimonials');
    
    // Look for navigation controls
    const prevButton = testimonialsContainer.locator('[data-testid="testimonial-prev"], .testimonial-prev, button:has-text("Previous")');
    const nextButton = testimonialsContainer.locator('[data-testid="testimonial-next"], .testimonial-next, button:has-text("Next")');
    
    // If navigation controls exist, they should be accessible
    if (await prevButton.count() > 0) {
      await expect(prevButton).toBeVisible();
      
      // Should be properly labeled
      const prevLabel = await prevButton.getAttribute('aria-label') || await prevButton.textContent();
      expect(prevLabel).toBeTruthy();
      expect(prevLabel?.toLowerCase()).toMatch(/prev|back|earlier/);
      
      // Should be keyboard focusable
      await prevButton.focus();
      await expect(prevButton).toBeFocused();
      
      // Should be proper button type
      const buttonType = await prevButton.getAttribute('type');
      if (buttonType !== null) expect(buttonType).toBe('button');
    }
    
    if (await nextButton.count() > 0) {
      await expect(nextButton).toBeVisible();
      
      // Should be properly labeled
      const nextLabel = await nextButton.getAttribute('aria-label') || await nextButton.textContent();
      expect(nextLabel).toBeTruthy();
      expect(nextLabel?.toLowerCase()).toMatch(/next|forward|later/);
      
      // Should be keyboard focusable
      await nextButton.focus();
      await expect(nextButton).toBeFocused();
      
      // Should be proper button type
      const buttonType = await nextButton.getAttribute('type');
      if (buttonType !== null) expect(buttonType).toBe('button');
    }
  });

  test('should have properly structured testimonial content', async ({ page }) => {
    const testimonialsContainer = page.locator('[data-testid="testimonials"], .testimonials, #testimonials');
    
    // Should have testimonial items
    const testimonialItems = testimonialsContainer.locator('[data-testid="testimonial-item"], .testimonial-item, .testimonial');
    const itemCount = await testimonialItems.count();
    expect(itemCount).toBeGreaterThan(0);
    
    // Check first testimonial for proper structure
    const firstTestimonial = testimonialItems.first();
    await expect(firstTestimonial).toBeVisible();
    
    // Should have testimonial text content
    const testimonialText = firstTestimonial.locator('.testimonial-text, .testimonial-content, blockquote, p');
    await expect(testimonialText.first()).toBeVisible();
    
    const textContent = await testimonialText.first().textContent();
    expect(textContent?.trim().length).toBeGreaterThan(10);
    
    // Should have attribution (name, location, etc.)
    const attribution = firstTestimonial.locator('.testimonial-author, .testimonial-attribution, cite, .author');
    await expect(attribution.first()).toBeVisible();
    
    const authorContent = await attribution.first().textContent();
    expect(authorContent?.trim().length).toBeGreaterThan(2);
  });

  test('should announce testimonial changes to screen readers', async ({ page }) => {
    const testimonialsContainer = page.locator('[data-testid="testimonials"], .testimonials, #testimonials');
    
    // Look for live region for announcements
    const liveRegion = page.locator('[aria-live], [data-testid="testimonial-live-region"]');
    
    // Navigate with next button if available
    const nextButton = testimonialsContainer.locator('[data-testid="testimonial-next"], .testimonial-next, button:has-text("Next")');
    
    if (await nextButton.count() > 0) {
      await nextButton.click();
      
      // Wait for potential announcement
      await page.waitForTimeout(500);
      
      // Check if announcement was made
      if (await liveRegion.count() > 0) {
        const liveRegionText = await liveRegion.textContent();
        expect((liveRegionText || '').length).toBeGreaterThan(0);
      }
      
      // Alternative: check for aria-current or similar state indicators
      const testimonialItems = testimonialsContainer.locator('[data-testid="testimonial-item"], .testimonial-item, .testimonial');
      const currentItem = testimonialItems.locator('[aria-current="true"], .current, .active');
      
      // Should have some way to indicate current/visible testimonial
      if (await currentItem.count() > 0) {
        await expect(currentItem).toBeVisible();
      }
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const testimonialsContainer = page.locator('[data-testid="testimonials"], .testimonials, #testimonials');
    
    // Focus the testimonials container
    await testimonialsContainer.focus();
    
    // Test arrow key navigation if supported
    const initialState = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="testimonials"], .testimonials, #testimonials');
      return container ? {
        activeElement: document.activeElement?.className || '',
        currentTestimonial: container.querySelector('.current, .active')?.textContent?.slice(0, 20) || ''
      } : null;
    });
    
    if (initialState) {
      // Try arrow keys
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(200);
      
      const newState = await page.evaluate(() => {
        const container = document.querySelector('[data-testid="testimonials"], .testimonials, #testimonials');
        return container ? {
          activeElement: document.activeElement?.className || '',
          currentTestimonial: container.querySelector('.current, .active')?.textContent?.slice(0, 20) || ''
        } : null;
      });
      
      // Either focus moved or testimonial changed
      if (newState) {
        const focusChanged = newState.activeElement !== initialState.activeElement;
        const testimonialChanged = newState.currentTestimonial !== initialState.currentTestimonial;
        expect(focusChanged || testimonialChanged).toBeTruthy();
      }
    }
  });

  test('should have proper ARIA attributes for testimonials', async ({ page }) => {
    const testimonialsContainer = page.locator('[data-testid="testimonials"], .testimonials, #testimonials');
    
    // If using carousel pattern, should have proper ARIA
    const isCarousel = await testimonialsContainer.getAttribute('role') === 'group' || 
                     await testimonialsContainer.locator('.carousel, [role="carousel"]').count() > 0;
    
    if (isCarousel) {
      // Should have carousel ARIA
      const ariaLabel = await testimonialsContainer.getAttribute('aria-label');
      expect(ariaLabel?.toLowerCase()).toMatch(/testimonial|review|carousel/);
      
      // Items should have proper roles
      const testimonialItems = testimonialsContainer.locator('[data-testid="testimonial-item"], .testimonial-item, .testimonial');
      const firstItem = testimonialItems.first();
      
      if (await firstItem.count() > 0) {
        const itemRole = await firstItem.getAttribute('role');
        expect(['group', 'tabpanel', 'article'].includes(itemRole || '')).toBeTruthy();
      }
    }
    
    // Testimonial text should be properly marked up
    const testimonialItems = testimonialsContainer.locator('[data-testid="testimonial-item"], .testimonial-item, .testimonial');
    if (await testimonialItems.count() > 0) {
      const firstItem = testimonialItems.first();
      
      // Should use blockquote or similar semantic element
      const quoteElement = firstItem.locator('blockquote, q, .testimonial-text[role="text"]');
      if (await quoteElement.count() > 0) {
        await expect(quoteElement.first()).toBeVisible();
      }
      
      // Attribution should be properly associated
      const citation = firstItem.locator('cite, .testimonial-author');
      if (await citation.count() > 0) {
        await expect(citation.first()).toBeVisible();
      }
    }
  });

  test('should meet WCAG accessibility standards', async ({ page }) => {
    // Run comprehensive accessibility scan on testimonials
    await checkA11y(page, '[data-testid="testimonials"], .testimonials, #testimonials', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
    
    // Test specific to testimonial controls if they exist
    const testimonialControls = page.locator('[data-testid="testimonial-prev"], [data-testid="testimonial-next"], .testimonial-prev, .testimonial-next');
    
    if (await testimonialControls.count() > 0) {
      await checkA11y(page, testimonialControls, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    }
  });

  test('should handle disabled navigation states', async ({ page }) => {
    const testimonialsContainer = page.locator('[data-testid="testimonials"], .testimonials, #testimonials');
    const prevButton = testimonialsContainer.locator('[data-testid="testimonial-prev"], .testimonial-prev');
    const nextButton = testimonialsContainer.locator('[data-testid="testimonial-next"], .testimonial-next');
    
    if (await prevButton.count() > 0 && await nextButton.count() > 0) {
      // Check if navigation states are properly managed
      const testimonialItems = testimonialsContainer.locator('[data-testid="testimonial-item"], .testimonial-item, .testimonial');
      const itemCount = await testimonialItems.count();
      
      if (itemCount > 1) {
        // At first testimonial, prev might be disabled
        const prevDisabled = await prevButton.getAttribute('disabled');
        const prevAriaDisabled = await prevButton.getAttribute('aria-disabled');
        
        // At least one of these patterns should be used for state management
        const hasStateManagement = prevDisabled !== null || prevAriaDisabled !== null;
        
        if (hasStateManagement) {
          // Navigate to last and check next button state
          for (let i = 0; i < itemCount - 1; i++) {
            await nextButton.click();
            await page.waitForTimeout(100);
          }
          
          const nextDisabled = await nextButton.getAttribute('disabled');
          const nextAriaDisabled = await nextButton.getAttribute('aria-disabled');
          
          expect(nextDisabled !== null || nextAriaDisabled === 'true').toBeTruthy();
        }
      }
    }
  });

  test('should have minimum touch target size for mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip(); // Only test on mobile devices
    }
    
    const testimonialsContainer = page.locator('[data-testid="testimonials"], .testimonials, #testimonials');
    const buttons = testimonialsContainer.locator('button');
    
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();
      
      if (boundingBox) {
        // Should meet minimum 44x44px touch target
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    
    const testimonialsContainer = page.locator('[data-testid="testimonials"], .testimonials, #testimonials');
    await expect(testimonialsContainer).toBeVisible();
    
    // Check if transitions are disabled or reduced
    const containerStyles = await testimonialsContainer.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        transition: style.transition,
        animation: style.animation
      };
    });
    
    // Should either have no transitions or very fast ones
    if (containerStyles.transition !== 'none') {
      expect(containerStyles.transition).toMatch(/0s|0\.0/);
    }
    
    if (containerStyles.animation !== 'none') {
      expect(containerStyles.animation).toMatch(/0s|0\.0/);
    }
  });
});