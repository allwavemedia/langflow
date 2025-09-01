/**
 * Adaptation Engine
 * Epic 6.4.3 Story 1.3 - Task 4
 * 
 * Central orchestration engine that coordinates expertise tracking,
 * progressive disclosure, and conversation memory for adaptive questioning.
 */

import { 
  UserResponse, 
  ExpertiseLevel,
  SophisticationLevel,
  QuestionType,
  QuestionComplexity,
  AdaptiveQuestion 
} from './questionTypes';
import { DomainContext } from '../domainDetectionSystem';
import { DynamicExpertiseTracker } from './expertiseTracker';
import { 
  UserResponse as TrackerUserResponse,
  ExpertiseLevel as TrackerExpertiseLevel,
  ResponseQuality
} from './expertiseTracker';
import { DynamicProgressiveDisclosure, AdaptationContext } from './progressiveDisclosure';
import { 
  ConversationMemoryManager, 
  ConversationContext, 
  ConversationTurn, 
  AdaptationRecord,
  conversationMemory 
} from './conversationMemory';

export interface ProgressiveRecommendation {
  recommendedLevel?: SophisticationLevel;
  confidence: number;
  reasoning: string;
  adaptationStrategy?: string;
}

export interface LearningPatternsAnalysis {
  learningVelocity: number;
  preferredComplexity: SophisticationLevel;
  adaptationResponsiveness: number;
  dominantInteractionStyle: string;
  recommendedStrategy: string;
}

export interface MemoryStats {
  activeSessions: number;
  totalTurns: number;
  memoryUsage: number;
  compressionRatio: number;
}

export interface PerformanceSummary {
  averageLatency: number;
  averageAccuracy: number;
  totalAdaptations: number;
}

export interface AdaptationConfig {
  expertiseTrackingEnabled: boolean;
  progressiveDisclosureEnabled: boolean;
  conversationMemoryEnabled: boolean;
  maxMemorySize: number;
  adaptationThreshold: number;
  performanceTarget: {
    maxLatency: number;
    maxMemoryIncrease: number;
    targetAccuracy: number;
  };
}

export interface AdaptationDecision {
  targetSophistication: SophisticationLevel;
  recommendedQuestionType: QuestionType;
  adaptationReason: string;
  confidence: number;
  fallbackStrategy?: string;
  adaptationApplied: AdaptationRecord;
}

export interface AdaptationMetrics {
  sessionId: string;
  totalAdaptations: number;
  successfulAdaptations: number;
  averageConfidence: number;
  performanceImpact: {
    latency: number;
    memoryUsage: number;
    accuracy: number;
  };
  userSatisfaction?: number;
  learningProgress: number;
}

export interface EngineState {
  isActive: boolean;
  currentSessionId?: string;
  lastAdaptation?: Date;
  consecutiveFailures: number;
  circuitBreakerOpen: boolean;
  performanceMetrics: AdaptationMetrics[];
}

export class AdaptationEngine {
  private expertiseTracker: DynamicExpertiseTracker;
  private progressiveDisclosure: DynamicProgressiveDisclosure;
  private memoryManager: ConversationMemoryManager;
  private state: EngineState;

  constructor(
    private config: AdaptationConfig = {
      expertiseTrackingEnabled: true,
      progressiveDisclosureEnabled: true,
      conversationMemoryEnabled: true,
      maxMemorySize: 10000,
      adaptationThreshold: 0.6,
      performanceTarget: {
        maxLatency: 200,
        maxMemoryIncrease: 0.2,
        targetAccuracy: 0.8
      }
    }
  ) {
    this.expertiseTracker = new DynamicExpertiseTracker();
    this.progressiveDisclosure = new DynamicProgressiveDisclosure();
    this.memoryManager = conversationMemory;
    
    this.state = {
      isActive: true,
      consecutiveFailures: 0,
      circuitBreakerOpen: false,
      performanceMetrics: []
    };
  }

  // Type adapter functions to bridge interface differences
  private adaptUserResponseToTracker(response: UserResponse, domainContext: DomainContext): TrackerUserResponse {
    return {
      id: response.id,
      text: response.response, // UserResponse.response -> TrackerUserResponse.text
      questionId: response.questionId,
      timestamp: response.submittedAt, // UserResponse.submittedAt -> TrackerUserResponse.timestamp  
      responseTime: response.processingTime, // UserResponse.processingTime -> TrackerUserResponse.responseTime
      domain: domainContext.domain,
      metadata: {
        wordCount: response.metadata.responseLength,
        technicalTerms: response.metadata.technicalTermsUsed,
        codeSnippets: 0, // Not available in UserResponse
        questionsAsked: 0, // Not available in UserResponse
        clarificationRequests: response.clarificationNeeded ? 1 : 0
      }
    };
  }

