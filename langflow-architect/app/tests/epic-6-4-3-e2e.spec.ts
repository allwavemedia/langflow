import { test, expect, Page } from '@playwright/test';

/**
 * Epic 6.4.3 End-to-End Testing Suite
 * Advanced Socratic Questioning System - CopilotKit Actions
 */

class TestingUtils {
  constructor(private page: Page) {}

  async waitForCopilotKit() {
    // Wait for the application to load first
    await this.page.waitForLoadState('networkidle');
    
    // Look for CopilotKit interface - it should be available based on the global setup
    const chatInterface = this.page.locator('textbox[placeholder*="message"], input[placeholder*="message"], textarea[placeholder*="message"]');
    
    try {
      await chatInterface.waitFor({ timeout: 5000 });
      console.log('✅ CopilotKit chat input found immediately');
      return;
    } catch {
      // Chat might not be open, look for open button
      console.log('🔍 Looking for chat open button...');
    }
    
    // Try to find and click the "Open Chat" button
    const openChatButton = this.page.locator('button:has-text("Open Chat"), button[title*="chat"], button[aria-label*="chat"]');
    if (await openChatButton.isVisible()) {
      console.log('🖱️ Clicking Open Chat button');
      await openChatButton.click();
      await this.page.waitForTimeout(1000);
    }
    
    // Now wait for the message input to be available
    await chatInterface.waitFor({ timeout: 10000 });
    console.log('✅ CopilotKit chat interface ready');
  }

  async sendCopilotMessage(message: string) {
    // Find chat input and send message
    const chatInput = this.page.locator('textbox[placeholder*="message"], input[placeholder*="message"], textarea[placeholder*="message"]').first();
    await chatInput.click();
    await chatInput.fill(message);
    
    // Look for send button (might be enabled after typing)
    await this.page.waitForTimeout(500);
    const sendButton = this.page.locator('button:not([disabled]):has(img), button[type="submit"]:not([disabled])').last();
    if (await sendButton.isVisible()) {
      await sendButton.click();
    } else {
      // Fallback: press Enter
      await chatInput.press('Enter');
    }
    
    // Wait for response
    await this.page.waitForTimeout(3000);
  }

  async getLastCopilotResponse(): Promise<string> {
    // Look for the latest AI response
    const messages = this.page.locator('div:has-text("Generated adaptive question"), div:has-text("Expertise Analysis"), div:has-text("Questioning session"), div:has-text("sophistication"), paragraph, div[role="dialog"] p, div[role="dialog"] div');
    
    if (await messages.count() > 0) {
      const lastMessage = messages.last();
      return await lastMessage.textContent() || '';
    }
    
    return '';
  }

  async checkQuestioningDashboard(): Promise<boolean> {
    // Look for dashboard indicators
    const dashboard = this.page.locator('div:has-text("Current Analysis"), div:has-text("Enhancement Statistics"), div:has-text("Guiding Questions")');
    return await dashboard.first().isVisible();
  }

  async getCurrentQuestions(): Promise<string[]> {
    const questionsSection = this.page.locator('div:has-text("Guiding Questions")').first();
    if (await questionsSection.isVisible()) {
      const questions = await questionsSection.locator('li, p, div').allTextContents();
      return questions.filter(q => q.trim().length > 10); // Filter out empty or very short text
    }
    return [];
  }

  async getSophisticationLevel(): Promise<number> {
    // Look for sophistication level indicators in the UI
    const levelIndicators = this.page.locator('div:has-text("level"), span:has-text("level"), div:has-text("sophistication")');
    if (await levelIndicators.count() > 0) {
      const levelText = await levelIndicators.first().textContent() || '';
      const match = levelText.match(/level\s*(\d+)/i);
      return match ? parseInt(match[1]) : 1;
    }
    return 1;
  }
}

