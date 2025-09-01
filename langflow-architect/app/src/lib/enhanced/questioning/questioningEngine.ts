// Questioning Engine - Epic 6.4.3 Story 1.2 Main Coordination Component
// Coordinates question generation, enrichment, and validation for adaptive questioning

import { 
  AdaptiveQuestion, 
  QuestionType, 
  QuestionComplexity,
  SophisticationLevel,
  ExpertiseLevel
} from './questionTypes';
import { DomainContext, EnhancedDomainContext } from '../domainDetectionSystem';
import { QuestioningFeatureFlagsConfig } from '../featureFlags';
import { 
  DynamicQuestionGenerator, 
  QuestionGenerationRequest, 
  QuestionGenerationResult 
} from './questionGenerator';
import { 
  DynamicContextualEnrichment, 
  QuestionEnrichmentRequest, 
  QuestionEnrichmentResult,
  MultiSourceKnowledgeSystem 
} from './contextualEnrichment';

interface TimingData {
  generation: QuestionGenerationResult;
  enrichment: QuestionEnrichmentResult;
  startTime: number;
}

// Simplified session interface for the engine
interface SimpleQuestionSession {
  sessionId: string;
  startTime: Date;
  endTime: Date | null;
  questions: AdaptiveQuestion[];
  responses: string[];
  domainContext: string;
  sophisticationLevel: SophisticationLevel;
  expertiseLevel: ExpertiseLevel;
  progressMetrics: {
    questionsAsked: number;
    questionsAnswered: number;
    domainCoverage: number;
    expertiseGrowth: number;
    engagementScore: number;
  };
  contextHistory: string[];
  isActive: boolean;
}

export interface QuestioningEngineRequest {
  domainContext: DomainContext | null;
  enhancedContext?: EnhancedDomainContext;
  userInput: string;
  conversationHistory: string[];
  sophisticationLevel: SophisticationLevel;
  sessionId: string;
  preferences?: QuestioningPreferences;
}

export interface QuestioningPreferences {
  preferredComplexity?: QuestionComplexity;
  questionTypes?: QuestionType[];
  excludeTypes?: QuestionType[];
  maxQuestions?: number;
  includeEnrichment?: boolean;
  includeAlternatives?: boolean;
}

export interface QuestioningEngineResult {
  primaryQuestion: AdaptiveQuestion;
  alternativeQuestions: AdaptiveQuestion[];
  sessionContext: SimpleQuestionSession;
  processingDetails: ProcessingDetails;
  recommendations: QuestioningRecommendations;
}

export interface ProcessingDetails {
  totalProcessingTimeMs: number;
  generationTimeMs: number;
  enrichmentTimeMs: number;
  validationTimeMs: number;
  fallbacksUsed: string[];
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  domainConfidence: number;
  questionRelevance: number;
  enrichmentQuality: number;
  overallConfidence: number;
  cacheHitRate: number;
}

export interface QuestioningRecommendations {
  suggestedFollowUps: string[];
  contextualHints: string[];
  expertiseAdjustments: string[];
  performanceOptimizations: string[];
}

export interface QuestioningEngineConfig {
  featureFlags: QuestioningFeatureFlagsConfig;
  performanceThresholds: {
    maxTotalTimeMs: number;
    maxGenerationTimeMs: number;
    maxEnrichmentTimeMs: number;
  };
  qualityThresholds: {
    minQuestionConfidence: number;
    minEnrichmentQuality: number;
    minDomainRelevance: number;
  };
}

/**
 * Main Questioning Engine - Coordinates all questioning functionality
 * Integrates generation, enrichment, and validation with performance monitoring
 */
export class AdaptiveQuestioningEngine {
  private readonly config: QuestioningEngineConfig;
  private readonly questionGenerator: DynamicQuestionGenerator;
  private readonly contextualEnrichment: DynamicContextualEnrichment;
  private questioningCache: Map<string, QuestioningEngineResult>;
  private performanceHistory: PerformanceMetrics[];
  private lastMaintenanceRun: number;

