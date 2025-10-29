import { test, expect } from '@playwright/test';

test.describe('Phase 2 - Foundational', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should have sticky header', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Scroll down to test sticky behavior
    await page.evaluate(() => window.scrollTo(0, 500));
    await expect(header).toBeVisible();
  });

  test('should have footer with NAP and socials', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check for contact info placeholders
    await expect(footer).toContainText(['Contact', 'Social']);
  });

  test('should have hero section with H1 and CTA', async ({ page }) => {
    const hero = page.locator('[data-testid="hero"]');
    await expect(hero).toBeVisible();
    
    const h1 = hero.locator('h1');
    await expect(h1).toBeVisible();
    
    const cta = hero.locator('a[href="#quote"], button');
    await expect(cta).toBeVisible();
  });

  test('should have benefits grid with 6 items', async ({ page }) => {
    const benefitsGrid = page.locator('[data-testid="benefits-grid"]');
    await expect(benefitsGrid).toBeVisible();
    
    const benefitItems = benefitsGrid.locator('[data-testid="benefit-item"]');
    await expect(benefitItems).toHaveCount(6);
  });

  test('should have problem-outcome section', async ({ page }) => {
    const problemOutcome = page.locator('[data-testid="problem-outcome"]');
    await expect(problemOutcome).toBeVisible();
  });

  test('should have quote anchor target', async ({ page }) => {
    const quoteSection = page.locator('#quote');
    await expect(quoteSection).toBeVisible();
  });

  test('should have skip-to-content link', async ({ page }) => {
    const skipLink = page.locator('a[href="#main"]');
    await expect(skipLink).toBeVisible();
    
    // Test skip link functionality
    await skipLink.click();
    const mainContent = page.locator('#main');
    await expect(mainContent).toBeFocused();
  });

  test('should have proper page composition', async ({ page }) => {
    // Test that all main sections are present in order
    const sections = page.locator('body > *');
    
    await expect(sections.nth(0)).toHaveAttribute('data-testid', 'skip-link');
    await expect(sections.nth(1)).toContainText('header');
    await expect(sections.nth(2)).toHaveAttribute('id', 'main');
    await expect(sections.nth(-1)).toContainText('footer');
  });

  test('should apply layout utilities correctly', async ({ page }) => {
    // Test container and grid utilities
    const container = page.locator('.container');
    await expect(container).toBeVisible();
    
    // Test responsive behavior
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(container).toBeVisible();
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(container).toBeVisible();
  });

  test('should have utility classes working', async ({ page }) => {
    // Test scroll-snap if gallery is present
    const gallery = page.locator('[data-testid="gallery"]');
    if (await gallery.isVisible()) {
      const scrollContainer = gallery.locator('.scroll-snap-x');
      await expect(scrollContainer).toBeVisible();
    }
    
    // Test reduced-motion respect
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    
    // Elements with animations should respect reduced motion
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
    const count = await animatedElements.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const element = animatedElements.nth(i);
        const styles = await element.evaluate(el => 
          window.getComputedStyle(el).getPropertyValue('animation-duration')
        );
        // Should be 0s or 0.01s for reduced motion
        expect(styles === '0s' || styles === '0.01s').toBeTruthy();
      }
    }
  });
});