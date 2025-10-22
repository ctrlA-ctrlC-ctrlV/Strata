/**
 * E2E Test: US1 Configurator Happy Path
 * Test the complete configurator flow from start to quote submission
 */

import { test, expect, type Page } from '@playwright/test';

test.describe('US1 Configurator Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to configurator page
    await page.goto('/src/pages/products/configurator.html');
  });

  test('complete configurator flow and submit quote', async ({ page }) => {
    // Step 1: Size selection
    await test.step('configure size', async () => {
      await expect(page.locator('h2')).toContainText('Choose Your Size');
      
      // Set width and depth
      await page.fill('#width-input', '6');
      await page.fill('#depth-input', '4');
      
      // Verify floor area calculation
      await expect(page.locator('.area-display')).toContainText('Floor Area: 24.0 m²');
      
      // Continue to next step
      await page.click('[data-testid="next-step"]');
    });

    // Step 2: Openings configuration
    await test.step('configure openings', async () => {
      await expect(page.locator('h2')).toContainText('Configure Openings');
      
      // Add a window
      await page.click('[data-type="windows"].add-opening-btn');
      await page.fill('[data-type="windows"][data-index="0"][data-dimension="width"]', '1.2');
      await page.fill('[data-type="windows"][data-index="0"][data-dimension="height"]', '1.2');
      
      // Add an external door
      await page.click('[data-type="externalDoors"].add-opening-btn');
      await page.fill('[data-type="externalDoors"][data-index="0"][data-dimension="width"]', '0.9');
      await page.fill('[data-type="externalDoors"][data-index="0"][data-dimension="height"]', '2.1');
      
      // Verify summary shows correct counts
      await expect(page.locator('.stat:has-text("Windows:") .value')).toContainText('1');
      await expect(page.locator('.stat:has-text("External Doors:") .value')).toContainText('1');
      
      await page.click('[data-testid="next-step"]');
    });

    // Step 3: Cladding selection
    await test.step('configure cladding', async () => {
      await expect(page.locator('h2')).toContainText('Choose Your Cladding');
      
      // Select material and color
      await page.check('#material-composite');
      await page.check('#color-charcoal');
      
      // Verify preview updates
      await expect(page.locator('.cladding-surface')).toHaveClass(/composite.*charcoal/);
      
      await page.click('[data-testid="next-step"]');
    });

    // Step 4: Bathroom configuration
    await test.step('configure bathroom', async () => {
      await expect(page.locator('h2')).toContainText('Bathroom Options');
      
      // Select half bathroom
      await page.check('#bathroom-half');
      
      // Verify summary
      await expect(page.locator('.summary-content')).toContainText('1 Half Bathroom');
      
      await page.click('[data-testid="next-step"]');
    });

    // Step 5: Floor selection
    await test.step('configure floor', async () => {
      await expect(page.locator('h2')).toContainText('Choose Your Flooring');
      
      // Select wooden flooring
      await page.check('#floor-wooden');
      
      // Verify area display
      await expect(page.locator('.floor-area-info')).toContainText('Floor Area: 24.0 m²');
      
      await page.click('[data-testid="next-step"]');
    });

    // Step 6: Extras selection
    await test.step('configure extras', async () => {
      await expect(page.locator('h2')).toContainText('Optional Extras');
      
      // Add some extras
      await page.click('[data-code="steel-door"].qty-btn.increase');
      await page.click('[data-code="extra-sockets"].qty-btn.increase');
      await page.click('[data-code="extra-sockets"].qty-btn.increase');
      
      // Add custom extra
      await page.fill('.custom-description', 'Custom feature request');
      await page.fill('.custom-price', '500');
      await page.click('.add-custom-btn');
      
      // Verify summary shows selected extras
      await expect(page.locator('.extras-summary')).toContainText('Steel Security Door');
      await expect(page.locator('.extras-summary')).toContainText('Additional Double Sockets × 2');
      await expect(page.locator('.extras-summary')).toContainText('Custom feature request');
      
      await page.click('[data-testid="next-step"]');
    });

    // Step 7: Summary and price calculation
    await test.step('review summary', async () => {
      await expect(page.locator('h2')).toContainText('Review Your Configuration');
      
      // Verify all selections are shown
      await expect(page.locator('.config-summary')).toContainText('6.0m × 4.0m');
      await expect(page.locator('.config-summary')).toContainText('Composite - Charcoal');
      await expect(page.locator('.config-summary')).toContainText('Half Bathroom');
      await expect(page.locator('.config-summary')).toContainText('Wooden Flooring');
      
      // Verify price calculation
      await expect(page.locator('.price-display .subtotal')).toBeVisible();
      await expect(page.locator('.price-display .vat')).toBeVisible();
      await expect(page.locator('.price-display .total')).toBeVisible();
      
      // Test VAT toggle
      await page.click('[data-testid="vat-toggle"]');
      await expect(page.locator('.price-display')).toContainText('Excl. VAT');
      
      await page.click('[data-testid="vat-toggle"]');
      await expect(page.locator('.price-display')).toContainText('Incl. VAT');
      
      await page.click('[data-testid="get-quote"]');
    });

    // Step 8: Quote form
    await test.step('fill quote form', async () => {
      await expect(page.locator('h2')).toContainText('Get Your Quote');
      
      // Fill customer details
      await page.fill('#customer-name', 'John Smith');
      await page.fill('#customer-email', 'john.smith@example.com');
      await page.fill('#customer-phone', '+353 87 123 4567');
      await page.fill('#customer-address', '123 Test Street, Dublin');
      await page.fill('#customer-eircode', 'D01 X2Y3');
      await page.selectOption('#timeframe', '3-6-months');
      
      // Verify county validation (Dublin should be accepted)
      await page.locator('#customer-eircode').blur();
      await expect(page.locator('.validation-messages')).not.toContainText('not supported');
      
      // Submit quote
      await page.click('[data-testid="submit-quote"]');
    });

    // Step 9: Confirmation
    await test.step('verify confirmation', async () => {
      await expect(page.locator('h2')).toContainText('Quote Submitted Successfully');
      
      // Verify quote number is displayed
      await expect(page.locator('.quote-number')).toContainText(/Q\d+-\d{4}-\d{5}/);
      
      // Verify configuration summary is shown
      await expect(page.locator('.confirmation-summary')).toContainText('6.0m × 4.0m');
      
      // Verify email design option
      await expect(page.locator('[data-testid="email-design"]')).toBeVisible();
    });
  });

  test('validates required fields in quote form', async ({ page }) => {
    // Navigate through steps quickly to reach quote form
    await completeStepsToQuoteForm(page);
    
    // Try to submit without filling required fields
    await page.click('[data-testid="submit-quote"]');
    
    // Verify validation messages
    await expect(page.locator('.error-message')).toContainText('Name is required');
    await expect(page.locator('.error-message')).toContainText('Email is required');
  });

  test('validates county restrictions', async ({ page }) => {
    await completeStepsToQuoteForm(page);
    
    // Fill form with unsupported county
    await page.fill('#customer-name', 'John Smith');
    await page.fill('#customer-email', 'john.smith@example.com');
    await page.fill('#customer-eircode', 'T12 A3B4'); // Tipperary - not supported
    
    await page.locator('#customer-eircode').blur();
    
    // Verify county restriction message
    await expect(page.locator('.error-message')).toContainText('Currently only serving Dublin, Wicklow, and Kildare');
  });

  test('persists configuration state', async ({ page }) => {
    // Configure first few steps
    await page.fill('#width-input', '5');
    await page.fill('#depth-input', '3');
    await page.click('[data-testid="next-step"]');
    
    await page.click('[data-type="windows"].add-opening-btn');
    await page.click('[data-testid="next-step"]');
    
    // Reload page
    await page.reload();
    
    // Verify state is restored
    await expect(page.locator('#width-input')).toHaveValue('5');
    await expect(page.locator('#depth-input')).toHaveValue('3');
    
    // Navigate to openings step
    await page.click('[data-testid="next-step"]');
    await expect(page.locator('.opening-item')).toHaveCount(1);
  });

  test('calculates price updates in real-time', async ({ page }) => {
    // Configure basic setup
    await page.fill('#width-input', '4');
    await page.fill('#depth-input', '4');
    
    // Check initial estimate
    const initialEstimate = await page.locator('.price-preview .total').textContent();
    
    // Change size and verify price updates
    await page.fill('#width-input', '6');
    
    // Wait for price to update
    await page.waitForFunction(
      (initial) => {
        const current = document.querySelector('.price-preview .total')?.textContent;
        return current && current !== initial;
      },
      initialEstimate
    );
    
    const updatedEstimate = await page.locator('.price-preview .total').textContent();
    expect(updatedEstimate).not.toBe(initialEstimate);
  });
});

// Helper function to quickly navigate to quote form
async function completeStepsToQuoteForm(page: Page) {
  // Size
  await page.fill('#width-input', '4');
  await page.fill('#depth-input', '4');
  await page.click('[data-testid="next-step"]');
  
  // Openings (skip)
  await page.click('[data-testid="next-step"]');
  
  // Cladding
  await page.check('#material-composite');
  await page.check('#color-charcoal');
  await page.click('[data-testid="next-step"]');
  
  // Bathroom (none)
  await page.click('[data-testid="next-step"]');
  
  // Floor (none)
  await page.click('[data-testid="next-step"]');
  
  // Extras (skip)
  await page.click('[data-testid="next-step"]');
  
  // Summary
  await page.click('[data-testid="get-quote"]');
}