import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * Phase 8 - FAQ Accessibility Tests
 * 
 * Tests for User Story 5: Self-Serve Answers (Mini-FAQ)
 * Validates FAQ expand/collapse functionality, keyboard accessibility, and screen reader support
 */

test.describe('FAQ - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    // Wait for FAQ component to be visible
    await page.waitForSelector('[data-testid="faq"], .faq, #faq');
  });

  test('should have accessible FAQ container structure', async ({ page }) => {
    // Test will fail until component is implemented
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    await expect(faqContainer).toBeVisible();
    
    // Should have proper semantic structure
    const role = await faqContainer.getAttribute('role');
    expect(['region', 'group', 'list'].includes(role || '') || !role).toBeTruthy();
    
    // Should have accessible name or heading
    const ariaLabel = await faqContainer.getAttribute('aria-label');
    const ariaLabelledBy = await faqContainer.getAttribute('aria-labelledby');
    const heading = faqContainer.locator('h1, h2, h3, h4, h5, h6').first();
    
    expect(ariaLabel || ariaLabelledBy || await heading.count() > 0).toBeTruthy();
    
    // If using aria-labelledby, the referenced element should exist
    if (ariaLabelledBy) {
      const labelElement = page.locator(`#${ariaLabelledBy}`);
      await expect(labelElement).toBeVisible();
    }
  });

  test('should use native details/summary elements for accessibility', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    
    // Should use native details/summary for baseline accessibility
    const detailsElements = faqContainer.locator('details');
    const detailsCount = await detailsElements.count();
    expect(detailsCount).toBeGreaterThan(0);
    
    // Each details should have a summary
    const summaryElements = faqContainer.locator('details summary');
    await expect(summaryElements).toHaveCount(detailsCount);
    
    // Summaries should be properly labeled
    for (let i = 0; i < Math.min(detailsCount, 3); i++) {
      const summary = summaryElements.nth(i);
      const text = await summary.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should support keyboard navigation for FAQ items', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const summaryElements = faqContainer.locator('details summary');
    const firstSummary = summaryElements.first();
    
    // Should be focusable
    await firstSummary.focus();
    await expect(firstSummary).toBeFocused();
    
    // Should expand/collapse with Enter and Space
    const parentDetails = firstSummary.locator('..');
    const initialOpenState = await parentDetails.getAttribute('open');
    
    // Test Enter key
    await firstSummary.press('Enter');
    const afterEnterState = await parentDetails.getAttribute('open');
    expect(initialOpenState !== afterEnterState).toBeTruthy();
    
    // Test Space key
    await firstSummary.press('Space');
    const afterSpaceState = await parentDetails.getAttribute('open');
    expect(afterEnterState !== afterSpaceState).toBeTruthy();
  });

  test('should have visible focus indicators on summary elements', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const summaryElements = faqContainer.locator('details summary');
    
    if (await summaryElements.count() > 0) {
      const firstSummary = summaryElements.first();
      await firstSummary.focus();
      
      // Check that focus styles are applied
      const focusStyles = await firstSummary.evaluate(el => {
        const computedStyle = window.getComputedStyle(el);
        return {
          outline: computedStyle.getPropertyValue('outline'),
          boxShadow: computedStyle.getPropertyValue('box-shadow'),
          backgroundColor: computedStyle.getPropertyValue('background-color'),
          borderColor: computedStyle.getPropertyValue('border-color')
        };
      });
      
      // Should have visible focus indication (outline, box-shadow, or background change)
      const hasFocusIndication = (
        focusStyles.outline !== 'none' &&
        focusStyles.outline !== '0px none' &&
        focusStyles.outline !== ''
      ) || (
        focusStyles.boxShadow !== 'none' &&
        focusStyles.boxShadow !== ''
      );
      
      expect(hasFocusIndication).toBeTruthy();
    }
  });

  test('should support multiple FAQ items being open simultaneously', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const detailsElements = faqContainer.locator('details');
    const detailsCount = await detailsElements.count();
    
    if (detailsCount >= 2) {
      const firstDetails = detailsElements.nth(0);
      const secondDetails = detailsElements.nth(1);
      const firstSummary = firstDetails.locator('summary');
      const secondSummary = secondDetails.locator('summary');
      
      // Open first FAQ item
      await firstSummary.click();
      await expect(firstDetails).toHaveAttribute('open');
      
      // Open second FAQ item
      await secondSummary.click();
      await expect(secondDetails).toHaveAttribute('open');
      
      // Both should remain open (accordion behavior should not be forced)
      await expect(firstDetails).toHaveAttribute('open');
      await expect(secondDetails).toHaveAttribute('open');
    }
  });

  test('should announce expand/collapse state to screen readers', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const detailsElements = faqContainer.locator('details');
    
    if (await detailsElements.count() > 0) {
      const firstDetails = detailsElements.first();
      const firstSummary = firstDetails.locator('summary');
      
      // Check initial state
      const initialExpanded = await firstDetails.getAttribute('open') !== null;
      
      // Click to toggle
      await firstSummary.click();
      const afterClickExpanded = await firstDetails.getAttribute('open') !== null;
      
      // State should have changed
      expect(initialExpanded !== afterClickExpanded).toBeTruthy();
      
      // Check for ARIA attributes that help screen readers
      const ariaExpanded = await firstSummary.getAttribute('aria-expanded');
      const ariaControls = await firstSummary.getAttribute('aria-controls');
      
      // Native details/summary should provide built-in accessibility
      // but we can enhance with ARIA if needed
      if (ariaExpanded) {
        expect(ariaExpanded).toBe(afterClickExpanded ? 'true' : 'false');
      }
    }
  });

  test('should have proper content structure in expanded state', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const detailsElements = faqContainer.locator('details');
    
    if (await detailsElements.count() > 0) {
      const firstDetails = detailsElements.first();
      const firstSummary = firstDetails.locator('summary');
      
      // Ensure FAQ is expanded
      if (!await firstDetails.getAttribute('open')) {
        await firstSummary.click();
      }
      
      // Check that content is visible and accessible
      const content = firstDetails.locator(':not(summary)');
      await expect(content.first()).toBeVisible();
      
      // Content should have text
      const contentText = await content.first().textContent();
      expect(contentText?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should have appropriate ARIA landmark or section roles', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    
    // Check if FAQ is in a section or has appropriate landmark
    const isInSection = await faqContainer.locator('xpath=ancestor-or-self::section').count() > 0;
    const hasRegionRole = await faqContainer.getAttribute('role') === 'region';
    const hasMainRole = await faqContainer.locator('xpath=ancestor-or-self::main').count() > 0;
    
    expect(isInSection || hasRegionRole || hasMainRole).toBeTruthy();
  });

  test('should pass automated accessibility checks', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    await expect(faqContainer).toBeVisible();
    
    // Run axe accessibility checks on the FAQ section
    await checkA11y(page, '[data-testid="faq"], .faq, #faq', {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('should work correctly with reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    await expect(faqContainer).toBeVisible();
    
    // FAQ should still function but without animations
    const detailsElements = faqContainer.locator('details');
    if (await detailsElements.count() > 0) {
      const firstDetails = detailsElements.first();
      const firstSummary = firstDetails.locator('summary');
      
      // Should still be able to expand/collapse
      const initialState = await firstDetails.getAttribute('open') !== null;
      await firstSummary.click();
      const afterClickState = await firstDetails.getAttribute('open') !== null;
      
      expect(initialState !== afterClickState).toBeTruthy();
    }
  });

  test('should have appropriate touch target sizes on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const summaryElements = faqContainer.locator('details summary');
    
    if (await summaryElements.count() > 0) {
      for (let i = 0; i < Math.min(await summaryElements.count(), 3); i++) {
        const summary = summaryElements.nth(i);
        const boundingBox = await summary.boundingBox();
        
        if (boundingBox) {
          // WCAG recommends minimum 44x44 CSS pixels for touch targets
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
          // Width should be reasonable for tap target
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should support Tab navigation through FAQ items sequentially', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const summaryElements = faqContainer.locator('details summary');
    const summaryCount = await summaryElements.count();
    
    if (summaryCount > 1) {
      // Start from first summary
      await summaryElements.first().focus();
      await expect(summaryElements.first()).toBeFocused();
      
      // Tab through each summary element
      for (let i = 1; i < Math.min(summaryCount, 3); i++) {
        await page.keyboard.press('Tab');
        await expect(summaryElements.nth(i)).toBeFocused();
      }
    }
  });

  test('should support Shift+Tab navigation backwards through FAQ items', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const summaryElements = faqContainer.locator('details summary');
    const summaryCount = await summaryElements.count();
    
    if (summaryCount > 1) {
      // Start from last summary
      await summaryElements.last().focus();
      await expect(summaryElements.last()).toBeFocused();
      
      // Shift+Tab backwards through summary elements
      for (let i = summaryCount - 2; i >= Math.max(0, summaryCount - 3); i--) {
        await page.keyboard.press('Shift+Tab');
        await expect(summaryElements.nth(i)).toBeFocused();
      }
    }
  });

  test('should handle Escape key appropriately', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const summaryElements = faqContainer.locator('details summary');
    
    if (await summaryElements.count() > 0) {
      const firstSummary = summaryElements.first();
      const firstDetails = firstSummary.locator('..');
      
      // Open the FAQ item
      await firstSummary.click();
      await expect(firstDetails).toHaveAttribute('open');
      
      // Press Escape (should not close FAQ item - this is native behavior)
      await firstSummary.press('Escape');
      // FAQ should remain open as <details> doesn't respond to Escape by default
      await expect(firstDetails).toHaveAttribute('open');
    }
  });

  test('should maintain focus after expanding/collapsing', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const summaryElements = faqContainer.locator('details summary');
    
    if (await summaryElements.count() > 0) {
      const firstSummary = summaryElements.first();
      
      // Focus and expand
      await firstSummary.focus();
      await firstSummary.press('Enter');
      
      // Focus should remain on summary after expanding
      await expect(firstSummary).toBeFocused();
      
      // Collapse and check focus again
      await firstSummary.press('Space');
      await expect(firstSummary).toBeFocused();
    }
  });

  test('should support Arrow key navigation between FAQ items', async ({ page }) => {
    const faqContainer = page.locator('[data-testid="faq"], .faq, #faq');
    const summaryElements = faqContainer.locator('details summary');
    const summaryCount = await summaryElements.count();
    
    if (summaryCount > 1) {
      await summaryElements.first().focus();
      
      // Arrow Down should move to next FAQ item (if implemented)
      await page.keyboard.press('ArrowDown');
      
      // Check if focus moved or if it's still on first item (both are acceptable)
      const firstFocused = await summaryElements.first().evaluate(el => document.activeElement === el);
      const secondFocused = await summaryElements.nth(1).evaluate(el => document.activeElement === el);
      
      // Either the focus stayed (normal Tab behavior) or moved (enhanced arrow navigation)
      expect(firstFocused || secondFocused).toBeTruthy();
    }
  });
});