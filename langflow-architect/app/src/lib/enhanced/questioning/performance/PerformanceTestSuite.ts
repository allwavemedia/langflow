/**
 * Performance Testing Suite
 * Epic 6.4.3 Story 1.3 - Task 6
 * 
 * Validates performance requirements:
 * - <20% memory increase
 * - <200ms additional processing time  
 * - <3s response maintenance
 */

import { performance } from 'perf_hooks';
import { DynamicExpertiseTracker } from '../expertiseTracker';
import { DynamicProgressiveDisclosure } from '../progressiveDisclosure';
import { ConversationMemoryManager } from '../conversationMemory';
import { AdaptationEngine } from '../adaptationEngineV2';
import { 
  UserResponse, 
  AdaptiveQuestion, 
  ExpertiseLevel,
  SophisticationLevel 
} from '../questionTypes';
import { DomainContext } from '../../domainDetectionSystem';

interface PerformanceMetrics {
  memoryUsage: {
    baseline: number;
    withSystem: number;
    increasePercent: number;
  };
  processingTime: {
    expertiseTracking: number;
    progressiveDisclosure: number;
    conversationMemory: number;
    adaptationEngine: number;
    total: number;
  };
  responseMaintenanceTime: number;
  throughput: {
    responsesPerSecond: number;
    questionsProcessedPerMinute: number;
  };
}

interface PerformanceTestConfig {
  iterations: number;
  warmupRounds: number;
  memoryCheckInterval: number;
  maxTestDuration: number; // milliseconds
}

const DEFAULT_CONFIG: PerformanceTestConfig = {
  iterations: 100,
  warmupRounds: 10,
  memoryCheckInterval: 10,
  maxTestDuration: 30000 // 30 seconds
};

export class PerformanceTestSuite {
  private expertiseTracker: DynamicExpertiseTracker;
  private progressiveDisclosure: DynamicProgressiveDisclosure;
  private conversationMemory: ConversationMemoryManager;
  private adaptationEngine: AdaptationEngine;
  private baselineMemory: number = 0;

  constructor() {
    this.expertiseTracker = new DynamicExpertiseTracker();
    this.progressiveDisclosure = new DynamicProgressiveDisclosure();
    this.conversationMemory = new ConversationMemoryManager();
    this.adaptationEngine = new AdaptationEngine(
      this.expertiseTracker,
      this.progressiveDisclosure,
      this.conversationMemory
    );
  }

  /**
   * Run comprehensive performance test suite
   */
  async runFullTestSuite(config: Partial<PerformanceTestConfig> = {}): Promise<PerformanceMetrics> {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    
    console.log('🚀 Starting Performance Test Suite for Epic 6.4.3 Story 1.3');
    console.log(`Configuration: ${JSON.stringify(finalConfig, null, 2)}`);

    // 1. Establish baseline memory usage
    await this.establishBaseline();

    // 2. Warmup rounds
    await this.runWarmupRounds(finalConfig.warmupRounds);

    // 3. Main performance tests
    const metrics = await this.runPerformanceTests(finalConfig);

    // 4. Validate against requirements
    this.validateRequirements(metrics);

    return metrics;
  }

  /**
   * Establish baseline memory usage without any processing
   */
  private async establishBaseline(): Promise<void> {
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    // Wait for memory to stabilize
    await this.sleep(100);
    
    this.baselineMemory = process.memoryUsage().heapUsed;
    console.log(`📊 Baseline memory usage: ${this.formatBytes(this.baselineMemory)}`);
  }

  /**
   * Run warmup rounds to stabilize JIT compilation
   */
  private async runWarmupRounds(rounds: number): Promise<void> {
    console.log(`🔥 Running ${rounds} warmup rounds...`);
    
    for (let i = 0; i < rounds; i++) {
      await this.processSingleScenario();
    }
    
    console.log('✅ Warmup complete');
  }

