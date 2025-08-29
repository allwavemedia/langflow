// React Hooks for Epic 6.4.3 Socratic Questioning System
// Provides React integration for questioning functionality with feature flag support

import { useState, useEffect, useCallback } from 'react';
import { 
  SocraticQuestioningContext, 
  QuestionSession, 
  ExpertiseLevel,
  AdaptiveQuestion,
  UserResponse
} from '../questioning/questionTypes';
import { 
  isSocraticQuestioningEnabled,
  isQuestionGenerationEnabled,
  isExpertiseTrackingEnabled,
  questioningFlags
} from '../featureFlags';

// Hook for managing overall questioning state
export function useSocraticQuestioning(sessionId?: string) {
  const [questioningContext, setQuestioningContext] = useState<SocraticQuestioningContext>({
    isActive: false,
    currentSession: null,
    questioningStrategy: 'adaptive',
    adaptationEnabled: true,
    expertiseTrackingEnabled: isExpertiseTrackingEnabled(),
    progressiveDisclosureEnabled: questioningFlags.isProgressiveDisclosureEnabled(),
    averageResponseTime: 0,
    questionGenerationLatency: 0,
    expertiseAnalysisLatency: 0,
    activeSessions: new Map(),
    maxConcurrentSessions: 5,
    errorCount: 0,
    circuitBreakerOpen: false,
  });

  const [isEnabled, setIsEnabled] = useState(isSocraticQuestioningEnabled());

  // Monitor feature flag changes
  useEffect(() => {
    const checkFeatureFlags = () => {
      const enabled = isSocraticQuestioningEnabled();
      setIsEnabled(enabled);
      
      if (!enabled && questioningContext.isActive) {
        // Feature was disabled, gracefully shutdown
        setQuestioningContext(prev => ({
          ...prev,
          isActive: false,
          currentSession: null,
        }));
      }
    };

    // Check immediately and set up polling for changes
    checkFeatureFlags();
    const interval = setInterval(checkFeatureFlags, 5000);

    return () => clearInterval(interval);
  }, [questioningContext.isActive]);

  const startQuestioning = useCallback((domain: string, maxQuestions = 10) => {
    if (!isEnabled) {
      console.warn('Socratic questioning is disabled via feature flags');
      return null;
    }

    const session: QuestionSession = {
      sessionId: sessionId || `session-${Date.now()}`,
      domain,
      startedAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      questions: [],
      responses: [],
      currentQuestionIndex: 0,
      expertiseLevel: {
        overall: 'intermediate',
        domain,
        confidence: 0.5,
        technicalDepth: 'intermediate',
        domainKnowledge: 'intermediate',
        integrationAwareness: 'intermediate',
        complianceUnderstanding: 'intermediate',
        signals: [],
        responseHistory: 0,
        consistencyScore: 0.5,
        lastUpdated: new Date(),
      },
      disclosureState: {
        currentLevel: 1,
        maxUnlockedLevel: 1,
        domainFamiliarity: { [domain]: 1 },
        questionsAnsweredAtLevel: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        expertiseThresholds: { 1: 0, 2: 3, 3: 7, 4: 12, 5: 20 },
        unlockCriteria: {
          1: ['basic-concepts'],
          2: ['basic-understanding'],
          3: ['intermediate-concepts'],
          4: ['advanced-patterns'],
          5: ['expert-insights'],
        },
        allowLevelSkipping: false,
        autoAdvancement: true,
        requiresValidation: false,
      },
      domainContext: {
        domain,
        confidence: 0.8,
        indicators: [],
        timestamp: new Date(),
        source: 'conversation',
      },
      maxQuestions: maxQuestions,
      timeoutMinutes: 30,
      allowBacktracking: true,
      conversationFlow: {
        currentPhase: 'discovery',
        phaseProgress: 0,
        overallProgress: 0,
        availableTransitions: ['exploration'],
        blockedTransitions: [],
        conditionalBranches: [],
        accumulatedContext: {},
        verifiedFacts: [],
        assumptionsMade: [],
        unknownsIdentified: [],
      },
    };

    setQuestioningContext(prev => ({
      ...prev,
      isActive: true,
      currentSession: session,
      activeSessions: new Map(prev.activeSessions.set(session.sessionId, session)),
    }));

    return session;
  }, [isEnabled, sessionId]);

  const endQuestioning = useCallback((sessionId: string) => {
    setQuestioningContext(prev => {
      const newSessions = new Map(prev.activeSessions);
      newSessions.delete(sessionId);
      
      return {
        ...prev,
        activeSessions: newSessions,
        currentSession: prev.currentSession?.sessionId === sessionId ? null : prev.currentSession,
        isActive: newSessions.size > 0,
      };
    });
  }, []);

  return {
    questioningContext,
    isEnabled,
    startQuestioning,
    endQuestioning,
  };
}

