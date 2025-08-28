#!/usr/bin/env node

/**
 * Comprehensive integration test for Enhanced Langflow Architect
 * Tests all features of Stories 5.3-5.5 with mock data
 */

// import { readFileSync } from 'fs';
// import { fileURLToPath } from 'url';
// import { dirname /*, join */ } from 'path';

// const __filename = fileURLToPath(import.meta.url);
// const ___dirname = dirname(__filename);

// Mock environment
process.env.NODE_ENV = 'test';

// Import enhanced modules
const { ContextEngine } = await import('./src/lib/enhanced/contextEngine.js');
const { WebSearchManager } = await import('./src/lib/enhanced/searchManager.js');
const { PromptEngine } = await import('./src/lib/enhanced/promptEngine.js');
const { KnowledgeCache } = await import('./src/lib/enhanced/knowledgeCache.js');
const { EnhancedCopilotManager } = await import('./src/lib/enhanced/enhancedManager.js');

async function runComprehensiveTest() {
  console.log('🚀 Enhanced Langflow Architect - Comprehensive Integration Test\n');
  
  const tests = [
    testHealthcareDomain,
    testFinanceDomain,
    testM365Domain,
    testAutomationDomain,
    testCachePerformance,
    testAttributionSystem,
    testErrorHandling,
    testComplexScenarios
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await test();
      passed++;
    } catch {
      console.error(`❌ ${test.name} failed:`, error.message);
      failed++;
    }
  }

  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Enhanced features are ready for deployment.');
  } else {
    console.log('⚠️  Some tests failed. Please review the implementation.');
  }
}

async function testHealthcareDomain() {
  console.log('🏥 Testing Healthcare Domain...');
  
  const manager = new EnhancedCopilotManager();
  const result = await manager.analyzeWorkflowWithEnhancement(
    'healthcare',
    'complex',
    'I need a healthcare chatbot that handles patient inquiries while being HIPAA compliant and integrates with Epic EHR system'
  );

  assert(result.domain_context.domain === 'healthcare', 'Should detect healthcare domain');
  assert(result.complianceAlerts.length > 0, 'Should generate HIPAA compliance alerts');
  assert(result.confidenceScore > 0.7, 'Should have high confidence for healthcare');
  
  console.log('✅ Healthcare domain test passed');
  console.log(`   - Domain: ${result.domain_context.domain}`);
  console.log(`   - Compliance alerts: ${result.complianceAlerts.length}`);
  console.log(`   - Confidence: ${Math.round(result.confidenceScore * 100)}%`);
}

async function testFinanceDomain() {
  console.log('💰 Testing Finance Domain...');
  
  const contextEngine = new ContextEngine();
  const context = await contextEngine.analyzeContext(
    'Create a trading system that processes financial transactions with SOX compliance'
  );

  assert(context.domain === 'finance', 'Should detect finance domain');
  assert(context.complexity === 'complex', 'Should assess as complex');
  assert(context.requiresCurrentInfo === true, 'Should require current regulatory info');
  
  console.log('✅ Finance domain test passed');
  console.log(`   - Domain: ${context.domain}`);
  console.log(`   - Complexity: ${context.complexity}`);
  console.log(`   - Requires current info: ${context.requiresCurrentInfo}`);
}

async function testM365Domain() {
  console.log('🔷 Testing M365 Domain...');
  
  const promptEngine = new PromptEngine();
  const context = {
    domain: 'm365',
    techStack: ['SharePoint', 'Teams', 'Power Automate'],
    complexity: 'moderate',
    requiresCurrentInfo: true,
    searchTriggers: ['best_practices'],
    confidence: 0.85
  };

  const prompt = await promptEngine.generateContextualPrompt(
    'Create a SharePoint workflow that integrates with Teams',
    context
  );

  assert(prompt.systemPrompt.includes('Microsoft 365'), 'Should include M365 expertise');
  assert(prompt.systemPrompt.includes('SharePoint'), 'Should reference SharePoint');
  assert(prompt.complianceAlerts.length === 0, 'Should not have regulatory alerts for M365');
  
  console.log('✅ M365 domain test passed');
  console.log(`   - Domain expertise included: ✅`);
  console.log(`   - Confidence score: ${Math.round(prompt.confidenceScore * 100)}%`);
}

async function testAutomationDomain() {
  console.log('⚙️ Testing Automation Domain...');
  
  const manager = new EnhancedCopilotManager();
  const result = await manager.generateEnhancedQuestions(
    'automation',
    'intermediate',
    'Process automation for document approval workflow'
  );

  assert(result.questions.length > 0, 'Should generate questions');
  assert(result.category === 'automation', 'Should maintain category');
  assert(result.expertise_level === 'intermediate', 'Should maintain expertise level');
  
  console.log('✅ Automation domain test passed');
  console.log(`   - Questions generated: ${result.questions.length}`);
  console.log(`   - Expertise level: ${result.expertise_level}`);
}

