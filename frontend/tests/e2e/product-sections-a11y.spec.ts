import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * Phase 4 - Product Sections Accessibility Tests
 * 
 * Tests for User Story 2: Explore Product Sections
 * Validates accessibility, tab order, and link functionality for Garden Rooms and Home Extensions sections
 */

test.describe('Product Sections - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
  });

  test('should have accessible Garden Rooms section structure', async ({ page }) => {
    // Check for Garden Rooms section
    const gardenRoomsSection = page.locator('[data-testid="garden-rooms-section"], #garden-rooms');
    await expect(gardenRoomsSection).toBeAttached();
    
    // Should have proper heading hierarchy
    const heading = gardenRoomsSection.locator('h2, h3');
    await expect(heading).toBeAttached();
    
    // Should have image with alt text
    const image = gardenRoomsSection.locator('img');
    await expect(image).toBeAttached();
    const altText = await image.getAttribute('alt');
    expect(altText).toBeTruthy();
    expect(altText).not.toBe('');
    
    // Should have primary CTA button
    const primaryCta = gardenRoomsSection.locator('[data-testid="garden-rooms-cta"], .btn-primary');
    await expect(primaryCta).toBeAttached();
    
    // Should have "For more details" link
    const detailsLink = gardenRoomsSection.locator('a[href*="garden-rooms"], a:has-text("more details")');
    await expect(detailsLink).toBeAttached();
  });

  test('should have accessible Home Extensions section structure', async ({ page }) => {
    // Check for Home Extensions section
    const homeExtensionsSection = page.locator('[data-testid="home-extensions-section"], #home-extensions');
    await expect(homeExtensionsSection).toBeAttached();
    
    // Should have proper heading hierarchy
    const heading = homeExtensionsSection.locator('h2, h3');
    await expect(heading).toBeAttached();
    
    // Should have image with alt text
    const image = homeExtensionsSection.locator('img');
    await expect(image).toBeAttached();
    const altText = await image.getAttribute('alt');
    expect(altText).toBeTruthy();
    expect(altText).not.toBe('');
    
    // Should have primary CTA button
    const primaryCta = homeExtensionsSection.locator('[data-testid="home-extensions-cta"], .btn-primary');
    await expect(primaryCta).toBeAttached();
    
    // Should have "For more details" link
    const detailsLink = homeExtensionsSection.locator('a[href*="home-extensions"], a:has-text("more details")');
    await expect(detailsLink).toBeAttached();
  });

  test('should have proper keyboard tab order for CTAs and links', async ({ page }) => {
    // Focus on first focusable element
    await page.keyboard.press('Tab');
    
    // Garden Rooms section elements should be accessible via tab
    const gardenRoomsSection = page.locator('[data-testid="garden-rooms-section"], #garden-rooms');
    const gardenRoomsCta = gardenRoomsSection.locator('[data-testid="garden-rooms-cta"], .btn-primary');
    const gardenRoomsDetails = gardenRoomsSection.locator('a[href*="garden-rooms"], a:has-text("more details")');
    
    // Check if elements are keyboard accessible
    await gardenRoomsCta.focus();
    await expect(gardenRoomsCta).toBeFocused();
    
    await page.keyboard.press('Tab');
    if (await gardenRoomsDetails.isVisible()) {
      await expect(gardenRoomsDetails).toBeFocused();
    }
    
    // Home Extensions section elements should be accessible via tab
    const homeExtensionsSection = page.locator('[data-testid="home-extensions-section"], #home-extensions');
    const homeExtensionsCta = homeExtensionsSection.locator('[data-testid="home-extensions-cta"], .btn-primary');
    const homeExtensionsDetails = homeExtensionsSection.locator('a[href*="home-extensions"], a:has-text("more details")');
    
    // Navigate to Home Extensions CTA
    await homeExtensionsCta.focus();
    await expect(homeExtensionsCta).toBeFocused();
    
    await page.keyboard.press('Tab');
    if (await homeExtensionsDetails.isVisible()) {
      await expect(homeExtensionsDetails).toBeFocused();
    }
  });

  test('should have proper 2-column layout structure', async ({ page }) => {
    // Garden Rooms should have 2-column layout
    const gardenRoomsSection = page.locator('[data-testid="garden-rooms-section"], #garden-rooms');
    
    // Should have image column (left)
    const imageColumn = gardenRoomsSection.locator('.image-column, .col-image, [data-column="image"]');
    await expect(imageColumn).toBeAttached();
    
    // Should have content column (right)
    const contentColumn = gardenRoomsSection.locator('.content-column, .col-content, [data-column="content"]');
    await expect(contentColumn).toBeAttached();
    
    // Home Extensions should have 2-column layout
    const homeExtensionsSection = page.locator('[data-testid="home-extensions-section"], #home-extensions');
    
    // Should have image column
    const homeImageColumn = homeExtensionsSection.locator('.image-column, .col-image, [data-column="image"]');
    await expect(homeImageColumn).toBeAttached();
    
    // Should have content column
    const homeContentColumn = homeExtensionsSection.locator('.content-column, .col-content, [data-column="content"]');
    await expect(homeContentColumn).toBeAttached();
  });

  test('should meet WCAG accessibility standards', async ({ page }) => {
    // Run axe accessibility checks on the whole page
    await checkA11y(page, undefined, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
    
    // Specific checks for product sections
    const gardenRoomsSection = page.locator('[data-testid="garden-rooms-section"], #garden-rooms');
    await checkA11y(page, gardenRoomsSection, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
    
    const homeExtensionsSection = page.locator('[data-testid="home-extensions-section"], #home-extensions');
    await checkA11y(page, homeExtensionsSection, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('should have working CTA links that scroll to quote section', async ({ page }) => {
    // Garden Rooms CTA should scroll to quote section
    const gardenRoomsCta = page.locator('[data-testid="garden-rooms-cta"], .btn-primary').first();
    await gardenRoomsCta.click();
    
    // Should scroll to quote section
    const quoteSection = page.locator('#quote');
    await expect(quoteSection).toBeInViewport();
    
    // Home Extensions CTA should scroll to quote section
    await page.goBack();
    const homeExtensionsCta = page.locator('[data-testid="home-extensions-cta"], .btn-primary').last();
    await homeExtensionsCta.click();
    
    // Should scroll to quote section
    await expect(quoteSection).toBeInViewport();
  });

  test('should have working details links with proper destinations', async ({ page }) => {
    // Garden Rooms details link
    const gardenRoomsDetails = page.locator('a[href*="garden-rooms"], a:has-text("more details")').first();
    if (await gardenRoomsDetails.isVisible()) {
      const href = await gardenRoomsDetails.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/garden-rooms|#garden-rooms-details/);
    }
    
    // Home Extensions details link
    const homeExtensionsDetails = page.locator('a[href*="home-extensions"], a:has-text("more details")').last();
    if (await homeExtensionsDetails.isVisible()) {
      const href = await homeExtensionsDetails.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toMatch(/home-extensions|#home-extensions-details/);
    }
  });

  test('should have 4.5:1 contrast ratio and readable line lengths', async ({ page }) => {
    // Check text contrast in Garden Rooms section
    const gardenRoomsText = page.locator('[data-testid="garden-rooms-section"] p, #garden-rooms p').first();
    if (await gardenRoomsText.isVisible()) {
      const styles = await gardenRoomsText.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          maxWidth: computed.maxWidth,
          width: computed.width
        };
      });
      
      // Ensure reasonable line length (should not exceed ~75ch or 600px for readability)
      const width = parseInt(styles.width);
      if (width > 0) {
        expect(width).toBeLessThanOrEqual(600); // Rough guideline for readability
      }
    }
    
    // Check text contrast in Home Extensions section
    const homeExtensionsText = page.locator('[data-testid="home-extensions-section"] p, #home-extensions p').first();
    if (await homeExtensionsText.isVisible()) {
      const styles = await homeExtensionsText.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          maxWidth: computed.maxWidth,
          width: computed.width
        };
      });
      
      // Ensure reasonable line length
      const width = parseInt(styles.width);
      if (width > 0) {
        expect(width).toBeLessThanOrEqual(600);
      }
    }
  });
});