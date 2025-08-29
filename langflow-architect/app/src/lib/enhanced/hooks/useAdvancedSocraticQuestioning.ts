// React Hooks for Epic 6.4.3 Socratic Questioning System
// Provides React integration for questioning functionality with feature flag support

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  SocraticQuestioningContext, 
  QuestionSession, 
  ExpertiseLevel,
  AdaptiveQuestion,
  UserResponse,
  QuestioningEvent
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
        questionsAnsweredAtLevel: { 1: 0 },
        expertiseThresholds: { 1: 0, 2: 3, 3: 7, 4: 12, 5: 20 },
        unlockCriteria: {
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
      maxQuestions,
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

  const stopQuestioning = useCallback(() => {
    setQuestioningContext(prev => ({
      ...prev,
      isActive: false,
      currentSession: null,
    }));
  }, []);

  const pauseQuestioning = useCallback(() => {
    setQuestioningContext(prev => ({
      ...prev,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        isActive: false,
      } : null,
    }));
  }, []);

  const resumeQuestioning = useCallback(() => {
    if (!isEnabled) return;
    
    setQuestioningContext(prev => ({
      ...prev,
      currentSession: prev.currentSession ? {
        ...prev.currentSession,
        isActive: true,
        lastActivity: new Date(),
      } : null,
    }));
  }, [isEnabled]);

  return {
    questioningContext,
    isEnabled,
    startQuestioning,
    stopQuestioning,
    pauseQuestioning,
    resumeQuestioning,
  };
}

