import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility testing utilities using axe-core
 * 
 * These helpers provide consistent accessibility testing across all components
 * and pages in the Strata Garden Rooms landing page.
 */

export interface AxeOptions {
  /** Accessibility rules to include in the scan */
  include?: string[];
  /** Accessibility rules to exclude from the scan */
  exclude?: string[];
  /** Tags to filter rules by (e.g., 'wcag2a', 'wcag2aa', 'wcag21aa') */
  tags?: string[];
  /** Disable specific rules by rule ID */
  disableRules?: string[];
}

/**
 * Run axe accessibility scan on the current page
 * @param page - Playwright page object
 * @param options - Configuration options for the axe scan
 */
export async function runAxeAccessibilityTest(
  page: Page, 
  options: AxeOptions = {}
): Promise<void> {
  const {
    include = [],
    exclude = [],
    tags = ['wcag2a', 'wcag2aa', 'wcag21aa'],
    disableRules = []
  } = options;

  let axeBuilder = new AxeBuilder({ page })
    .withTags(tags);

  // Apply includes/excludes
  if (include.length > 0) {
    axeBuilder = axeBuilder.include(include);
  }
  
  if (exclude.length > 0) {
    axeBuilder = axeBuilder.exclude(exclude);
  }

  // Disable specific rules if requested
  if (disableRules.length > 0) {
    axeBuilder = axeBuilder.disableRules(disableRules);
  }

  const accessibilityScanResults = await axeBuilder.analyze();

  // Assert no violations found
  expect(accessibilityScanResults.violations, 
    `Accessibility violations found:\n${formatViolations(accessibilityScanResults.violations)}`
  ).toEqual([]);
}

/**
 * Run axe scan on a specific element/selector
 * @param page - Playwright page object
 * @param selector - CSS selector to scan
 * @param options - Configuration options for the axe scan
 */
export async function runAxeOnElement(
  page: Page, 
  selector: string, 
  options: AxeOptions = {}
): Promise<void> {
  await runAxeAccessibilityTest(page, {
    ...options,
    include: [selector]
  });
}

/**
 * Test keyboard navigation for a specific component
 * @param page - Playwright page object
 * @param startSelector - Starting element selector
 * @param expectedTabOrder - Array of selectors in expected tab order
 */
export async function testKeyboardNavigation(
  page: Page,
  startSelector: string,
  expectedTabOrder: string[]
): Promise<void> {
  // Focus the starting element
  await page.locator(startSelector).focus();
  
  // Verify initial focus
  await expect(page.locator(startSelector)).toBeFocused();

  // Tab through expected elements
  for (let i = 1; i < expectedTabOrder.length; i++) {
    await page.keyboard.press('Tab');
    const expectedElement = expectedTabOrder[i];
    
    await expect(
      page.locator(expectedElement),
      `Element ${expectedElement} should be focused after ${i} tab(s)`
    ).toBeFocused();
  }
}

/**
 * Test skip link functionality
 * @param page - Playwright page object
 * @param skipLinkSelector - Selector for the skip link
 * @param targetSelector - Selector for the skip target
 */
export async function testSkipLink(
  page: Page,
  skipLinkSelector: string = '.skip-link',
  targetSelector: string = '#main-content'
): Promise<void> {
  // Tab to make skip link visible
  await page.keyboard.press('Tab');
  
  // Verify skip link is visible and focusable
  const skipLink = page.locator(skipLinkSelector);
  await expect(skipLink).toBeVisible();
  await expect(skipLink).toBeFocused();
  
  // Activate skip link
  await page.keyboard.press('Enter');
  
  // Verify target element receives focus
  const target = page.locator(targetSelector);
  await expect(target).toBeFocused();
}

/**
 * Test focus trap within a modal or dialog
 * @param page - Playwright page object
 * @param containerSelector - Selector for the modal/dialog container
 * @param focusableSelectors - Array of focusable elements within the container
 */
export async function testFocusTrap(
  page: Page,
  containerSelector: string,
  focusableSelectors: string[]
): Promise<void> {
  const container = page.locator(containerSelector);
  await expect(container).toBeVisible();

  // Focus should start on first focusable element
  await expect(page.locator(focusableSelectors[0])).toBeFocused();

  // Tab through all focusable elements
  for (let i = 1; i < focusableSelectors.length; i++) {
    await page.keyboard.press('Tab');
    await expect(page.locator(focusableSelectors[i])).toBeFocused();
  }

  // Tab from last element should wrap to first
  await page.keyboard.press('Tab');
  await expect(page.locator(focusableSelectors[0])).toBeFocused();

  // Shift+Tab should go to last element
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator(focusableSelectors[focusableSelectors.length - 1])).toBeFocused();
}

/**
 * Test screen reader announcements using live regions
 * @param page - Playwright page object
 * @param triggerAction - Function that triggers the announcement
 * @param expectedAnnouncement - Expected text content in live region
 * @param liveRegionSelector - Selector for the live region (default: '[aria-live]')
 */
export async function testScreenReaderAnnouncement(
  page: Page,
  triggerAction: () => Promise<void>,
  expectedAnnouncement: string,
  liveRegionSelector: string = '[aria-live]'
): Promise<void> {
  // Wait for live region to be present
  const liveRegion = page.locator(liveRegionSelector);
  await expect(liveRegion).toBeAttached();

  // Trigger the action that should cause an announcement
  await triggerAction();

  // Wait for the announcement to appear
  await expect(liveRegion).toContainText(expectedAnnouncement);
}

