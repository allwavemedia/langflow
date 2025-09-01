// Epic 6.4.3 Story 1.3: Progressive Disclosure Implementation
// Sophistication adaptation engine for adjusting question complexity based on user expertise

import { 
  AdaptiveQuestion, 
  SophisticationLevel,
  QuestionComplexity
} from './questionTypes';
import { DomainContext } from '../domainDetectionSystem';
import { ExpertiseLevel, UserResponse, ExpertiseIndicators } from './expertiseTracker';

export type AdaptationStrategy = 'conservative' | 'moderate' | 'aggressive' | 'adaptive';
export type FallbackCondition = 'confusion' | 'time-pressure' | 'complexity-overload' | 'knowledge-gap';

export interface SophisticationAdjustment {
  fromLevel: SophisticationLevel;
  toLevel: SophisticationLevel;
  reason: string;
  confidence: number;
  adaptationStrategy: AdaptationStrategy;
  triggers: string[];
}

export interface ProgressiveDisclosureConfig {
  // Sophistication scaling parameters
  sophisticationThresholds: Record<ExpertiseLevel, SophisticationLevel>;
  adaptationSpeed: number; // 0-1, how quickly to adapt
  conservativeMode: boolean; // Prefer lower complexity when uncertain
  
  // Fallback and safety parameters
  confusionDetectionThreshold: number;
  fallbackSteps: number; // How many levels to drop when falling back
  maxProgressionPerSession: number; // Max sophistication increase per session
  
  // Context awareness
  domainSpecificAdaptation: boolean;
  crossDomainTransfer: number; // 0-1, how much expertise transfers between domains
  sessionMemoryWeight: number; // 0-1, weight of current session vs historical data
  
  // Performance and monitoring
  enableAdaptationLogging: boolean;
  maxAdaptationTimeMs: number;
  trackAdaptationEffectiveness: boolean;
}

export interface AdaptationContext {
  currentExpertise: ExpertiseLevel;
  domainContext: DomainContext;
  recentResponses: UserResponse[];
  sessionHistory: AdaptiveQuestion[];
  confusionSignals: boolean;
  timeConstraints?: number; // Available response time in ms
  userPreferences?: {
    preferredComplexity?: QuestionComplexity;
    allowAdvancement?: boolean;
    requestSimplification?: boolean;
  };
}

export class DynamicProgressiveDisclosure {
  private config: ProgressiveDisclosureConfig;
  private adaptationHistory: Map<string, SophisticationAdjustment[]> = new Map(); // sessionId -> adjustments
  private effectivenessMetrics: Map<SophisticationLevel, number> = new Map(); // level -> success rate
  
  constructor(config: Partial<ProgressiveDisclosureConfig> = {}) {
    this.config = {
      sophisticationThresholds: {
        novice: 1,
        beginner: 2,
        intermediate: 3,
        advanced: 4,
        expert: 5
      },
      adaptationSpeed: 0.3,
      conservativeMode: true,
      confusionDetectionThreshold: 0.3,
      fallbackSteps: 1,
      maxProgressionPerSession: 2,
      domainSpecificAdaptation: true,
      crossDomainTransfer: 0.3,
      sessionMemoryWeight: 0.7,
      enableAdaptationLogging: false,
      maxAdaptationTimeMs: 50,
      trackAdaptationEffectiveness: true,
      ...config
    };
    
    // Initialize effectiveness metrics
    for (let level = 1; level <= 5; level++) {
      this.effectivenessMetrics.set(level as SophisticationLevel, 0.5);
    }
  }
  
