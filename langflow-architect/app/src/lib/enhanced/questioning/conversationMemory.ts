/**
 * Conversation Memory and Context Management
 * Epic 6.4.3 Story 1.3 - Task 3
 * 
 * Manages conversation history, user context, and adaptation patterns
 * for progressive disclosure and expertise tracking systems.
 */

import { 
  UserResponse, 
  ExpertiseLevel,
  SophisticationLevel,
  QuestionType,
  QuestionComplexity 
} from './questionTypes';
import { DomainContext } from '../domainDetectionSystem';

// Additional interfaces needed for conversation memory
export interface ConversationContext {
  sessionId: string;
  currentExpertise?: ExpertiseLevel;
  currentSophistication?: SophisticationLevel;
  dominantDomain: DomainContext;
  recentTurns: ConversationTurn[];
  expertiseProgression: ExpertiseLevel[];
  sophisticationProgression: SophisticationLevel[];
  adaptationHistory: AdaptationRecord[];
  conversationLength: number;
  sessionDuration: number;
  patterns: ConversationPattern[];
  metrics: MemoryMetrics;
}

export interface ConversationTurn {
  id: string;
  timestamp: number;
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  sophisticationLevel: SophisticationLevel;
  userResponse: UserResponse;
  expertiseLevel: ExpertiseLevel;
  domainContext: DomainContext;
  adaptationApplied?: AdaptationRecord;
}

export interface AdaptationRecord {
  type: 'sophistication_increase' | 'sophistication_decrease' | 'question_type_change' | 'domain_shift';
  fromLevel?: SophisticationLevel;
  toLevel?: SophisticationLevel;
  reason: string;
  effectiveness?: number; // 0-1 scale
  userFeedback?: 'positive' | 'negative' | 'neutral';
}

export interface ConversationPattern {
  patternId: string;
  frequency: number;
  context: string;
  adaptationSuccess: number; // 0-1 scale
  recommendedStrategy: string;
}

export interface MemoryMetrics {
  totalTurns: number;
  averageResponseTime: number;
  expertiseProgression: ExpertiseLevel[];
  sophisticationProgression: SophisticationLevel[];
  adaptationSuccessRate: number;
  dominantPatterns: ConversationPattern[];
  memoryUsage: number; // in bytes
  compressionRatio: number;
}

export interface ConversationSnapshot {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  turns: ConversationTurn[];
  currentExpertise: ExpertiseLevel;
  currentSophistication: SophisticationLevel;
  dominantDomain: DomainContext;
  adaptationHistory: AdaptationRecord[];
  patterns: ConversationPattern[];
  metrics: MemoryMetrics;
}

export interface LearningPatternAnalysis {
  learningVelocity: number;
  preferredComplexity: SophisticationLevel;
  adaptationResponsiveness: number;
  dominantInteractionStyle: string;
  recommendedStrategy: string;
}

export interface PerformanceAnalysis {
  successRate: number;
  responseQuality: number;
  engagementLevel: number;
}

export interface CompressedSummary {
  turnCount: number;
  expertiseProgression: ExpertiseLevel[];
  sophisticationProgression: SophisticationLevel[];
  avgResponseTime: number;
  dominantQuestionTypes: QuestionType[];
}

export class ConversationMemoryManager {
  private conversationHistory: Map<string, ConversationSnapshot> = new Map();
  private readonly maxHistoryLength: number = 1000;
  private readonly maxSessionAge: number = 24 * 60 * 60 * 1000; // 24 hours
  private readonly compressionThreshold: number = 500; // compress after 500 turns
  
  constructor(
    private readonly performanceTarget = {
      maxMemoryIncrease: 0.2, // 20%
      maxProcessingTime: 200, // ms
      maxResponseDelay: 3000 // ms
    }
  ) {}