  private adaptExpertiseLevelToTracker(expertise: ExpertiseLevel): TrackerExpertiseLevel {
    // questionTypes.ExpertiseLevel has QuestionComplexity, expertiseTracker expects string enum
    const mapComplexity = (complexity: QuestionComplexity): TrackerExpertiseLevel => {
      switch (complexity) {
        case 'beginner': return 'beginner';
        case 'intermediate': return 'intermediate';
        case 'advanced': return 'advanced';
        case 'expert': return 'expert';
        case 'research': return 'expert'; // Map research to expert
        default: return 'intermediate';
      }
    };
    
    return mapComplexity(expertise.overall);
  }

  private adaptTrackerExpertiseToQuestion(trackerExpertise: ResponseQuality): ExpertiseLevel {
    // ResponseQuality to questionTypes.ExpertiseLevel
    const mapScoreToComplexity = (score: number): QuestionComplexity => {
      if (score < 0.2) return 'beginner';
      if (score < 0.4) return 'intermediate';  
      if (score < 0.6) return 'advanced';
      if (score < 0.8) return 'expert';
      return 'research';
    };

    const overallComplexity = mapScoreToComplexity(trackerExpertise.score);
    
    return {
      overall: overallComplexity,
      domain: 'general', // Default domain
      confidence: trackerExpertise.score,
      technicalDepth: mapScoreToComplexity(trackerExpertise.indicators.technicalAccuracy),
      domainKnowledge: mapScoreToComplexity(trackerExpertise.indicators.domainSpecificKnowledge),
      integrationAwareness: mapScoreToComplexity(trackerExpertise.indicators.problemSolvingApproach),
      complianceUnderstanding: 'intermediate', // Default
      signals: [], // Empty for now
      responseHistory: 0, // Default
      consistencyScore: trackerExpertise.score,
      lastUpdated: new Date()
    };
  }

  private adaptConversationToAdaptationContext(
    conversationContext: ConversationContext, 
    currentExpertise: ExpertiseLevel,
    domainContext: DomainContext
  ): AdaptationContext {
    return {
      currentExpertise: this.adaptExpertiseLevelToTracker(currentExpertise),
      domainContext: domainContext,
      recentResponses: [], // Would need to convert from conversation turns if available
      sessionHistory: [], // Would need to extract questions from conversation turns
      confusionSignals: false, // Could derive from conversation context if available
      timeConstraints: undefined,
      userPreferences: {
        preferredComplexity: currentExpertise.overall,
        allowAdvancement: true,
        requestSimplification: false
      }
    };
  }

