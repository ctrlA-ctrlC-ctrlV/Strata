import { test, expect } from '@playwright/test';

test.describe('Debug Hero Component', () => {
  test('check what hero elements are actually present', async ({ page }) => {
    await page.goto('/');
    
    // Debug: Check what's actually in the DOM
    const bodyContent = await page.evaluate(() => document.body.innerHTML);
    console.log('Body content:', bodyContent.substring(0, 2000));
    
    // Check for any hero-related elements
    const heroElements = await page.locator('[data-testid="hero"], .hero, #hero').count();
    console.log('Hero elements found:', heroElements);
    
    if (heroElements > 0) {
      const heroContent = await page.locator('[data-testid="hero"], .hero, #hero').first().innerHTML();
      console.log('Hero content:', heroContent);
    }
    
    // Check for trust-related elements anywhere on page
    const trustElements = await page.locator('[data-testid*="trust"], .trust, [class*="trust"]').count();
    console.log('Trust-related elements found:', trustElements);
    
    // Check for any scripts or console errors
    const logs: string[] = [];
    page.on('console', msg => logs.push(`${msg.type()}: ${msg.text()}`));
    
    await page.waitForTimeout(2000); // Wait for scripts to execute
    
    console.log('Console logs:', logs);
    
    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'debug-hero.png', fullPage: true });
  });
});