  /**
   * Adjust question sophistication based on user expertise and context
   */
  public adjustQuestionSophistication(
    baseQuestion: AdaptiveQuestion,
    expertiseLevel: ExpertiseLevel,
    conversationContext: AdaptationContext
  ): AdaptiveQuestion {
    const startTime = Date.now();
    
    try {
      // Determine target sophistication level
      const targetLevel = this.determineTargetSophistication(
        expertiseLevel,
        conversationContext
      );
      
      // If no change needed, return original question
      if (this.getCurrentQuestionSophistication(baseQuestion) === targetLevel) {
        return baseQuestion;
      }
      
      // Create adjusted question
      const adjustedQuestion = this.createAdjustedQuestion(
        baseQuestion,
        targetLevel
      );
      
      // Log adaptation if enabled
      if (this.config.enableAdaptationLogging) {
        this.logAdaptation(baseQuestion, adjustedQuestion, expertiseLevel, conversationContext);
      }
      
      // Track performance
      const adaptationTime = Date.now() - startTime;
      if (adaptationTime > this.config.maxAdaptationTimeMs) {
        console.warn(`Progressive disclosure adaptation took ${adaptationTime}ms (threshold: ${this.config.maxAdaptationTimeMs}ms)`);
      }
      
      return adjustedQuestion;
      
    } catch (error) {
      console.error('Error in progressive disclosure adaptation:', error);
      return baseQuestion; // Return original question on error
    }
  }
  
  /**
   * Determine the next question sophistication level based on expertise and response quality
   */
  public determineNextQuestionLevel(
    currentLevel: ExpertiseLevel,
    responseQuality: { score: number; confusionSignals: boolean; indicators: ExpertiseIndicators },
    domainConfidence: number
  ): SophisticationLevel {
    // Get base sophistication level for current expertise
    const baseSophistication = this.config.sophisticationThresholds[currentLevel];
    
    // Adjust based on response quality
    let adjustedLevel = baseSophistication;
    
    // Increase sophistication if high quality response
    if (responseQuality.score > 0.8 && !responseQuality.confusionSignals) {
      adjustedLevel = Math.min(5, baseSophistication + 1) as SophisticationLevel;
    }
    
    // Decrease if confusion detected or low quality
    if (responseQuality.confusionSignals || responseQuality.score < 0.4) {
      adjustedLevel = Math.max(1, baseSophistication - this.config.fallbackSteps) as SophisticationLevel;
    }
    
    // Apply domain confidence modifier
    if (domainConfidence < 0.5) {
      adjustedLevel = Math.max(1, adjustedLevel - 1) as SophisticationLevel;
    }
    
    // Apply conservative mode if enabled
    if (this.config.conservativeMode && responseQuality.score < 0.6) {
      adjustedLevel = Math.max(1, adjustedLevel - 1) as SophisticationLevel;
    }
    
    return adjustedLevel;
  }
  
  /**
   * Check if sophistication should fall back due to confusion or difficulty
   */
  public shouldFallback(
    responses: UserResponse[],
    currentSophistication: SophisticationLevel
  ): { shouldFallback: boolean; condition: FallbackCondition | null; newLevel: SophisticationLevel | null } {
    if (responses.length < 2) {
      return { shouldFallback: false, condition: null, newLevel: null };
    }
    
    const recentResponses = responses.slice(-3);
    
    // Check for confusion signals
    const confusionRate = recentResponses.filter(r => 
      r.text.toLowerCase().includes('confused') ||
      r.text.toLowerCase().includes('don\'t understand') ||
      r.text.toLowerCase().includes('help') ||
      r.text.length < 10
    ).length / recentResponses.length;
    
    if (confusionRate > this.config.confusionDetectionThreshold) {
      return {
        shouldFallback: true,
        condition: 'confusion',
        newLevel: Math.max(1, currentSophistication - this.config.fallbackSteps) as SophisticationLevel
      };
    }
    
    // Check for time pressure (very quick responses might indicate overwhelm)
    const avgResponseTime = recentResponses.reduce((sum, r) => sum + r.responseTime, 0) / recentResponses.length;
    if (avgResponseTime < 5000 && currentSophistication > 2) { // Less than 5 seconds
      return {
        shouldFallback: true,
        condition: 'time-pressure',
        newLevel: Math.max(1, currentSophistication - 1) as SophisticationLevel
      };
    }
    
    // Check for complexity overload (declining response quality)
    const qualityTrend = this.calculateQualityTrend(recentResponses);
    if (qualityTrend < -0.2 && currentSophistication > 2) {
      return {
        shouldFallback: true,
        condition: 'complexity-overload',
        newLevel: Math.max(1, currentSophistication - 1) as SophisticationLevel
      };
    }
    
    return { shouldFallback: false, condition: null, newLevel: null };
  }
  
