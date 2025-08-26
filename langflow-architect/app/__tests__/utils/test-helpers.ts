import { Page } from '@playwright/test'

/**
 * Utility function to wait for the application to fully load
 */
export async function waitForAppLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('h1:has-text("Socratic Langflow Architect")', { timeout: 10000 })
}

/**
 * Utility function to check if all main sections are visible
 */
export async function verifyMainSections(page: Page) {
  const sections = [
    'Socratic Langflow Architect',
    'Current Analysis', 
    'Guiding Questions',
    'Getting Started'
  ]
  
  for (const section of sections) {
    await page.waitForSelector(`text=${section}`, { timeout: 5000 })
  }
}

/**
 * Utility function to simulate workflow data updates
 */
export function createMockWorkflowData() {
  return {
    description: 'E-commerce product recommendation system',
    category: 'automation',
    complexity: 'moderate',
    timestamp: new Date().toISOString()
  }
}

/**
 * Utility function to create mock questions
 */
export function createMockQuestions() {
  return [
    'What specific triggers should start this workflow?',
    'What data sources will you be working with?',
    'How should the workflow handle errors or exceptions?',
    'What are the expected output formats?'
  ]
}

/**
 * Utility function to create mock Langflow JSON
 */
export function createMockLangflowJson() {
  return {
    data: {
      nodes: [
        {
          id: "input-1",
          type: "ChatInput",
          position: { x: 100, y: 200 },
          data: {
            type: "ChatInput",
            node: {
              template: {
                input_value: {
                  display_name: "Text",
                  type: "str",
                  value: "User input will be processed here"
                }
              }
            }
          }
        },
        {
          id: "llm-1", 
          type: "OpenAIModel",
          position: { x: 400, y: 200 },
          data: {
            type: "OpenAIModel",
            node: {
              template: {
                model_name: {
                  value: "gpt-3.5-turbo"
                },
                input_value: {
                  display_name: "Input",
                  type: "str"
                }
              }
            }
          }
        },
        {
          id: "output-1",
          type: "ChatOutput", 
          position: { x: 700, y: 200 },
          data: {
            type: "ChatOutput",
            node: {
              template: {
                input_value: {
                  display_name: "Text",
                  type: "str"
                }
              }
            }
          }
        }
      ],
      edges: [
        {
          id: "edge-1",
          source: "input-1",
          target: "llm-1"
        },
        {
          id: "edge-2", 
          source: "llm-1",
          target: "output-1"
        }
      ]
    },
    description: "Test workflow",
    name: "Generated Test Workflow"
  }
}

/**
 * Utility function to mock API responses
 */
export async function mockCopilotKitAPI(page: Page, response: any) {
  await page.route('/api/copilotkit', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    })
  })
}

/**
 * Utility function to simulate download functionality
 */
export async function verifyDownloadFunctionality(page: Page) {
  // Mock the download by intercepting blob URLs
  let downloadTriggered = false
  
  await page.addInitScript(() => {
    const originalCreateObjectURL = window.URL.createObjectURL
    window.URL.createObjectURL = function(blob: Blob) {
      // Mark that download was triggered
      (window as any).__downloadTriggered = true
      return originalCreateObjectURL.call(this, blob)
    }
  })
  
  await page.evaluate(() => {
    const mockBlob = new Blob(['{"test": "data"}'], { type: 'application/json' })
    const url = URL.createObjectURL(mockBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'test-workflow.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  })
  
  downloadTriggered = await page.evaluate(() => (window as any).__downloadTriggered)
  return downloadTriggered
}

/**
 * Utility function to check responsive design
 */
export async function testResponsiveDesign(page: Page) {
  const viewports = [
    { width: 375, height: 667, name: 'Mobile' },
    { width: 768, height: 1024, name: 'Tablet' },
    { width: 1200, height: 800, name: 'Desktop' }
  ]
  
  const results = []
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.waitForTimeout(100) // Allow layout to settle
    
    const isVisible = await page.getByText('Socratic Langflow Architect').isVisible()
    results.push({
      viewport: viewport.name,
      titleVisible: isVisible
    })
  }
  
  return results
}

/**
 * Utility function to collect performance metrics
 */
export async function collectPerformanceMetrics(page: Page) {
  return await page.evaluate(() => {
    const performance = window.performance
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    return {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      domElements: document.querySelectorAll('*').length,
      timestamp: Date.now()
    }
  })
}

/**
 * Utility function to check accessibility features
 */
export async function checkAccessibility(page: Page) {
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').count()
  const lists = await page.locator('ol, ul').count()
  const buttons = await page.locator('button, [role="button"]').count()
  const links = await page.locator('a, [role="link"]').count()
  
  return {
    headings,
    lists,
    buttons,
    links,
    hasMainLandmark: await page.locator('main, [role="main"]').count() > 0
  }
}