/**
 * Test color contrast requirements
 * @param page - Playwright page object
 * @param elementSelector - Selector for element to test
 * @param minimumRatio - Minimum contrast ratio (default: 4.5 for AA)
 */
export async function testColorContrast(
  page: Page,
  elementSelector: string,
  minimumRatio: number = 4.5
): Promise<void> {
  // Use axe's color-contrast rule specifically
  await runAxeAccessibilityTest(page, {
    include: [elementSelector],
    tags: ['wcag2aa'],
    disableRules: [] // Keep color-contrast rule enabled
  });
}

/**
 * Test form accessibility (labels, error messages, required fields)
 * @param page - Playwright page object
 * @param formSelector - Selector for the form
 */
export async function testFormAccessibility(
  page: Page,
  formSelector: string
): Promise<void> {
  // Run comprehensive accessibility scan on form
  await runAxeAccessibilityTest(page, {
    include: [formSelector],
    tags: ['wcag2a', 'wcag2aa', 'wcag21aa']
  });

  // Test specific form accessibility patterns
  const form = page.locator(formSelector);
  
  // All inputs should have associated labels
  const inputs = form.locator('input, select, textarea');
  const inputCount = await inputs.count();
  
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const inputId = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledby = await input.getAttribute('aria-labelledby');
    
    // Input should have either: id with associated label, aria-label, or aria-labelledby
    const hasLabel = inputId && await form.locator(`label[for="${inputId}"]`).count() > 0;
    const hasAriaLabel = ariaLabel !== null;
    const hasAriaLabelledby = ariaLabelledby !== null;
    
    expect(
      hasLabel || hasAriaLabel || hasAriaLabelledby,
      `Input at index ${i} must have an accessible label`
    ).toBeTruthy();
  }
}

/**
 * Test image accessibility (alt text, decorative images)
 * @param page - Playwright page object
 * @param containerSelector - Container to scan for images (default: 'body')
 */
export async function testImageAccessibility(
  page: Page,
  containerSelector: string = 'body'
): Promise<void> {
  const container = page.locator(containerSelector);
  const images = container.locator('img');
  const imageCount = await images.count();

  for (let i = 0; i < imageCount; i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');
    const role = await img.getAttribute('role');
    const ariaHidden = await img.getAttribute('aria-hidden');

    // Image should have alt attribute (can be empty for decorative)
    // OR be marked as decorative with role="presentation" or aria-hidden="true"
    const hasAlt = alt !== null;
    const isDecorative = role === 'presentation' || ariaHidden === 'true';

    expect(
      hasAlt || isDecorative,
      `Image at index ${i} must have alt attribute or be marked as decorative`
    ).toBeTruthy();
  }
}

/**
 * Test heading hierarchy (h1, h2, h3, etc. in proper order)
 * @param page - Playwright page object
 * @param containerSelector - Container to scan for headings (default: 'body')
 */
export async function testHeadingHierarchy(
  page: Page,
  containerSelector: string = 'body'
): Promise<void> {
  const container = page.locator(containerSelector);
  const headings = container.locator('h1, h2, h3, h4, h5, h6');
  const headingCount = await headings.count();

  const levels: number[] = [];
  
  for (let i = 0; i < headingCount; i++) {
    const heading = headings.nth(i);
    const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
    const level = parseInt(tagName.charAt(1));
    levels.push(level);
  }

  // Check for proper hierarchy
  expect(levels[0], 'Page should start with h1').toBe(1);
  
  for (let i = 1; i < levels.length; i++) {
    const currentLevel = levels[i];
    const previousLevel = levels[i - 1];
    
    // Next heading should be at most one level deeper
    expect(
      currentLevel <= previousLevel + 1,
      `Heading level ${currentLevel} follows level ${previousLevel}. Skip in heading hierarchy detected.`
    ).toBeTruthy();
  }
}

/**
 * Format axe violations for readable error messages
 * @param violations - Array of axe violations
 * @returns Formatted string describing violations
 */
function formatViolations(violations: any[]): string {
  return violations.map(violation => {
    const nodes = violation.nodes.map((node: any) => `  - ${node.target.join(', ')}`).join('\n');
    return `Rule: ${violation.id}\nDescription: ${violation.description}\nHelp: ${violation.help}\nNodes:\n${nodes}`;
  }).join('\n\n');
}

/**
 * Common accessibility test suite that can be run on any page
 * @param page - Playwright page object
 * @param options - Configuration options
 */
export async function runCommonAccessibilityTests(
  page: Page,
  options: AxeOptions & {
    skipHeadingHierarchy?: boolean;
    skipImageAccessibility?: boolean;
    testFormSelector?: string;
  } = {}
): Promise<void> {
  const { skipHeadingHierarchy, skipImageAccessibility, testFormSelector, ...axeOptions } = options;

  // Run full page accessibility scan
  await runAxeAccessibilityTest(page, axeOptions);

  // Test heading hierarchy unless skipped
  if (!skipHeadingHierarchy) {
    await testHeadingHierarchy(page);
  }

  // Test image accessibility unless skipped
  if (!skipImageAccessibility) {
    await testImageAccessibility(page);
  }

  // Test form accessibility if form selector provided
  if (testFormSelector) {
    await testFormAccessibility(page, testFormSelector);
  }
}