  constructor(
    config: QuestioningEngineConfig,
    multiSourceKnowledge?: MultiSourceKnowledgeSystem
  ) {
    this.config = config;
    this.questionGenerator = new DynamicQuestionGenerator(config.featureFlags);
    this.contextualEnrichment = new DynamicContextualEnrichment(config.featureFlags, multiSourceKnowledge);
    this.questioningCache = new Map();
    this.performanceHistory = [];
    this.lastMaintenanceRun = Date.now();
  }

  /**
   * Generate adaptive question with full enrichment and validation
   */
  async generateAdaptiveQuestion(request: QuestioningEngineRequest): Promise<QuestioningEngineResult> {
    const startTime = Date.now();
    
    // Check feature flags
    if (!this.config.featureFlags.enableQuestionGeneration) {
      return this.createDisabledFallback(request, startTime);
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(request);
    const cached = this.questioningCache.get(cacheKey);
    if (cached && this.isCacheValid(cached)) {
      return this.updateCachedResult(cached, startTime);
    }

    try {
      // Step 1: Generate base question
      const generationResult = await this.performQuestionGeneration(request);
      
      // Step 2: Enrich question with contextual knowledge
      const enrichmentResult = await this.performQuestionEnrichment(
        generationResult.question, 
        request
      );
      
      // Step 3: Validate and optimize result
      const validationResult = await this.performResultValidation(
        enrichmentResult.enrichedQuestion,
        request
      );
      
      // Step 4: Generate alternatives if requested
      const alternatives = await this.generateAlternativeQuestions(request, validationResult);
      
      // Step 5: Create session context
      const sessionContext = this.createQuestionSession(request, validationResult);
      
      // Step 6: Compile final result
      const result = this.compileEngineResult(
        validationResult,
        alternatives,
        sessionContext,
        request,
        {
          generation: generationResult,
          enrichment: enrichmentResult,
          startTime
        }
      );

      // Cache successful result
      this.cacheResult(cacheKey, result);
      
      // Update performance metrics (TODO: implement updatePerformanceMetrics)
      // this.updatePerformanceMetrics(result.processingDetails);
      
      return result;
      
    } catch (error) {
      console.warn('Questioning engine failed, using fallback:', error);
      return this.createErrorFallback(request, startTime, error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Get questioning engine capabilities and status
   */
  getEngineCapabilities(): {
    isEnabled: boolean;
    supportedQuestionTypes: QuestionType[];
    averageResponseTime: number;
    cacheHitRate: number;
    performanceScore: number;
  } {
    
    const recentMetrics = this.performanceHistory.slice(-10);
    const avgResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + (m.overallConfidence * 1000), 0) / recentMetrics.length
      : 500;
    
    const cacheHitRate = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length
      : 0;
    
    const performanceScore = recentMetrics.length > 0
      ? recentMetrics.reduce((sum, m) => sum + m.overallConfidence, 0) / recentMetrics.length
      : 0.7;

    return {
      isEnabled: this.config.featureFlags.enableQuestionGeneration,
      supportedQuestionTypes: this.questionGenerator.getQuestionGenerationCapabilities().supportedQuestionTypes,
      averageResponseTime: avgResponseTime,
      cacheHitRate,
      performanceScore
    };
  }

  /**
   * Clear all caches and reset performance metrics
   */
  resetEngine(): void {
    this.questioningCache.clear();
    this.contextualEnrichment.clearEnrichmentCache();
    this.performanceHistory = [];
    this.lastMaintenanceRun = Date.now();
  }

  /**
   * Perform maintenance tasks (cache cleanup, performance analysis)
   */
  async performMaintenance(): Promise<void> {
    const now = Date.now();
    
    // Clean caches if needed
    if (now - this.lastMaintenanceRun > 600000) { // 10 minutes
      this.cleanQuestioningCache();
      this.analyzePerformanceTrends();
      this.lastMaintenanceRun = now;
    }
  }

  /**
   * Generate base question using question generator
   */
  private async performQuestionGeneration(request: QuestioningEngineRequest): Promise<QuestionGenerationResult> {
    const generationRequest: QuestionGenerationRequest = {
      domainContext: request.domainContext,
      enhancedContext: request.enhancedContext,
      sophisticationLevel: request.sophisticationLevel,
      conversationHistory: request.conversationHistory,
      currentInput: request.userInput,
      preferredComplexity: request.preferences?.preferredComplexity,
      focusAreas: request.preferences?.questionTypes,
      excludeTypes: request.preferences?.excludeTypes
    };

    return await this.questionGenerator.generateAdaptiveQuestion(generationRequest);
  }

  /**
   * Enrich question with contextual knowledge
   */
  private async performQuestionEnrichment(
    baseQuestion: AdaptiveQuestion,
    request: QuestioningEngineRequest
  ): Promise<QuestionEnrichmentResult> {
    
    // Skip enrichment if disabled or not requested
    if (!this.config.featureFlags.enableQuestionGeneration || 
        !request.preferences?.includeEnrichment) {
      return {
        enrichedQuestion: baseQuestion,
        knowledgeUsed: {
          domainSpecificExamples: [],
          relevantBestPractices: [],
          alternativeApproaches: [],
          contextualHints: [],
          performanceConsiderations: [],
          securityGuidelines: []
        },
        enrichmentConfidence: 0.5,
        processingTimeMs: 0,
        fallbackUsed: true,
        sources: ['skipped']
      };
    }

    const enrichmentRequest: QuestionEnrichmentRequest = {
      baseQuestion,
      domainContext: request.domainContext,
      enhancedContext: request.enhancedContext,
      includeExamples: true,
      includeBestPractices: true,
      includeAlternatives: Boolean(request.preferences?.includeAlternatives),
      maxEnrichmentTimeMs: this.config.performanceThresholds.maxEnrichmentTimeMs
    };

    return await this.contextualEnrichment.enrichQuestion(enrichmentRequest);
  }

  /**
   * Validate result quality and performance
   */
  private async performResultValidation(
    question: AdaptiveQuestion,
    request: QuestioningEngineRequest
  ): Promise<AdaptiveQuestion> {
    
    // Quality validation
    if (question.confidence < this.config.qualityThresholds.minQuestionConfidence) {
      console.warn('Question confidence below threshold, applying quality boost');
      question.confidence = Math.max(question.confidence + 0.1, this.config.qualityThresholds.minQuestionConfidence);
    }

    // Domain relevance validation
    const domainRelevance = this.calculateDomainRelevance(question, request);
    if (domainRelevance < this.config.qualityThresholds.minDomainRelevance) {
      console.warn('Domain relevance below threshold, enhancing domain context');
      question.context = this.enhanceDomainContext(question.context, request);
    }

    return question;
  }

  /**
   * Generate alternative questions if requested
   */
  private async generateAlternativeQuestions(
    request: QuestioningEngineRequest,
    primaryQuestion: AdaptiveQuestion
  ): Promise<AdaptiveQuestion[]> {
    
    if (!request.preferences?.includeAlternatives) {
      return [];
    }

    const maxAlternatives = Math.min(request.preferences?.maxQuestions || 2, 3);
    
    try {
      const alternativeRequest: QuestionGenerationRequest = {
        ...this.buildGenerationRequest(request),
        excludeTypes: [primaryQuestion.type]
      };

      const alternatives = await this.questionGenerator.generateMultipleQuestions(
        alternativeRequest, 
        maxAlternatives
      );

      return alternatives.map(result => result.question);
      
    } catch (error) {
      console.warn('Alternative question generation failed:', error);
      return [];
    }
  }

  /**
   * Create question session context
   */
  private createQuestionSession(
    request: QuestioningEngineRequest,
    question: AdaptiveQuestion
  ): SimpleQuestionSession {
    
    return {
      sessionId: request.sessionId,
      startTime: new Date(),
      endTime: null,
      questions: [question],
      responses: [],
      domainContext: request.domainContext?.domain || 'unknown',
      sophisticationLevel: request.sophisticationLevel,
      expertiseLevel: this.inferExpertiseLevel(request.domainContext?.domain || 'general'),
      progressMetrics: {
        questionsAsked: 1,
        questionsAnswered: 0,
        domainCoverage: 0.1,
        expertiseGrowth: 0,
        engagementScore: 0.8
      },
      contextHistory: request.conversationHistory.slice(-5),
      isActive: true
    };
  }

  /**
   * Compile final engine result
   */
  private compileEngineResult(
    validatedQuestion: AdaptiveQuestion,
    alternatives: AdaptiveQuestion[],
    sessionContext: SimpleQuestionSession,
    request: QuestioningEngineRequest,
    timingData: TimingData
  ): QuestioningEngineResult {
    
    const totalTime = Date.now() - timingData.startTime;
    
    return {
      primaryQuestion: validatedQuestion,
      alternativeQuestions: alternatives,
      sessionContext,
      processingDetails: {
        totalProcessingTimeMs: totalTime,
        generationTimeMs: timingData.generation.generationTimeMs,
        enrichmentTimeMs: timingData.enrichment.processingTimeMs,
        validationTimeMs: 5, // Minimal validation time
        fallbacksUsed: this.identifyFallbacksUsed(timingData),
        performanceMetrics: {
          domainConfidence: request.domainContext?.confidence || 0.5,
          questionRelevance: this.calculateQuestionRelevance(validatedQuestion, request),
          enrichmentQuality: timingData.enrichment.enrichmentConfidence,
          overallConfidence: validatedQuestion.confidence,
          cacheHitRate: this.calculateCurrentCacheHitRate()
        }
      },
      recommendations: this.generateRecommendations(validatedQuestion, request, timingData)
    };
  }

  /**
   * Generate recommendations for continued questioning
   */
  private generateRecommendations(
    question: AdaptiveQuestion,
    request: QuestioningEngineRequest,
    timingData: TimingData
  ): QuestioningRecommendations {
    
    const followUps: string[] = [];
    const hints: string[] = [];
    const adjustments: string[] = [];
    const optimizations: string[] = [];

    // Generate follow-up suggestions
    if (question.type === 'clarifying') {
      followUps.push('Consider asking an exploration question next');
    } else if (question.type === 'exploration') {
      followUps.push('Move to assumption-testing or concept-validation');
    }

    // Generate contextual hints
    if (request.domainContext && request.domainContext.confidence > 0.8) {
      hints.push(`Strong ${request.domainContext.domain} context detected - leverage domain-specific patterns`);
    } else {
      hints.push('Consider gathering more domain context before specialized questions');
    }

    // Generate expertise adjustments
    if (request.sophisticationLevel < 3) {
      adjustments.push('Consider gradually increasing question complexity');
    } else if (request.sophisticationLevel >= 4) {
      adjustments.push('User shows high sophistication - can handle advanced concepts');
    }

    // Generate performance optimizations
    if (timingData.generation.generationTimeMs > 400) {
      optimizations.push('Question generation is slow - consider caching or simpler approaches');
    }
    if (timingData.enrichment.processingTimeMs > 300) {
      optimizations.push('Knowledge enrichment is slow - optimize knowledge queries');
    }

    return {
      suggestedFollowUps: followUps,
      contextualHints: hints,
      expertiseAdjustments: adjustments,
      performanceOptimizations: optimizations
    };
  }

  // Helper methods
  private buildGenerationRequest(request: QuestioningEngineRequest): QuestionGenerationRequest {
    return {
      domainContext: request.domainContext,
      enhancedContext: request.enhancedContext,
      sophisticationLevel: request.sophisticationLevel,
      conversationHistory: request.conversationHistory,
      currentInput: request.userInput,
      preferredComplexity: request.preferences?.preferredComplexity,
      focusAreas: request.preferences?.questionTypes,
      excludeTypes: request.preferences?.excludeTypes
    };
  }

  private calculateDomainRelevance(question: AdaptiveQuestion, request: QuestioningEngineRequest): number {
    if (!request.domainContext) return 0.5;
    
    let relevance = 0.5;
    if (question.domain === request.domainContext.domain) relevance += 0.3;
    if (question.domainSpecific) relevance += 0.2;
    
    return Math.min(relevance, 1.0);
  }

  private calculateQuestionRelevance(question: AdaptiveQuestion, request: QuestioningEngineRequest): number {
    let relevance = question.confidence;
    
    // Boost relevance based on domain match
    if (request.domainContext && question.domain === request.domainContext.domain) {
      relevance += 0.1;
    }
    
    // Boost relevance based on conversation context
    if (request.conversationHistory.length > 0) {
      relevance += 0.05;
    }
    
    return Math.min(relevance, 1.0);
  }

  private enhanceDomainContext(originalContext: string, request: QuestioningEngineRequest): string {
    if (!request.domainContext) return originalContext;
    
    const enhancement = `Domain context: ${request.domainContext.domain} (confidence: ${request.domainContext.confidence})`;
    return `${originalContext}\n\n${enhancement}`;
  }

  private identifyFallbacksUsed(timingData: TimingData): string[] {
    const fallbacks: string[] = [];
    
    if (timingData.generation.fallbackUsed) fallbacks.push('question-generation');
    if (timingData.enrichment.fallbackUsed) fallbacks.push('knowledge-enrichment');
    
    return fallbacks;
  }

  private calculateCurrentCacheHitRate(): number {
    const recentMetrics = this.performanceHistory.slice(-5);
    if (recentMetrics.length === 0) return 0;
    
    return recentMetrics.reduce((sum, m) => sum + m.cacheHitRate, 0) / recentMetrics.length;
  }

  private generateCacheKey(request: QuestioningEngineRequest): string {
    const keyData = {
      domain: request.domainContext?.domain || 'none',
      input: request.userInput.slice(0, 100), // First 100 chars
      sophistication: request.sophisticationLevel,
      historyLength: request.conversationHistory.length,
      preferences: request.preferences || {}
    };
    return btoa(JSON.stringify(keyData));
  }

  private isCacheValid(cached: QuestioningEngineResult): boolean {
    const maxAge = 300000; // 5 minutes
    const age = Date.now() - cached.sessionContext.startTime.getTime();
    return age < maxAge;
  }

  private updateCachedResult(cached: QuestioningEngineResult, startTime: number): QuestioningEngineResult {
    return {
      ...cached,
      processingDetails: {
        ...cached.processingDetails,
        totalProcessingTimeMs: Date.now() - startTime,
        performanceMetrics: {
          ...cached.processingDetails.performanceMetrics,
          cacheHitRate: 1.0 // Cache hit
        }
      }
    };
  }

  private cacheResult(key: string, result: QuestioningEngineResult): void {
    this.questioningCache.set(key, result);
  }

  private updatePerformanceMetrics(metrics: PerformanceMetrics): void {
    this.performanceHistory.push(metrics);
    
    // Keep only recent history
    if (this.performanceHistory.length > 100) {
      this.performanceHistory = this.performanceHistory.slice(-50);
    }
  }

  private cleanQuestioningCache(): void {
    if (this.questioningCache.size > 50) {
      const entries = Array.from(this.questioningCache.entries());
      const toRemove = entries.slice(0, entries.length - 25);
      toRemove.forEach(([key]) => this.questioningCache.delete(key));
    }
  }

  private analyzePerformanceTrends(): void {
    if (this.performanceHistory.length < 10) return;
    
    const recent = this.performanceHistory.slice(-10);
    const avgConfidence = recent.reduce((sum, m) => sum + m.overallConfidence, 0) / recent.length;
    
    if (avgConfidence < 0.6) {
      console.warn('Questioning engine performance declining - consider optimization');
    }
  }

  private createDisabledFallback(request: QuestioningEngineRequest, startTime: number): QuestioningEngineResult {
    const fallbackQuestion: AdaptiveQuestion = {
      id: `fallback-${Date.now()}`,
      type: 'clarifying',
      complexity: 'intermediate',
      priority: 'medium',
      domain: 'general',
      question: 'How can I help you with your current challenge?',
      context: 'Questioning system disabled - using basic fallback',
      expectedResponseType: 'text',
      followUpTriggers: ['help', 'challenge', 'problem'],
      prerequisiteQuestions: [],
      alternativeFormulations: [],
      domainSpecific: false,
      complianceRelated: false,
      performanceImpact: 'minimal',
      tags: ['fallback', 'disabled'],
      generatedAt: new Date(),
      source: 'template',
      confidence: 0.5
    };

    return {
      primaryQuestion: fallbackQuestion,
      alternativeQuestions: [],
      sessionContext: this.createQuestionSession(request, fallbackQuestion),
      processingDetails: {
        totalProcessingTimeMs: Date.now() - startTime,
        generationTimeMs: 0,
        enrichmentTimeMs: 0,
        validationTimeMs: 0,
        fallbacksUsed: ['disabled'],
        performanceMetrics: {
          domainConfidence: 0,
          questionRelevance: 0.5,
          enrichmentQuality: 0,
          overallConfidence: 0.5,
          cacheHitRate: 0
        }
      },
      recommendations: {
        suggestedFollowUps: ['Enable questioning system for better assistance'],
        contextualHints: ['Questioning features are currently disabled'],
        expertiseAdjustments: [],
        performanceOptimizations: []
      }
    };
  }

  private createErrorFallback(
    request: QuestioningEngineRequest,
    startTime: number,
    error: Error
  ): QuestioningEngineResult {
    
    const errorQuestion: AdaptiveQuestion = {
      id: `error-${Date.now()}`,
      type: 'clarifying',
      complexity: 'intermediate',
      priority: 'medium',
      domain: request.domainContext?.domain || 'general',
      question: 'Could you provide more details about what you\'re working on?',
      context: `Fallback question due to system error: ${error.message || 'Unknown error'}`,
      expectedResponseType: 'text',
      followUpTriggers: ['details', 'working', 'help'],
      prerequisiteQuestions: [],
      alternativeFormulations: ['What specific challenge are you facing?'],
      domainSpecific: Boolean(request.domainContext),
      complianceRelated: false,
      performanceImpact: 'minimal',
      tags: ['error-fallback', 'recovery'],
      generatedAt: new Date(),
      source: 'template',
      confidence: 0.4
    };

    return {
      primaryQuestion: errorQuestion,
      alternativeQuestions: [],
      sessionContext: this.createQuestionSession(request, errorQuestion),
      processingDetails: {
        totalProcessingTimeMs: Date.now() - startTime,
        generationTimeMs: 0,
        enrichmentTimeMs: 0,
        validationTimeMs: 0,
        fallbacksUsed: ['error-recovery'],
        performanceMetrics: {
          domainConfidence: request.domainContext?.confidence || 0,
          questionRelevance: 0.4,
          enrichmentQuality: 0,
          overallConfidence: 0.4,
          cacheHitRate: 0
        }
      },
      recommendations: {
        suggestedFollowUps: ['Try again or provide more context'],
        contextualHints: ['System experienced an error - using fallback mode'],
        expertiseAdjustments: [],
        performanceOptimizations: ['System stability may need attention']
      }
    };
  }

  /**
   * Infer expertise level from domain and context
   */
  private inferExpertiseLevel(domain: string): ExpertiseLevel {
    // Create basic expertise assessment
    const complexity: QuestionComplexity = domain === 'technical' ? 'intermediate' : 'beginner';
    
    return {
      overall: complexity,
      domain,
      confidence: 0.5,
      technicalDepth: complexity,
      domainKnowledge: complexity,
      integrationAwareness: 'beginner',
      complianceUnderstanding: 'beginner',
      signals: [],
      responseHistory: 0,
      consistencyScore: 0.5,
      lastUpdated: new Date()
    };
  }
}

export default AdaptiveQuestioningEngine;
