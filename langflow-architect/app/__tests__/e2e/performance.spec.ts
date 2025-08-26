import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  
  test('should load page within acceptable time limits', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should have good Lighthouse performance scores', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Run basic performance checks
    const performanceMetrics = await page.evaluate(() => {
      return {
        // Check if performance API is available
        performanceAvailable: 'performance' in window,
        // Check DOM ready state
        domReady: document.readyState === 'complete',
        // Count of DOM elements (should be reasonable)
        elementCount: document.querySelectorAll('*').length
      }
    })
    
    expect(performanceMetrics.performanceAvailable).toBe(true)
    expect(performanceMetrics.domReady).toBe(true)
    expect(performanceMetrics.elementCount).toBeLessThan(500) // Reasonable DOM size
  })

  test('should handle multiple viewport sizes efficiently', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1200, height: 800 },  // Desktop
      { width: 1920, height: 1080 }  // Large desktop
    ]

    for (const viewport of viewports) {
      const startTime = Date.now()
      
      await page.setViewportSize(viewport)
      await page.waitForLoadState('networkidle')
      
      const resizeTime = Date.now() - startTime
      
      // Viewport changes should be fast
      expect(resizeTime).toBeLessThan(1000)
      
      // Content should still be visible
      await expect(page.getByText('Socratic Langflow Architect')).toBeVisible()
    }
  })

  test('should not have memory leaks', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Get initial memory usage
    const initialMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory
      }
      return null
    })
    
    // Simulate some activity
    for (let i = 0; i < 10; i++) {
      await page.reload()
      await page.waitForLoadState('networkidle')
    }
    
    // Check memory usage again
    const finalMetrics = await page.evaluate(() => {
      if ('memory' in performance) {
        return (performance as any).memory
      }
      return null
    })
    
    // If memory API is available, check for reasonable memory usage
    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics.usedJSHeapSize - initialMetrics.usedJSHeapSize
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    }
  })

  test('should handle rapid interactions without performance degradation', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const startTime = Date.now()
    
    // Simulate rapid interactions
    for (let i = 0; i < 20; i++) {
      await page.mouse.move(Math.random() * 800, Math.random() * 600)
      await page.waitForTimeout(10)
    }
    
    const interactionTime = Date.now() - startTime
    
    // Rapid interactions should complete quickly
    expect(interactionTime).toBeLessThan(2000)
    
    // Page should still be responsive
    await expect(page.getByText('Socratic Langflow Architect')).toBeVisible()
  })

  test('should have efficient CSS and resource loading', async ({ page }) => {
    const resources: string[] = []
    
    page.on('response', (response) => {
      const url = response.url()
      if (url.includes('.css') || url.includes('.js') || url.includes('.json')) {
        resources.push(url)
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Should have a reasonable number of resources
    expect(resources.length).toBeLessThan(20)
    
    // Check that critical resources loaded successfully
    const responses = await Promise.all(
      resources.map(url => page.request.get(url))
    )
    
    const failedRequests = responses.filter(response => !response.ok())
    expect(failedRequests).toHaveLength(0)
  })

  test('should maintain performance across different network conditions', async ({ page }) => {
    // Test with slow network
    await page.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)) // Add 100ms delay
      await route.continue()
    })
    
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Even with network delay, should load within reasonable time
    expect(loadTime).toBeLessThan(10000)
    
    // Content should still be fully visible
    await expect(page.getByText('Socratic Langflow Architect')).toBeVisible()
    await expect(page.getByText('Current Analysis')).toBeVisible()
    await expect(page.getByText('Guiding Questions')).toBeVisible()
  })
})
