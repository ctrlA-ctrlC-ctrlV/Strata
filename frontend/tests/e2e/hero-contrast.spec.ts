import { test, expect } from '@playwright/test';

test.describe('Hero Contrast Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('hero text should have sufficient contrast against background image', async ({ page }) => {
    const hero = page.locator('[data-testid="hero"]');
    await expect(hero).toBeVisible();

    // Wait for hero to load completely
    await page.waitForTimeout(1000);

    // Test main headline contrast
    const headline = hero.locator('h1');
    await expect(headline).toBeVisible();

    // Get computed styles for text elements
    const headlineStyles = await headline.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        textShadow: styles.textShadow,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight
      };
    });

    // Verify text shadow is applied for better contrast
    expect(headlineStyles.textShadow).not.toBe('none');
    expect(headlineStyles.textShadow).toContain('rgba(0, 0, 0');

    // Test subheading contrast
    const subheading = hero.locator('.hero__subheading');
    if (await subheading.isVisible()) {
      const subheadingStyles = await subheading.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          textShadow: styles.textShadow
        };
      });

      expect(subheadingStyles.textShadow).not.toBe('none');
    }

    // Test CTA button contrast and visibility
    const ctaButton = hero.locator('.hero__cta-button');
    await expect(ctaButton).toBeVisible();

    const ctaStyles = await ctaButton.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        boxShadow: styles.boxShadow
      };
    });

    // CTA should have solid background color for contrast
    expect(ctaStyles.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(ctaStyles.backgroundColor).not.toBe('transparent');
  });

  test('hero overlay should provide adequate contrast backdrop', async ({ page }) => {
    const hero = page.locator('[data-testid="hero"]');
    await expect(hero).toBeVisible();

    const overlay = hero.locator('.hero__overlay');
    await expect(overlay).toBeVisible();

    // Check overlay properties
    const overlayStyles = await overlay.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        background: styles.background,
        backgroundColor: styles.backgroundColor,
        opacity: styles.opacity,
        position: styles.position,
        zIndex: styles.zIndex
      };
    });

    // Overlay should be positioned and have background
    expect(overlayStyles.position).toBe('absolute');
    expect(parseInt(overlayStyles.zIndex)).toBeGreaterThan(0);
    expect(overlayStyles.background).toContain('rgba(0, 0, 0');
  });

  test('trust indicators should be readable against hero background', async ({ page }) => {
    const trustIndicators = page.locator('[data-testid="trust-indicators"]');
    
    if (await trustIndicators.isVisible()) {
      const trustItems = trustIndicators.locator('[data-testid="trust-item"]');
      const count = await trustItems.count();

      for (let i = 0; i < count; i++) {
        const item = trustItems.nth(i);
        await expect(item).toBeVisible();

        // Check trust item background and contrast
        const itemStyles = await item.evaluate((el) => {
          const styles = window.getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            backdropFilter: styles.backdropFilter,
            border: styles.border
          };
        });

        // Trust items should have semi-transparent background or backdrop filter
        const hasBackground = itemStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                             itemStyles.backgroundColor !== 'transparent';
        const hasBackdropFilter = itemStyles.backdropFilter !== 'none';
        const hasBorder = itemStyles.border !== 'none' && 
                         itemStyles.border !== '0px none rgb(0, 0, 0)';

        expect(hasBackground || hasBackdropFilter || hasBorder).toBeTruthy();
      }
    }
  });

  test('hero text should remain readable in high contrast mode', async ({ page }) => {
    // Emulate high contrast preference
    await page.emulateMedia({ contrast: 'more' });
    await page.reload();

    const hero = page.locator('[data-testid="hero"]');
    await expect(hero).toBeVisible();

    // Check if high contrast styles are applied
    const heroStyles = await hero.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor
      };
    });

    // In high contrast mode, text should be visible
    expect(heroStyles.color).not.toBe('rgba(0, 0, 0, 0)');
    expect(heroStyles.color).not.toBe('transparent');
  });

  test('scroll indicator should be visible against hero background', async ({ page }) => {
    const scrollIndicator = page.locator('[data-testid="scroll-indicator"]');
    
    if (await scrollIndicator.isVisible()) {
      const indicatorStyles = await scrollIndicator.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          backgroundColor: styles.backgroundColor,
          border: styles.border,
          backdropFilter: styles.backdropFilter
        };
      });

      // Scroll indicator should have some contrast mechanism
      const hasBackground = indicatorStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                           indicatorStyles.backgroundColor !== 'transparent';
      const hasBorder = indicatorStyles.border !== 'none' && 
                       indicatorStyles.border !== '0px none rgb(0, 0, 0)';
      const hasBackdropFilter = indicatorStyles.backdropFilter !== 'none';

      expect(hasBackground || hasBorder || hasBackdropFilter).toBeTruthy();
    }
  });

  test('hero text should be readable with different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1920, height: 1080 }  // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      const hero = page.locator('[data-testid="hero"]');
      await expect(hero).toBeVisible();

      const headline = hero.locator('h1');
      await expect(headline).toBeVisible();

      // Check if text is still within viewport and readable
      const headlineBox = await headline.boundingBox();
      expect(headlineBox).not.toBeNull();
      expect(headlineBox!.width).toBeGreaterThan(0);
      expect(headlineBox!.height).toBeGreaterThan(0);

      // Text should not overflow viewport
      expect(headlineBox!.x + headlineBox!.width).toBeLessThanOrEqual(viewport.width);
    }
  });

  test('hero background image should load and not cause contrast issues', async ({ page }) => {
    const hero = page.locator('[data-testid="hero"]');
    await expect(hero).toBeVisible();

    // Check if background image is loaded
    const backgroundImage = await hero.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.backgroundImage;
    });

    // Should have a background image set
    expect(backgroundImage).not.toBe('none');
    expect(backgroundImage).toContain('url(');

    // Wait for image to potentially load
    await page.waitForTimeout(2000);

    // Text should still be visible after image loads
    const headline = hero.locator('h1');
    await expect(headline).toBeVisible();

    // Check if text is still properly contrasted
    const isVisible = await headline.isVisible();
    expect(isVisible).toBeTruthy();
  });

  test('hero should handle missing background image gracefully', async ({ page }) => {
    // Intercept image requests and return 404
    await page.route('**/images/hero/**', route => {
      route.fulfill({ status: 404 });
    });

    await page.goto('http://localhost:5173');

    const hero = page.locator('[data-testid="hero"]');
    await expect(hero).toBeVisible();

    // Text should still be readable even without background image
    const headline = hero.locator('h1');
    await expect(headline).toBeVisible();

    const headlineStyles = await headline.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        visibility: styles.visibility,
        opacity: styles.opacity
      };
    });

    expect(headlineStyles.visibility).toBe('visible');
    expect(parseFloat(headlineStyles.opacity)).toBeGreaterThan(0.5);
  });
});