  /**
   * Records a new conversation turn
   */
  recordTurn(
    sessionId: string,
    turn: ConversationTurn,
    context: ConversationContext
  ): void {
    const startTime = performance.now();

    let snapshot = this.conversationHistory.get(sessionId);
    if (!snapshot) {
      snapshot = this.createNewSnapshot(sessionId, context);
      this.conversationHistory.set(sessionId, snapshot);
    }

    // Add turn to history
    snapshot.turns.push(turn);
    snapshot.lastActivity = Date.now();
    
    // Update current state
    snapshot.currentExpertise = turn.expertiseLevel;
    snapshot.currentSophistication = turn.sophisticationLevel;
    
    // Record adaptation if applied
    if (turn.adaptationApplied) {
      snapshot.adaptationHistory.push(turn.adaptationApplied);
    }

    // Update patterns and metrics
    this.updateConversationPatterns(snapshot);
    this.updateMetrics(snapshot);

    // Check for compression need
    if (snapshot.turns.length > this.compressionThreshold) {
      this.compressConversationHistory(snapshot);
    }

    // Performance monitoring
    const processingTime = performance.now() - startTime;
    if (processingTime > this.performanceTarget.maxProcessingTime) {
      console.warn(`ConversationMemory: Turn recording exceeded target time: ${processingTime}ms`);
    }
  }

  /**
   * Retrieves conversation context for adaptation decisions
   */
  getConversationContext(sessionId: string): ConversationContext | null {
    const snapshot = this.conversationHistory.get(sessionId);
    if (!snapshot) return null;

    const recentTurns = snapshot.turns.slice(-10); // Last 10 turns
    const expertiseProgression = recentTurns.map(turn => turn.expertiseLevel);
    const sophisticationProgression = recentTurns.map(turn => turn.sophisticationLevel);

    return {
      sessionId,
      currentExpertise: snapshot.currentExpertise,
      currentSophistication: snapshot.currentSophistication,
      dominantDomain: snapshot.dominantDomain,
      recentTurns,
      expertiseProgression,
      sophisticationProgression,
      adaptationHistory: snapshot.adaptationHistory.slice(-20), // Last 20 adaptations
      conversationLength: snapshot.turns.length,
      sessionDuration: Date.now() - snapshot.startTime,
      patterns: snapshot.patterns.slice(0, 5), // Top 5 patterns
      metrics: snapshot.metrics
    };
  }

  /**
   * Analyzes user learning patterns from conversation history
   */
  analyzeLearningPatterns(sessionId: string): LearningPatternAnalysis {
    const snapshot = this.conversationHistory.get(sessionId);
    if (!snapshot || snapshot.turns.length < 5) {
      return {
        learningVelocity: 0.5,
        preferredComplexity: 3 as SophisticationLevel,
        adaptationResponsiveness: 0.5,
        dominantInteractionStyle: 'balanced',
        recommendedStrategy: 'gradual_progression'
      };
    }

    const turns = snapshot.turns;
    const recentTurns = turns.slice(-20);

    // Calculate learning velocity
    const expertiseChanges = this.calculateExpertiseProgression(recentTurns);
    const learningVelocity = expertiseChanges / recentTurns.length;

    // Determine preferred complexity
    const sophisticationPreference = this.calculateSophisticationPreference(recentTurns);
    
    // Measure adaptation responsiveness
    const adaptationResponsiveness = this.calculateAdaptationResponsiveness(snapshot.adaptationHistory);

    // Identify interaction style
    const interactionStyle = this.identifyInteractionStyle(recentTurns);

    // Generate recommendation
    const recommendedStrategy = this.generateLearningStrategy(
      learningVelocity,
      sophisticationPreference,
      adaptationResponsiveness,
      interactionStyle
    );

    return {
      learningVelocity,
      preferredComplexity: sophisticationPreference,
      adaptationResponsiveness,
      dominantInteractionStyle: interactionStyle,
      recommendedStrategy
    };
  }

