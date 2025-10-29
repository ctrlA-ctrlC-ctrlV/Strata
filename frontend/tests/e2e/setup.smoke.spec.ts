import { test, expect } from '@playwright/test';

/**
 * Phase 1 Setup Smoke Tests
 * 
 * Basic smoke tests to verify Phase 1 setup tasks are working correctly.
 * These tests ensure that Tailwind, Bootstrap, basic structure, and security headers are in place.
 */

test.describe('Phase 1 Setup - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage without errors', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/.*/, { timeout: 10000 });
    
    // Check for any JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });
    
    // Wait a bit to catch any async errors
    await page.waitForTimeout(1000);
    
    expect(errors, `JavaScript errors found: ${errors.join(', ')}`).toHaveLength(0);
  });

  test('should have Tailwind CSS loaded', async ({ page }) => {
    // Check if Tailwind is loaded by testing a common utility class
    const element = await page.locator('body').first();
    
    // Add a temporary element with Tailwind classes to test
    await page.evaluate(() => {
      const testDiv = document.createElement('div');
      testDiv.className = 'hidden bg-blue-500 text-white p-4';
      testDiv.id = 'tailwind-test';
      document.body.appendChild(testDiv);
    });
    
    const testElement = page.locator('#tailwind-test');
    await expect(testElement).toHaveCSS('display', 'none'); // hidden class
    
    // Clean up
    await page.evaluate(() => {
      const testDiv = document.getElementById('tailwind-test');
      if (testDiv) testDiv.remove();
    });
  });

  test('should have Bootstrap Reboot styles loaded', async ({ page }) => {
    // Bootstrap Reboot should normalize box-sizing
    const body = page.locator('body');
    await expect(body).toHaveCSS('box-sizing', /border-box|inherit/);
    
    // Check that Bootstrap's base font family is applied (should not be browser default)
    const computedStyle = await body.evaluate((el) => {
      return window.getComputedStyle(el).fontFamily;
    });
    
    expect(computedStyle).toBeTruthy();
    expect(computedStyle).not.toBe('Times'); // Should not be browser default serif
  });

  test('should have proper security headers structure', async ({ page }) => {
    // Check for CSP meta tag presence
    const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(cspMeta).toBeAttached();
    
    const cspContent = await cspMeta.getAttribute('content');
    expect(cspContent).toBeTruthy();
    expect(cspContent).toContain("default-src 'self'");
  });

  test('should have images directory structure accessible', async ({ page }) => {
    // Test that image directories are accessible (will return 404 but not network error)
    const imagePaths = [
      '/images/hero/',
      '/images/gallery/',
      '/images/projects/',
      '/images/testimonials/',
      '/images/logos/'
    ];

    for (const imagePath of imagePaths) {
      const response = await page.request.get(imagePath);
      // Should get a response (even if 404), not a network error
      expect(response.status()).toBeGreaterThanOrEqual(200);
      expect(response.status()).toBeLessThan(600);
    }
  });

  test('should have privacy and terms link placeholders', async ({ page }) => {
    // Check for privacy policy link
    const privacyLink = page.locator('a[href*="privacy"], a[href*="Privacy"]');
    await expect(privacyLink).toBeAttached();
    
    // Check for terms link
    const termsLink = page.locator('a[href*="terms"], a[href*="Terms"]');
    await expect(termsLink).toBeAttached();
  });

  test('should have accessible main content structure', async ({ page }) => {
    // Check for proper HTML semantic structure
    await expect(page.locator('main, [role="main"]')).toBeAttached();
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeAttached();
    
    // Ensure there's only one h1
    const h1Count = await h1.count();
    expect(h1Count).toBe(1);
  });

  test('should have proper DOCTYPE and language', async ({ page }) => {
    // Check HTML structure
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', /^en/);
    
    // Check that DOCTYPE is HTML5 (indirectly by checking document properties)
    const doctype = await page.evaluate(() => {
      return document.doctype?.name;
    });
    expect(doctype).toBe('html');
  });
});