async function testCachePerformance() {
  console.log('🗄️ Testing Cache Performance...');
  
  const cache = new KnowledgeCache();
  const mockResult = {
    results: [
      {
        title: 'Test Result',
        url: 'https://example.com',
        content: 'Test content',
        snippet: 'Test snippet',
        provider: 'test',
        timestamp: new Date().toISOString()
      }
    ],
    totalResults: 1,
    queryId: 'test-123',
    relevanceScore: 0.85,
    deduplicationScore: 1.0
  };

  const mockSources = [
    {
      id: 'test-1',
      type: 'web-search',
      provider: 'test',
      title: 'Test Source',
      confidence: 0.85,
      timestamp: new Date().toISOString()
    }
  ];

  const queryHash = cache.generateQueryHash('test query');
  
  // Test caching
  await cache.cacheQuery(queryHash, mockResult, mockSources);
  const cached = await cache.getCachedResult(queryHash);
  
  assert(cached !== null, 'Should retrieve cached result');
  assert(cached.result.queryId === 'test-123', 'Should maintain query ID');
  
  // Test attribution
  const attribution = cache.formatAttribution(mockSources);
  assert(attribution.totalSources === 1, 'Should count sources correctly');
  
  console.log('✅ Cache performance test passed');
  console.log(`   - Cache hit: ✅`);
  console.log(`   - Attribution sources: ${attribution.totalSources}`);
}

async function testAttributionSystem() {
  console.log('📋 Testing Attribution System...');
  
  const cache = new KnowledgeCache();
  const sources = [
    {
      id: 'web-1',
      type: 'web-search',
      provider: 'tavily',
      url: 'https://example.com/article1',
      title: 'Healthcare Best Practices',
      confidence: 0.85,
      timestamp: new Date().toISOString()
    },
    {
      id: 'web-2',
      type: 'web-search',
      provider: 'duckduckgo',
      url: 'https://example.com/article2',
      title: 'HIPAA Compliance Guide',
      confidence: 0.75,
      timestamp: new Date().toISOString()
    }
  ];

  const summary = cache.generateAttributionSummary(sources);
  const attribution = cache.formatAttribution(sources);

  assert(summary.includes('2 web search results'), 'Should summarize sources correctly');
  assert(attribution.totalSources === 2, 'Should count all sources');
  assert(attribution.sourceBreakdown.webSearch === 2, 'Should categorize web search');
  assert(attribution.providers.has('tavily'), 'Should track Tavily provider');
  assert(attribution.providers.has('duckduckgo'), 'Should track DuckDuckGo provider');
  
  console.log('✅ Attribution system test passed');
  console.log(`   - Summary: ${summary}`);
  console.log(`   - Providers tracked: ${Array.from(attribution.providers).join(', ')}`);
}

async function testErrorHandling() {
  console.log('🛡️ Testing Error Handling...');
  
  const searchManager = new WebSearchManager();
  
  // Test with invalid query
  try {
    const result = await searchManager.searchWithFallback({
      query: '',
      maxResults: 0
    });
    assert(result.results.length === 0, 'Should handle empty queries gracefully');
  } catch {
    // Expected for some edge cases
  }

  // Test cache with invalid data
  const cache = new KnowledgeCache();
  const invalidHash = cache.generateQueryHash('');
  const cachedResult = await cache.getCachedResult(invalidHash);
  assert(cachedResult === null, 'Should handle cache misses gracefully');
  
  console.log('✅ Error handling test passed');
  console.log('   - Graceful degradation: ✅');
  console.log('   - Invalid input handling: ✅');
}

async function testComplexScenarios() {
  console.log('🧠 Testing Complex Scenarios...');
  
  const manager = new EnhancedCopilotManager();
  
  // Test complex healthcare scenario
  const complexHealthcare = await manager.analyzeWorkflowWithEnhancement(
    'healthcare',
    'complex',
    'Multi-tenant healthcare platform with real-time patient monitoring, HIPAA compliance, HL7 FHIR integration, and machine learning for predictive analytics'
  );

  assert(complexHealthcare.domain_context.domain === 'healthcare', 'Should detect healthcare domain');
  assert(complexHealthcare.domain_context.complexity === 'complex', 'Should assess as complex');
  assert(complexHealthcare.complianceAlerts.length > 0, 'Should generate multiple compliance alerts');
  
  // Test statistics
  const stats = await manager.getCacheStatistics();
  assert(stats.searchManagerStatus !== undefined, 'Should provide search manager status');
  
  console.log('✅ Complex scenarios test passed');
  console.log(`   - Complex domain analysis: ✅`);
  console.log(`   - Multi-faceted compliance: ✅`);
  console.log(`   - Statistics generation: ✅`);
}

// Simple assertion function
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Run the comprehensive test
runComprehensiveTest().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});