  /**
   * Run main performance tests
   */
  private async runPerformanceTests(config: PerformanceTestConfig): Promise<PerformanceMetrics> {
    const processingTimes: number[] = [];
    const componentTimes = {
      expertiseTracking: [] as number[],
      progressiveDisclosure: [] as number[],
      conversationMemory: [] as number[],
      adaptationEngine: [] as number[]
    };
    
    let maxMemoryUsage = this.baselineMemory;
    const startTime = performance.now();
    
    console.log(`⚡ Running ${config.iterations} performance test iterations...`);

    for (let i = 0; i < config.iterations; i++) {
      const iterationStart = performance.now();
      
      // Run single scenario with detailed timing
      const componentTimings = await this.processSingleScenarioWithTiming();
      
      const iterationTime = performance.now() - iterationStart;
      processingTimes.push(iterationTime);
      
      // Store component timings
      componentTimes.expertiseTracking.push(componentTimings.expertiseTracking);
      componentTimes.progressiveDisclosure.push(componentTimings.progressiveDisclosure);
      componentTimes.conversationMemory.push(componentTimings.conversationMemory);
      componentTimes.adaptationEngine.push(componentTimings.adaptationEngine);

      // Check memory usage periodically
      if (i % config.memoryCheckInterval === 0) {
        const currentMemory = process.memoryUsage().heapUsed;
        maxMemoryUsage = Math.max(maxMemoryUsage, currentMemory);
      }

      // Progress indicator
      if (i % 20 === 0 && i > 0) {
        console.log(`   Progress: ${i}/${config.iterations} iterations (${Math.round((i/config.iterations)*100)}%)`);
      }

      // Respect max test duration
      if (performance.now() - startTime > config.maxTestDuration) {
        console.log(`⏰ Test duration limit reached, stopping at iteration ${i}`);
        break;
      }
    }

    const totalTestTime = performance.now() - startTime;
    
    // Calculate averages and metrics
    const metrics: PerformanceMetrics = {
      memoryUsage: {
        baseline: this.baselineMemory,
        withSystem: maxMemoryUsage,
        increasePercent: ((maxMemoryUsage - this.baselineMemory) / this.baselineMemory) * 100
      },
      processingTime: {
        expertiseTracking: this.calculateAverage(componentTimes.expertiseTracking),
        progressiveDisclosure: this.calculateAverage(componentTimes.progressiveDisclosure),
        conversationMemory: this.calculateAverage(componentTimes.conversationMemory),
        adaptationEngine: this.calculateAverage(componentTimes.adaptationEngine),
        total: this.calculateAverage(processingTimes)
      },
      responseMaintenanceTime: this.calculateAverage(processingTimes),
      throughput: {
        responsesPerSecond: (processingTimes.length / totalTestTime) * 1000,
        questionsProcessedPerMinute: (processingTimes.length / totalTestTime) * 60000
      }
    };

    console.log('📈 Performance testing complete!');
    return metrics;
  }

  /**
   * Process a single test scenario
   */
  private async processSingleScenario(): Promise<void> {
    const mockUserResponse = this.createMockUserResponse();
    const mockQuestion = this.createMockQuestion();
    const mockDomain = this.createMockDomain();

    // Process through all systems
    await this.expertiseTracker.analyzeUserResponse(mockUserResponse, mockDomain);
    await this.progressiveDisclosure.adjustQuestionSophistication(mockQuestion, 'intermediate', mockDomain);
    
    const sessionId = 'perf-test-session';
    const turn = this.createMockConversationTurn(mockQuestion, mockUserResponse);
    const context = this.createMockConversationContext(sessionId);
    
    this.conversationMemory.recordTurn(sessionId, turn, context);
    
    const adaptationRequest = {
      currentQuestion: mockQuestion,
      userResponse: mockUserResponse,
      currentExpertise: 'intermediate' as ExpertiseLevel,
      currentSophistication: 3 as SophisticationLevel,
      domainContext: mockDomain,
      conversationContext: context
    };
    
    await this.adaptationEngine.adaptQuestion(adaptationRequest);
  }