  /**
   * Get adaptation recommendations for continuing the conversation
   */
  public getAdaptationRecommendations(
    sessionId: string,
    currentContext: AdaptationContext
  ): {
    recommendedSophistication: SophisticationLevel;
    adaptationStrategy: AdaptationStrategy;
    reasoning: string[];
    confidence: number;
  } {
    const history = this.adaptationHistory.get(sessionId) || [];
    const currentSophistication = this.getCurrentSophisticationFromContext(currentContext);
    
    // Analyze adaptation effectiveness
    const effectiveness = this.analyzeAdaptationEffectiveness(history);
    
    // Determine optimal sophistication level
    const baseSophistication = this.config.sophisticationThresholds[currentContext.currentExpertise];
    let recommendedLevel = baseSophistication;
    
    const reasoning: string[] = [];
    
    // Adjust based on effectiveness
    if (effectiveness.overallSuccess > 0.8) {
      recommendedLevel = Math.min(5, baseSophistication + 1) as SophisticationLevel;
      reasoning.push(`High success rate (${Math.round(effectiveness.overallSuccess * 100)}%) suggests readiness for advancement`);
    } else if (effectiveness.overallSuccess < 0.4) {
      recommendedLevel = Math.max(1, baseSophistication - 1) as SophisticationLevel;
      reasoning.push(`Low success rate (${Math.round(effectiveness.overallSuccess * 100)}%) suggests need for simplification`);
    }
    
    // Consider domain confidence
    if (currentContext.domainContext.confidence < 0.6) {
      recommendedLevel = Math.max(1, recommendedLevel - 1) as SophisticationLevel;
      reasoning.push(`Low domain confidence (${Math.round(currentContext.domainContext.confidence * 100)}%) recommends conservative approach`);
    }
    
    // Check for confusion signals
    if (currentContext.confusionSignals) {
      recommendedLevel = Math.max(1, recommendedLevel - this.config.fallbackSteps) as SophisticationLevel;
      reasoning.push('Confusion signals detected, reducing complexity');
    }
    
    // Apply session progression limits
    const sessionProgression = this.calculateSessionProgression(history);
    if (sessionProgression >= this.config.maxProgressionPerSession) {
      recommendedLevel = Math.min(recommendedLevel, currentSophistication) as SophisticationLevel;
      reasoning.push(`Session progression limit reached (${sessionProgression}/${this.config.maxProgressionPerSession})`);
    }
    
    // Determine adaptation strategy
    let strategy: AdaptationStrategy = 'moderate';
    if (effectiveness.overallSuccess > 0.9) {
      strategy = 'aggressive';
    } else if (effectiveness.overallSuccess < 0.3 || currentContext.confusionSignals) {
      strategy = 'conservative';
    } else if (this.shouldUseAdaptiveStrategy(currentContext)) {
      strategy = 'adaptive';
    }
    
    // Calculate confidence in recommendation
    const confidence = this.calculateRecommendationConfidence(
      currentContext,
      effectiveness
    );
    
    return {
      recommendedSophistication: recommendedLevel,
      adaptationStrategy: strategy,
      reasoning,
      confidence
    };
  }
  
  /**
   * Private helper methods
   */
  
