// Enhanced Domain Expertise Provider - Epic 6.4.3 Story 1.1
// Composition-based extension of domain detection system with questioning capabilities
// CRITICAL: Zero modification to existing domain detection - composition pattern only

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { domainDetectionSystem, DomainContext, EnhancedDomainContext } from '../lib/enhanced/domainDetectionSystem';
import { 
  SocraticQuestioningContext, 
  EnhancedDomainContext as QuestioningEnhancedDomainContext,
  QuestionSession,
  ExpertiseLevel,
  QuestionType,
  QuestionComplexity,
  DisclosureLevel
} from '../lib/enhanced/questioning/questionTypes';
import { 
  isSocraticQuestioningEnabled,
  questioningFlags,
  questioningCircuitBreaker
} from '../lib/enhanced/featureFlags';

// Enhanced context that composes original domain context with questioning capabilities
interface EnhancedDomainExpertiseContext {
  // Original domain detection functionality (unchanged)
  originalDomainContext: EnhancedDomainContext | null;
  
  // Domain detection methods (preserved exactly)
  analyzeUserContext: (input: string, sessionId?: string) => Promise<DomainContext>;
  activateDomainExpertise: (input: string, sessionId: string) => Promise<any>;
  getActiveDomainContext: (sessionId: string) => EnhancedDomainContext | null;
  
  // Enhanced questioning capabilities (additive only)
  questioningContext: SocraticQuestioningContext;
  questioningMethods: {
    startQuestioning: (domain: string, sessionId: string) => Promise<QuestionSession | null>;
    generateQuestion: (context: any) => Promise<any>;
    analyzeResponse: (response: any) => Promise<ExpertiseLevel | null>;
    updateExpertise: (sessionId: string, expertise: ExpertiseLevel) => void;
    endQuestioning: (sessionId: string) => void;
  };
  
  // Feature flag status
  isQuestioningEnabled: boolean;
  questioningFeatures: {
    questionGeneration: boolean;
    expertiseTracking: boolean;
    progressiveDisclosure: boolean;
    adaptiveComplexity: boolean;
  };
  
  // Performance monitoring
  performanceMetrics: {
    domainDetectionLatency: number;
    questioningLatency: number;
    totalLatency: number;
    featureOverhead: number;
  };
  
  // Error handling and fallback
  errorState: {
    lastError: string | null;
    errorCount: number;
    circuitBreakerOpen: boolean;
    fallbackMode: boolean;
  };
}

// Create the enhanced context
const EnhancedDomainExpertiseContext = createContext<EnhancedDomainExpertiseContext | null>(null);

// Provider component implementing composition pattern
interface EnhancedDomainExpertiseProviderProps {
  children: ReactNode;
}