  /**
   * Provides memory-aware recommendations for next question adaptation
   */
  getAdaptationRecommendations(sessionId: string): {
    recommendedSophistication: SophisticationLevel;
    confidence: number;
    reasoning: string;
    fallbackStrategy?: string;
  } {
    const context = this.getConversationContext(sessionId);
    if (!context) {
      return {
        recommendedSophistication: 3 as SophisticationLevel,
        confidence: 0.5,
        reasoning: 'No conversation history available'
      };
    }

    const patterns = this.analyzeLearningPatterns(sessionId);
    const recentPerformance = this.analyzeRecentPerformance(context);
    const adaptationHistory = context.adaptationHistory;

    let recommendedLevel: SophisticationLevel;
    let confidence: number;
    let reasoning: string;

    // Determine recommendation based on learning patterns
    if (patterns.learningVelocity > 0.7 && recentPerformance.successRate > 0.8) {
      recommendedLevel = this.increaseSophistication(context.currentSophistication);
      confidence = 0.8;
      reasoning = 'High learning velocity and success rate suggest readiness for increased complexity';
    } else if (patterns.learningVelocity < 0.3 || recentPerformance.successRate < 0.5) {
      recommendedLevel = this.decreaseSophistication(context.currentSophistication);
      confidence = 0.7;
      reasoning = 'Low performance suggests need for reduced complexity';
    } else {
      recommendedLevel = context.currentSophistication || 3 as SophisticationLevel;
      confidence = 0.6;
      reasoning = 'Current level appears appropriate based on recent performance';
    }

    // Adjust based on adaptation history
    const recentAdaptations = adaptationHistory.slice(-5);
    const adaptationEffectiveness = recentAdaptations
      .filter((a: AdaptationRecord) => a.effectiveness !== undefined)
      .reduce((sum: number, a: AdaptationRecord) => sum + (a.effectiveness || 0), 0) / recentAdaptations.length;

    if (adaptationEffectiveness < 0.4) {
      confidence *= 0.8;
      reasoning += '; Recent adaptations show mixed results';
    }

    // Generate fallback strategy if confidence is low
    let fallbackStrategy: string | undefined;
    if (confidence < 0.6) {
      fallbackStrategy = this.generateFallbackStrategy(patterns, recentPerformance);
    }

    return {
      recommendedSophistication: recommendedLevel,
      confidence,
      reasoning,
      fallbackStrategy
    };
  }

  /**
   * Cleans up old conversation data to manage memory usage
   */
  cleanupOldSessions(): void {
    const now = Date.now();
    const sessionsToRemove: string[] = [];

    for (const [sessionId, snapshot] of this.conversationHistory) {
      if (now - snapshot.lastActivity > this.maxSessionAge) {
        sessionsToRemove.push(sessionId);
      }
    }

    sessionsToRemove.forEach(sessionId => {
      this.conversationHistory.delete(sessionId);
    });

    if (sessionsToRemove.length > 0) {
      console.log(`ConversationMemory: Cleaned up ${sessionsToRemove.length} old sessions`);
    }
  }

  /**
   * Gets memory usage statistics
   */
  getMemoryStats(): {
    activeSessions: number;
    totalTurns: number;
    memoryUsage: number;
    compressionRatio: number;
  } {
    let totalTurns = 0;
    let totalMemoryUsage = 0;
    let totalCompressionRatio = 0;

    for (const snapshot of this.conversationHistory.values()) {
      totalTurns += snapshot.turns.length;
      totalMemoryUsage += snapshot.metrics.memoryUsage;
      totalCompressionRatio += snapshot.metrics.compressionRatio;
    }

    return {
      activeSessions: this.conversationHistory.size,
      totalTurns,
      memoryUsage: totalMemoryUsage,
      compressionRatio: totalCompressionRatio / this.conversationHistory.size || 1
    };
  }

  // Private helper methods

