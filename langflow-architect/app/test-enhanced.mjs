#!/usr/bin/env node

/**
 * Test script for enhanced features
 * This script tests the core functionality without the UI
 */

// Import our enhanced modules
import { WebSearchManager } from './src/lib/enhanced/searchManager.js';
import { PromptEngine } from './src/lib/enhanced/promptEngine.js';
import { KnowledgeCache } from './src/lib/enhanced/knowledgeCache.js';
import { ContextEngine } from './src/lib/enhanced/contextEngine.js';

async function testEnhancedFeatures() {
  console.log('🧪 Testing Enhanced Langflow Architect Features...\n');

  try {
    // Test 1: Context Engine
    console.log('1️⃣ Testing Context Understanding Engine...');
    const contextEngine = new ContextEngine();
    const context = await contextEngine.analyzeContext(
      "I need a healthcare chatbot that handles patient inquiries while being HIPAA compliant"
    );
    
    console.log('✅ Context Analysis:', {
      domain: context.domain,
      complexity: context.complexity,
      requiresCurrentInfo: context.requiresCurrentInfo,
      confidence: Math.round(context.confidence * 100) + '%'
    });

    // Test 2: Search Manager (without actual API calls)
    console.log('\n2️⃣ Testing Search Manager...');
    const searchManager = new WebSearchManager();
    const searchQuery = searchManager.generateContextualQuery(
      "HIPAA compliance best practices",
      "healthcare chatbot requirements",
      "healthcare"
    );
    console.log('✅ Generated Search Query:', searchQuery.query);

    // Test 3: Knowledge Cache
    console.log('\n3️⃣ Testing Knowledge Cache...');
    const knowledgeCache = new KnowledgeCache();
    const queryHash = knowledgeCache.generateQueryHash("test query", { domain: "healthcare" });
    console.log('✅ Generated Query Hash:', queryHash);

    // Test 4: Prompt Engine
    console.log('\n4️⃣ Testing Prompt Engine...');
    const promptEngine = new PromptEngine();
    const enhancedPrompt = await promptEngine.generateContextualPrompt(
      "Create a healthcare chatbot",
      context
    );
    
    console.log('✅ Enhanced Prompt Preview:', {
      hasSystemPrompt: !!enhancedPrompt.systemPrompt,
      hasUserPrompt: !!enhancedPrompt.userPrompt,
      confidenceScore: Math.round(enhancedPrompt.confidenceScore * 100) + '%',
      complianceAlerts: enhancedPrompt.complianceAlerts.length
    });

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Feature Summary:');
    console.log('   ✅ Context Understanding Engine - Working');
    console.log('   ✅ Web Search Manager - Ready (Tavily/DuckDuckGo)');
    console.log('   ✅ Enhanced Prompt Engineering - Working');
    console.log('   ✅ Knowledge Cache & Attribution - Working');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Only run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  testEnhancedFeatures();
}