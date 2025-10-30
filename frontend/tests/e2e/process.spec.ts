import { test, expect } from '@playwright/test';

test.describe('Phase 7 - Process Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display process section with 4 stages', async ({ page }) => {
    const processSection = page.locator('[data-testid="process"]').first();
    await expect(processSection).toBeVisible();
    
    // Should have exactly 4 process steps
    const processSteps = processSection.locator('[data-testid="process-step"]');
    await expect(processSteps).toHaveCount(4);
  });

  test('should have proper heading structure', async ({ page }) => {
    const processSection = page.locator('[data-testid="process"]').first();
    
    // Should have a main heading for the section
    const mainHeading = processSection.locator('h2, h3').first();
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('Our Process');
    
    // Each step should have a heading
    const stepHeadings = processSection.locator('[data-testid="process-step"] h3, [data-testid="process-step"] h4');
    await expect(stepHeadings).toHaveCount(4);
  });

  test('should have numbered steps with content', async ({ page }) => {
    const processSteps = page.locator('[data-testid="process-step"]');
    
    for (let i = 0; i < 4; i++) {
      const step = processSteps.nth(i);
      
      // Each step should have a number indicator
      const stepNumber = step.locator('[data-testid="step-number"]');
      await expect(stepNumber).toBeVisible();
      await expect(stepNumber).toContainText(`${i + 1}`);
      
      // Each step should have a title
      const stepTitle = step.locator('h3, h4');
      await expect(stepTitle).toBeVisible();
      
      // Each step should have description content
      const stepDescription = step.locator('p, [data-testid="step-description"]');
      await expect(stepDescription).toBeVisible();
    }
  });

  test('should have appropriate content for each step', async ({ page }) => {
    const processSection = page.locator('[data-testid="process"]').first();
    const processSteps = processSection.locator('[data-testid="process-step"]');
    
    // Step 1: Initial consultation/contact
    const step1 = processSteps.nth(0);
    await expect(step1).toContainText('Initial Consultation');
    await expect(step1).toContainText('requirements');
    
    // Step 2: Design/planning
    const step2 = processSteps.nth(1);
    await expect(step2).toContainText('Design');
    await expect(step2).toContainText('Planning');
    
    // Step 3: Approval/permits
    const step3 = processSteps.nth(2);
    await expect(step3).toContainText('Approvals');
    await expect(step3).toContainText('Documentation');
    
    // Step 4: Build/installation
    const step4 = processSteps.nth(3);
    await expect(step4).toContainText('Construction');
    await expect(step4).toContainText('Completion');
  });

  test('should be keyboard accessible', async ({ page }) => {
    const processSection = page.locator('[data-testid="process"]').first();
    
    // Focus should be able to reach the process section
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // If there are interactive elements, they should be focusable
    const interactiveElements = processSection.locator('a, button, [tabindex="0"]');
    const count = await interactiveElements.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i);
        await element.focus();
        await expect(element).toBeFocused();
      }
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    const processSection = page.locator('[data-testid="process"]').first();
    const interactiveElements = processSection.locator('a, button, [tabindex="0"]');
    const count = await interactiveElements.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const element = interactiveElements.nth(i);
        await element.focus();
        
        // Check that focus styles are applied
        const outlineStyle = await element.evaluate(el => 
          window.getComputedStyle(el).getPropertyValue('outline')
        );
        const boxShadowStyle = await element.evaluate(el =>
          window.getComputedStyle(el).getPropertyValue('box-shadow')
        );
        
        // Should have either outline or box-shadow for focus
        expect(outlineStyle !== 'none' || boxShadowStyle !== 'none').toBeTruthy();
      }
    }
  });

  test('should be responsive across different viewport sizes', async ({ page }) => {
    const processSection = page.locator('[data-testid="process"]').first();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(processSection).toBeVisible();
    
    const processSteps = processSection.locator('[data-testid="process-step"]');
    await expect(processSteps).toHaveCount(4);
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(processSection).toBeVisible();
    await expect(processSteps).toHaveCount(4);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(processSection).toBeVisible();
    await expect(processSteps).toHaveCount(4);
  });

  test('should have proper semantic structure', async ({ page }) => {
    const processSection = page.locator('[data-testid="process"]').first();
    
    // The process section itself is a semantic element (section)
    await expect(processSection).toBeVisible();
    
    // Steps should be in a list or organized container within the process section
    const stepsContainer = processSection.locator('.process__timeline[role="list"]');
    const hasListStructure = await stepsContainer.count() > 0;
    
    if (hasListStructure) {
      const listItems = stepsContainer.locator('[role="listitem"]');
      await expect(listItems).toHaveCount(4);
    } else {
      // If not using list structure, ensure steps are properly organized
      const processSteps = processSection.locator('[data-testid="process-step"]');
      await expect(processSteps).toHaveCount(4);
    }
  });

  test('should respect reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    
    const processSection = page.locator('[data-testid="process"]').first();
    await expect(processSection).toBeVisible();
    
    // Check that animations are disabled or minimal
    const animatedElements = processSection.locator('[class*="animate"], [class*="transition"]');
    const count = await animatedElements.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const element = animatedElements.nth(i);
        const animationDuration = await element.evaluate(el => 
          window.getComputedStyle(el).getPropertyValue('animation-duration')
        );
        const transitionDuration = await element.evaluate(el =>
          window.getComputedStyle(el).getPropertyValue('transition-duration')
        );
        
        // Should be 0s or 0.01s for reduced motion
        expect(
          animationDuration === '0s' || animationDuration === '0.01s' ||
          transitionDuration === '0s' || transitionDuration === '0.01s'
        ).toBeTruthy();
      }
    }
  });

  test('should be positioned correctly in page flow', async ({ page }) => {
    const processSection = page.locator('[data-testid="process"]').first();
    await expect(processSection).toBeVisible();
    
    // Process should come after some other sections but before footer
    const footer = page.locator('footer[data-testid="footer"]');
    await expect(footer).toBeVisible();
    
    // Get positions to ensure process comes before footer
    const processPosition = await processSection.boundingBox();
    const footerPosition = await footer.boundingBox();
    
    expect(processPosition).toBeTruthy();
    expect(footerPosition).toBeTruthy();
    expect(processPosition!.y).toBeLessThan(footerPosition!.y);
  });
});