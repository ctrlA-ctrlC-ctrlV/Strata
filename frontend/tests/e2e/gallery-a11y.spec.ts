import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * Phase 5 - Gallery Accessibility Tests
 * 
 * Tests for User Story 3: Explore Projects Gallery
 * Validates accessibility, ARIA attributes, keyboard navigation, and screen reader support
 */

test.describe('Gallery - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    // Wait for gallery to be visible
    await page.waitForSelector('[data-testid="gallery-container"], #gallery');
  });

  test('should have proper ARIA structure for gallery container', async ({ page }) => {
    // Test will fail until component is implemented
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    await expect(galleryContainer).toBeVisible();
    
    // Gallery should have proper role
    const role = await galleryContainer.getAttribute('role');
    expect(['region', 'group', 'grid'].includes(role || '')).toBeTruthy();
    
    // Should have accessible name
    const ariaLabel = await galleryContainer.getAttribute('aria-label');
    const ariaLabelledBy = await galleryContainer.getAttribute('aria-labelledby');
    expect(ariaLabel || ariaLabelledBy).toBeTruthy();
    
    // If using aria-labelledby, the referenced element should exist
    if (ariaLabelledBy) {
      const labelElement = page.locator(`#${ariaLabelledBy}`);
      await expect(labelElement).toBeVisible();
    }
  });

  test('should have accessible navigation controls', async ({ page }) => {
    const prevButton = page.locator('[data-testid="gallery-prev"], .gallery-nav-prev');
    const nextButton = page.locator('[data-testid="gallery-next"], .gallery-nav-next');
    
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
    
    // Buttons should have proper labels
    const prevLabel = await prevButton.getAttribute('aria-label') || await prevButton.textContent();
    const nextLabel = await nextButton.getAttribute('aria-label') || await nextButton.textContent();
    
    expect(prevLabel).toBeTruthy();
    expect(nextLabel).toBeTruthy();
    expect(prevLabel?.toLowerCase()).toContain('prev');
    expect(nextLabel?.toLowerCase()).toContain('next');
    
    // Buttons should be properly typed
    const prevType = await prevButton.getAttribute('type');
    const nextType = await nextButton.getAttribute('type');
    
    if (prevType !== null) expect(prevType).toBe('button');
    if (nextType !== null) expect(nextType).toBe('button');
    
    // Should have minimum touch target size (44x44px)
    const prevBox = await prevButton.boundingBox();
    const nextBox = await nextButton.boundingBox();
    
    if (prevBox) {
      expect(prevBox.width).toBeGreaterThanOrEqual(44);
      expect(prevBox.height).toBeGreaterThanOrEqual(44);
    }
    
    if (nextBox) {
      expect(nextBox.width).toBeGreaterThanOrEqual(44);
      expect(nextBox.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should have keyboard-accessible project tiles', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    const tileCount = await tiles.count();
    expect(tileCount).toBeGreaterThan(0);
    
    // Check first few tiles for accessibility
    for (let i = 0; i < Math.min(tileCount, 3); i++) {
      const tile = tiles.nth(i);
      
      // Tile should be focusable
      const tabIndex = await tile.getAttribute('tabindex');
      expect(parseInt(tabIndex || '0')).toBeGreaterThanOrEqual(0);
      
      // Should be able to focus
      await tile.focus();
      await expect(tile).toBeFocused();
      
      // Should have visible focus indicator
      const focusStyles = await tile.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          outlineWidth: style.outlineWidth,
          boxShadow: style.boxShadow,
        };
      });
      
      // Should have some form of focus indicator
      const hasFocusIndicator = focusStyles.outline !== 'none' || 
                               focusStyles.outlineWidth !== '0px' || 
                               focusStyles.boxShadow !== 'none';
      expect(hasFocusIndicator).toBeTruthy();
    }
  });

  test('should have proper image accessibility', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const images = galleryContainer.locator('img');
    
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Check all images for accessibility
    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i);
      
      // Must have alt text
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText?.length).toBeGreaterThan(0);
      
      // Alt text should be descriptive (not generic)
      expect(altText?.toLowerCase()).not.toBe('image');
      expect(altText?.toLowerCase()).not.toBe('photo');
      expect(altText?.toLowerCase()).not.toBe('picture');
      
      // Should have proper dimensions for screen readers
      const width = await image.getAttribute('width');
      const height = await image.getAttribute('height');
      
      // At least one dimension method should be used
      const hasExplicitDimensions = width && height;
      const hasStyleDimensions = await image.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.width !== 'auto' || style.height !== 'auto';
      });
      
      expect(hasExplicitDimensions || hasStyleDimensions).toBeTruthy();
    }
  });

  test('should support arrow key navigation within gallery', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    const tileCount = await tiles.count();
    if (tileCount < 2) return; // Skip if not enough tiles
    
    // Focus first tile
    await tiles.first().focus();
    await expect(tiles.first()).toBeFocused();
    
    // Arrow right should move to next tile or scroll
    const initialScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    await page.keyboard.press('ArrowRight');
    
    // Should either focus next tile or scroll gallery
    const newScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    const secondTileFocused = await tiles.nth(1).evaluate(el => document.activeElement === el).catch(() => false);
    
    expect(newScroll > initialScroll || secondTileFocused).toBeTruthy();
    
    // Arrow left should move back
    await page.keyboard.press('ArrowLeft');
    const backScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    const firstTileFocused = await tiles.first().evaluate(el => document.activeElement === el).catch(() => false);
    
    expect(backScroll <= newScroll || firstTileFocused).toBeTruthy();
  });

  test('should announce gallery updates to screen readers', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Should have live region for announcements
    const liveRegion = page.locator('[aria-live], [data-testid="gallery-live-region"]');
    
    // Navigate with next button
    const nextButton = page.locator('[data-testid="gallery-next"], .gallery-nav-next');
    await nextButton.click();
    
    // Wait for potential announcement
    await page.waitForTimeout(500);
    
    // Check if announcement was made (implementation may vary)
    const liveRegionText = await liveRegion.textContent().catch(() => '');
    
    // If live region exists, it should have meaningful content after navigation
    if (await liveRegion.count() > 0) {
      expect((liveRegionText || '').length).toBeGreaterThan(0);
    }
    
    // Alternative: check for aria-current or similar state indicators
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    const currentTile = tiles.locator('[aria-current="true"], .current');
    
    // Should have some way to indicate current/visible item
    if (await currentTile.count() > 0) {
      await expect(currentTile).toBeVisible();
    }
  });

  test('should handle disabled navigation states properly', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const prevButton = page.locator('[data-testid="gallery-prev"], .gallery-nav-prev');
    const nextButton = page.locator('[data-testid="gallery-next"], .gallery-nav-next');
    
    // Scroll to beginning
    await galleryContainer.evaluate(el => { el.scrollLeft = 0; });
    await page.waitForTimeout(200);
    
    // Previous button should be disabled at start
    const prevDisabled = await prevButton.getAttribute('disabled');
    const prevAriaDisabled = await prevButton.getAttribute('aria-disabled');
    
    expect(prevDisabled !== null || prevAriaDisabled === 'true').toBeTruthy();
    
    // Scroll to end
    await galleryContainer.evaluate(el => { 
      el.scrollLeft = el.scrollWidth - el.clientWidth; 
    });
    await page.waitForTimeout(200);
    
    // Next button should be disabled at end
    const nextDisabled = await nextButton.getAttribute('disabled');
    const nextAriaDisabled = await nextButton.getAttribute('aria-disabled');
    
    expect(nextDisabled !== null || nextAriaDisabled === 'true').toBeTruthy();
  });

  test('should provide accessible tile information', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    const tileCount = await tiles.count();
    expect(tileCount).toBeGreaterThan(0);
    
    // Check first tile for accessibility info
    const firstTile = tiles.first();
    
    // Should have accessible name (title, aria-label, or aria-labelledby)
    const ariaLabel = await firstTile.getAttribute('aria-label');
    const ariaLabelledBy = await firstTile.getAttribute('aria-labelledby');
    const titleText = await firstTile.locator('h1, h2, h3, h4, h5, h6, .title').textContent().catch(() => '');
    
    expect(ariaLabel || ariaLabelledBy || titleText).toBeTruthy();
    
    // Should have description if detailed info is available
    const ariaDescribedBy = await firstTile.getAttribute('aria-describedby');
    const description = await firstTile.locator('.description, .details').textContent().catch(() => '');
    
    // Either has aria-describedby or visible description
    expect(ariaDescribedBy || description).toBeTruthy();
    
    // If using aria-describedby, referenced element should exist
    if (ariaDescribedBy) {
      const descElement = page.locator(`#${ariaDescribedBy}`);
      await expect(descElement).toBeAttached();
    }
  });

  test('should meet WCAG accessibility standards', async ({ page }) => {
    // Run comprehensive accessibility scan
    await checkA11y(page, '[data-testid="gallery-container"], #gallery', {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
    
    // Test specific to gallery controls
    const galleryControls = page.locator('[data-testid="gallery-prev"], [data-testid="gallery-next"], .gallery-nav-prev, .gallery-nav-next');
    
    if (await galleryControls.count() > 0) {
      await checkA11y(page, galleryControls, {
        detailedReport: true,
        detailedReportOptions: { html: true },
      });
    }
  });

  test('should handle focus management during scroll', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    const tileCount = await tiles.count();
    if (tileCount < 3) return; // Need multiple tiles for this test
    
    // Focus a tile that will scroll out of view
    await tiles.nth(0).focus();
    await expect(tiles.nth(0)).toBeFocused();
    
    // Scroll to reveal later tiles
    await galleryContainer.evaluate(el => {
      el.scrollLeft = el.scrollWidth / 2;
    });
    
    await page.waitForTimeout(300);
    
    // Focus should either stay on element or move to visible tile
    const focusedElement = page.locator(':focus');
    const isVisible = await focusedElement.isVisible().catch(() => false);
    
    // Focus should be on a visible element
    expect(isVisible).toBeTruthy();
    
    // If focus moved, it should be to a gallery tile
    const focusedTile = await focusedElement.evaluate(el => {
      return el.closest('[data-testid="project-tile"], .gallery-tile') !== null;
    }).catch(() => false);
    
    if (!isVisible) {
      expect(focusedTile).toBeTruthy();
    }
  });

  test('should have proper heading structure if gallery has title', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Check for gallery heading
    const galleryHeading = galleryContainer.locator('h1, h2, h3, h4, h5, h6').first();
    
    if (await galleryHeading.count() > 0) {
      await expect(galleryHeading).toBeVisible();
      
      // Heading should have text content
      const headingText = await galleryHeading.textContent();
      expect(headingText?.trim().length).toBeGreaterThan(0);
      
      // Should be properly associated with gallery
      const headingId = await galleryHeading.getAttribute('id');
      if (headingId) {
        const containerLabelledBy = await galleryContainer.getAttribute('aria-labelledby');
        expect(containerLabelledBy).toBe(headingId);
      }
    }
  });
});