  private determineTargetSophistication(
    expertiseLevel: ExpertiseLevel,
    context: AdaptationContext
  ): SophisticationLevel {
    const baseSophistication = this.config.sophisticationThresholds[expertiseLevel];
    
    // Apply context-based adjustments
    let targetLevel = baseSophistication;
    
    // Consider domain confidence
    if (context.domainContext.confidence < 0.6) {
      targetLevel = Math.max(1, targetLevel - 1) as SophisticationLevel;
    }
    
    // Check for confusion signals
    if (context.confusionSignals) {
      targetLevel = Math.max(1, targetLevel - this.config.fallbackSteps) as SophisticationLevel;
    }
    
    // Apply user preferences
    if (context.userPreferences?.requestSimplification) {
      targetLevel = Math.max(1, targetLevel - 1) as SophisticationLevel;
    }
    
    // Consider time constraints
    if (context.timeConstraints && context.timeConstraints < 30000) { // Less than 30 seconds
      targetLevel = Math.max(1, targetLevel - 1) as SophisticationLevel;
    }
    
    return targetLevel;
  }
  
  private getCurrentQuestionSophistication(question: AdaptiveQuestion): SophisticationLevel {
    // Map question complexity to sophistication level
    const complexityMapping: Record<QuestionComplexity, SophisticationLevel> = {
      beginner: 1,
      intermediate: 3,
      advanced: 4,
      expert: 5,
      research: 5
    };
    
    return complexityMapping[question.complexity] || 3;
  }
  
  private createAdjustedQuestion(
    baseQuestion: AdaptiveQuestion,
    targetLevel: SophisticationLevel
  ): AdaptiveQuestion {
    // Map sophistication level back to complexity
    const levelToComplexity: Record<SophisticationLevel, QuestionComplexity> = {
      1: 'beginner',
      2: 'beginner',
      3: 'intermediate',
      4: 'advanced',
      5: 'expert'
    };
    
    const adjustedComplexity = levelToComplexity[targetLevel];
    
    // Create adjusted question with modified complexity and potentially simplified language
    const adjustedQuestion: AdaptiveQuestion = {
      ...baseQuestion,
      id: `${baseQuestion.id}-adapted-${targetLevel}`,
      complexity: adjustedComplexity,
      question: this.adjustQuestionLanguage(baseQuestion.question, targetLevel),
      context: `${baseQuestion.context} (Adapted for sophistication level ${targetLevel})`,
      generatedAt: new Date(),
      source: 'dynamic'
    };
    
    return adjustedQuestion;
  }
  
  private adjustQuestionLanguage(question: string, sophisticationLevel: SophisticationLevel): string {
    // This is a simplified implementation - in a real system, this would use more sophisticated NLP
    if (sophisticationLevel <= 2) {
      // Simplify language for beginner levels
      return question
        .replace(/implement/gi, 'create')
        .replace(/utilize/gi, 'use')
        .replace(/demonstrate/gi, 'show')
        .replace(/methodology/gi, 'way')
        .replace(/optimization/gi, 'improvement');
    } else if (sophisticationLevel >= 4) {
      // Use more technical language for advanced levels
      return question
        .replace(/create/gi, 'implement')
        .replace(/use/gi, 'utilize')
        .replace(/show/gi, 'demonstrate')
        .replace(/way/gi, 'methodology')
        .replace(/improvement/gi, 'optimization');
    }
    
    return question; // No change for intermediate levels
  }
  