  private createNewSnapshot(sessionId: string, context: ConversationContext): ConversationSnapshot {
    // Create a basic ExpertiseLevel object
    const defaultExpertise: ExpertiseLevel = {
      overall: 'beginner' as QuestionComplexity,
      domain: context.dominantDomain.domain || 'general',
      confidence: 0.5,
      technicalDepth: 'beginner' as QuestionComplexity,
      domainKnowledge: 'beginner' as QuestionComplexity,
      integrationAwareness: 'beginner' as QuestionComplexity,
      complianceUnderstanding: 'beginner' as QuestionComplexity,
      signals: [],
      responseHistory: 0,
      consistencyScore: 0.5,
      lastUpdated: new Date()
    };

    return {
      sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      turns: [],
      currentExpertise: context.currentExpertise || defaultExpertise,
      currentSophistication: context.currentSophistication || 3 as SophisticationLevel,
      dominantDomain: context.dominantDomain,
      adaptationHistory: [],
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

  private updateConversationPatterns(snapshot: ConversationSnapshot): void {
    // Analyze recent turns for patterns
    const recentTurns = snapshot.turns.slice(-10);
    
    // Pattern detection logic
    const responseTimePattern = this.detectResponseTimePattern(recentTurns);
    const sophisticationPattern = this.detectSophisticationPattern(recentTurns);
    const adaptationPattern = this.detectAdaptationPattern(snapshot.adaptationHistory.slice(-10));

    // Update patterns
    this.updateOrAddPattern(snapshot.patterns, responseTimePattern);
    this.updateOrAddPattern(snapshot.patterns, sophisticationPattern);
    this.updateOrAddPattern(snapshot.patterns, adaptationPattern);

    // Keep only top patterns to manage memory
    snapshot.patterns = snapshot.patterns
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private updateMetrics(snapshot: ConversationSnapshot): void {
    const turns = snapshot.turns;
    
    snapshot.metrics.totalTurns = turns.length;
    snapshot.metrics.averageResponseTime = turns.reduce((sum, turn) => 
      sum + turn.userResponse.processingTime, 0) / turns.length;
    
    snapshot.metrics.expertiseProgression = turns.map(turn => turn.expertiseLevel);
    snapshot.metrics.sophisticationProgression = turns.map(turn => turn.sophisticationLevel);
    
    const successfulAdaptations = snapshot.adaptationHistory
      .filter(a => a.effectiveness && a.effectiveness > 0.6).length;
    snapshot.metrics.adaptationSuccessRate = successfulAdaptations / 
      Math.max(snapshot.adaptationHistory.length, 1);
    
    snapshot.metrics.dominantPatterns = snapshot.patterns.slice(0, 5);
    
    // Estimate memory usage
    snapshot.metrics.memoryUsage = this.estimateMemoryUsage(snapshot);
  }

  private compressConversationHistory(snapshot: ConversationSnapshot): void {
    const originalLength = snapshot.turns.length;
    
    // Keep recent turns and compress older ones
    const recentTurns = snapshot.turns.slice(-200); // Keep last 200 turns
    const olderTurns = snapshot.turns.slice(0, -200);
    
    // Create compressed summary of older turns
    this.createCompressedSummary(olderTurns);
    
    // Update snapshot
    snapshot.turns = recentTurns;
    snapshot.metrics.compressionRatio = originalLength / snapshot.turns.length;
    
    console.log(`ConversationMemory: Compressed ${originalLength} turns to ${snapshot.turns.length} + summary`);
  }

  private calculateExpertiseProgression(turns: ConversationTurn[]): number {
    if (turns.length < 2) return 0;
    
    const expertiseLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const startLevel = expertiseLevels.indexOf(turns[0].expertiseLevel.overall);
    const endLevel = expertiseLevels.indexOf(turns[turns.length - 1].expertiseLevel.overall);
    
    return (endLevel - startLevel) / turns.length;
  }

  private calculateSophisticationPreference(turns: ConversationTurn[]): SophisticationLevel {
    const sophisticationCounts = new Map<SophisticationLevel, number>();
    
    turns.forEach(turn => {
      const current = sophisticationCounts.get(turn.sophisticationLevel) || 0;
      sophisticationCounts.set(turn.sophisticationLevel, current + 1);
    });
    
    let maxCount = 0;
    let preferredLevel: SophisticationLevel = 3 as SophisticationLevel;
    
    for (const [level, count] of sophisticationCounts) {
      if (count > maxCount) {
        maxCount = count;
        preferredLevel = level;
      }
    }
    
    return preferredLevel;
  }

  private calculateAdaptationResponsiveness(adaptations: AdaptationRecord[]): number {
    if (adaptations.length === 0) return 0.5;
    
    const effectiveAdaptations = adaptations.filter(a => 
      a.effectiveness && a.effectiveness > 0.6
    ).length;
    
    return effectiveAdaptations / adaptations.length;
  }

  private identifyInteractionStyle(turns: ConversationTurn[]): string {
    const avgResponseTime = turns.reduce((sum: number, turn: ConversationTurn) => 
      sum + turn.userResponse.processingTime, 0) / turns.length;
    
    const avgResponseLength = turns.reduce((sum: number, turn: ConversationTurn) => 
      sum + turn.userResponse.response.length, 0) / turns.length;
    
    if (avgResponseTime < 5000 && avgResponseLength < 50) {
      return 'quick_decisive';
    } else if (avgResponseTime > 15000 && avgResponseLength > 200) {
      return 'thoughtful_detailed';
    } else if (avgResponseLength > 150) {
      return 'verbose_explanatory';
    } else if (avgResponseTime < 8000) {
      return 'fast_concise';
    }
    
    return 'balanced';
  }

  private generateLearningStrategy(
    velocity: number,
    complexity: SophisticationLevel,
    responsiveness: number,
    style: string
  ): string {
    if (velocity > 0.6 && responsiveness > 0.7) {
      return 'aggressive_progression';
    } else if (velocity < 0.3 || responsiveness < 0.4) {
      return 'conservative_reinforcement';
    } else if (style === 'thoughtful_detailed') {
      return 'depth_focused';
    } else if (style === 'quick_decisive') {
      return 'breadth_focused';
    }
    
    return 'balanced_adaptation';
  }

  private analyzeRecentPerformance(context: ConversationContext): PerformanceAnalysis {
    const recentTurns = context.recentTurns.slice(-5);
    
    if (recentTurns.length === 0) {
      return { successRate: 0.5, responseQuality: 0.5, engagementLevel: 0.5 };
    }
    
    // Simple heuristic for success rate based on response characteristics
    const successfulResponses = recentTurns.filter((turn: ConversationTurn) => 
      turn.userResponse.response.length > 20 && // Meaningful response length
      turn.userResponse.processingTime < 30000 // Not too slow
    ).length;
    
    const successRate = successfulResponses / recentTurns.length;
    
    const avgResponseLength = recentTurns.reduce((sum: number, turn: ConversationTurn) => 
      sum + turn.userResponse.response.length, 0) / recentTurns.length;
    
    const responseQuality = Math.min(avgResponseLength / 100, 1); // Normalize to 0-1
    
    const avgResponseTime = recentTurns.reduce((sum: number, turn: ConversationTurn) => 
      sum + turn.userResponse.processingTime, 0) / recentTurns.length;
    
    const engagementLevel = Math.max(0, 1 - (avgResponseTime / 60000)); // Lower time = higher engagement
    
    return { successRate, responseQuality, engagementLevel };
  }

  private increaseSophistication(current?: SophisticationLevel): SophisticationLevel {
    const currentLevel = current || 3;
    return Math.min(currentLevel + 1, 5) as SophisticationLevel;
  }

  private decreaseSophistication(current?: SophisticationLevel): SophisticationLevel {
    const currentLevel = current || 3;
    return Math.max(currentLevel - 1, 1) as SophisticationLevel;
  }

  private generateFallbackStrategy(patterns: LearningPatternAnalysis, performance: PerformanceAnalysis): string {
    if (performance.successRate < 0.4) {
      return 'reduce_complexity_and_provide_scaffolding';
    } else if (performance.engagementLevel < 0.3) {
      return 'increase_interactivity_and_variety';
    } else if (patterns.adaptationResponsiveness < 0.3) {
      return 'maintain_consistency_avoid_frequent_changes';
    }
    return 'gradual_adjustment_with_feedback_monitoring';
  }

  private detectResponseTimePattern(turns: ConversationTurn[]): ConversationPattern {
    const avgTime = turns.reduce((sum, turn) => sum + turn.userResponse.processingTime, 0) / turns.length;
    
    return {
      patternId: 'response_time_pattern',
      frequency: turns.length,
      context: avgTime > 15000 ? 'slow_thoughtful' : avgTime < 5000 ? 'quick_responsive' : 'moderate_pace',
      adaptationSuccess: 0.7, // Default value
      recommendedStrategy: avgTime > 15000 ? 'allow_more_thinking_time' : 'maintain_engagement'
    };
  }

  private detectSophisticationPattern(turns: ConversationTurn[]): ConversationPattern {
    const sophisticationChanges = turns.slice(1).filter((turn, index) => 
      turn.sophisticationLevel !== turns[index].sophisticationLevel
    ).length;
    
    return {
      patternId: 'sophistication_pattern',
      frequency: sophisticationChanges,
      context: sophisticationChanges > turns.length * 0.5 ? 'high_variability' : 'stable_level',
      adaptationSuccess: sophisticationChanges > turns.length * 0.5 ? 0.4 : 0.8,
      recommendedStrategy: sophisticationChanges > turns.length * 0.5 ? 'stabilize_level' : 'maintain_progression'
    };
  }

  private detectAdaptationPattern(adaptations: AdaptationRecord[]): ConversationPattern {
    const effectiveAdaptations = adaptations.filter(a => a.effectiveness && a.effectiveness > 0.6).length;
    
    return {
      patternId: 'adaptation_pattern',
      frequency: adaptations.length,
      context: effectiveAdaptations / Math.max(adaptations.length, 1) > 0.7 ? 'responsive_to_changes' : 'adaptation_resistant',
      adaptationSuccess: effectiveAdaptations / Math.max(adaptations.length, 1),
      recommendedStrategy: effectiveAdaptations / Math.max(adaptations.length, 1) > 0.7 ? 'continue_adaptive_approach' : 'reduce_adaptation_frequency'
    };
  }

  private updateOrAddPattern(patterns: ConversationPattern[], newPattern: ConversationPattern): void {
    const existingIndex = patterns.findIndex(p => p.patternId === newPattern.patternId);
    
    if (existingIndex >= 0) {
      patterns[existingIndex] = {
        ...patterns[existingIndex],
        frequency: patterns[existingIndex].frequency + 1,
        adaptationSuccess: (patterns[existingIndex].adaptationSuccess + newPattern.adaptationSuccess) / 2
      };
    } else {
      patterns.push(newPattern);
    }
  }

  private estimateMemoryUsage(snapshot: ConversationSnapshot): number {
    // Rough estimation of memory usage in bytes
    const turnSize = 500; // Approximate bytes per turn
    const patternSize = 200; // Approximate bytes per pattern
    const adaptationSize = 150; // Approximate bytes per adaptation
    
    return (snapshot.turns.length * turnSize) +
           (snapshot.patterns.length * patternSize) +
           (snapshot.adaptationHistory.length * adaptationSize);
  }

  private createCompressedSummary(turns: ConversationTurn[]): CompressedSummary {
    // Create a compressed summary of older turns
    return {
      turnCount: turns.length,
      expertiseProgression: turns.map(t => t.expertiseLevel),
      sophisticationProgression: turns.map(t => t.sophisticationLevel),
      avgResponseTime: turns.reduce((sum, t) => sum + t.userResponse.processingTime, 0) / turns.length,
      dominantQuestionTypes: this.getDominantQuestionTypes(turns)
    };
  }

  private getDominantQuestionTypes(turns: ConversationTurn[]): QuestionType[] {
    const typeCounts = new Map<QuestionType, number>();
    
    turns.forEach(turn => {
      const current = typeCounts.get(turn.questionType) || 0;
      typeCounts.set(turn.questionType, current + 1);
    });
    
    return Array.from(typeCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type);
  }
}

// Export singleton instance for global use
export const conversationMemory = new ConversationMemoryManager();
