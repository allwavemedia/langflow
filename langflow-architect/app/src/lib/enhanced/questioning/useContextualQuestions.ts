// React Hook for Story 1.2: Contextual Question Integration
// Provides specialized hooks for domain-aware and knowledge-enriched questioning

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
  AdaptiveQuestion, 
  QuestionType, 
  QuestionComplexity
} from './questionTypes';
import { DomainContext } from '../domainDetectionSystem';
import { useQuestionGeneration, QuestionGenerationConfig } from './useQuestionGeneration';

export interface ContextualQuestioningState {
  domainQuestions: Record<string, AdaptiveQuestion[]>;
  contextAwareQuestion: AdaptiveQuestion | null;
  enrichmentSources: string[];
  domainConfidence: number;
  knowledgeDepth: number;
  contextualHints: string[];
  isEnriching: boolean;
  lastEnrichmentTime: number;
}

export interface ContextualQuestioningConfig {
  enableKnowledgeEnrichment: boolean;
  enableDomainSpecialization: boolean;
  enrichmentSources: string[];
  contextSensitivity: 'low' | 'medium' | 'high';
  domainAdaptation: boolean;
  knowledgeDepthTarget: number;
}

export interface UseContextualQuestionsReturn {
  // State
  contextualState: ContextualQuestioningState;
  
  // Domain-specific question generation
  generateDomainQuestion: (domain: string, userInput: string) => Promise<void>;
  generateEnrichedQuestion: (userInput: string, domainContext: DomainContext) => Promise<void>;
  
  // Knowledge integration
  enrichWithKnowledge: (question: AdaptiveQuestion) => Promise<AdaptiveQuestion>;
  getContextualHints: (domain: string) => string[];
  
  // Domain management
  switchDomain: (newDomain: string) => void;
  getDomainQuestions: (domain: string) => AdaptiveQuestion[];
  
  // Configuration
  updateContextualConfig: (config: Partial<ContextualQuestioningConfig>) => void;
  resetContextualState: () => void;
}

/**
 * Hook for contextual and domain-aware questioning
 * Extends basic question generation with knowledge enrichment
 */
interface KnowledgeEnrichment {
  summary: string;
  reasoning: string;
  sources: string[];
}

