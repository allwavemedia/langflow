import { chromium, FullConfig } from '@playwright/test';

/**
 * Global setup for Epic 6.4.3 E2E Tests
 * Ensures CopilotKit and application are ready before testing
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting Epic 6.4.3 E2E Test Setup...');
  
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log(`🌐 Navigating to ${baseURL}...`);
    await page.goto(baseURL || 'http://localhost:3000');
    
    // Wait for application to load
    await page.waitForLoadState('networkidle');
    console.log('✅ Application loaded successfully');
    
    // Check for critical console errors during startup
    const criticalErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('Warning:')) {
        criticalErrors.push(msg.text());
      }
    });
    
    // Wait a bit to catch any startup errors
    await page.waitForTimeout(3000);
    
    if (criticalErrors.length > 0) {
      console.warn('⚠️ Console errors detected during startup:', criticalErrors);
    } else {
      console.log('✅ No critical console errors detected');
    }
    
    // Try to locate CopilotKit components (adjust selector as needed)
    try {
      await page.waitForSelector('[data-testid="copilot-chat"], .copilotkit-chat, [class*="copilot"]', { 
        timeout: 5000 
      });
      console.log('✅ CopilotKit interface detected');
    } catch {
      console.warn('⚠️ CopilotKit interface not immediately visible - tests will need to wait');
    }
    
    console.log('🎯 Epic 6.4.3 test environment ready!');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