  /**
   * Main adaptation method - processes user response and determines next question characteristics
   */
  async adaptQuestion(
    sessionId: string,
    userResponse: UserResponse,
    currentQuestion: AdaptiveQuestion,
    domainContext: DomainContext
  ): Promise<AdaptationDecision> {
    const startTime = performance.now();

    try {
      // Circuit breaker check
      if (this.state.circuitBreakerOpen) {
        return this.getDefaultAdaptation(sessionId, 'Circuit breaker is open');
      }

      // Update current session
      this.state.currentSessionId = sessionId;

      // Step 1: Update expertise tracking
      let currentExpertise: ExpertiseLevel | undefined;
      if (this.config.expertiseTrackingEnabled) {
        const trackerUserResponse = this.adaptUserResponseToTracker(userResponse, domainContext);
        const responseQuality = this.expertiseTracker.analyzeUserResponse(
          trackerUserResponse,
          currentQuestion,
          domainContext
        );
        currentExpertise = this.adaptTrackerExpertiseToQuestion(responseQuality);
      }

      // Step 2: Get conversation context from memory
      let conversationContext: ConversationContext | null = null;
      if (this.config.conversationMemoryEnabled) {
        conversationContext = this.memoryManager.getConversationContext(sessionId);
        
        // Record current turn
        if (currentExpertise) {
          const turn: ConversationTurn = {
            id: `${sessionId}-${Date.now()}`,
            timestamp: Date.now(),
            questionId: currentQuestion.id,
            questionText: currentQuestion.question,
            questionType: currentQuestion.type,
            sophisticationLevel: this.mapComplexityToSophistication(currentQuestion.complexity),
            userResponse,
            expertiseLevel: currentExpertise,
            domainContext
          };

          this.memoryManager.recordTurn(sessionId, turn, conversationContext || this.createDefaultContext(sessionId, domainContext));
          
          // Get updated context
          conversationContext = this.memoryManager.getConversationContext(sessionId);
        }
      }

      // Step 3: Determine sophistication adaptation
      let adaptedQuestion: AdaptiveQuestion = currentQuestion;
      if (this.config.progressiveDisclosureEnabled && conversationContext && currentExpertise) {
        const trackerExpertiseLevel = this.adaptExpertiseLevelToTracker(currentExpertise);
        const adaptationContext = this.adaptConversationToAdaptationContext(
          conversationContext, 
          currentExpertise, 
          domainContext
        );
        adaptedQuestion = this.progressiveDisclosure.adjustQuestionSophistication(
          currentQuestion,
          trackerExpertiseLevel,
          adaptationContext
        );
      }

      // Step 4: Combine insights and make adaptation decision
      const decision = this.synthesizeAdaptationDecision(
        sessionId,
        currentExpertise,
        conversationContext,
        adaptedQuestion,
        domainContext
      );

      // Step 5: Record adaptation
      if (conversationContext && decision.adaptationApplied) {
        const lastTurn = conversationContext.recentTurns[conversationContext.recentTurns.length - 1];
        if (lastTurn) {
          lastTurn.adaptationApplied = decision.adaptationApplied;
        }
      }

      // Step 6: Update performance metrics
      const processingTime = performance.now() - startTime;
      this.updatePerformanceMetrics(sessionId, decision, processingTime);

      // Step 7: Check for circuit breaker conditions
      this.checkCircuitBreaker(decision, processingTime);

      this.state.lastAdaptation = new Date();
      this.state.consecutiveFailures = 0;

      return decision;

    } catch (error) {
      console.error('AdaptationEngine: Error during adaptation:', error);
      this.state.consecutiveFailures++;
      
      if (this.state.consecutiveFailures >= 3) {
        this.state.circuitBreakerOpen = true;
        setTimeout(() => {
          this.state.circuitBreakerOpen = false;
          this.state.consecutiveFailures = 0;
        }, 30000); // 30 second circuit breaker
      }

      return this.getDefaultAdaptation(sessionId, `Error occurred: ${error}`);
    }
  }

  /**
   * Gets comprehensive adaptation recommendations from memory analysis
   */
  async getMemoryBasedRecommendations(sessionId: string): Promise<{
    recommendedSophistication: SophisticationLevel;
    learningPatterns: LearningPatternsAnalysis;
    adaptationHistory: AdaptationRecord[];
    confidence: number;
  }> {
    if (!this.config.conversationMemoryEnabled) {
      return {
        recommendedSophistication: 3 as SophisticationLevel,
        learningPatterns: {
          learningVelocity: 0.5,
          preferredComplexity: 3 as SophisticationLevel,
          adaptationResponsiveness: 0.5,
          dominantInteractionStyle: 'exploratory',
          recommendedStrategy: 'progressive'
        },
        adaptationHistory: [],
        confidence: 0.5
      };
    }

    const memoryRecommendations = this.memoryManager.getAdaptationRecommendations(sessionId);
    const learningPatterns = this.memoryManager.analyzeLearningPatterns(sessionId);
    const context = this.memoryManager.getConversationContext(sessionId);

    return {
      recommendedSophistication: memoryRecommendations.recommendedSophistication,
      learningPatterns,
      adaptationHistory: context?.adaptationHistory || [],
      confidence: memoryRecommendations.confidence
    };
  }

  /**
   * Provides detailed metrics about adaptation effectiveness
   */
  getAdaptationMetrics(sessionId?: string): AdaptationMetrics[] {
    if (sessionId) {
      return this.state.performanceMetrics.filter(m => m.sessionId === sessionId);
    }
    return this.state.performanceMetrics;
  }

  /**
   * Resets the adaptation engine state
   */
  reset(): void {
    this.state = {
      isActive: true,
      consecutiveFailures: 0,
      circuitBreakerOpen: false,
      performanceMetrics: []
    };
    
    // Clear memory if needed
    if (this.config.conversationMemoryEnabled) {
      this.memoryManager.cleanupOldSessions();
    }
  }