// Hook for question generation
export function useQuestionGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  
  const generateQuestion = useCallback(async (
    domain: string,
    expertiseLevel: ExpertiseLevel,
    conversationHistory: UserResponse[] = [] // For future use in conversation analysis
  ): Promise<AdaptiveQuestion | null> => {
    if (!isQuestionGenerationEnabled()) {
      console.warn('Question generation is disabled via feature flags');
      return null;
    }

    setIsLoading(true);
    setLastError(null);

    try {
      // Basic question generation implementation using conversation history
      // In a real implementation, this would call the question generation engine
      const historyBasedComplexity = conversationHistory.length > 3 ? 'advanced' : expertiseLevel.overall;
      
      const question: AdaptiveQuestion = {
        id: `q-${Date.now()}`,
        type: 'exploration',
        complexity: historyBasedComplexity,
        priority: 'medium',
        domain,
        question: `What specific aspects of ${domain} workflows are most important for your use case?`,
        context: 'Generated based on domain analysis and user expertise level',
        expectedResponseType: 'text',
        followUpTriggers: ['specific-technology', 'integration-needs', 'compliance-requirements'],
        prerequisiteQuestions: [],
        alternativeFormulations: [
          `How do you typically handle ${domain} processes in your current workflow?`,
          `What ${domain} challenges are you looking to solve?`
        ],
        domainSpecific: true,
        complianceRelated: false,
        performanceImpact: 'low',
        tags: ['exploration', 'workflow-discovery'],
        generatedAt: new Date(),
        source: 'dynamic',
        confidence: 0.8,
      };

      setIsLoading(false);
      return question;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Question generation failed';
      setLastError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  return {
    generateQuestion,
    isLoading,
    lastError,
    isEnabled: isQuestionGenerationEnabled(),
  };
}

// Hook for expertise tracking
export function useExpertiseTracking() {
  const [expertiseHistory, setExpertiseHistory] = useState<Map<string, ExpertiseLevel>>(new Map());
  
  const analyzeResponse = useCallback(async (
    response: UserResponse,
    currentExpertise: ExpertiseLevel
  ): Promise<ExpertiseLevel | null> => {
    if (!isExpertiseTrackingEnabled()) {
      return null;
    }

    try {
      // Basic expertise analysis
      // In a real implementation, this would use sophisticated NLP analysis
      const responseLength = response.response.length;
      const technicalTerms = response.metadata.technicalTermsUsed.length;
      const concepts = response.metadata.conceptsReferenced.length;
      
      let complexityAdjustment = currentExpertise.overall;
      
      // Simple heuristics for expertise adjustment
      if (responseLength > 200 && technicalTerms > 3 && concepts > 2) {
        complexityAdjustment = 'advanced';
      } else if (responseLength > 100 && technicalTerms > 1) {
        complexityAdjustment = 'intermediate';
      } else if (complexityAdjustment === 'research') {
        complexityAdjustment = 'expert'; // Map research to expert level
      }

      const updatedExpertise: ExpertiseLevel = {
        ...currentExpertise,
        overall: complexityAdjustment,
        confidence: Math.min(currentExpertise.confidence + 0.1, 1.0),
        responseHistory: currentExpertise.responseHistory + 1,
        lastUpdated: new Date(),
      };

      setExpertiseHistory(prev => new Map(prev.set(response.sessionId, updatedExpertise)));
      
      return updatedExpertise;

    } catch (error) {
      console.warn('Expertise analysis failed:', error);
      return null;
    }
  }, []);

  const getExpertiseLevel = useCallback((sessionId: string): ExpertiseLevel | null => {
    return expertiseHistory.get(sessionId) || null;
  }, [expertiseHistory]);

  return {
    analyzeResponse,
    getExpertiseLevel,
    expertiseHistory,
    isEnabled: isExpertiseTrackingEnabled(),
  };
}

// Hook for question session management
export function useQuestioningSession(sessionId: string) {
  const [session, setSession] = useState<QuestionSession | null>(null);
  const [isActive, setIsActive] = useState(false);
  
  const updateSession = useCallback((updates: Partial<QuestionSession>) => {
    setSession(prev => prev ? { ...prev, ...updates, lastActivity: new Date() } : null);
  }, []);

  // Use sessionId for tracking (placeholder implementation)
  console.log('Managing session:', sessionId);

  const addQuestion = useCallback((question: AdaptiveQuestion) => {
    setSession(prev => prev ? {
      ...prev,
      questions: [...prev.questions, question],
      lastActivity: new Date(),
    } : null);
  }, []);

  const addResponse = useCallback((response: UserResponse) => {
    setSession(prev => prev ? {
      ...prev,
      responses: [...prev.responses, response],
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      lastActivity: new Date(),
    } : null);
  }, []);

  const endSession = useCallback(() => {
    setSession(prev => prev ? { ...prev, isActive: false } : null);
    setIsActive(false);
  }, []);

  return {
    session,
    isActive,
    updateSession,
    addQuestion,
    addResponse,
    endSession,
  };
}

// Hook for questioning performance monitoring
export function useQuestioningPerformance() {
  const [metrics, setMetrics] = useState({
    questionGenerationLatency: 0,
    expertiseAnalysisLatency: 0,
    totalResponseTime: 0,
    errorRate: 0,
    cacheHitRate: 0,
  });

  const recordLatency = useCallback((operation: string, latency: number) => {
    setMetrics(prev => ({
      ...prev,
      [`${operation}Latency`]: latency,
      totalResponseTime: prev.totalResponseTime + latency,
    }));
  }, []);

  const recordError = useCallback(() => {
    setMetrics(prev => ({
      ...prev,
      errorRate: prev.errorRate + 1,
    }));
  }, []);

  const recordCacheHit = useCallback((hit: boolean) => {
    setMetrics(prev => ({
      ...prev,
      cacheHitRate: hit ? prev.cacheHitRate + 1 : prev.cacheHitRate,
    }));
  }, []);

  return {
    metrics,
    recordLatency,
    recordError,
    recordCacheHit,
  };
}