export const useContextualQuestions = (
  initialConfig: ContextualQuestioningConfig = {
    enableKnowledgeEnrichment: true,
    enableDomainSpecialization: true,
    enrichmentSources: ['documentation', 'knowledge-base', 'domain-patterns'],
    contextSensitivity: 'medium',
    domainAdaptation: true,
    knowledgeDepthTarget: 3
  }
): UseContextualQuestionsReturn => {
  
  // Base question generation
  const questionGeneration = useQuestionGeneration();
  
  // Contextual state
  const [contextualState, setContextualState] = useState<ContextualQuestioningState>({
    domainQuestions: {},
    contextAwareQuestion: null,
    enrichmentSources: initialConfig.enrichmentSources,
    domainConfidence: 0,
    knowledgeDepth: 0,
    contextualHints: [],
    isEnriching: false,
    lastEnrichmentTime: 0
  });
  
  const [config, setConfig] = useState<ContextualQuestioningConfig>(initialConfig);
  const currentDomain = useRef<string>('general');
  const knowledgeCache = useRef<Map<string, KnowledgeEnrichment>>(new Map());
  
  // Memoized domain patterns for question adaptation
  const domainPatterns = useMemo(() => ({
    'technical': {
      questionTypes: ['concept-validation', 'assumption-testing'] as QuestionType[],
      complexity: 'intermediate' as QuestionComplexity,
      hints: ['Consider implementation details', 'Think about edge cases', 'Explore architectural implications']
    },
    'business': {
      questionTypes: ['exploration', 'pattern-discovery'] as QuestionType[],
      complexity: 'advanced' as QuestionComplexity,
      hints: ['Consider stakeholder perspectives', 'Think about business impact', 'Explore process implications']
    },
    'design': {
      questionTypes: ['clarifying', 'integration-focused'] as QuestionType[],
      complexity: 'intermediate' as QuestionComplexity,
      hints: ['Consider user experience', 'Think about visual hierarchy', 'Explore accessibility concerns']
    },
    'strategy': {
      questionTypes: ['exploration', 'assumption-testing'] as QuestionType[],
      complexity: 'expert' as QuestionComplexity,
      hints: ['Consider long-term implications', 'Think about competitive landscape', 'Explore risk factors']
    }
  }), []);
  
  /**
   * Generate domain-specific question with specialized patterns
   */
  const generateDomainQuestion = useCallback(async (domain: string, userInput: string) => {
    if (!config.enableDomainSpecialization) {
      await questionGeneration.generateQuestion(userInput);
      return;
    }
    
    const domainPattern = domainPatterns[domain as keyof typeof domainPatterns];
    if (domainPattern) {
      // Configure question generation for domain
      const domainConfig: Partial<QuestionGenerationConfig> = {
        questionTypes: domainPattern.questionTypes,
        preferredComplexity: domainPattern.complexity,
        sophisticationLevel: domain === 'strategy' ? 4 : 3
      };
      
      questionGeneration.updateConfig(domainConfig);
      currentDomain.current = domain;
      
      // Update contextual hints
      setContextualState(prev => ({
        ...prev,
        contextualHints: domainPattern.hints,
        domainConfidence: 0.8
      }));
    }
    
    await questionGeneration.generateQuestion(userInput);
    
    // Store domain-specific question
    const generatedQuestion = questionGeneration.state.currentQuestion;
    if (generatedQuestion) {
      setContextualState(prev => ({
        ...prev,
        domainQuestions: {
          ...prev.domainQuestions,
          [domain]: [...(prev.domainQuestions[domain] || []), generatedQuestion]
        }
      }));
    }
  }, [config.enableDomainSpecialization, domainPatterns, questionGeneration]);
  
  /**
   * Generate question with knowledge enrichment
   */
  const generateEnrichedQuestion = useCallback(async (
    userInput: string, 
    domainContext: DomainContext
  ) => {
    setContextualState(prev => ({ ...prev, isEnriching: true }));
    
    const startTime = Date.now();
    
    try {
      // First generate base question
      await questionGeneration.generateQuestion(userInput, domainContext);
      
      const baseQuestion = questionGeneration.state.currentQuestion;
      if (!baseQuestion || !config.enableKnowledgeEnrichment) {
        setContextualState(prev => ({ ...prev, isEnriching: false }));
        return;
      }
      
      // Enrich with knowledge
      const enrichedQuestion = await enrichWithKnowledge(baseQuestion);
      
      setContextualState(prev => ({
        ...prev,
        contextAwareQuestion: enrichedQuestion,
        isEnriching: false,
        lastEnrichmentTime: Date.now() - startTime,
        domainConfidence: domainContext.confidence,
        knowledgeDepth: prev.knowledgeDepth + 1
      }));
      
    } catch (error) {
      console.error('Knowledge enrichment failed:', error);
      setContextualState(prev => ({ ...prev, isEnriching: false }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.enableKnowledgeEnrichment, questionGeneration]); // enrichWithKnowledge defined below
  
  /**
   * Enrich question with relevant knowledge
   */
  const enrichWithKnowledge = useCallback(async (
    question: AdaptiveQuestion
  ): Promise<AdaptiveQuestion> => {
    
    if (!config.enableKnowledgeEnrichment) {
      return question;
    }
    
    const cacheKey = `${question.domain}-${question.type}-${question.complexity}`;
    
      // Check cache first
      const cachedKnowledge = knowledgeCache.current.get(cacheKey);
      if (cachedKnowledge) {
        return {
          ...question,
          context: `${question.context}\n\nEnriched with: ${cachedKnowledge.summary}`
        };
      }    try {
      // Simulate knowledge enrichment (replace with actual implementation)
      const mockKnowledge = await simulateKnowledgeEnrichment(question);
      
      // Cache the knowledge
      knowledgeCache.current.set(cacheKey, mockKnowledge);
      
      // Create enriched question
      const enrichedQuestion: AdaptiveQuestion = {
        ...question,
        context: `${question.context}\n\nEnriched with: ${mockKnowledge.summary}`
      };
      
      return enrichedQuestion;
      
    } catch (error) {
      console.warn('Knowledge enrichment failed, returning original question:', error);
      return question;
    }
  }, [config.enableKnowledgeEnrichment]);
  
  /**
   * Get contextual hints for a domain
   */
  const getContextualHints = useCallback((domain: string): string[] => {
    const pattern = domainPatterns[domain as keyof typeof domainPatterns];
    return pattern ? pattern.hints : [
      'Consider the context carefully',
      'Think about implications',
      'Explore different perspectives'
    ];
  }, [domainPatterns]);
  
  /**
   * Switch to a different domain
   */
  const switchDomain = useCallback((newDomain: string) => {
    currentDomain.current = newDomain;
    const hints = getContextualHints(newDomain);
    
    setContextualState(prev => ({
      ...prev,
      contextualHints: hints,
      domainConfidence: 0.5 // Reset confidence when switching
    }));
  }, [getContextualHints]);
  
  /**
   * Get all questions for a specific domain
   */
  const getDomainQuestions = useCallback((domain: string): AdaptiveQuestion[] => {
    return contextualState.domainQuestions[domain] || [];
  }, [contextualState.domainQuestions]);
  
  /**
   * Update contextual configuration
   */
  const updateContextualConfig = useCallback((newConfig: Partial<ContextualQuestioningConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);
  
  /**
   * Reset contextual state
   */
  const resetContextualState = useCallback(() => {
    setContextualState({
      domainQuestions: {},
      contextAwareQuestion: null,
      enrichmentSources: config.enrichmentSources,
      domainConfidence: 0,
      knowledgeDepth: 0,
      contextualHints: [],
      isEnriching: false,
      lastEnrichmentTime: 0
    });
    knowledgeCache.current.clear();
    currentDomain.current = 'general';
  }, [config.enrichmentSources]);
  
  // Auto-update hints when domain questions change
  useEffect(() => {
    const currentQuestion = questionGeneration.state.currentQuestion;
    if (currentQuestion && currentQuestion.domain !== currentDomain.current) {
      switchDomain(currentQuestion.domain);
    }
  }, [questionGeneration.state.currentQuestion, switchDomain]);
  
  return {
    contextualState,
    generateDomainQuestion,
    generateEnrichedQuestion,
    enrichWithKnowledge,
    getContextualHints,
    switchDomain,
    getDomainQuestions,
    updateContextualConfig,
    resetContextualState
  };
};

/**
 * Simulate knowledge enrichment (placeholder for actual implementation)
 */
async function simulateKnowledgeEnrichment(question: AdaptiveQuestion): Promise<{
  summary: string;
  reasoning: string;
  sources: string[];
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const domainKnowledge = {
    'technical': {
      summary: 'Related patterns, best practices, and implementation considerations',
      reasoning: 'Technical domain expertise suggests exploring implementation details and architectural implications',
      sources: ['technical-docs', 'best-practices', 'architecture-patterns']
    },
    'business': {
      summary: 'Business context, stakeholder considerations, and process implications',
      reasoning: 'Business domain analysis indicates focus on stakeholder impact and process optimization',
      sources: ['business-process', 'stakeholder-analysis', 'requirements']
    },
    'design': {
      summary: 'User experience principles, design patterns, and accessibility guidelines',
      reasoning: 'Design domain knowledge emphasizes user-centered approach and accessibility considerations',
      sources: ['design-system', 'ux-patterns', 'accessibility-guidelines']
    }
  };
  
  const knowledge = domainKnowledge[question.domain as keyof typeof domainKnowledge] || {
    summary: 'General domain knowledge and cross-cutting concerns',
    reasoning: 'General domain analysis suggests exploring multiple perspectives and implications',
    sources: ['general-knowledge', 'cross-cutting-concerns']
  };
  
  return knowledge;
}

export default useContextualQuestions;