  private calculateQualityTrend(responses: UserResponse[]): number {
    if (responses.length < 2) return 0;
    
    // Simple linear trend calculation based on response length and technical terms
    const qualities = responses.map(r => {
      const wordCount = r.metadata?.wordCount || r.text.split(' ').length;
      const techTerms = r.metadata?.technicalTerms?.length || 0;
      return (wordCount / 50) * 0.6 + (techTerms / 5) * 0.4;
    });
    
    // Calculate trend (positive = improving, negative = declining)
    const firstHalf = qualities.slice(0, Math.floor(qualities.length / 2));
    const secondHalf = qualities.slice(-Math.floor(qualities.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    return secondAvg - firstAvg;
  }
  
  private getCurrentSophisticationFromContext(context: AdaptationContext): SophisticationLevel {
    if (context.sessionHistory.length === 0) {
      return this.config.sophisticationThresholds[context.currentExpertise];
    }
    
    const lastQuestion = context.sessionHistory[context.sessionHistory.length - 1];
    return this.getCurrentQuestionSophistication(lastQuestion);
  }
  
  private analyzeAdaptationEffectiveness(
    history: SophisticationAdjustment[]
  ): { overallSuccess: number; levelEffectiveness: Map<SophisticationLevel, number> } {
    if (history.length === 0) {
      return {
        overallSuccess: 0.5,
        levelEffectiveness: new Map(this.effectivenessMetrics)
      };
    }
    
    // Calculate success rate based on whether adjustments led to better responses
    const successfulAdjustments = history.filter(adj => adj.confidence > 0.7).length;
    const overallSuccess = successfulAdjustments / history.length;
    
    // Calculate level-specific effectiveness
    const levelEffectiveness = new Map<SophisticationLevel, number>();
    for (let level = 1; level <= 5; level++) {
      const levelAdjustments = history.filter(adj => adj.toLevel === level);
      if (levelAdjustments.length > 0) {
        const levelSuccess = levelAdjustments.filter(adj => adj.confidence > 0.7).length / levelAdjustments.length;
        levelEffectiveness.set(level as SophisticationLevel, levelSuccess);
      } else {
        levelEffectiveness.set(level as SophisticationLevel, 0.5);
      }
    }
    
    return { overallSuccess, levelEffectiveness };
  }
  
  private calculateSessionProgression(history: SophisticationAdjustment[]): number {
    if (history.length === 0) return 0;
    
    const firstLevel = history[0].fromLevel;
    const lastLevel = history[history.length - 1].toLevel;
    
    return Math.max(0, lastLevel - firstLevel);
  }
  
  private shouldUseAdaptiveStrategy(context: AdaptationContext): boolean {
    // Use adaptive strategy when we have enough data and mixed signals
    return context.recentResponses.length >= 3 &&
           context.sessionHistory.length >= 2 &&
           !context.confusionSignals &&
           context.domainContext.confidence > 0.5;
  }
  
  private calculateRecommendationConfidence(
    context: AdaptationContext,
    effectiveness: { overallSuccess: number }
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence with more data
    if (context.recentResponses.length >= 3) confidence += 0.2;
    if (context.sessionHistory.length >= 2) confidence += 0.1;
    
    // Adjust based on effectiveness
    confidence += (effectiveness.overallSuccess - 0.5) * 0.4;
    
    // Adjust based on domain confidence
    confidence += (context.domainContext.confidence - 0.5) * 0.2;
    
    // Reduce confidence if confusion signals present
    if (context.confusionSignals) confidence -= 0.3;
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  private logAdaptation(
    originalQuestion: AdaptiveQuestion,
    adjustedQuestion: AdaptiveQuestion,
    expertiseLevel: ExpertiseLevel,
    context: AdaptationContext
  ): void {
    const adjustment: SophisticationAdjustment = {
      fromLevel: this.getCurrentQuestionSophistication(originalQuestion),
      toLevel: this.getCurrentQuestionSophistication(adjustedQuestion),
      reason: `Expertise: ${expertiseLevel}, Domain confidence: ${context.domainContext.confidence}`,
      confidence: 0.8, // This would be calculated based on various factors
      adaptationStrategy: 'moderate',
      triggers: context.confusionSignals ? ['confusion'] : ['expertise-assessment']
    };
    
    // Log to session history (would be session-specific in real implementation)
    console.log('Progressive Disclosure Adaptation:', adjustment);
  }
}

export default DynamicProgressiveDisclosure;
