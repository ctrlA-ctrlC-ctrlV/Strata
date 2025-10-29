import { test, expect } from '@playwright/test';
import { runCommonAccessibilityTests } from '../helpers/axe';

/**
 * Phase 2 Foundational Tests
 * 
 * Tests for foundational components: Header, Footer, Hero, BenefitsGrid, ProblemOutcome
 * Verifies layout, accessibility, and component composition.
 */

test.describe('Phase 2 Foundational - Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have sticky header with navigation', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeAttached();
    
    // Check if header has sticky positioning
    const position = await header.evaluate((el) => {
      return window.getComputedStyle(el).position;
    });
    expect(['sticky', 'fixed']).toContain(position);
    
    // Header should contain navigation
    const nav = header.locator('nav');
    await expect(nav).toBeAttached();
    
    // Should have accessible navigation landmarks
    await expect(nav).toHaveAttribute('aria-label');
  });

  test('should have footer with contact info and social links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeAttached();
    
    // Footer should have proper semantic role
    const role = await footer.getAttribute('role');
    expect(role === null || role === 'contentinfo').toBeTruthy();
    
    // Should contain contact information (NAP - Name, Address, Phone)
    await expect(footer).toContainText(/contact|phone|address/i);
    
    // Should have social media links if present
    const socialLinks = footer.locator('a[href*="facebook"], a[href*="twitter"], a[href*="instagram"], a[href*="linkedin"]');
    const socialCount = await socialLinks.count();
    
    if (socialCount > 0) {
      // If social links exist, they should be accessible
      for (let i = 0; i < socialCount; i++) {
        const socialLink = socialLinks.nth(i);
        const ariaLabel = await socialLink.getAttribute('aria-label');
        const text = await socialLink.textContent();
        
        expect(ariaLabel || text, 'Social links must have accessible names').toBeTruthy();
      }
    }
  });

  test('should have hero section with H1 and CTA', async ({ page }) => {
    // Hero section should exist
    const hero = page.locator('[data-testid="hero"], .hero, section:first-of-type');
    await expect(hero).toBeAttached();
    
    // Should contain exactly one H1
    const h1 = page.locator('h1');
    await expect(h1).toBeAttached();
    
    const h1Count = await h1.count();
    expect(h1Count).toBe(1);
    
    // H1 should have meaningful content
    const h1Text = await h1.textContent();
    expect(h1Text?.trim().length, 'H1 should not be empty').toBeGreaterThan(0);
    
    // Should have at least one CTA button
    const ctaButton = hero.locator('a[href*="quote"], button:has-text("Quote"), a:has-text("Get"), a:has-text("Quote")');
    await expect(ctaButton.first()).toBeAttached();
  });

  test('should have benefits grid with accessible content', async ({ page }) => {
    const benefitsGrid = page.locator('[data-testid="benefits-grid"], .benefits-grid, [class*="benefits"]');
    
    if (await benefitsGrid.count() > 0) {
      await expect(benefitsGrid).toBeAttached();
      
      // Should have multiple benefit items (at least 3, up to 6 as per spec)
      const benefitItems = benefitsGrid.locator('[class*="benefit"], .grid > *, li');
      const itemCount = await benefitItems.count();
      
      expect(itemCount).toBeGreaterThanOrEqual(3);
      expect(itemCount).toBeLessThanOrEqual(6);
      
      // Each benefit should have a heading and description
      for (let i = 0; i < Math.min(itemCount, 6); i++) {
        const item = benefitItems.nth(i);
        const heading = item.locator('h2, h3, h4, [class*="heading"], [class*="title"]');
        
        if (await heading.count() > 0) {
          const headingText = await heading.textContent();
          expect(headingText?.trim().length, `Benefit ${i + 1} should have a heading`).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should have problem-outcome section', async ({ page }) => {
    const problemOutcome = page.locator('[data-testid="problem-outcome"], .problem-outcome, [class*="problem"]');
    
    if (await problemOutcome.count() > 0) {
      await expect(problemOutcome).toBeAttached();
      
      // Should contain problem and outcome content
      const sectionText = await problemOutcome.textContent();
      expect(sectionText?.length, 'Problem-outcome section should have content').toBeGreaterThan(50);
    }
  });

  test('should have proper page composition and layout', async ({ page }) => {
    // Page should have main content landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeAttached();
    
    // Should have proper heading hierarchy
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    expect(headingCount).toBeGreaterThanOrEqual(1);
    
    // First heading should be h1
    const firstHeading = headings.first();
    const tagName = await firstHeading.evaluate(el => el.tagName.toLowerCase());
    expect(tagName).toBe('h1');
    
    // Page should have sections/components in logical order
    const sections = page.locator('section, [class*="section"], header, main, footer');
    const sectionCount = await sections.count();
    
    expect(sectionCount).toBeGreaterThanOrEqual(3); // At least header, main content, footer
  });

  test('should have quote anchor target', async ({ page }) => {
    // Should have an element with id="quote" or similar
    const quoteTarget = page.locator('#quote, [id*="quote"], [data-id="quote"]');
    
    if (await quoteTarget.count() > 0) {
      await expect(quoteTarget).toBeAttached();
      
      // Target should be focusable or contain focusable elements
      const isFocusable = await quoteTarget.evaluate(el => {
        return el.matches(':focus-within, [tabindex], input, button, select, textarea, a[href]') ||
               el.querySelector('input, button, select, textarea, a[href]') !== null;
      });
      
      expect(isFocusable, 'Quote target should be focusable or contain focusable elements').toBeTruthy();
    }
  });

  test('should have skip-to-content link', async ({ page }) => {
    // Tab to reveal skip link
    await page.keyboard.press('Tab');
    
    const skipLink = page.locator('.skip-link, [class*="skip"], a[href="#main"], a[href="#content"]');
    
    if (await skipLink.count() > 0) {
      // Skip link should become visible when focused
      await expect(skipLink).toBeVisible();
      
      // Should have proper text
      const skipText = await skipLink.textContent();
      expect(skipText?.toLowerCase()).toContain('skip');
      
      // Should link to main content
      const href = await skipLink.getAttribute('href');
      expect(href).toMatch(/#(main|content)/);
    }
  });

  test('should have responsive layout containers', async ({ page }) => {
    // Check for consistent container classes/styles
    const containers = page.locator('.container, .container-custom, [class*="container"]');
    
    if (await containers.count() > 0) {
      // Containers should have max-width constraints
      for (let i = 0; i < Math.min(await containers.count(), 3); i++) {
        const container = containers.nth(i);
        const maxWidth = await container.evaluate(el => {
          return window.getComputedStyle(el).maxWidth;
        });
        
        expect(maxWidth).not.toBe('none');
      }
    }
  });

  test('should handle reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    
    // Check that animations are disabled or reduced
    const animatedElements = page.locator('[class*="animate"], [style*="animation"], [style*="transition"]');
    const count = await animatedElements.count();
    
    if (count > 0) {
      // If animated elements exist, they should respect reduced motion
      for (let i = 0; i < Math.min(count, 3); i++) {
        const element = animatedElements.nth(i);
        const animationDuration = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.animationDuration;
        });
        
        // Animation should be very short or disabled
        expect(['0s', '0.01ms', 'none', '']).toContain(animationDuration);
      }
    }
  });
});

