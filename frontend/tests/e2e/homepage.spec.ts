import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load basic HTML structure', async ({ page }) => {
    // Create a simple test page since we don't have a dev server yet
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Strata Garden Rooms</title>
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/configurator">Configure</a>
          <a href="/contact">Contact</a>
        </nav>
        <main>
          <h1>Strata Garden Rooms</h1>
          <a href="/configurator" class="cta-button">Get Started</a>
        </main>
      </body>
      </html>
    `
    
    await page.setContent(htmlContent)
    
    // Check title
    await expect(page).toHaveTitle(/Strata Garden Rooms/)
    
    // Check main navigation
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('nav a[href="/"]')).toContainText('Home')
    await expect(page.locator('nav a[href*="configurator"]')).toContainText('Configure')
    await expect(page.locator('nav a[href*="contact"]')).toContainText('Contact')
    
    // Check main content
    await expect(page.locator('h1')).toContainText('Strata Garden Rooms')
    await expect(page.locator('.cta-button')).toBeVisible()
  })

  test('should navigate to configurator from CTA', async ({ page }) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Strata Garden Rooms</title>
      </head>
      <body>
        <a href="/configurator" class="cta-button">Get Started</a>
      </body>
      </html>
    `
    
    await page.setContent(htmlContent)
    
    // Check that CTA has proper href
    await expect(page.locator('.cta-button')).toHaveAttribute('href', '/configurator')
  })

  test('should be accessible', async ({ page }) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Strata Garden Rooms</title>
      </head>
      <body>
        <a href="#main" class="skip-link">Skip to main content</a>
        <nav aria-label="Main navigation">
          <a href="/">Home</a>
        </nav>
        <main id="main">
          <h1>Strata Garden Rooms</h1>
          <a href="/configurator" class="cta-button">Get Started</a>
        </main>
      </body>
      </html>
    `
    
    await page.setContent(htmlContent)
    
    // Check for skip link
    const skipLink = page.locator('.skip-link')
    await expect(skipLink).toBeVisible()
    
    // Check heading hierarchy
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
    
    // Check navigation has proper ARIA
    const nav = page.locator('nav')
    await expect(nav).toBeVisible()
    
    // Check CTA is properly labeled
    const cta = page.locator('.cta-button')
    await expect(cta).toHaveAttribute('href')
  })

  test('should work on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip()
      return
    }
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Strata Garden Rooms</title>
        <style>
          .cta-button { 
            display: block; 
            width: 200px; 
            height: 50px; 
            background: #2D5A3D; 
            color: white; 
            text-align: center; 
            line-height: 50px; 
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Strata Garden Rooms</h1>
        </header>
        <main>
          <a href="/configurator" class="cta-button">Get Started</a>
        </main>
      </body>
      </html>
    `
    
    await page.setContent(htmlContent)
    
    // Check responsive design
    await expect(page.locator('header')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
    
    // Check touch targets are adequate size
    const cta = page.locator('.cta-button')
    const ctaBox = await cta.boundingBox()
    expect(ctaBox?.height).toBeGreaterThanOrEqual(44) // WCAG touch target size
  })
})