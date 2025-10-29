import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Icon Accessibility Semantics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('trust indicator icons should be properly hidden from screen readers', async ({ page }) => {
    const trustIndicators = page.locator('[data-testid="trust-indicators"]');
    
    if (await trustIndicators.isVisible()) {
      const trustItems = trustIndicators.locator('[data-testid="trust-item"]');
      const count = await trustItems.count();

      for (let i = 0; i < count; i++) {
        const item = trustItems.nth(i);
        const icon = item.locator('.hero__trust-icon');
        
        if (await icon.isVisible()) {
          // Icon should be hidden from screen readers
          const ariaHidden = await icon.getAttribute('aria-hidden');
          expect(ariaHidden).toBe('true');
          
          // Should not have role that makes it accessible
          const role = await icon.getAttribute('role');
          expect(role).not.toBe('img');
          expect(role).not.toBe('button');
          
          // Should not have accessible name
          const ariaLabel = await icon.getAttribute('aria-label');
          const ariaLabelledBy = await icon.getAttribute('aria-labelledby');
          expect(ariaLabel).toBeNull();
          expect(ariaLabelledBy).toBeNull();
        }
      }
    }
  });

  test('benefits grid icons should be properly marked as decorative', async ({ page }) => {
    const benefitsGrid = page.locator('[data-testid="benefits-grid"]');
    
    if (await benefitsGrid.isVisible()) {
      const benefitItems = benefitsGrid.locator('[data-testid="benefit-item"]');
      const count = await benefitItems.count();

      for (let i = 0; i < count; i++) {
        const item = benefitItems.nth(i);
        const icon = item.locator('.benefit-item__icon');
        
        if (await icon.isVisible()) {
          // Icon should be hidden from screen readers since it's decorative
          const ariaHidden = await icon.getAttribute('aria-hidden');
          expect(ariaHidden).toBe('true');
          
          // The meaning should come from the text content, not the icon
          const title = item.locator('.benefit-item__title');
          await expect(title).toBeVisible();
          await expect(title).not.toBeEmpty();
        }
      }
    }
  });

  test('problem-outcome icons should be decorative', async ({ page }) => {
    const problemOutcome = page.locator('[data-testid="problem-outcome"]');
    
    if (await problemOutcome.isVisible()) {
      const icons = problemOutcome.locator('.problem-outcome__icon');
      const count = await icons.count();

      for (let i = 0; i < count; i++) {
        const icon = icons.nth(i);
        
        if (await icon.isVisible()) {
          // Icon should be hidden from screen readers
          const ariaHidden = await icon.getAttribute('aria-hidden');
          expect(ariaHidden).toBe('true');
          
          // Should not have accessible properties
          const ariaLabel = await icon.getAttribute('aria-label');
          const alt = await icon.getAttribute('alt');
          expect(ariaLabel).toBeNull();
          expect(alt).toBeNull();
        }
      }
    }
  });

  test('header logo should have appropriate semantics', async ({ page }) => {
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();

    const logo = header.locator('.header__logo');
    if (await logo.isVisible()) {
      // Logo link should have proper aria-label
      const ariaLabel = await logo.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('Home');
      
      // Logo text should be accessible
      const logoText = logo.locator('.header__logo-text');
      if (await logoText.isVisible()) {
        await expect(logoText).not.toBeEmpty();
      }
    }
  });

  test('navigation icons (if any) should have proper labels', async ({ page }) => {
    const header = page.locator('[data-testid="header"]');
    await expect(header).toBeVisible();

    // Check mobile menu toggle
    const menuToggle = header.locator('[data-testid="mobile-menu-toggle"]');
    if (await menuToggle.isVisible()) {
      const ariaLabel = await menuToggle.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toContain('menu');
      
      const ariaExpanded = await menuToggle.getAttribute('aria-expanded');
      expect(ariaExpanded).toBeTruthy();
      expect(['true', 'false']).toContain(ariaExpanded!);
    }

    // Menu icons should be decorative
    const menuIcons = header.locator('.header__menu-icon');
    const iconCount = await menuIcons.count();
    
    for (let i = 0; i < iconCount; i++) {
      const icon = menuIcons.nth(i);
      // These are typically decorative hamburger menu lines
      // They shouldn't have accessible properties since the button has the label
      const ariaLabel = await icon.getAttribute('aria-label');
      const ariaHidden = await icon.getAttribute('aria-hidden');
      
      // Either explicitly hidden or no accessible properties
      if (ariaHidden !== 'true') {
        expect(ariaLabel).toBeNull();
      }
    }
  });

  test('scroll indicator icon should be properly labeled', async ({ page }) => {
    const scrollIndicator = page.locator('[data-testid="scroll-indicator"]');
    
    if (await scrollIndicator.isVisible()) {
      const ariaLabel = await scrollIndicator.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/scroll/i);
      
      // Arrow icon inside should be decorative
      const arrow = scrollIndicator.locator('.hero__scroll-arrow');
      if (await arrow.isVisible()) {
        const ariaHidden = await arrow.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      }
    }
  });

  test('footer social icons should have descriptive labels', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]');
    if (await footer.isVisible()) {
      const socialLinks = footer.locator('.footer__social-link');
      const count = await socialLinks.count();

      for (let i = 0; i < count; i++) {
        const link = socialLinks.nth(i);
        
        if (await link.isVisible()) {
          const ariaLabel = await link.getAttribute('aria-label');
          expect(ariaLabel).toBeTruthy();
          
          // Should describe the action and platform
          expect(ariaLabel).toMatch(/(follow|connect|visit).*(facebook|instagram|linkedin|twitter)/i);
          
          // Social icons should be decorative since link has aria-label
          const icon = link.locator('.footer__social-icon');
          if (await icon.isVisible()) {
            const iconAriaHidden = await icon.getAttribute('aria-hidden');
            expect(iconAriaHidden).toBe('true');
          }
        }
      }
    }
  });

  test('contact icons should be decorative with proper context', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]');
    if (await footer.isVisible()) {
      const contactLinks = footer.locator('.footer__contact-link');
      const count = await contactLinks.count();

      for (let i = 0; i < count; i++) {
        const link = contactLinks.nth(i);
        
        if (await link.isVisible()) {
          // Contact icons should be decorative
          const icon = link.locator('.footer__contact-icon');
          if (await icon.isVisible()) {
            const ariaHidden = await icon.getAttribute('aria-hidden');
            expect(ariaHidden).toBe('true');
          }
          
          // Text content should provide the accessible name
          const text = link.locator('.footer__contact-text');
          if (await text.isVisible()) {
            await expect(text).not.toBeEmpty();
          }
        }
      }
    }
  });

  test('all decorative emojis and symbols should be hidden from screen readers', async ({ page }) => {
    // Find all elements that likely contain emoji or symbol icons
    const elements = await page.locator('*').all();
    const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    
    for (const element of elements) {
      const textContent = await element.textContent();
      if (textContent && emojiPattern.test(textContent)) {
        // If element contains only emoji/symbols and no meaningful text
        const trimmedText = textContent.trim();
        if (trimmedText.length <= 3 && emojiPattern.test(trimmedText)) {
          const ariaHidden = await element.getAttribute('aria-hidden');
          const ariaLabel = await element.getAttribute('aria-label');
          const role = await element.getAttribute('role');
          
          // Should either be hidden or have proper labeling
          if (ariaHidden !== 'true') {
            // If not hidden, should have meaningful label or be in context that provides meaning
            const parentElement = await element.locator('..').first();
            const parentText = await parentElement.textContent();
            const hasContext = parentText && parentText.length > trimmedText.length;
            
            if (!hasContext && !ariaLabel && role !== 'img') {
              console.warn(`Emoji/symbol "${trimmedText}" may need aria-hidden="true" or proper labeling`);
            }
          }
        }
      }
    }
  });

  test('run axe accessibility scan for icon-related issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .include('[data-testid]')
      .analyze();

    // Filter for icon-related violations
    const iconRelatedViolations = accessibilityScanResults.violations.filter(violation => 
      violation.id.includes('image') || 
      violation.id.includes('aria') ||
      violation.description.toLowerCase().includes('icon') ||
      violation.description.toLowerCase().includes('image')
    );

    if (iconRelatedViolations.length > 0) {
      console.log('Icon-related accessibility violations found:', iconRelatedViolations);
    }

    expect(iconRelatedViolations).toHaveLength(0);
  });

  test('icons should not interfere with keyboard navigation', async ({ page }) => {
    // Tab through all focusable elements
    await page.keyboard.press('Tab');
    
    let focusedElement = page.locator(':focus');
    const visited = new Set();
    
    while (await focusedElement.count() > 0) {
      const tagName = await focusedElement.evaluate(el => el.tagName);
      const role = await focusedElement.getAttribute('role');
      const ariaHidden = await focusedElement.getAttribute('aria-hidden');
      
      // Icons should not be focusable unless they're interactive
      if (ariaHidden === 'true') {
        expect(['SPAN', 'DIV', 'I']).toContain(tagName);
        expect(role).not.toBe('button');
        expect(role).not.toBe('link');
      }
      
      // Prevent infinite loop
      const elementText = await focusedElement.textContent();
      const key = `${tagName}-${elementText}`;
      if (visited.has(key)) break;
      visited.add(key);
      
      await page.keyboard.press('Tab');
      focusedElement = page.locator(':focus');
      
      // Safety break after reasonable number of elements
      if (visited.size > 50) break;
    }
  });

  test('icon alternatives should be meaningful when icons fail to load', async ({ page }) => {
    // Block icon fonts or image resources that might be used for icons
    await page.route('**/*.woff*', route => route.abort());
    await page.route('**/*.ttf', route => route.abort());
    await page.route('**/icons/**', route => route.abort());
    
    await page.reload();
    
    // Check that text alternatives are still meaningful
    const benefitsGrid = page.locator('[data-testid="benefits-grid"]');
    if (await benefitsGrid.isVisible()) {
      const benefitItems = benefitsGrid.locator('[data-testid="benefit-item"]');
      const count = await benefitItems.count();

      for (let i = 0; i < count; i++) {
        const item = benefitItems.nth(i);
        const title = item.locator('.benefit-item__title');
        const description = item.locator('.benefit-item__description');
        
        // Text content should still be meaningful without icons
        await expect(title).toBeVisible();
        await expect(title).not.toBeEmpty();
        await expect(description).toBeVisible();
        await expect(description).not.toBeEmpty();
      }
    }
  });
});