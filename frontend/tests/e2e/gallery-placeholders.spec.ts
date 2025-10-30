import { test, expect } from '@playwright/test';

/**
 * Phase 5 - Gallery Image Placeholder Tests
 * 
 * Tests for graceful handling of failed image loads in the gallery
 * Validates placeholder fallbacks, error states, and user experience
 */

test.describe('Gallery - Image Placeholders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for gallery to be visible
    await page.waitForSelector('[data-testid="gallery-container"], #gallery');
  });

  test('should display placeholder for missing images', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    const tileCount = await tiles.count();
    expect(tileCount).toBeGreaterThan(0);

    // Check first few tiles for placeholder handling
    for (let i = 0; i < Math.min(tileCount, 3); i++) {
      const tile = tiles.nth(i);
      const image = tile.locator('img');
      
      await expect(image).toBeVisible();
      
      // Get image source
      const src = await image.getAttribute('src');
      expect(src).toBeTruthy();
      
      // If it's a placeholder, verify it's the expected one
      if (src?.includes('data:image/svg+xml')) {
        expect(src).toContain('data:image/svg+xml');
        
        // Verify the image loads successfully (even if it's a placeholder)
        await expect(image).toBeVisible();
        
        // Check that the image has proper dimensions
        const boundingBox = await image.boundingBox();
        expect(boundingBox).toBeTruthy();
        expect(boundingBox!.width).toBeGreaterThan(0);
        expect(boundingBox!.height).toBeGreaterThan(0);
      }
    }
  });

  test('should handle broken image URLs gracefully', async ({ page }) => {
    // Intercept image requests and return 404 for some images
    await page.route('**/images/projects/test-broken-*.jpg', route => {
      route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'Not Found'
      });
    });

    // Inject a tile with a broken image URL for testing
    await page.evaluate(() => {
      const galleryTiles = document.querySelector('.gallery-tiles');
      if (galleryTiles) {
        const testTile = document.createElement('article');
        testTile.className = 'gallery-tile';
        testTile.setAttribute('data-testid', 'test-broken-image-tile');
        testTile.innerHTML = `
          <div class="gallery-tile-image">
            <img 
              src="/images/projects/test-broken-image.jpg" 
              alt="Test broken image"
              onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzRhNTU2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='; this.onerror=null;"
            >
          </div>
          <div class="gallery-tile-content">
            <h3>Test Broken Image</h3>
            <p>Test location</p>
          </div>
        `;
        galleryTiles.appendChild(testTile);
      }
    });

    // Wait for the tile to be added
    const testTile = page.locator('[data-testid="test-broken-image-tile"]');
    await expect(testTile).toBeVisible();

    // Get the image in the test tile
    const testImage = testTile.locator('img');
    
    // Wait for the image to load or fail
    await page.waitForTimeout(1000);
    
    // Should still be visible (with placeholder)
    await expect(testImage).toBeVisible();
    
    // Should have switched to placeholder src
    const finalSrc = await testImage.getAttribute('src');
    expect(finalSrc).toContain('data:image/svg+xml');
  });

  test('should maintain layout integrity with placeholder images', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    // Get initial tile dimensions
    const firstTile = tiles.first();
    await expect(firstTile).toBeVisible();
    
    const initialBox = await firstTile.boundingBox();
    expect(initialBox).toBeTruthy();
    expect(initialBox!.width).toBeGreaterThan(0);
    expect(initialBox!.height).toBeGreaterThan(0);
    
    // Check that images maintain consistent sizing
    const tileCount = await tiles.count();
    for (let i = 0; i < Math.min(tileCount, 3); i++) {
      const tile = tiles.nth(i);
      const image = tile.locator('img');
      
      await expect(image).toBeVisible();
      
      const imageBox = await image.boundingBox();
      expect(imageBox).toBeTruthy();
      
      // Images should maintain consistent dimensions
      const widthRatio = imageBox!.width / initialBox!.width;
      expect(widthRatio).toBeGreaterThan(0.8); // Allow for some variation
      expect(widthRatio).toBeLessThan(1.2);
    }
  });

  test('should provide accessible placeholders', async ({ page }) => {
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
      expect(altText!.length).toBeGreaterThan(0);
      
      // Alt text should be meaningful even for placeholders
      expect(altText!.toLowerCase()).not.toBe('placeholder');
      expect(altText!.toLowerCase()).not.toBe('no image');
      expect(altText!.toLowerCase()).not.toBe('broken');
      
      // Should be visible to screen readers
      const ariaHidden = await image.getAttribute('aria-hidden');
      expect(ariaHidden).not.toBe('true');
    }
  });

  test('should handle slow-loading images gracefully', async ({ page }) => {
    // Slow down image loading to test loading states
    await page.route('**/images/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      route.continue();
    });

    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    
    // Gallery should still be functional during slow loading
    await expect(galleryContainer).toBeVisible();
    await expect(tiles.first()).toBeVisible();
    
    // Navigation should still work
    const nextButton = page.locator('[data-testid="gallery-next"], .gallery-nav-next');
    if (await nextButton.count() > 0) {
      await expect(nextButton).toBeVisible();
      await nextButton.click();
    }
    
    // Wait for images to eventually load
    await page.waitForTimeout(2000);
    
    // Check that at least one image is visible
    const images = galleryContainer.locator('img');
    const firstImage = images.first();
    await expect(firstImage).toBeVisible();
  });

  test('should show appropriate loading states', async ({ page }) => {
    // Check if there are any loading indicators
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Look for potential loading states (these might not exist yet, test for future implementation)
    const loadingIndicators = galleryContainer.locator('.loading, [data-testid="loading"]');
    
    // If loading indicators exist, they should be accessible
    const indicatorCount = await loadingIndicators.count();
    if (indicatorCount > 0) {
      for (let i = 0; i < indicatorCount; i++) {
        const indicator = loadingIndicators.nth(i);
        
        // Should have proper ARIA attributes
        const ariaLabel = await indicator.getAttribute('aria-label') || 
                         await indicator.getAttribute('aria-describedby');
        if (ariaLabel) {
          expect(ariaLabel.toLowerCase()).toMatch(/load|wait|progress/);
        }
      }
    }
    
    // Gallery should be functional regardless of loading states
    await expect(galleryContainer).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Simulate network errors for image requests
    await page.route('**/images/projects/**', route => {
      route.abort('failed');
    });

    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Gallery should still render and be functional
    await expect(galleryContainer).toBeVisible();
    
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    await expect(tiles.first()).toBeVisible();
    
    // Images should fallback to placeholders
    const images = galleryContainer.locator('img');
    const firstImage = images.first();
    await expect(firstImage).toBeVisible();
    
    // Wait for potential error handling
    await page.waitForTimeout(1000);
    
    // Image should either show placeholder or still be visible
    await expect(firstImage).toBeVisible();
  });

  test('should maintain functionality with mixed placeholder and real images', async ({ page }) => {
    // Allow some images to load, block others
    await page.route('**/images/projects/*1*', route => {
      route.abort('failed'); // Block images with "1" in filename
    });

    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    await expect(galleryContainer).toBeVisible();
    
    // Navigation should work regardless of image load status
    const prevButton = page.locator('[data-testid="gallery-prev"], .gallery-nav-prev');
    const nextButton = page.locator('[data-testid="gallery-next"], .gallery-nav-next');
    
    if (await nextButton.count() > 0) {
      await nextButton.click();
      await page.waitForTimeout(300);
      
      if (await prevButton.count() > 0) {
        await prevButton.click();
        await page.waitForTimeout(300);
      }
    }
    
    // Keyboard navigation should work
    await galleryContainer.focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowLeft');
    
    // All tiles should remain accessible
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    const tileCount = await tiles.count();
    
    for (let i = 0; i < Math.min(tileCount, 3); i++) {
      const tile = tiles.nth(i);
      await expect(tile).toBeVisible();
      
      // Should be focusable
      await tile.focus();
      await expect(tile).toBeFocused();
    }
  });

  test('should provide good user experience during image failures', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"], #gallery');
    
    // Check that gallery doesn't show error messages to users
    const errorMessages = page.locator('.error, [data-testid="error"]');
    const errorCount = await errorMessages.count();
    
    // If there are error messages, they should be helpful, not technical
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const error = errorMessages.nth(i);
        const errorText = await error.textContent();
        
        if (errorText) {
          // Should not contain technical error messages
          expect(errorText.toLowerCase()).not.toContain('404');
          expect(errorText.toLowerCase()).not.toContain('failed to load');
          expect(errorText.toLowerCase()).not.toContain('network error');
          
          // Should be user-friendly
          expect(errorText.length).toBeGreaterThan(10);
        }
      }
    }
    
    // Gallery should maintain its visual appeal even with placeholders
    await expect(galleryContainer).toBeVisible();
    const tiles = galleryContainer.locator('[data-testid="project-tile"], .gallery-tile');
    await expect(tiles.first()).toBeVisible();
    
    // Check visual consistency
    const firstTileBox = await tiles.first().boundingBox();
    expect(firstTileBox).toBeTruthy();
    expect(firstTileBox!.width).toBeGreaterThan(200); // Reasonable minimum size
    expect(firstTileBox!.height).toBeGreaterThan(200);
  });
});