// Hook for question generation functionality
export function useQuestionGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<AdaptiveQuestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generationCache = useRef(new Map<string, AdaptiveQuestion>());

  const generateQuestion = useCallback(async (
    domain: string,
    expertise: ExpertiseLevel,
    context: Record<string, unknown> = {}
  ): Promise<AdaptiveQuestion | null> => {
    if (!isQuestionGenerationEnabled()) {
      console.warn('Question generation is disabled via feature flags');
      return null;
    }

    const cacheKey = `${domain}-${expertise.overall}-${JSON.stringify(context)}`;
    const cached = generationCache.current.get(cacheKey);
    if (cached) {
      setLastGenerated(cached);
      return cached;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Simulate question generation with basic fallback
      // In real implementation, this would call the question generation engine
      const question: AdaptiveQuestion = {
        id: `q-${Date.now()}`,
        type: 'exploration',
        complexity: expertise.overall,
        priority: 'medium',
        domain,
        question: `What specific aspects of ${domain} workflows are most important for your use case?`,
        context: `Generated for ${expertise.overall} level user in ${domain} domain`,
        expectedResponseType: 'text',
        followUpTriggers: ['integration', 'performance', 'security'],
        prerequisiteQuestions: [],
        alternativeFormulations: [
          `Which ${domain} requirements should we prioritize?`,
          `What are your main ${domain} workflow objectives?`,
        ],
        domainSpecific: true,
        complianceRelated: false,
        performanceImpact: 'low',
        tags: [domain, 'exploration', 'requirements'],
        generatedAt: new Date(),
        source: 'dynamic',
        confidence: 0.8,
      };

      generationCache.current.set(cacheKey, question);
      setLastGenerated(question);
      return question;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Question generation failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearCache = useCallback(() => {
    generationCache.current.clear();
  }, []);

  return {
    generateQuestion,
    isGenerating,
    lastGenerated,
    error,
    clearCache,
  };
}

// Hook for expertise tracking
export function useExpertiseTracking(sessionId?: string) {
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel | null>(null);
  const [isTracking, setIsTracking] = useState(isExpertiseTrackingEnabled());
  const [analysisHistory, setAnalysisHistory] = useState<ExpertiseLevel[]>([]);

  useEffect(() => {
    setIsTracking(isExpertiseTrackingEnabled());
  }, []);

  const analyzeResponse = useCallback((response: UserResponse): ExpertiseLevel | null => {
    if (!isTracking) {
      console.warn('Expertise tracking is disabled via feature flags');
      return null;
    }

    // Basic expertise analysis - would be more sophisticated in real implementation
    const indicators = response.extractedEntities.length + response.identifiedConcepts.length;
    const complexity: ExpertiseLevel['overall'] = 
      indicators > 5 ? 'advanced' :
      indicators > 2 ? 'intermediate' : 'beginner';

    const newExpertiseLevel: ExpertiseLevel = {
      overall: complexity,
      domain: response.questionId.includes('healthcare') ? 'healthcare' : 'general',
      confidence: response.confidence,
      technicalDepth: complexity,
      domainKnowledge: complexity,
      integrationAwareness: complexity,
      complianceUnderstanding: complexity,
      signals: [],
      responseHistory: (expertiseLevel?.responseHistory || 0) + 1,
      consistencyScore: 0.8,
      lastUpdated: new Date(),
    };

    setExpertiseLevel(newExpertiseLevel);
    setAnalysisHistory(prev => [...prev, newExpertiseLevel].slice(-10)); // Keep last 10

    return newExpertiseLevel;
  }, [isTracking, expertiseLevel]);

  const resetTracking = useCallback(() => {
    setExpertiseLevel(null);
    setAnalysisHistory([]);
  }, []);

  return {
    expertiseLevel,
    isTracking,
    analysisHistory,
    analyzeResponse,
    resetTracking,
  };
}

// Hook for session management
export function useQuestioningSession(sessionId: string) {
  const [session, setSession] = useState<QuestionSession | null>(null);
  const [events, setEvents] = useState<QuestioningEvent[]>([]);

  const updateSession = useCallback((updates: Partial<QuestionSession>) => {
    setSession(prev => prev ? { ...prev, ...updates, lastActivity: new Date() } : null);
  }, []);

  const addEvent = useCallback((event: Omit<QuestioningEvent, 'timestamp'>) => {
    const fullEvent: QuestioningEvent = {
      ...event,
      timestamp: new Date(),
    };
    setEvents(prev => [...prev, fullEvent].slice(-50)); // Keep last 50 events
  }, []);

  const endSession = useCallback(() => {
    if (session) {
      addEvent({
        type: 'complete-session',
        sessionId: session.sessionId,
        payload: { totalQuestions: session.questions.length, totalResponses: session.responses.length },
        success: true,
        duration: Date.now() - session.startedAt.getTime(),
      });
    }
    setSession(null);
  }, [session, addEvent]);

  return {
    session,
    events,
    updateSession,
    addEvent,
    endSession,
  };
}

// Hook for performance monitoring
export function useQuestioningPerformance() {
  const [metrics, setMetrics] = useState({
    questionGenerationTime: 0,
    expertiseAnalysisTime: 0,
    totalLatency: 0,
    cacheHitRate: 0,
    errorRate: 0,
  });

  const recordMetric = useCallback((metricName: keyof typeof metrics, value: number) => {
    setMetrics(prev => ({
      ...prev,
      [metricName]: value,
    }));
  }, []);

  const recordTiming = useCallback(<T,>(
    operation: () => Promise<T>,
    metricName: keyof typeof metrics
  ): Promise<T> => {
    const start = performance.now();
    return operation().finally(() => {
      const duration = performance.now() - start;
      recordMetric(metricName, duration);
    });
  }, [recordMetric]);

  return {
    metrics,
    recordMetric,
    recordTiming,
  };
}

// Convenience hook for complete questioning functionality
export function useAdvancedSocraticQuestioning(sessionId?: string) {
  const questioning = useSocraticQuestioning(sessionId);
  const questionGeneration = useQuestionGeneration();
  const expertiseTracking = useExpertiseTracking(sessionId);
  const performance = useQuestioningPerformance();

  const isFullyEnabled = questioning.isEnabled && 
                         isQuestionGenerationEnabled() && 
                         isExpertiseTrackingEnabled();

  return {
    ...questioning,
    ...questionGeneration,
    ...expertiseTracking,
    performance,
    isFullyEnabled,
  };
}