  /**
   * Process single scenario with detailed component timing
   */
  private async processSingleScenarioWithTiming(): Promise<{
    expertiseTracking: number;
    progressiveDisclosure: number;
    conversationMemory: number;
    adaptationEngine: number;
  }> {
    const mockUserResponse = this.createMockUserResponse();
    const mockQuestion = this.createMockQuestion();
    const mockDomain = this.createMockDomain();

    // Time expertise tracking
    const expertiseStart = performance.now();
    await this.expertiseTracker.analyzeUserResponse(mockUserResponse, mockDomain);
    const expertiseTime = performance.now() - expertiseStart;

    // Time progressive disclosure
    const disclosureStart = performance.now();
    await this.progressiveDisclosure.adjustQuestionSophistication(mockQuestion, 'intermediate', mockDomain);
    const disclosureTime = performance.now() - disclosureStart;

    // Time conversation memory
    const memoryStart = performance.now();
    const sessionId = 'perf-test-session';
    const turn = this.createMockConversationTurn(mockQuestion, mockUserResponse);
    const context = this.createMockConversationContext(sessionId);
    this.conversationMemory.recordTurn(sessionId, turn, context);
    const memoryTime = performance.now() - memoryStart;

    // Time adaptation engine
    const adaptationStart = performance.now();
    const adaptationRequest = {
      currentQuestion: mockQuestion,
      userResponse: mockUserResponse,
      currentExpertise: 'intermediate' as ExpertiseLevel,
      currentSophistication: 3 as SophisticationLevel,
      domainContext: mockDomain,
      conversationContext: context
    };
    await this.adaptationEngine.adaptQuestion(adaptationRequest);
    const adaptationTime = performance.now() - adaptationStart;

    return {
      expertiseTracking: expertiseTime,
      progressiveDisclosure: disclosureTime,
      conversationMemory: memoryTime,
      adaptationEngine: adaptationTime
    };
  }

  /**
   * Validate performance against Epic 6.4.3 requirements
   */
  private validateRequirements(metrics: PerformanceMetrics): void {
    console.log('\n🎯 Validating Performance Requirements:');
    
    // Requirement 1: <20% memory increase
    const memoryPass = metrics.memoryUsage.increasePercent < 20;
    console.log(`   Memory increase: ${metrics.memoryUsage.increasePercent.toFixed(2)}% ${memoryPass ? '✅' : '❌'} (Requirement: <20%)`);
    
    // Requirement 2: <200ms additional processing time
    const processingPass = metrics.processingTime.total < 200;
    console.log(`   Processing time: ${metrics.processingTime.total.toFixed(2)}ms ${processingPass ? '✅' : '❌'} (Requirement: <200ms)`);
    
    // Requirement 3: <3s response maintenance
    const maintenancePass = metrics.responseMaintenanceTime < 3000;
    console.log(`   Response maintenance: ${metrics.responseMaintenanceTime.toFixed(2)}ms ${maintenancePass ? '✅' : '❌'} (Requirement: <3000ms)`);
    
    const allPass = memoryPass && processingPass && maintenancePass;
    console.log(`\n🏆 Overall Performance: ${allPass ? 'PASSED ✅' : 'FAILED ❌'}`);
    
    if (!allPass) {
      console.log('\n⚠️  Performance requirements not met. Consider optimization.');
    }
  }

