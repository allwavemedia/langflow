// React Hook for Story 1.2: Adaptive Question Generation Integration
// Provides React components with dynamic question generation capabilities

import { useState, useCallback, useRef, useEffect } from 'react';
import { 
  AdaptiveQuestioningEngine,
  QuestioningEngineRequest,
  QuestioningEngineResult
} from './questioningEngine';
import { 
  AdaptiveQuestion, 
  QuestionType, 
  QuestionComplexity,
  SophisticationLevel 
} from './questionTypes';
import { DomainContext } from '../domainDetectionSystem';

// Mock feature flags for now - will be replaced with actual implementation
const useFeatureFlags = () => ({
  enableSocraticQuestioning: true,
  enableQuestionGeneration: true,
  enableExpertiseTracking: true,
  enableProgressiveDisclosure: true,
  enableAdaptiveComplexity: true,
  enableQuestioningDebugMode: false,
  enablePerformanceLogging: false,
  enableQuestioningMetrics: true,
  maxQuestioningLatencyMs: 800,
  fallbackToBasicMode: true,
  enableCircuitBreaker: true
});

export interface QuestionGenerationState {
  currentQuestion: AdaptiveQuestion | null;
  alternativeQuestions: AdaptiveQuestion[];
  isGenerating: boolean;
  sessionId: string;
  questionHistory: AdaptiveQuestion[];
  error: string | null;
  lastGenerationTime: number;
  totalQuestionsGenerated: number;
}

export interface QuestionGenerationConfig {
  sophisticationLevel?: SophisticationLevel;
  preferredComplexity?: QuestionComplexity;
  questionTypes?: QuestionType[];
  excludeTypes?: QuestionType[];
  maxQuestions?: number;
  autoAdvance?: boolean;
  includeAlternatives?: boolean;
}

export interface UseQuestionGenerationReturn {
  // Current state
  state: QuestionGenerationState;
  
  // Primary actions
  generateQuestion: (userInput: string, domainContext?: DomainContext) => Promise<void>;
  regenerateQuestion: () => Promise<void>;
  selectAlternative: (questionId: string) => void;
  
  // Configuration
  updateConfig: (config: Partial<QuestionGenerationConfig>) => void;
  resetSession: () => void;
  
  // Session management
  pauseGeneration: () => void;
  resumeGeneration: () => void;
  
  // Utils
  getSessionMetrics: () => SessionMetrics;
  exportSession: () => QuestionSessionExport;
}

export interface SessionMetrics {
  questionsGenerated: number;
  averageGenerationTime: number;
  domainCoverage: string[];
  complexityProgression: QuestionComplexity[];
  userEngagement: number;
  sessionDuration: number;
  errorRate: number;
}

export interface QuestionSessionExport {
  sessionId: string;
  timestamp: Date;
  questions: AdaptiveQuestion[];
  metrics: SessionMetrics;
  configuration: QuestionGenerationConfig;
  domainAnalysis: Record<string, number>;
}

/**
 * React hook for adaptive question generation
 * Integrates Story 1.2 capabilities with React components
 */
