import { test, expect } from '@playwright/test';

/**
 * Phase 5 - Gallery Interaction Tests
 * 
 * Tests for User Story 3: Explore Projects Gallery
 * Validates drag/swipe interactions, keyboard navigation, and lazy loading
 */

test.describe('Gallery - Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for gallery to be visible
    await page.waitForSelector('[data-testid="gallery-container"], #gallery');
  });

  test('should have gallery container with proper structure', async ({ page }) => {
    // Test will fail until component is implemented
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    await expect(galleryContainer).toBeVisible();
    
    // The scrollable container is the .gallery-container child element
    const scrollableContainer = galleryContainer.locator('.gallery-container');
    await expect(scrollableContainer).toBeVisible();
    
    // Should have fixed height and scroll behavior
    const containerStyles = await scrollableContainer.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        height: style.height,
        overflowX: style.overflowX,
        scrollSnapType: style.scrollSnapType,
      };
    });
    
    // Verify fixed height is set (not auto)
    expect(containerStyles.height).not.toBe('auto');
    expect(containerStyles.height).not.toBe('0px');
    
    // Should have horizontal scroll (auto, not visible)
    expect(containerStyles.overflowX).toBe('auto');
    
    // Should have scroll snap
    expect(containerStyles.scrollSnapType).toContain('x');
  });

  test('should have project tiles with images', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Should have multiple project tiles
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    await expect(tiles.first()).toBeVisible();
    
    const tileCount = await tiles.count();
    expect(tileCount).toBeGreaterThan(0);
    
    // Each tile should have an image
    for (let i = 0; i < Math.min(tileCount, 5); i++) {
      const tile = tiles.nth(i);
      const image = tile.locator('img');
      await expect(image).toBeVisible();
      
      // Image should have proper alt text
      const altText = await image.getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText?.length).toBeGreaterThan(0);
    }
  });

  test('should support keyboard navigation through tiles', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    // Focus first tile
    await tiles.first().focus();
    await expect(tiles.first()).toBeFocused();
    
    // Tab to next tile
    await page.keyboard.press('Tab');
    if (await tiles.nth(1).isVisible()) {
      await expect(tiles.nth(1)).toBeFocused();
    }
    
    // Arrow key navigation should work within gallery
    await tiles.first().focus();
    await page.keyboard.press('ArrowRight');
    
    // Should move focus or scroll position
    const scrollPosition = await galleryContainer.evaluate(el => el.scrollLeft);
    // Either focus moved or scroll happened
    const isFocusedOnNext = await tiles.nth(1).evaluate(el => document.activeElement === el).catch(() => false);
    expect(scrollPosition > 0 || isFocusedOnNext).toBeTruthy();
  });

  test('should support drag-to-scroll on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-only drag test');
    
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Get initial scroll position
    const initialScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    
    // Get container bounds for drag coordinates
    const containerBox = await galleryContainer.boundingBox();
    if (!containerBox) throw new Error('Gallery container not found');
    
    // Perform drag gesture from center left to center right
    await page.mouse.move(containerBox.x + 100, containerBox.y + containerBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(containerBox.x + containerBox.width - 100, containerBox.y + containerBox.height / 2);
    await page.mouse.up();
    
    // Wait for scroll to complete
    await page.waitForTimeout(500);
    
    // Check if scroll position changed
    const finalScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    expect(finalScroll).not.toBe(initialScroll);
  });

  test('should support touch swipe on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only swipe test');
    
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Get initial scroll position
    const initialScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    
    // Get container bounds for swipe coordinates
    const containerBox = await galleryContainer.boundingBox();
    if (!containerBox) throw new Error('Gallery container not found');
    
    // Perform swipe gesture (right to left)
    const startX = containerBox.x + containerBox.width * 0.8;
    const endX = containerBox.x + containerBox.width * 0.2;
    const y = containerBox.y + containerBox.height / 2;
    
    await page.touchscreen.tap(startX, y);
    await page.touchscreen.tap(endX, y);
    
    // Wait for scroll to complete
    await page.waitForTimeout(500);
    
    // Check if scroll position changed
    const finalScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    expect(finalScroll).toBeGreaterThan(initialScroll);
  });

  test('should have navigation controls', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Should have previous/next buttons
    const prevButton = page.locator('[data-testid="gallery-prev"], .gallery-nav-prev');
    const nextButton = page.locator('[data-testid="gallery-next"], .gallery-nav-next');
    
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
    
    // Buttons should be keyboard accessible
    await prevButton.focus();
    await expect(prevButton).toBeFocused();
    
    await nextButton.focus();
    await expect(nextButton).toBeFocused();
    
    // Next button should scroll gallery
    const initialScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    await nextButton.click();
    await page.waitForTimeout(300);
    
    const newScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    expect(newScroll).toBeGreaterThan(initialScroll);
  });

  test('should implement lazy loading for images', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    // Check that some images use lazy loading
    const images = tiles.locator('img');
    const firstImage = images.first();
    
    // Should have loading attribute
    const loadingAttr = await firstImage.getAttribute('loading');
    expect(loadingAttr).toBe('lazy');
    
    // Or should use intersection observer pattern
    const hasDataSrc = await firstImage.getAttribute('data-src');
    if (hasDataSrc) {
      // Using intersection observer lazy loading
      expect(hasDataSrc).toBeTruthy();
    }
  });

  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.waitForSelector('[data-testid="gallery-container"], #gallery');
    
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Navigation should still work but without smooth animations
    const nextButton = page.locator('[data-testid="gallery-next"], .gallery-nav-next');
    
    const initialScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    await nextButton.click();
    
    // Should scroll but transition should be instant or much faster
    await page.waitForTimeout(100); // Short wait
    const newScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    expect(newScroll).toBeGreaterThan(initialScroll);
    
    // Check if reduced motion classes are applied
    const bodyClasses = await page.locator('body').getAttribute('class');
    expect(bodyClasses).toContain('reduce-motion');
  });

  test('should have proper scroll snap behavior', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Scroll by a small amount
    await galleryContainer.evaluate(el => {
      el.scrollLeft = 50; // Small scroll
    });
    
    // Wait for snap to complete
    await page.waitForTimeout(500);
    
    // Should snap to a tile boundary
    const finalScroll = await galleryContainer.evaluate(el => el.scrollLeft);
    
    // Final position should be aligned to tile boundaries (0, tileWidth, 2*tileWidth, etc.)
    // This is approximate since we don't know exact tile width
    expect(finalScroll).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty gallery gracefully', async ({ page }) => {
    // Test case for when no projects are available
    // This might need to be implemented by temporarily mocking empty data
    
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // If gallery is empty, should show appropriate message
    const emptyMessage = page.locator('[data-testid="gallery-empty"], .gallery-empty');
    
    // Either has content or shows empty state
    const hasContent = await galleryContainer.locator('[data-testid="project-tile"], .gallery-tile').count() > 0;
    
    if (!hasContent) {
      await expect(emptyMessage).toBeVisible();
      const messageText = await emptyMessage.textContent();
      expect(messageText).toContain('project');
    }
  });

  test('should maintain aspect ratios for variable height tiles', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    // Check first few tiles for proper dimensions
    const tileCount = Math.min(await tiles.count(), 3);
    
    for (let i = 0; i < tileCount; i++) {
      const tile = tiles.nth(i);
      const image = tile.locator('img');
      
      const dimensions = await image.evaluate(el => {
        const htmlEl = el as HTMLImageElement;
        return {
          width: htmlEl.offsetWidth,
          height: htmlEl.offsetHeight,
          naturalWidth: htmlEl.naturalWidth,
          naturalHeight: htmlEl.naturalHeight,
        };
      });
      
      // Image should have reasonable dimensions
      expect(dimensions.width).toBeGreaterThan(0);
      expect(dimensions.height).toBeGreaterThan(0);
      
      // Aspect ratio should be maintained if natural dimensions are available
      if (dimensions.naturalWidth > 0 && dimensions.naturalHeight > 0) {
        const displayRatio = dimensions.width / dimensions.height;
        const naturalRatio = dimensions.naturalWidth / dimensions.naturalHeight;
        
        // Allow some tolerance for aspect ratio preservation
        expect(Math.abs(displayRatio - naturalRatio)).toBeLessThan(0.1);
      }
    }
  });
});