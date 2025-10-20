import { Page } from '@playwright/test'

/**
 * Accessibility helper utilities for Playwright tests
 */
export class AccessibilityHelper {
  constructor(private page: Page) {}

  /**
   * Run axe-core accessibility check on the current page
   */
  async checkA11y(options?: {
    include?: string[]
    exclude?: string[]
    tags?: string[]
    rules?: Record<string, { enabled: boolean }>
  }) {
    // Inject axe-core if not already loaded
    await this.injectAxe()
    
    // Configure axe if options provided
    if (options?.rules) {
      await this.page.evaluate((rules) => {
        (window as any).axe.configure({ rules })
      }, options.rules)
    }

    // Run axe scan
    const results = await this.page.evaluate(async (scanOptions) => {
      const axe = (window as any).axe
      if (!axe) {
        throw new Error('axe-core not loaded')
      }

      try {
        const results = await axe.run(document, {
          tags: scanOptions?.tags || ['wcag2a', 'wcag2aa', 'wcag21aa'],
          include: scanOptions?.include,
          exclude: scanOptions?.exclude
        })
        return results
      } catch (error) {
        throw new Error(`Axe scan failed: ${error}`)
      }
    }, options)

    return results
  }

  /**
   * Assert that page has no accessibility violations
   */
  async assertNoA11yViolations(options?: Parameters<typeof this.checkA11y>[0]) {
    const results = await this.checkA11y(options)
    
    if (results.violations.length > 0) {
      const violationMessages = results.violations.map((violation: any) => 
        `${violation.id}: ${violation.description}\n` +
        violation.nodes.map((node: any) => 
          `  - ${node.target.join(', ')}: ${node.failureSummary}`
        ).join('\n')
      ).join('\n\n')
      
      throw new Error(`Accessibility violations found:\n\n${violationMessages}`)
    }
  }

  /**
   * Check for specific accessibility rules
   */
  async checkSpecificRules(ruleIds: string[]) {
    return this.checkA11y({
      tags: [],
      rules: Object.fromEntries(
        ruleIds.map(id => [id, { enabled: true }])
      )
    })
  }

  /**
   * Check color contrast compliance
   */
  async checkColorContrast() {
    return this.checkSpecificRules(['color-contrast'])
  }

  /**
   * Check keyboard navigation
   */
  async checkKeyboardNavigation() {
    return this.checkSpecificRules([
      'keyboard',
      'focus-order-semantics',
      'focusable-content',
      'tabindex'
    ])
  }

  /**
   * Check form accessibility
   */
  async checkFormAccessibility() {
    return this.checkSpecificRules([
      'label',
      'form-field-multiple-labels',
      'label-title-only',
      'input-button-name'
    ])
  }

  /**
   * Check heading structure
   */
  async checkHeadingStructure() {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all()
    const headingLevels = await Promise.all(
      headings.map(async (heading) => {
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
        const text = await heading.textContent()
        return { level: parseInt(tagName.charAt(1)), text: text?.trim() }
      })
    )

    // Check for proper heading hierarchy
    let currentLevel = 0
    const issues: string[] = []
    
    for (const heading of headingLevels) {
      if (heading.level === 1) {
        if (currentLevel > 0) {
          issues.push(`Multiple H1 elements found: "${heading.text}"`)
        }
        currentLevel = 1
      } else {
        if (heading.level > currentLevel + 1) {
          issues.push(
            `Heading level skipped: H${heading.level} "${heading.text}" ` +
            `follows H${currentLevel}`
          )
        }
        currentLevel = heading.level
      }
    }

    if (issues.length > 0) {
      throw new Error(`Heading structure issues:\n${issues.join('\n')}`)
    }

    return headingLevels
  }

  /**
   * Check ARIA attributes and landmarks
   */
  async checkARIA() {
    return this.checkSpecificRules([
      'aria-valid-attr',
      'aria-valid-attr-value',
      'aria-allowed-attr',
      'aria-required-attr',
      'aria-roles',
      'landmark-one-main',
      'landmark-complementary-is-top-level',
      'landmark-no-duplicate-banner',
      'landmark-no-duplicate-contentinfo'
    ])
  }

  /**
   * Inject axe-core library into the page
   */
  private async injectAxe() {
    const axeExists = await this.page.evaluate(() => {
      return typeof (window as any).axe !== 'undefined'
    })

    if (!axeExists) {
      // Load axe-core from CDN
      await this.page.addScriptTag({
        url: 'https://unpkg.com/axe-core@4/axe.min.js'
      })

      // Wait for axe to be available
      await this.page.waitForFunction(() => {
        return typeof (window as any).axe !== 'undefined'
      })
    }
  }

  /**
   * Generate accessibility report
   */
  async generateReport() {
    const results = await this.checkA11y()
    
    const report = {
      url: this.page.url(),
      timestamp: new Date().toISOString(),
      summary: {
        violations: results.violations.length,
        passes: results.passes.length,
        incomplete: results.incomplete.length,
        inapplicable: results.inapplicable.length
      },
      violations: results.violations.map((violation: any) => ({
        id: violation.id,
        impact: violation.impact,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.length
      })),
      details: results.violations
    }

    return report
  }
}

/**
 * Create accessibility helper for a page
 */
export function createA11yHelper(page: Page) {
  return new AccessibilityHelper(page)
}

/**
 * Common accessibility test patterns
 */
export const a11yTestPatterns = {
  /**
   * Basic page accessibility check
   */
  async basicPageCheck(page: Page) {
    const helper = createA11yHelper(page)
    await helper.assertNoA11yViolations()
    await helper.checkHeadingStructure()
  },

  /**
   * Form accessibility check
   */
  async formCheck(page: Page) {
    const helper = createA11yHelper(page)
    await helper.checkFormAccessibility()
    await helper.assertNoA11yViolations({
      tags: ['wcag2a', 'wcag2aa']
    })
  },

  /**
   * Navigation accessibility check
   */
  async navigationCheck(page: Page) {
    const helper = createA11yHelper(page)
    await helper.checkKeyboardNavigation()
    await helper.checkARIA()
  }
}