export const useQuestionGeneration = (
  initialConfig: QuestionGenerationConfig = {}
): UseQuestionGenerationReturn => {
  
  // Engine and state management
  const engineRef = useRef<AdaptiveQuestioningEngine | null>(null);
  const sessionStartTime = useRef<Date>(new Date());
  const conversationHistory = useRef<string[]>([]);
  const featureFlags = useFeatureFlags();
  
  // Initialize default state
  const [state, setState] = useState<QuestionGenerationState>({
    currentQuestion: null,
    alternativeQuestions: [],
    isGenerating: false,
    sessionId: `qgen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    questionHistory: [],
    error: null,
    lastGenerationTime: 0,
    totalQuestionsGenerated: 0
  });
  
  const [config, setConfig] = useState<QuestionGenerationConfig>({
    sophisticationLevel: 2,
    preferredComplexity: 'intermediate',
    questionTypes: ['clarifying', 'exploration'],
    excludeTypes: [],
    maxQuestions: 20,
    autoAdvance: false,
    includeAlternatives: true,
    ...initialConfig
  });
  
  const [isPaused, setIsPaused] = useState(false);
  
  // Initialize engine when feature flags are available
  useEffect(() => {
    if (featureFlags && !engineRef.current) {
      try {
        const mockConfig = {
          featureFlags: featureFlags,
          performanceThresholds: {
            maxGenerationTimeMs: 500,
            maxEnrichmentTimeMs: 300,
            maxTotalTimeMs: 800
          },
          qualityThresholds: {
            minQuestionConfidence: 0.7,
            minEnrichmentQuality: 0.6,
            minDomainRelevance: 0.8
          }
        };
        engineRef.current = new AdaptiveQuestioningEngine(mockConfig);
      } catch (error) {
        console.warn('Failed to initialize question generation engine:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to initialize question generation system'
        }));
      }
    }
  }, [featureFlags]);
  
  /**
   * Generate a new adaptive question based on user input
   */
  const generateQuestion = useCallback(async (
    userInput: string, 
    domainContext?: DomainContext
  ) => {
    if (!engineRef.current || isPaused) {
      console.warn('Question generation not available');
      return;
    }
    
    if (config.maxQuestions && state.totalQuestionsGenerated >= config.maxQuestions) {
      setState(prev => ({
        ...prev,
        error: 'Maximum questions limit reached'
      }));
      return;
    }
    
    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null 
    }));
    
    const startTime = Date.now();
    
    try {
      // Prepare request
      const request: QuestioningEngineRequest = {
        domainContext: domainContext || null,
        userInput: userInput.trim(),
        conversationHistory: conversationHistory.current,
        sophisticationLevel: config.sophisticationLevel || 2,
        sessionId: state.sessionId,
        preferences: {
          preferredComplexity: config.preferredComplexity,
          questionTypes: config.questionTypes,
          excludeTypes: config.excludeTypes,
          maxQuestions: config.maxQuestions,
          includeEnrichment: true,
          includeAlternatives: config.includeAlternatives
        }
      };
      
      // Generate question
      const result: QuestioningEngineResult = await engineRef.current.generateAdaptiveQuestion(request);
      
      const generationTime = Date.now() - startTime;
      
      // Update conversation history
      conversationHistory.current.push(userInput);
      if (conversationHistory.current.length > 10) {
        conversationHistory.current = conversationHistory.current.slice(-10);
      }
      
      // Update state with results
      setState(prev => ({
        ...prev,
        currentQuestion: result.primaryQuestion,
        alternativeQuestions: result.alternativeQuestions,
        isGenerating: false,
        questionHistory: [...prev.questionHistory, result.primaryQuestion],
        lastGenerationTime: generationTime,
        totalQuestionsGenerated: prev.totalQuestionsGenerated + 1,
        error: null
      }));
      
    } catch (error) {
      console.error('Question generation failed:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Question generation failed'
      }));
    }
  }, [config, state.sessionId, state.totalQuestionsGenerated, isPaused]);
  
  /**
   * Regenerate the current question with different parameters
   */
  const regenerateQuestion = useCallback(async () => {
    if (!state.currentQuestion || !engineRef.current) return;
    
    const lastInput = conversationHistory.current[conversationHistory.current.length - 1];
    if (lastInput) {
      await generateQuestion(lastInput);
    }
  }, [state.currentQuestion, generateQuestion]);
  
  /**
   * Select an alternative question as the primary question
   */
  const selectAlternative = useCallback((questionId: string) => {
    const alternative = state.alternativeQuestions.find(q => q.id === questionId);
    if (alternative) {
      setState(prev => ({
        ...prev,
        currentQuestion: alternative,
        alternativeQuestions: prev.alternativeQuestions.filter(q => q.id !== questionId)
      }));
    }
  }, [state.alternativeQuestions]);
  
  /**
   * Update generation configuration
   */
  const updateConfig = useCallback((newConfig: Partial<QuestionGenerationConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);
  
  /**
   * Reset the generation session
   */
  const resetSession = useCallback(() => {
    setState({
      currentQuestion: null,
      alternativeQuestions: [],
      isGenerating: false,
      sessionId: `qgen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      questionHistory: [],
      error: null,
      lastGenerationTime: 0,
      totalQuestionsGenerated: 0
    });
    conversationHistory.current = [];
    sessionStartTime.current = new Date();
    setIsPaused(false);
  }, []);
  
  /**
   * Pause question generation
   */
  const pauseGeneration = useCallback(() => {
    setIsPaused(true);
  }, []);
  
  /**
   * Resume question generation
   */
  const resumeGeneration = useCallback(() => {
    setIsPaused(false);
  }, []);
  
  /**
   * Get current session metrics
   */
  const getSessionMetrics = useCallback((): SessionMetrics => {
    const sessionDuration = (Date.now() - sessionStartTime.current.getTime()) / 1000;
    const averageTime = state.questionHistory.length > 0 
      ? state.lastGenerationTime
      : 0;
    
    return {
      questionsGenerated: state.totalQuestionsGenerated,
      averageGenerationTime: averageTime,
      domainCoverage: [...new Set(state.questionHistory.map(q => q.domain))],
      complexityProgression: state.questionHistory.map(q => q.complexity),
      userEngagement: state.questionHistory.length > 0 ? 0.8 : 0, // Placeholder
      sessionDuration,
      errorRate: state.error ? 0.1 : 0
    };
  }, [state]);
  
  /**
   * Export session data
   */
  const exportSession = useCallback((): QuestionSessionExport => {
    return {
      sessionId: state.sessionId,
      timestamp: new Date(),
      questions: state.questionHistory,
      metrics: getSessionMetrics(),
      configuration: config,
      domainAnalysis: state.questionHistory.reduce((acc, q) => {
        acc[q.domain] = (acc[q.domain] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [state, config, getSessionMetrics]);
  
  return {
    state,
    generateQuestion,
    regenerateQuestion,
    selectAlternative,
    updateConfig,
    resetSession,
    pauseGeneration,
    resumeGeneration,
    getSessionMetrics,
    exportSession
  };
};

export default useQuestionGeneration;
