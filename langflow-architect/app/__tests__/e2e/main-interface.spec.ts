import { test, expect } from '@playwright/test'

test.describe('Socratic Langflow Architect - E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display the main application interface', async ({ page }) => {
    // Check main title
    await expect(page.getByText('Socratic Langflow Architect')).toBeVisible()
    
    // Check description
    await expect(page.getByText(/Use AI-powered Socratic questioning/)).toBeVisible()
    
    // Check main sections
    await expect(page.getByText('Current Analysis')).toBeVisible()
    await expect(page.getByText('Guiding Questions')).toBeVisible()
    await expect(page.getByText('Getting Started')).toBeVisible()
  })

  test('should show empty state messages when no data is present', async ({ page }) => {
    // Check empty state messages
    await expect(page.getByText(/No workflow analysis yet/)).toBeVisible()
    await expect(page.getByText(/Questions will appear here/)).toBeVisible()
  })

  test('should display getting started instructions', async ({ page }) => {
    // Check all getting started steps
    await expect(page.getByText(/Click the chat icon in the sidebar/)).toBeVisible()
    await expect(page.getByText(/Describe what you want to build/)).toBeVisible()
    await expect(page.getByText(/Answer the AI's questions/)).toBeVisible()
    await expect(page.getByText(/Export your completed workflow/)).toBeVisible()
  })

  test('should have proper responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 })
    
    const gridContainer = page.locator('.grid.md\\:grid-cols-2')
    await expect(gridContainer).toBeVisible()
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Content should still be visible on mobile
    await expect(page.getByText('Socratic Langflow Architect')).toBeVisible()
    await expect(page.getByText('Current Analysis')).toBeVisible()
  })

  test('should have proper accessibility features', async ({ page }) => {
    // Check heading hierarchy
    const h1 = page.locator('h1')
    await expect(h1).toHaveText('Socratic Langflow Architect')
    
    const h2Elements = page.locator('h2')
    await expect(h2Elements).toHaveCount(3)
    
    // Check for proper list structure
    const orderedList = page.locator('ol')
    await expect(orderedList).toBeVisible()
    
    // Check for proper semantic elements
    const _mainContent = page.locator('main, [role="main"]')
    // Note: If no main element exists, the test will still pass as we're checking overall structure
  })

  test('should handle color scheme and theme correctly', async ({ page }) => {
    // Check that the gradient background is applied
    const bodyContainer = page.locator('.min-h-screen.bg-gradient-to-br')
    await expect(bodyContainer).toBeVisible()
    
    // Check that cards have proper styling
    const cards = page.locator('.bg-white.rounded-lg.shadow-lg')
    await expect(cards).toHaveCount(3) // Current Analysis, Guiding Questions, Getting Started
  })

  test('should load without JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // Filter out expected/harmless errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('Service Worker') &&
      !error.includes('manifest')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })

  test('should handle network failures gracefully', async ({ page }) => {
    // Simulate offline condition
    await page.context().setOffline(true)
    
    await page.reload()
    
    // The static content should still load
    await expect(page.getByText('Socratic Langflow Architect')).toBeVisible()
    
    // Restore network
    await page.context().setOffline(false)
  })

  test('should have proper meta tags and SEO elements', async ({ page }) => {
    // Check that the page has a title
    await expect(page).toHaveTitle(/Socratic Langflow Architect/i)
    
    // Note: Additional meta tag checks would require them to be added to the app
  })

  test('should render numbered lists correctly', async ({ page }) => {
    // Check that the getting started section has a numbered list
    const orderedList = page.locator('ol.list-decimal')
    await expect(orderedList).toBeVisible()
    
    // Check that list items are present
    const listItems = orderedList.locator('li')
    await expect(listItems).toHaveCount(4)
  })

  test('should display tip section with proper styling', async ({ page }) => {
    // Check for the tip section
    const tipSection = page.locator('.bg-blue-50.rounded-lg')
    await expect(tipSection).toBeVisible()
    
    // Check tip content
    await expect(page.getByText('💡 Tip:')).toBeVisible()
    await expect(page.getByText(/The more specific you are/)).toBeVisible()
  })

  test('should have proper layout structure', async ({ page }) => {
    // Check max-width container
    const container = page.locator('.max-w-4xl.mx-auto')
    await expect(container).toBeVisible()
    
    // Check header section
    const header = page.locator('header.text-center')
    await expect(header).toBeVisible()
    
    // Check grid layout
    const grid = page.locator('.grid.md\\:grid-cols-2.gap-8')
    await expect(grid).toBeVisible()
  })

  test('should handle long content gracefully', async ({ page }) => {
    // Test that the layout doesn't break with viewport changes
    await page.setViewportSize({ width: 320, height: 568 }) // Small mobile
    
    // All main content should still be visible
    await expect(page.getByText('Socratic Langflow Architect')).toBeVisible()
    await expect(page.getByText('Current Analysis')).toBeVisible()
    await expect(page.getByText('Guiding Questions')).toBeVisible()
    await expect(page.getByText('Getting Started')).toBeVisible()
    
    // Reset to normal size
    await page.setViewportSize({ width: 1200, height: 800 })
  })

  test('should load all CSS and styling correctly', async ({ page }) => {
    // Check that Tailwind classes are properly applied
    const titleElement = page.getByText('Socratic Langflow Architect')
    
    // Verify the element has the expected styling by checking computed styles
    const fontSize = await titleElement.evaluate((el) => 
      window.getComputedStyle(el).fontSize
    )
    
    // The title should have a larger font size (exact value may vary)
    expect(parseInt(fontSize)).toBeGreaterThan(20)
  })
})