test.describe('Phase 2 Foundational - Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should pass foundational accessibility checks', async ({ page }) => {
    await runCommonAccessibilityTests(page, {
      tags: ['wcag2a', 'wcag2aa'],
      skipImageAccessibility: false,
      skipHeadingHierarchy: false
    });
  });

  test('should have accessible navigation', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeAttached();
    
    // Navigation should have proper ARIA
    const ariaLabel = await nav.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    
    // Navigation links should be keyboard accessible
    const navLinks = nav.locator('a');
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 5); i++) {
        const link = navLinks.nth(i);
        await link.focus();
        await expect(link).toBeFocused();
      }
    }
  });

  test('should have accessible footer content', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeAttached();
    
    // Footer links should be accessible
    const footerLinks = footer.locator('a');
    const linkCount = await footerLinks.count();
    
    if (linkCount > 0) {
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = footerLinks.nth(i);
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        expect(href || text, 'Footer links should have href or meaningful text').toBeTruthy();
      }
    }
  });

  test('should have accessible hero section', async ({ page }) => {
    const hero = page.locator('[data-testid="hero"], .hero, section:first-of-type');
    
    if (await hero.count() > 0) {
      // Hero should have proper heading structure
      const h1 = hero.locator('h1');
      await expect(h1).toBeAttached();
      
      // CTA buttons should be accessible
      const ctaButtons = hero.locator('button, a[href]');
      const buttonCount = await ctaButtons.count();
      
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 2); i++) {
          const button = ctaButtons.nth(i);
          const accessibleName = await button.evaluate(el => {
            return el.getAttribute('aria-label') || 
                   el.getAttribute('title') || 
                   el.textContent?.trim() || 
                   el.getAttribute('alt');
          });
          
          expect(accessibleName, 'CTA buttons should have accessible names').toBeTruthy();
        }
      }
    }
  });
});