  /**
   * Updates configuration at runtime
   */
  updateConfig(newConfig: Partial<AdaptationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Gets current engine status and health
   */
  getEngineStatus(): {
    isHealthy: boolean;
    state: EngineState;
    memoryStats: MemoryStats | null;
    performanceSummary: PerformanceSummary;
  } {
    const memoryStats = this.config.conversationMemoryEnabled ? 
      this.memoryManager.getMemoryStats() : null;

    const recentMetrics = this.state.performanceMetrics.slice(-10);
    const performanceSummary = {
      averageLatency: recentMetrics.reduce((sum, m) => sum + m.performanceImpact.latency, 0) / recentMetrics.length || 0,
      averageAccuracy: recentMetrics.reduce((sum, m) => sum + m.performanceImpact.accuracy, 0) / recentMetrics.length || 0,
      totalAdaptations: recentMetrics.reduce((sum, m) => sum + m.totalAdaptations, 0)
    };

    const isHealthy = !this.state.circuitBreakerOpen && 
                     this.state.consecutiveFailures < 3 &&
                     performanceSummary.averageLatency < this.config.performanceTarget.maxLatency;

    return {
      isHealthy,
      state: this.state,
      memoryStats,
      performanceSummary
    };
  }

  // Private helper methods

  private synthesizeAdaptationDecision(
    sessionId: string,
    expertise?: ExpertiseLevel,
    conversationContext?: ConversationContext | null,
    adaptedQuestion?: AdaptiveQuestion,
    domainContext?: DomainContext
  ): AdaptationDecision {
    
    // Default decision
    let targetSophistication: SophisticationLevel = 3 as SophisticationLevel;
    let recommendedQuestionType: QuestionType = 'exploration';
    let confidence = 0.5;
    let adaptationReason = 'Default adaptation';

    // Apply expertise-based adjustment
    if (expertise && this.config.expertiseTrackingEnabled) {
      targetSophistication = this.mapComplexityToSophistication(expertise.overall);
      confidence += 0.2;
      adaptationReason = `Based on detected expertise level: ${expertise.overall}`;
    }

    // Apply progressive disclosure from adapted question
    if (adaptedQuestion && this.config.progressiveDisclosureEnabled) {
      if (adaptedQuestion.complexity) {
        targetSophistication = this.mapComplexityToSophistication(adaptedQuestion.complexity);
        confidence += 0.2;
        adaptationReason += `; Progressive disclosure suggests complexity ${adaptedQuestion.complexity}`;
      }
    }

    // Apply memory-based insights
    if (conversationContext && this.config.conversationMemoryEnabled) {
      const memoryRecommendations = this.memoryManager.getAdaptationRecommendations(sessionId);
      
      // Weight memory recommendations based on conversation length
      const memoryWeight = Math.min(conversationContext.conversationLength / 10, 0.3);
      confidence += memoryWeight * memoryRecommendations.confidence;
      
      if (memoryRecommendations.confidence > 0.7) {
        targetSophistication = memoryRecommendations.recommendedSophistication;
        adaptationReason += `; Memory analysis: ${memoryRecommendations.reasoning}`;
      }
    }

    // Determine question type based on domain and context
    if (domainContext) {
      recommendedQuestionType = this.selectQuestionType(domainContext, conversationContext);
    }

    // Create adaptation record
    const adaptationApplied: AdaptationRecord = {
      type: this.determineAdaptationType(conversationContext?.currentSophistication, targetSophistication),
      fromLevel: conversationContext?.currentSophistication,
      toLevel: targetSophistication,
      reason: adaptationReason,
      effectiveness: undefined // Will be updated based on user response
    };

    // Apply fallback strategy if confidence is low
    let fallbackStrategy: string | undefined;
    if (confidence < this.config.adaptationThreshold) {
      fallbackStrategy = 'Maintain current level with increased support';
      targetSophistication = conversationContext?.currentSophistication || 3 as SophisticationLevel;
    }

    return {
      targetSophistication,
      recommendedQuestionType,
      adaptationReason,
      confidence: Math.min(confidence, 1.0),
      fallbackStrategy,
      adaptationApplied
    };
  }

  private mapComplexityToSophistication(complexity: QuestionComplexity): SophisticationLevel {
    const mapping: Record<QuestionComplexity, SophisticationLevel> = {
      'beginner': 1,
      'intermediate': 3,
      'advanced': 4,
      'expert': 5,
      'research': 5
    };
    return mapping[complexity] as SophisticationLevel;
  }

  private selectQuestionType(domainContext: DomainContext, conversationContext?: ConversationContext | null): QuestionType {
    // Simple heuristic for question type selection
    if (!conversationContext || conversationContext.conversationLength < 3) {
      return 'exploration';
    }
    
    if (conversationContext.conversationLength < 8) {
      return 'clarifying';
    }
    
    if (domainContext.confidence > 0.8) {
      return 'assumption-testing';
    }
    
    return 'concept-validation';
  }

  private determineAdaptationType(
    fromLevel?: SophisticationLevel, 
    toLevel?: SophisticationLevel
  ): AdaptationRecord['type'] {
    if (!fromLevel || !toLevel) return 'sophistication_increase';
    
    if (toLevel > fromLevel) return 'sophistication_increase';
    if (toLevel < fromLevel) return 'sophistication_decrease';
    return 'question_type_change';
  }

  private createDefaultContext(sessionId: string, domainContext: DomainContext): ConversationContext {
    return {
      sessionId,
      dominantDomain: domainContext,
      recentTurns: [],
      expertiseProgression: [],
      sophisticationProgression: [],
      adaptationHistory: [],
      conversationLength: 0,
      sessionDuration: 0,
      patterns: [],
      metrics: {
        totalTurns: 0,
        averageResponseTime: 0,
        expertiseProgression: [],
        sophisticationProgression: [],
        adaptationSuccessRate: 0,
        dominantPatterns: [],
        memoryUsage: 0,
        compressionRatio: 1
      }
    };
  }

  private getDefaultAdaptation(sessionId: string, reason: string): AdaptationDecision {
    return {
      targetSophistication: 3 as SophisticationLevel,
      recommendedQuestionType: 'exploration',
      adaptationReason: reason,
      confidence: 0.5,
      fallbackStrategy: 'Use default questioning approach',
      adaptationApplied: {
        type: 'question_type_change',
        reason: `Fallback: ${reason}`,
        effectiveness: undefined
      }
    };
  }

  private updatePerformanceMetrics(
    sessionId: string, 
    decision: AdaptationDecision, 
    processingTime: number
  ): void {
    let metrics = this.state.performanceMetrics.find(m => m.sessionId === sessionId);
    
    if (!metrics) {
      metrics = {
        sessionId,
        totalAdaptations: 0,
        successfulAdaptations: 0,
        averageConfidence: 0,
        performanceImpact: {
          latency: 0,
          memoryUsage: 0,
          accuracy: 0
        },
        learningProgress: 0
      };
      this.state.performanceMetrics.push(metrics);
    }

    metrics.totalAdaptations++;
    if (decision.confidence > this.config.adaptationThreshold) {
      metrics.successfulAdaptations++;
    }

    metrics.averageConfidence = (
      (metrics.averageConfidence * (metrics.totalAdaptations - 1)) + decision.confidence
    ) / metrics.totalAdaptations;

    metrics.performanceImpact.latency = processingTime;
    metrics.performanceImpact.accuracy = decision.confidence;

    // Keep only recent metrics to prevent memory bloat
    if (this.state.performanceMetrics.length > 100) {
      this.state.performanceMetrics = this.state.performanceMetrics.slice(-50);
    }
  }

  private checkCircuitBreaker(decision: AdaptationDecision, processingTime: number): void {
    const hasPerformanceIssue = processingTime > this.config.performanceTarget.maxLatency;
    const hasLowConfidence = decision.confidence < 0.3;
    
    if (hasPerformanceIssue || hasLowConfidence) {
      this.state.consecutiveFailures++;
    }
    
    if (this.state.consecutiveFailures >= 5) {
      this.state.circuitBreakerOpen = true;
      console.warn('AdaptationEngine: Circuit breaker opened due to performance issues');
      
      // Auto-recovery after 1 minute
      setTimeout(() => {
        this.state.circuitBreakerOpen = false;
        this.state.consecutiveFailures = 0;
        console.log('AdaptationEngine: Circuit breaker reset');
      }, 60000);
    }
  }
}

// Export singleton instance for global use
export const adaptationEngine = new AdaptationEngine();