  /**
   * Print detailed performance report
   */
  printDetailedReport(metrics: PerformanceMetrics): void {
    console.log('\n📊 DETAILED PERFORMANCE REPORT');
    console.log('═'.repeat(50));
    
    console.log('\nMemory Usage:');
    console.log(`   Baseline: ${this.formatBytes(metrics.memoryUsage.baseline)}`);
    console.log(`   With System: ${this.formatBytes(metrics.memoryUsage.withSystem)}`);
    console.log(`   Increase: ${metrics.memoryUsage.increasePercent.toFixed(2)}%`);
    
    console.log('\nComponent Processing Times (avg):');
    console.log(`   Expertise Tracking: ${metrics.processingTime.expertiseTracking.toFixed(2)}ms`);
    console.log(`   Progressive Disclosure: ${metrics.processingTime.progressiveDisclosure.toFixed(2)}ms`);
    console.log(`   Conversation Memory: ${metrics.processingTime.conversationMemory.toFixed(2)}ms`);
    console.log(`   Adaptation Engine: ${metrics.processingTime.adaptationEngine.toFixed(2)}ms`);
    console.log(`   Total: ${metrics.processingTime.total.toFixed(2)}ms`);
    
    console.log('\nThroughput:');
    console.log(`   Responses/second: ${metrics.throughput.responsesPerSecond.toFixed(2)}`);
    console.log(`   Questions/minute: ${metrics.throughput.questionsProcessedPerMinute.toFixed(0)}`);
  }

  // Helper methods
  private createMockUserResponse(): any {
    return {
      id: `response-${Date.now()}-${Math.random()}`,
      text: 'This is a mock user response for performance testing',
      timestamp: Date.now(),
      responseTime: Math.random() * 5000 + 1000, // 1-6 seconds
      domain: 'testing'
    };
  }

  private createMockQuestion(): AdaptiveQuestion {
    return {
      id: `question-${Date.now()}-${Math.random()}`,
      type: 'exploration',
      complexity: 'intermediate',
      priority: 'medium',
      domain: 'testing',
      question: 'What are your thoughts on this testing scenario?',
      context: 'Performance testing context',
      expectedResponseType: 'text',
      followUpTriggers: [],
      prerequisiteQuestions: [],
      alternativeFormulations: [],
      domainSpecific: false,
      complianceRelated: false,
      performanceImpact: 'minimal',
      tags: ['performance', 'testing'],
      generatedAt: new Date(),
      source: 'template',
      confidence: 0.8
    };
  }

  private createMockDomain(): DomainContext {
    return {
      domain: 'testing',
      confidence: 0.9,
      subdomains: ['performance', 'benchmarking'],
      context: 'Performance testing domain',
      relatedDomains: [],
      complexity: 'intermediate'
    };
  }

  private createMockConversationTurn(question: AdaptiveQuestion, response: any): any {
    return {
      id: `turn-${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      questionId: question.id,
      questionText: question.question,
      questionType: question.type,
      sophisticationLevel: 3,
      userResponse: response,
      expertiseLevel: 'intermediate',
      domainContext: this.createMockDomain()
    };
  }

  private createMockConversationContext(sessionId: string): any {
    return {
      sessionId,
      currentExpertise: 'intermediate',
      currentSophistication: 3,
      dominantDomain: this.createMockDomain(),
      recentTurns: [],
      expertiseProgression: ['beginner', 'intermediate'],
      sophisticationProgression: [2, 3],
      adaptationHistory: [],
      conversationLength: 1,
      sessionDuration: 1000,
      patterns: [],
      metrics: {
        totalTurns: 1,
        averageResponseTime: 2000,
        expertiseProgression: ['intermediate'],
        sophisticationProgression: [3],
        adaptationSuccessRate: 1.0,
        dominantPatterns: [],
        memoryUsage: 1024,
        compressionRatio: 1.0
      }
    };
  }

  private calculateAverage(numbers: number[]): number {
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export for testing
export async function runPerformanceTests(): Promise<PerformanceMetrics> {
  const testSuite = new PerformanceTestSuite();
  const metrics = await testSuite.runFullTestSuite();
  testSuite.printDetailedReport(metrics);
  return metrics;
}

export default PerformanceTestSuite;
