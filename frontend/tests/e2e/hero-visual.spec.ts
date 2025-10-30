import { test, expect } from '@playwright/test';

/**
 * Phase 6 - Hero Visual Tests
 * 
 * Tests for User Story 4: Build Trust - Hero trust minis visibility
 * Validates trust indicators are visible and readable in the hero section
 */

test.describe('Hero - Visual Trust Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for hero section to be visible
    await page.waitForSelector('[data-testid="hero"], .hero, #hero');
  });

  test('should display trust minis in hero section', async ({ page }) => {
    // Test will fail until trust minis are implemented
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    await expect(heroSection).toBeVisible();
    
    // Look for trust indicators/minis container
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    await expect(trustMinisContainer).toBeVisible();
    
    // Should have multiple trust indicators
    const trustItems = trustMinisContainer.locator('[data-testid="trust-item"], .trust-item, .trust-mini');
    const itemCount = await trustItems.count();
    expect(itemCount).toBeGreaterThanOrEqual(3); // At least 3 trust indicators
  });

  test('should display rating trust mini with visible content', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    
    // Look for rating indicator
    const ratingMini = trustMinisContainer.locator('[data-testid="trust-rating"], .trust-rating, .rating-mini');
    await expect(ratingMini).toBeVisible();
    
    // Should have rating content (stars, number, or text)
    const ratingContent = await ratingMini.textContent();
    expect(ratingContent?.trim().length).toBeGreaterThan(0);
    
    // Should contain rating-related text or symbols
    expect(ratingContent?.toLowerCase()).toMatch(/star|rating|\d+(\.\d+)?|excellent|outstanding/);
    
    // Should be readable with sufficient contrast
    const styles = await ratingMini.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        color: style.color,
        backgroundColor: style.backgroundColor,
        fontSize: style.fontSize
      };
    });
    
    // Font size should be readable (at least 14px)
    const fontSize = parseInt(styles.fontSize);
    expect(fontSize).toBeGreaterThanOrEqual(14);
  });

  test('should display projects count trust mini', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    
    // Look for projects count indicator
    const projectsMini = trustMinisContainer.locator('[data-testid="trust-projects"], .trust-projects, .projects-mini');
    await expect(projectsMini).toBeVisible();
    
    // Should have projects-related content
    const projectsContent = await projectsMini.textContent();
    expect(projectsContent?.trim().length).toBeGreaterThan(0);
    
    // Should contain projects-related text or numbers
    expect(projectsContent?.toLowerCase()).toMatch(/project|completed|built|\d+\+?/);
    
    // Should be prominently displayed
    const boundingBox = await projectsMini.boundingBox();
    expect(boundingBox).toBeTruthy();
    expect(boundingBox!.width).toBeGreaterThan(50);
    expect(boundingBox!.height).toBeGreaterThan(20);
  });

  test('should display warranty trust mini', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    
    // Look for warranty indicator
    const warrantyMini = trustMinisContainer.locator('[data-testid="trust-warranty"], .trust-warranty, .warranty-mini');
    await expect(warrantyMini).toBeVisible();
    
    // Should have warranty-related content
    const warrantyContent = await warrantyMini.textContent();
    expect(warrantyContent?.trim().length).toBeGreaterThan(0);
    
    // Should contain warranty-related text
    expect(warrantyContent?.toLowerCase()).toMatch(/warranty|guarantee|year|protected|covered/);
  });

  test('should display planning support trust mini', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    
    // Look for planning indicator
    const planningMini = trustMinisContainer.locator('[data-testid="trust-planning"], .trust-planning, .planning-mini');
    await expect(planningMini).toBeVisible();
    
    // Should have planning-related content
    const planningContent = await planningMini.textContent();
    expect(planningContent?.trim().length).toBeGreaterThan(0);
    
    // Should contain planning-related text
    expect(planningContent?.toLowerCase()).toMatch(/planning|permission|support|handled|included/);
  });

  test('should have readable typography for all trust minis', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    
    const trustItems = trustMinisContainer.locator('[data-testid="trust-item"], .trust-item, .trust-mini');
    const itemCount = await trustItems.count();
    
    for (let i = 0; i < itemCount; i++) {
      const item = trustItems.nth(i);
      
      // Should be visible
      await expect(item).toBeVisible();
      
      // Should have readable text
      const textContent = await item.textContent();
      expect(textContent?.trim().length).toBeGreaterThan(0);
      
      // Should have appropriate styling
      const styles = await item.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          color: style.color,
          fontWeight: style.fontWeight
        };
      });
      
      // Font size should be readable
      const fontSize = parseInt(styles.fontSize);
      expect(fontSize).toBeGreaterThanOrEqual(12);
      
      // Should not be invisible text
      expect(styles.color).not.toBe('transparent');
      expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('should have proper layout and spacing for trust minis', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    
    // Container should be properly positioned
    await expect(trustMinisContainer).toBeVisible();
    const containerBox = await trustMinisContainer.boundingBox();
    expect(containerBox).toBeTruthy();
    expect(containerBox!.width).toBeGreaterThan(200); // Reasonable minimum width
    
    // Trust items should be properly spaced
    const trustItems = trustMinisContainer.locator('[data-testid="trust-item"], .trust-item, .trust-mini');
    const itemCount = await trustItems.count();
    
    if (itemCount > 1) {
      const firstItem = trustItems.nth(0);
      const secondItem = trustItems.nth(1);
      
      const firstBox = await firstItem.boundingBox();
      const secondBox = await secondItem.boundingBox();
      
      if (firstBox && secondBox) {
        // Items should not overlap
        const horizontalGap = Math.abs(firstBox.x - secondBox.x);
        const verticalGap = Math.abs(firstBox.y - secondBox.y);
        
        // Should have some spacing between items
        expect(horizontalGap > 0 || verticalGap > 0).toBeTruthy();
        
        // If horizontally aligned, should have gap
        if (Math.abs(firstBox.y - secondBox.y) < 10) {
          expect(horizontalGap).toBeGreaterThan(10);
        }
      }
    }
  });

  test('should be visible on different screen sizes', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(trustMinisContainer).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(trustMinisContainer).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(trustMinisContainer).toBeVisible();
    
    // Should still have readable content on mobile
    const trustItems = trustMinisContainer.locator('[data-testid="trust-item"], .trust-item, .trust-mini');
    const firstItem = trustItems.first();
    const itemContent = await firstItem.textContent();
    expect(itemContent?.trim().length).toBeGreaterThan(0);
  });

  test('should have appropriate visual hierarchy in hero', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    
    // Hero should have main heading
    const mainHeading = heroSection.locator('h1');
    await expect(mainHeading).toBeVisible();
    
    // Trust minis should be secondary to main content
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    await expect(trustMinisContainer).toBeVisible();
    
    // Trust minis should not overpower the main heading
    const headingBox = await mainHeading.boundingBox();
    const trustBox = await trustMinisContainer.boundingBox();
    
    if (headingBox && trustBox) {
      // Trust minis should typically be smaller than the main heading
      expect(headingBox.height).toBeGreaterThanOrEqual(trustBox.height * 0.5);
    }
    
    // Check font sizes to ensure proper hierarchy
    const headingFontSize = await mainHeading.evaluate(el => {
      return parseInt(window.getComputedStyle(el).fontSize);
    });
    
    const trustFontSize = await trustMinisContainer.evaluate(el => {
      return parseInt(window.getComputedStyle(el).fontSize);
    });
    
    // Main heading should be larger than trust indicators
    expect(headingFontSize).toBeGreaterThan(trustFontSize);
  });

  test('should maintain trust minis visibility with hero background', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    
    // Check if hero has background image or color
    const heroStyles = await heroSection.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundImage: style.backgroundImage,
        backgroundColor: style.backgroundColor
      };
    });
    
    // If hero has background, trust minis should still be readable
    if (heroStyles.backgroundImage !== 'none' || heroStyles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      const trustItems = trustMinisContainer.locator('[data-testid="trust-item"], .trust-item, .trust-mini');
      const firstItem = trustItems.first();
      
      const trustStyles = await firstItem.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor,
          textShadow: style.textShadow
        };
      });
      
      // Should have contrasting color or background
      expect(trustStyles.color).not.toBe('transparent');
      
      // Should either have contrasting background or text shadow for readability
      const hasBackground = trustStyles.backgroundColor !== 'rgba(0, 0, 0, 0)';
      const hasTextShadow = trustStyles.textShadow !== 'none';
      
      expect(hasBackground || hasTextShadow).toBeTruthy();
    }
  });

  test('should have semantic markup for trust indicators', async ({ page }) => {
    const heroSection = page.locator('[data-testid="hero"], .hero, #hero');
    const trustMinisContainer = heroSection.locator('[data-testid="trust-minis"], .trust-minis, .trust-indicators');
    
    // Trust container should have appropriate role or semantic element
    const containerElement = await trustMinisContainer.evaluate(el => el.tagName.toLowerCase());
    expect(['ul', 'ol', 'div', 'section'].includes(containerElement)).toBeTruthy();
    
    // If using list, should have list items
    if (containerElement === 'ul' || containerElement === 'ol') {
      const listItems = trustMinisContainer.locator('li');
      const itemCount = await listItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }
    
    // Trust items should have appropriate markup
    const trustItems = trustMinisContainer.locator('[data-testid="trust-item"], .trust-item, .trust-mini');
    const firstItem = trustItems.first();
    
    if (await firstItem.count() > 0) {
      // Should use appropriate semantic elements or ARIA labels
      const hasAriaLabel = await firstItem.getAttribute('aria-label');
      const hasTitle = await firstItem.getAttribute('title');
      const hasSemanticChild = await firstItem.locator('span, div, p, strong, em').count() > 0;
      
      expect(hasAriaLabel || hasTitle || hasSemanticChild).toBeTruthy();
    }
  });
});