export function EnhancedDomainExpertiseProvider({ children }: EnhancedDomainExpertiseProviderProps) {
  // State for original domain detection functionality
  const [originalDomainContext, setOriginalDomainContext] = useState<EnhancedDomainContext | null>(null);
  
  // State for questioning system (additive)
  const [questioningContext, setQuestioningContext] = useState<SocraticQuestioningContext>({
    isActive: false,
    currentSession: null,
    questioningStrategy: 'adaptive',
    adaptationEnabled: true,
    expertiseTrackingEnabled: questioningFlags.isExpertiseTrackingEnabled(),
    progressiveDisclosureEnabled: questioningFlags.isProgressiveDisclosureEnabled(),
    averageResponseTime: 0,
    questionGenerationLatency: 0,
    expertiseAnalysisLatency: 0,
    activeSessions: new Map(),
    maxConcurrentSessions: 5,
    errorCount: 0,
    circuitBreakerOpen: false,
  });

  // Feature flag monitoring
  const [isQuestioningEnabled, setIsQuestioningEnabled] = useState(isSocraticQuestioningEnabled());
  const [questioningFeatures, setQuestioningFeatures] = useState({
    questionGeneration: questioningFlags.isQuestionGenerationEnabled(),
    expertiseTracking: questioningFlags.isExpertiseTrackingEnabled(),
    progressiveDisclosure: questioningFlags.isProgressiveDisclosureEnabled(),
    adaptiveComplexity: questioningFlags.isAdaptiveComplexityEnabled(),
  });

  // Performance monitoring
  const [performanceMetrics, setPerformanceMetrics] = useState({
    domainDetectionLatency: 0,
    questioningLatency: 0,
    totalLatency: 0,
    featureOverhead: 0,
  });

  // Error state
  const [errorState, setErrorState] = useState({
    lastError: null as string | null,
    errorCount: 0,
    circuitBreakerOpen: false,
    fallbackMode: false,
  });

  // Monitor feature flags for real-time changes
  useEffect(() => {
    const monitorFeatureFlags = () => {
      const enabled = isSocraticQuestioningEnabled();
      setIsQuestioningEnabled(enabled);
      
      setQuestioningFeatures({
        questionGeneration: questioningFlags.isQuestionGenerationEnabled(),
        expertiseTracking: questioningFlags.isExpertiseTrackingEnabled(),
        progressiveDisclosure: questioningFlags.isProgressiveDisclosureEnabled(),
        adaptiveComplexity: questioningFlags.isAdaptiveComplexityEnabled(),
      });

      // Update circuit breaker status
      setErrorState(prev => ({
        ...prev,
        circuitBreakerOpen: questioningCircuitBreaker.getState() === 'open',
      }));
    };

    // Monitor every 5 seconds for feature flag changes
    const interval = setInterval(monitorFeatureFlags, 5000);
    monitorFeatureFlags(); // Initial check

    return () => clearInterval(interval);
  }, []);

  // Original domain detection methods (preserved exactly - no modification)
  const analyzeUserContext = useCallback(async (input: string, sessionId?: string): Promise<DomainContext> => {
    const startTime = performance.now();
    
    try {
      // Call original domain detection system exactly as before
      const result = await domainDetectionSystem.analyzeUserContext(input, sessionId);
      
      const latency = performance.now() - startTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        domainDetectionLatency: latency,
      }));

      return result;
    } catch (error) {
      setErrorState(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Domain analysis failed',
        errorCount: prev.errorCount + 1,
      }));
      throw error;
    }
  }, []);

  const activateDomainExpertise = useCallback(async (input: string, sessionId: string) => {
    const startTime = performance.now();
    
    try {
      // Call original domain detection system exactly as before
      const result = await domainDetectionSystem.activateDomainExpertise(input, sessionId);
      
      if (result.success) {
        setOriginalDomainContext(result.domainContext);
      }

      const latency = performance.now() - startTime;
      setPerformanceMetrics(prev => ({
        ...prev,
        domainDetectionLatency: latency,
      }));

      return result;
    } catch (error) {
      setErrorState(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Domain activation failed',
        errorCount: prev.errorCount + 1,
      }));
      throw error;
    }
  }, []);

  const getActiveDomainContext = useCallback((sessionId: string): EnhancedDomainContext | null => {
    // Call original domain detection system exactly as before
    return domainDetectionSystem.getActiveDomainContext(sessionId);
  }, []);

  // Enhanced questioning methods (additive functionality)
  const startQuestioning = useCallback(async (domain: string, sessionId: string): Promise<QuestionSession | null> => {
    if (!isQuestioningEnabled) {
      console.warn('Questioning disabled via feature flags');
      return null;
    }

    return questioningCircuitBreaker.execute(async () => {
      const startTime = performance.now();
      
      try {
        // Create new questioning session
        const session: QuestionSession = {
          sessionId,
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
          maxQuestions: 20,
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
          activeSessions: new Map(prev.activeSessions.set(sessionId, session)),
        }));

        const latency = performance.now() - startTime;
        setPerformanceMetrics(prev => ({
          ...prev,
          questioningLatency: latency,
        }));

        return session;
      } catch (error) {
        setErrorState(prev => ({
          ...prev,
          lastError: error instanceof Error ? error.message : 'Failed to start questioning',
          errorCount: prev.errorCount + 1,
        }));
        return null;
      }
    });
  }, [isQuestioningEnabled]);

  const generateQuestion = useCallback(async (context: any) => {
    if (!questioningFeatures.questionGeneration) {
      return null;
    }

    return questioningCircuitBreaker.execute(async () => {
      // Basic question generation - would be more sophisticated in real implementation
      return {
        id: `q-${Date.now()}`,
        type: 'exploration' as QuestionType,
        complexity: 'intermediate' as QuestionComplexity,
        priority: 'medium' as const,
        domain: context.domain || 'general',
        question: `What specific aspects of ${context.domain || 'your workflow'} are most important?`,
        context: 'Generated by enhanced questioning system',
        expectedResponseType: 'text' as const,
        followUpTriggers: [],
        prerequisiteQuestions: [],
        alternativeFormulations: [],
        domainSpecific: true,
        complianceRelated: false,
        performanceImpact: 'low' as const,
        tags: ['exploration'],
        generatedAt: new Date(),
        source: 'dynamic' as const,
        confidence: 0.8,
      };
    });
  }, [questioningFeatures.questionGeneration]);

  const analyzeResponse = useCallback(async (response: any): Promise<ExpertiseLevel | null> => {
    if (!questioningFeatures.expertiseTracking) {
      return null;
    }

    return questioningCircuitBreaker.execute(async () => {
      // Basic expertise analysis - would be more sophisticated in real implementation
      return {
        overall: 'intermediate' as QuestionComplexity,
        domain: response.domain || 'general',
        confidence: 0.7,
        technicalDepth: 'intermediate' as QuestionComplexity,
        domainKnowledge: 'intermediate' as QuestionComplexity,
        integrationAwareness: 'intermediate' as QuestionComplexity,
        complianceUnderstanding: 'intermediate' as QuestionComplexity,
        signals: [],
        responseHistory: 1,
        consistencyScore: 0.8,
        lastUpdated: new Date(),
      };
    });
  }, [questioningFeatures.expertiseTracking]);

  const updateExpertise = useCallback((sessionId: string, expertise: ExpertiseLevel) => {
    if (!questioningFeatures.expertiseTracking) {
      return;
    }

    setQuestioningContext(prev => {
      const session = prev.activeSessions.get(sessionId);
      if (session) {
        session.expertiseLevel = expertise;
        prev.activeSessions.set(sessionId, session);
      }
      return { ...prev };
    });
  }, [questioningFeatures.expertiseTracking]);

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

  // Context value with complete composition
  const contextValue: EnhancedDomainExpertiseContext = {
    // Original domain detection functionality (unchanged)
    originalDomainContext,
    analyzeUserContext,
    activateDomainExpertise,
    getActiveDomainContext,
    
    // Enhanced questioning capabilities (additive)
    questioningContext,
    questioningMethods: {
      startQuestioning,
      generateQuestion,
      analyzeResponse,
      updateExpertise,
      endQuestioning,
    },
    
    // Feature flags
    isQuestioningEnabled,
    questioningFeatures,
    
    // Performance monitoring
    performanceMetrics,
    
    // Error handling
    errorState,
  };

  return (
    <EnhancedDomainExpertiseContext.Provider value={contextValue}>
      {children}
    </EnhancedDomainExpertiseContext.Provider>
  );
}

// Hook to access the enhanced context
export function useEnhancedDomainExpertise() {
  const context = useContext(EnhancedDomainExpertiseContext);
  if (!context) {
    throw new Error('useEnhancedDomainExpertise must be used within EnhancedDomainExpertiseProvider');
  }
  return context;
}

// Convenience hook for original domain detection only (for backward compatibility)
export function useDomainDetection() {
  const context = useEnhancedDomainExpertise();
  return {
    analyzeUserContext: context.analyzeUserContext,
    activateDomainExpertise: context.activateDomainExpertise,
    getActiveDomainContext: context.getActiveDomainContext,
    domainContext: context.originalDomainContext,
  };
}

// Convenience hook for questioning features only
export function useQuestioningFeatures() {
  const context = useEnhancedDomainExpertise();
  return {
    questioningContext: context.questioningContext,
    questioningMethods: context.questioningMethods,
    isEnabled: context.isQuestioningEnabled,
    features: context.questioningFeatures,
    performance: context.performanceMetrics,
    errorState: context.errorState,
  };
}