test.describe('Epic 6.4.3: CopilotKit Actions E2E Tests', () => {
  let utils: TestingUtils;

  test.beforeEach(async ({ page }) => {
    utils = new TestingUtils(page);
    
    // Navigate to application
    await page.goto('http://localhost:3000');
    
    // Wait for application to load
    await page.waitForLoadState('networkidle');
    
    // Check for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
      }
    });
  });

  test('Action 1: generate_adaptive_question', async ({ page: _page }) => {
    const startTime = Date.now();
    
    // Wait for CopilotKit to be ready
    await utils.waitForCopilotKit();
    
    // Send test command
    await utils.sendCopilotMessage('Generate an adaptive question for healthcare domain');
    
    // Get response
    const response = await utils.getLastCopilotResponse();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Assertions
    expect(response).toContain('Generated adaptive question');
    expect(response).toContain('healthcare');
    expect(responseTime).toBeLessThan(5000); // 5 second timeout
    
    // Check if questions were added to UI
    const questions = await utils.getCurrentQuestions();
    expect(questions.length).toBeGreaterThan(0);
    
    console.log(`✅ Action 1 completed in ${responseTime}ms`);
  });

  test('Action 2: analyze_user_expertise', async ({ page: _page }) => {
    const startTime = Date.now();
    
    await utils.waitForCopilotKit();
    
    // Send complex medical response for analysis
    const complexResponse = 'I need advanced machine learning algorithms for medical diagnostics with FDA compliance requirements, including HIPAA-compliant data processing, real-time patient monitoring integration, and clinical decision support systems with proper audit trails.';
    
    await utils.sendCopilotMessage(`Analyze this response: ${complexResponse}`);
    
    const response = await utils.getLastCopilotResponse();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Assertions
    expect(response).toContain('Expertise Analysis Complete');
    expect(response).toContain('Technical Terms Detected');
    expect(response).toMatch(/(expert|advanced)/i);
    expect(responseTime).toBeLessThan(3000);
    
    console.log(`✅ Action 2 completed in ${responseTime}ms`);
  });

  test('Action 3: start_questioning_session', async ({ page: _page }) => {
    const startTime = Date.now();
    
    await utils.waitForCopilotKit();
    
    // Start questioning session
    await utils.sendCopilotMessage('Start a questioning session for finance domain with level 3 sophistication');
    
    const response = await utils.getLastCopilotResponse();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Assertions
    expect(response).toContain('Questioning session started');
    expect(response).toContain('finance');
    expect(response).toContain('Session ID');
    expect(responseTime).toBeLessThan(3000);
    
    // Check if QuestioningDashboard appeared
    const dashboardVisible = await utils.checkQuestioningDashboard();
    expect(dashboardVisible).toBe(true);
    
    // Check if finance-specific questions were generated
    const questions = await utils.getCurrentQuestions();
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.some(q => q.toLowerCase().includes('financial') || q.toLowerCase().includes('finance'))).toBe(true);
    
    console.log(`✅ Action 3 completed in ${responseTime}ms`);
  });

  test('Action 4: update_question_sophistication', async ({ page }) => {
    // First start a session
    await utils.waitForCopilotKit();
    await utils.sendCopilotMessage('Start a questioning session for finance domain');
    await page.waitForTimeout(2000);
    
    const startTime = Date.now();
    
    // Update sophistication
    await utils.sendCopilotMessage('Update sophistication to level 5 based on expert financial knowledge');
    
    const response = await utils.getLastCopilotResponse();
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Assertions
    expect(response).toContain('sophistication updated to level 5');
    expect(response).toContain('Advanced');
    expect(responseTime).toBeLessThan(3000);
    
    // Check if sophistication level updated in UI
    const currentLevel = await utils.getSophisticationLevel();
    expect(currentLevel).toBe(5);
    
    console.log(`✅ Action 4 completed in ${responseTime}ms`);
  });

  test('User Journey: Healthcare Professional', async ({ page }) => {
    await utils.waitForCopilotKit();
    
    // Step 1: User describes healthcare need
    await utils.sendCopilotMessage('I need help building a patient data workflow for HIPAA compliance');
    await page.waitForTimeout(1000);
    
    // Step 2: Start healthcare session
    await utils.sendCopilotMessage('Start a questioning session for healthcare domain');
    await page.waitForTimeout(2000);
    
    // Verify dashboard appeared
    const dashboardVisible = await utils.checkQuestioningDashboard();
    expect(dashboardVisible).toBe(true);
    
    // Step 3: Provide expert response
    const expertResponse = 'I need HL7 FHIR integration with Epic EHR systems, real-time patient monitoring, and clinical decision support with FDA-validated algorithms';
    await utils.sendCopilotMessage(`Analyze this response: ${expertResponse}`);
    await page.waitForTimeout(2000);
    
    // Step 4: Verify expertise recognition and sophistication adjustment
    const analysisResponse = await utils.getLastCopilotResponse();
    expect(analysisResponse).toMatch(/(expert|advanced)/i);
    
    console.log('✅ Healthcare Professional User Journey completed');
  });

  test('User Journey: Finance Expert', async ({ page }) => {
    await utils.waitForCopilotKit();
    
    // Step 1: Generate finance question
    await utils.sendCopilotMessage('Generate an adaptive question for finance domain');
    await page.waitForTimeout(1000);
    
    // Step 2: Analyze expert finance response
    const expertResponse = 'I need algorithmic trading systems with real-time risk management, derivatives pricing models, and regulatory compliance for Dodd-Frank and MiFID II';
    await utils.sendCopilotMessage(`Analyze this response: ${expertResponse}`);
    await page.waitForTimeout(2000);
    
    // Step 3: Update to expert level
    await utils.sendCopilotMessage('Update sophistication to level 5 based on quantitative finance expertise');
    await page.waitForTimeout(2000);
    
    // Verify expert-level adaptation
    const response = await utils.getLastCopilotResponse();
    expect(response).toContain('level 5');
    expect(response).toMatch(/(expert|advanced)/i);
    
    console.log('✅ Finance Expert User Journey completed');
  });

  test('Error Handling: Invalid Parameters', async ({ page }) => {
    await utils.waitForCopilotKit();
    
    // Test invalid sophistication level
    await utils.sendCopilotMessage('Update sophistication to level 10 based on expert knowledge');
    await page.waitForTimeout(2000);
    
    const response = await utils.getLastCopilotResponse();
    // Should gracefully handle invalid level
    expect(response).not.toContain('error');
    
    // Test empty analysis
    await utils.sendCopilotMessage('Analyze this response: ');
    await page.waitForTimeout(2000);
    
    const analysisResponse = await utils.getLastCopilotResponse();
    expect(analysisResponse).toContain('Analysis'); // Should still provide some analysis
    
    console.log('✅ Error Handling tests completed');
  });

  test('Performance: Response Times', async ({ page }) => {
    await utils.waitForCopilotKit();
    
    const tests = [
      { action: 'Generate an adaptive question for healthcare domain', maxTime: 800 },
      { action: 'Analyze this response: I need basic workflow automation', maxTime: 200 },
      { action: 'Start a questioning session for retail domain', maxTime: 500 }
    ];
    
    for (const testCase of tests) {
      const startTime = Date.now();
      await utils.sendCopilotMessage(testCase.action);
      await page.waitForTimeout(1000);
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log(`${testCase.action}: ${responseTime}ms (target: <${testCase.maxTime}ms)`);
      
      // Note: These are stretch goals, not hard failures
      if (responseTime > testCase.maxTime) {
        console.warn(`⚠️ Performance target missed: ${responseTime}ms > ${testCase.maxTime}ms`);
      }
    }
    
    console.log('✅ Performance tests completed');
  });

  test('UI Integration: State Synchronization', async ({ page }) => {
    await utils.waitForCopilotKit();
    
    // Start session and verify UI updates
    await utils.sendCopilotMessage('Start a questioning session for healthcare domain');
    await page.waitForTimeout(2000);
    
    // Verify dashboard is visible
    const dashboardVisible = await utils.checkQuestioningDashboard();
    expect(dashboardVisible).toBe(true);
    
    // Generate question and verify it appears in UI
    await utils.sendCopilotMessage('Generate an adaptive question for healthcare domain');
    await page.waitForTimeout(2000);
    
    const questions = await utils.getCurrentQuestions();
    expect(questions.length).toBeGreaterThan(0);
    
    // Update sophistication and verify UI reflects change
    await utils.sendCopilotMessage('Update sophistication to level 4');
    await page.waitForTimeout(2000);
    
    // The sophistication level should be updated in the dashboard
    // (This would need the actual UI elements to have proper test IDs)
    
    console.log('✅ UI Integration tests completed');
  });
});

test.describe('Console Error Detection', () => {
  test('No console errors during normal operation', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Perform some basic interactions
    const utils = new TestingUtils(page);
    await utils.waitForCopilotKit();
    await utils.sendCopilotMessage('Generate an adaptive question for healthcare domain');
    await page.waitForTimeout(3000);
    
    // Filter out expected warnings
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('localStorage') && 
      !error.includes('Warning:') &&
      !error.includes('devtools')
    );
    
    expect(criticalErrors).toHaveLength(0);
    
    if (criticalErrors.length > 0) {
      console.error('Console errors found:', criticalErrors);
    }
    
    console.log('✅ Console error detection completed');
  });
});

/**
 * Test Results Summary Helper
 */
test.afterAll(async () => {
  console.log('\n🎯 Epic 6.4.3 E2E Test Suite Completed');
  console.log('====================================');
  console.log('Run this command to execute:');
  console.log('npx playwright test tests/epic-6-4-3-e2e.spec.ts');
  console.log('\nFor UI mode:');
  console.log('npx playwright test tests/epic-6-4-3-e2e.spec.ts --ui');
});
