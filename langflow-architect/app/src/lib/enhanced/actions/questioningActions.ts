// Phase 3 Story 1.5: CopilotKit Action Enhancement - Questioning Actions
// Core questioning action implementations for adaptive question generation

import {
  SophisticationLevel,
  ConversationMemory,
  AdaptiveQuestion,
  GenerateAdaptiveQuestionParams,
  GenerateAdaptiveQuestionResponse,
  ProcessQuestionResponseParams,
  ProcessQuestionResponseResponse,
  AdjustQuestionSophisticationParams,
  AdjustQuestionSophisticationResponse,
  GetQuestioningProgressParams,
  GetQuestioningProgressResponse,
  QuestioningActionError
} from './actionTypes';

// Import existing enhanced questioning components
import { mcpManager } from '../mcpManager';

// Task 2: Performance Optimization - Advanced Caching Infrastructure
// Cache for questioning context - leveraging existing patterns
const questioningCache = new Map<string, ConversationMemory>();
const CACHE_TIMEOUT = 30 * 60 * 1000; // 30 minutes (same as existing cache)

// Performance optimization caches
interface CachedMcpResponse {
  response: string[];
  timestamp: number;
}

interface CachedExpertiseCalculation {
  result: {
    level: string;
    confidence: number;
    recommendations: string[];
  };
  timestamp: number;
}

const questionTemplateCache = new Map<string, string[]>();
const mcpResponseCache = new Map<string, CachedMcpResponse>();
const expertiseCalculationCache = new Map<string, CachedExpertiseCalculation>();

// Performance monitoring
interface PerformanceMetrics {
  questionGenerationTime: number[];
  mcpQueryTime: number[];
  cacheHitRate: number;
  totalQuestions: number;
  averageResponseTime: number;
}

const performanceMetrics: PerformanceMetrics = {
  questionGenerationTime: [],
  mcpQueryTime: [],
  cacheHitRate: 0,
  totalQuestions: 0,
  averageResponseTime: 0
};

// Cache configuration for performance optimization
const PERFORMANCE_CACHE_CONFIG = {
  MCP_CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes for MCP responses
  TEMPLATE_CACHE_TIMEOUT: 60 * 60 * 1000, // 1 hour for question templates
  EXPERTISE_CACHE_TIMEOUT: 15 * 60 * 1000, // 15 minutes for expertise calculations
  MAX_CACHE_SIZE: 1000, // Maximum number of cached items
  PERFORMANCE_SAMPLE_SIZE: 100 // Number of samples for rolling averages
};

// Performance optimization utilities
function updatePerformanceMetrics(operation: 'question' | 'mcp', duration: number): void {
  const metrics = performanceMetrics;
  
  if (operation === 'question') {
    metrics.questionGenerationTime.push(duration);
    if (metrics.questionGenerationTime.length > PERFORMANCE_CACHE_CONFIG.PERFORMANCE_SAMPLE_SIZE) {
      metrics.questionGenerationTime.shift();
    }
  } else if (operation === 'mcp') {
    metrics.mcpQueryTime.push(duration);
    if (metrics.mcpQueryTime.length > PERFORMANCE_CACHE_CONFIG.PERFORMANCE_SAMPLE_SIZE) {
      metrics.mcpQueryTime.shift();
    }
  }
  
  metrics.totalQuestions++;
  
  // Calculate rolling average
  const allTimes = [...metrics.questionGenerationTime, ...metrics.mcpQueryTime];
  metrics.averageResponseTime = allTimes.length > 0 
    ? allTimes.reduce((sum, time) => sum + time, 0) / allTimes.length 
    : 0;
}

function getCachedMcpResponse(cacheKey: string): string[] | null {
  const cached = mcpResponseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < PERFORMANCE_CACHE_CONFIG.MCP_CACHE_TIMEOUT) {
    return cached.response;
  }
  return null;
}

function setCachedMcpResponse(cacheKey: string, response: string[]): void {
  // Implement cache size limit
  if (mcpResponseCache.size >= PERFORMANCE_CACHE_CONFIG.MAX_CACHE_SIZE) {
    const firstKey = mcpResponseCache.keys().next().value;
    if (firstKey) mcpResponseCache.delete(firstKey);
  }
  
  mcpResponseCache.set(cacheKey, {
    response,
    timestamp: Date.now()
  });
}

function getCachedQuestionTemplate(domain: string, questionType: string): string[] | null {
  const cacheKey = `${domain}-${questionType}`;
  const cached = questionTemplateCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  return null;
}

function setCachedQuestionTemplate(domain: string, questionType: string, templates: string[]): void {
  const cacheKey = `${domain}-${questionType}`;
  questionTemplateCache.set(cacheKey, templates);
}

// Task 2: Intelligent template generation based on domain analysis
function generateIntelligentTemplates(domain: string, technologies: string[], questionType: string): string[] {
  const baseTemplates: Record<string, string[]> = {
    exploratory: [
      `What specific ${domain} challenges are you trying to solve?`,
      `How familiar are you with ${technologies.join(' and ')} technologies?`,
      `What's your primary goal with this ${domain} workflow?`,
      `What ${domain} experience do you bring to this project?`,
      `What constraints or requirements do you have for this ${domain} solution?`
    ],
    clarifying: [
      `Can you provide more details about your ${domain} requirements?`,
      `What constraints do you have for this ${domain} solution?`,
      `How do you envision users interacting with your ${domain} system?`,
      `What specific ${domain} features are most important to you?`,
      `What would make this ${domain} solution successful for your needs?`
    ],
    technical: [
      `What ${technologies.join(', ')} experience do you have?`,
      `How would you handle ${domain}-specific data validation?`,
      `What performance requirements do you have for your ${domain} solution?`,
      `What architectural patterns are you considering for ${domain}?`,
      `How do you plan to handle ${domain} scalability and maintenance?`
    ],
    validation: [
      `Does this ${domain} approach align with your requirements?`,
      `What would success look like for your ${domain} workflow?`,
      `How does this solution fit with your existing ${domain} infrastructure?`,
      `What risks do you see with this ${domain} approach?`,
      `Are you satisfied with the proposed ${domain} implementation strategy?`
    ],
    'follow-up': [
      `Could you elaborate on that aspect of your ${domain} workflow?`,
      `What other considerations are important for your ${domain} solution?`,
      `How does this relate to your broader ${domain} objectives?`,
      `What specific examples can you share about your ${domain} challenges?`,
      `What would be the next logical step in your ${domain} implementation?`
    ]
  };

  return baseTemplates[questionType] || baseTemplates.exploratory;
}

// Task 3: Graceful Degradation - Fallback Systems and Error Recovery

// Degradation modes for different failure scenarios
type DegradationMode = 'full' | 'limited' | 'offline' | 'emergency';

interface DegradationState {
  mode: DegradationMode;
  reason: string;
  capabilities: {
    mcpQueries: boolean;
    advancedTemplates: boolean;
    expertiseTracking: boolean;
    caching: boolean;
  };
  fallbacksActive: string[];
  timestamp: number;
}

// Global degradation state
let currentDegradationState: DegradationState = {
  mode: 'full',
  reason: 'System operating normally',
  capabilities: {
    mcpQueries: true,
    advancedTemplates: true,
    expertiseTracking: true,
    caching: true
  },
  fallbacksActive: [],
  timestamp: Date.now()
};

// Circuit breaker for MCP queries
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
  timeout: number;
}

const mcpCircuitBreaker: CircuitBreakerState = {
  failures: 0,
  lastFailure: 0,
  isOpen: false,
  timeout: 30000 // 30 seconds
};

// Fallback question templates that work without domain context
const FALLBACK_QUESTION_TEMPLATES: Record<string, string[]> = {
  exploratory: [
    'What are you trying to accomplish with this project?',
    'Can you describe your main goals and requirements?',
    'What challenges are you currently facing?',
    'What would success look like for this project?',
    'What constraints or limitations do you need to consider?'
  ],
  clarifying: [
    'Could you provide more details about your requirements?',
    'What specific features are most important to you?',
    'Are there any constraints I should know about?',
    'How do you envision users interacting with this system?',
    'What would make this solution successful for your needs?'
  ],
  technical: [
    'What technical experience do you have with similar projects?',
    'Are there any specific technologies you prefer or want to avoid?',
    'What are your performance and scalability requirements?',
    'How complex should this solution be?',
    'What kind of maintenance and support do you expect?'
  ],
  validation: [
    'Does this approach align with your expectations?',
    'Are there any concerns or risks you see with this plan?',
    'What would you change about this proposed solution?',
    'How does this fit with your existing systems or processes?',
    'What additional considerations should we address?'
  ],
  'follow-up': [
    'Could you elaborate on that point?',
    'What other factors are important to consider?',
    'How does this relate to your broader objectives?',
    'Can you provide a specific example?',
    'What would be the next logical step?'
  ]
};

// Error recovery utilities
function handleMcpFailure(_error: Error): void {
  mcpCircuitBreaker.failures++;
  mcpCircuitBreaker.lastFailure = Date.now();
  
  if (mcpCircuitBreaker.failures >= 3) {
    mcpCircuitBreaker.isOpen = true;
    updateDegradationState('limited', 'MCP servers unavailable', ['mcpQueries']);
  }
}

function checkMcpCircuitBreaker(): boolean {
  if (mcpCircuitBreaker.isOpen) {
    const timeSinceLastFailure = Date.now() - mcpCircuitBreaker.lastFailure;
    if (timeSinceLastFailure > mcpCircuitBreaker.timeout) {
      // Reset circuit breaker
      mcpCircuitBreaker.isOpen = false;
      mcpCircuitBreaker.failures = 0;
      return true;
    }
    return false;
  }
  return true;
}

function updateDegradationState(mode: DegradationMode, reason: string, disabledCapabilities: string[]): void {
  const previousMode = currentDegradationState.mode;
  
  currentDegradationState = {
    mode,
    reason,
    capabilities: {
      mcpQueries: !disabledCapabilities.includes('mcpQueries'),
      advancedTemplates: !disabledCapabilities.includes('advancedTemplates'),
      expertiseTracking: !disabledCapabilities.includes('expertiseTracking'),
      caching: !disabledCapabilities.includes('caching')
    },
    fallbacksActive: disabledCapabilities,
    timestamp: Date.now()
  };
  
  if (previousMode !== mode) {
    console.warn(`Degradation mode changed: ${previousMode} -> ${mode}. Reason: ${reason}`);
  }
}

// Fallback question generation that works without external dependencies
function generateFallbackQuestion(
  questionType: string, 
  domainContext?: { domain: string }, 
  _expertiseLevel?: unknown
): string {
  const templates = FALLBACK_QUESTION_TEMPLATES[questionType] || FALLBACK_QUESTION_TEMPLATES.exploratory;
  
  // Simple random selection for fallback mode
  const baseQuestion = templates[Math.floor(Math.random() * templates.length)];
  
  // Add minimal context if available
  if (domainContext?.domain && domainContext.domain !== 'general') {
    return baseQuestion.replace('this project', `this ${domainContext.domain} project`);
  }
  
  return baseQuestion;
}

// Simplified expertise assessment for degraded mode
function assessExpertiseSimplified(responseText: string, currentLevel: string): {
  newLevel: 'beginner' | 'intermediate' | 'advanced';
  confidence: number;
  reasoning: string;
} {
  const responseLength = responseText.length;
  const wordCount = responseText.split(/\s+/).length;
  
  // Simple heuristics for expertise assessment
  let newLevel: 'beginner' | 'intermediate' | 'advanced' = currentLevel as 'beginner' | 'intermediate' | 'advanced';
  let confidence = 0.5;
  let reasoning = 'Basic assessment due to limited capabilities';
  
  if (wordCount > 50 && responseLength > 200) {
    // Detailed response suggests higher expertise
    if (currentLevel === 'beginner') {
      newLevel = 'intermediate';
      confidence = 0.7;
      reasoning = 'Detailed response suggests intermediate understanding';
    } else if (currentLevel === 'intermediate') {
      confidence = Math.min(confidence + 0.2, 0.9);
      reasoning = 'Maintaining current level with increased confidence';
    }
  } else if (wordCount < 10 || responseLength < 50) {
    // Very short response might indicate struggles
    confidence = Math.max(confidence - 0.1, 0.2);
    reasoning = 'Brief response suggests need for additional support';
  }
  
  return { newLevel, confidence, reasoning };
}

// Error recovery with context preservation
function recoverFromError(error: Error, _context?: unknown): {
  canRecover: boolean;
  fallbackData: Record<string, boolean>;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let canRecover = true;
  let fallbackData: Record<string, boolean> = {};
  
  if (error.message.includes('MCP') || error.message.includes('timeout')) {
    // MCP-related failure
    handleMcpFailure(error);
    recommendations.push('Switching to offline question generation');
    recommendations.push('MCP services will be retried automatically');
    fallbackData = { useFallbackTemplates: true };
  } else if (error.message.includes('cache') || error.message.includes('memory')) {
    // Cache-related failure
    updateDegradationState('limited', 'Cache system issues', ['caching']);
    recommendations.push('Operating without advanced caching');
    recommendations.push('Performance may be slightly reduced');
    fallbackData = { useSimpleStorage: true };
  } else if (error.message.includes('conversation') || error.message.includes('context')) {
    // Context-related failure
    recommendations.push('Starting fresh conversation context');
    recommendations.push('Previous context may be partially restored');
    fallbackData = { createNewContext: true };
  } else {
    // Unknown error - enter emergency mode
    updateDegradationState('emergency', `Unknown error: ${error.message}`, ['mcpQueries', 'advancedTemplates', 'caching']);
    recommendations.push('Operating in emergency mode with basic functionality');
    recommendations.push('Please report this issue for investigation');
    canRecover = false;
  }
  
  return { canRecover, fallbackData, recommendations };
}

/**
 * Generate adaptive question based on domain context and expertise level
 * Integrates with existing questioning engine and progressive disclosure
 * Task 2: Enhanced with performance optimization and caching
 */
export async function generateAdaptiveQuestion(
  params: GenerateAdaptiveQuestionParams
): Promise<GenerateAdaptiveQuestionResponse> {
  const startTime = Date.now(); // Performance monitoring
  
  try {
    const {
      domainContext,
      expertiseLevel,
      conversationContext,
      sophisticationLevel,
      questionType = 'exploratory'
    } = params;

    // Generate conversation ID if not provided
    const conversationId = conversationContext?.conversationId || 
      `adaptive-question-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get or create conversation memory
    let memory = questioningCache.get(conversationId) || conversationContext;
    if (!memory) {
      memory = {
        conversationId,
        context: domainContext,
        questionHistory: [],
        expertiseEvolution: [expertiseLevel],
        preferences: {
          preferredComplexity: expertiseLevel.current,
          learningStyle: 'interactive',
          domainFocus: domainContext.technologies,
          skipBasicQuestions: expertiseLevel.current !== 'beginner',
          enableAdaptiveDifficulty: true
        }
      };
      questioningCache.set(conversationId, memory);
    }

    // Task 2: Optimized MCP server queries with caching
    // Task 3: Enhanced with graceful degradation and circuit breaker
    let domainInsights: string[] = [];
    const mcpCacheKey = `${domainContext.domain}-${expertiseLevel.current}-${questionType}`;
    
    // Check if MCP queries are available and circuit breaker allows them
    if (currentDegradationState.capabilities.mcpQueries && checkMcpCircuitBreaker()) {
      // Check cache first
      const cachedMcpResponse = getCachedMcpResponse(mcpCacheKey);
      if (cachedMcpResponse) {
        domainInsights = cachedMcpResponse;
      } else {
        // Query MCP servers with performance tracking
        const mcpStartTime = Date.now();
        const mcpServers = mcpManager.getServersForDomain(domainContext.domain);
        if (mcpServers.length > 0) {
          try {
            const mcpResponse = await mcpManager.queryServers(
              `Best questioning approaches for ${domainContext.domain} domain at ${expertiseLevel.current} level`,
              domainContext.domain,
              { timeout: 1500 } // Reduced timeout for better performance
            );
            domainInsights = mcpResponse.results.map(result => result.content).slice(0, 3);
            
            // Cache the response
            setCachedMcpResponse(mcpCacheKey, domainInsights);
            
            // Track performance
            updatePerformanceMetrics('mcp', Date.now() - mcpStartTime);
            
            // Reset circuit breaker on success
            mcpCircuitBreaker.failures = 0;
          } catch (error) {
            console.warn('MCP query failed for question generation:', error);
            handleMcpFailure(error instanceof Error ? error : new Error('Unknown MCP error'));
            // Continue with fallback question generation
          }
        }
      }
    }

    // Generate sophisticated level if not provided
    const effectiveSophisticationLevel: SophisticationLevel = sophisticationLevel || {
      complexity: expertiseLevel.current === 'beginner' ? 'simple' : 
                  expertiseLevel.current === 'intermediate' ? 'moderate' : 'advanced',
      depth: expertiseLevel.current === 'beginner' ? 2 : 
             expertiseLevel.current === 'intermediate' ? 3 : 4,
      technicalDetail: expertiseLevel.current !== 'beginner',
      includeExamples: true,
      requiresValidation: expertiseLevel.current === 'advanced'
    };

    // Generate question using optimized template-based approach
    // Task 3: Enhanced with graceful degradation for template failures
    let questionTemplates: Record<string, string[]>;
    let questionText: string;
    let usedFallback = false;
    
    try {
      // Task 2: Check cached templates first (if caching is available)
      if (currentDegradationState.capabilities.caching && currentDegradationState.capabilities.advancedTemplates) {
        const cachedTemplates = getCachedQuestionTemplate(domainContext.domain, questionType);
        if (cachedTemplates) {
          questionTemplates = { [questionType]: cachedTemplates };
        } else {
          // Generate domain-specific templates using intelligent generation
          const intelligentTemplates = generateIntelligentTemplates(
            domainContext.domain, 
            domainContext.technologies, 
            questionType
          );
          questionTemplates = { [questionType]: intelligentTemplates };
          
          // Cache the generated templates
          setCachedQuestionTemplate(domainContext.domain, questionType, intelligentTemplates);
        }
        
        const templates = questionTemplates[questionType] || questionTemplates.exploratory;
        questionText = templates[Math.floor(Math.random() * templates.length)];
      } else {
        // Use fallback template generation
        questionText = generateFallbackQuestion(questionType, domainContext);
        usedFallback = true;
      }
    } catch (error) {
      console.warn('Template generation failed, using fallback:', error);
      questionText = generateFallbackQuestion(questionType, domainContext);
      usedFallback = true;
      
      // Update degradation state if template system is failing
      if (!usedFallback) {
        updateDegradationState('limited', 'Template generation issues', ['advancedTemplates']);
      }
    }

    // Create adaptive question object
    const adaptiveQuestion: AdaptiveQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      question: questionText,
      type: questionType,
      sophisticationLevel: effectiveSophisticationLevel,
      context: domainContext,
      expectedResponseType: questionType === 'technical' ? 'technical' : 
                            questionType === 'validation' ? 'detailed' : 'short',
      followUpQuestions: [
        'Could you elaborate on that aspect?',
        'What specific challenges do you anticipate?',
        'How does this fit with your broader goals?'
      ],
      validationCriteria: [
        'Response demonstrates understanding of key concepts',
        'User provides specific rather than generic examples',
        'Answer shows appropriate level of technical depth'
      ]
    };

    // Generate follow-up suggestions
    const followUpSuggestions = [
      `After answering, we can explore ${domainContext.domain}-specific implementation details`,
      `Your response will help us determine the optimal ${domainContext.technologies.join(' and ')} approach`,
      'We can then dive deeper into specific components and workflows'
    ];

    // Generate adaptation recommendations
    const adaptationRecommendations = [
      expertiseLevel.current === 'beginner' ? 
        'Consider providing examples or visual aids with responses' : null,
      domainContext.compliance.length > 0 ? 
        `Ensure responses consider ${domainContext.compliance.join(', ')} requirements` : null,
      effectiveSophisticationLevel.requiresValidation ? 
        'Validate technical accuracy of responses' : null
    ].filter(Boolean) as string[];

    // Build response
    // Task 3: Enhanced with degradation status and fallback indicators
    const response: GenerateAdaptiveQuestionResponse = {
      question: adaptiveQuestion,
      context: {
        domainInsights: domainInsights.length > 0 ? domainInsights : [
          `Generated question for ${domainContext.domain} domain`,
          `Targeting ${expertiseLevel.current} expertise level`,
          `Using ${effectiveSophisticationLevel.complexity} complexity`,
          ...(usedFallback ? ['Operating in fallback mode for improved reliability'] : []),
          ...(currentDegradationState.mode !== 'full' ? [`System status: ${currentDegradationState.mode} mode`] : [])
        ],
        expertiseAssessment: `Current expertise: ${expertiseLevel.current} (${Math.round(expertiseLevel.confidence * 100)}% confidence)`,
        sophisticationRationale: `Question complexity set to ${effectiveSophisticationLevel.complexity} with depth level ${effectiveSophisticationLevel.depth}`
      },
      followUpSuggestions,
      adaptationRecommendations: [
        ...adaptationRecommendations,
        ...(currentDegradationState.mode !== 'full' ? [
          `Note: Operating in ${currentDegradationState.mode} mode - ${currentDegradationState.reason}`
        ] : [])
      ],
      conversationId,
      timestamp: new Date().toISOString()
    };

    // Update conversation memory
    memory.questionHistory.push({
      questionId: adaptiveQuestion.id,
      question: adaptiveQuestion.question,
      userResponse: '', // Will be filled when response is processed
      timestamp: new Date().toISOString(),
      sophisticationLevel: effectiveSophisticationLevel,
      responseQuality: 0,
      followUpGenerated: followUpSuggestions.length > 0
    });
    questioningCache.set(conversationId, memory);

    // Task 2: Track performance metrics
    const totalTime = Date.now() - startTime;
    updatePerformanceMetrics('question', totalTime);

    return response;

  } catch (error) {
    console.error('Generate adaptive question error:', error);
    
    // Task 3: Enhanced error handling with graceful recovery
    const errorInstance = error instanceof Error ? error : new Error('Unknown error');
    const recovery = recoverFromError(errorInstance);
    
    if (recovery.canRecover) {
      console.warn('Attempting graceful recovery:', recovery.recommendations);
      
      // Attempt to generate a basic response using fallback systems
      try {
        const { domainContext, questionType = 'exploratory' } = params;
        const conversationId = params.conversationContext?.conversationId || 
          `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const fallbackQuestion = generateFallbackQuestion(questionType, domainContext);
        const basicResponse: GenerateAdaptiveQuestionResponse = {
          question: {
            id: `fallback-${Date.now()}`,
            question: fallbackQuestion,
            type: questionType,
            sophisticationLevel: {
              complexity: 'simple',
              depth: 1,
              technicalDetail: false,
              includeExamples: true,
              requiresValidation: false
            },
            context: domainContext,
            expectedResponseType: 'short',
            followUpQuestions: ['Could you provide more details?'],
            validationCriteria: ['Response is relevant to the question']
          },
          context: {
            domainInsights: [
              'Operating in recovery mode',
              ...recovery.recommendations
            ],
            expertiseAssessment: 'Using simplified assessment',
            sophisticationRationale: 'Simplified due to system recovery'
          },
          followUpSuggestions: recovery.recommendations,
          adaptationRecommendations: [
            'System is operating in recovery mode',
            'Full functionality will be restored automatically'
          ],
          conversationId,
          timestamp: new Date().toISOString()
        };
        
        return basicResponse;
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError);
        // Fall through to original error handling
      }
    }
    
    throw new QuestioningActionError(
      'Failed to generate adaptive question',
      'generateAdaptiveQuestion',
      'GENERATION_ERROR',
      { params, error: errorInstance.message, degradationState: currentDegradationState }
    );
  }
}

/**
 * Process user response to a question and update expertise tracking
 * Simplified implementation for initial Story 1.5 deployment
 */
export async function processQuestionResponse(
  params: ProcessQuestionResponseParams
): Promise<ProcessQuestionResponseResponse> {
  try {
    const {
      questionId,
      response,
      updateExpertise,
      generateFollowUp = false,
      conversationId
    } = params;

    // Get conversation memory
    const memory = conversationId ? questioningCache.get(conversationId) : null;
    if (!memory) {
      throw new QuestioningActionError(
        'Conversation context not found',
        'processQuestionResponse',
        'CONTEXT_NOT_FOUND',
        { questionId, conversationId }
      );
    }

    // Find the question in history
    const questionInteraction = memory.questionHistory.find(q => q.questionId === questionId);
    if (!questionInteraction) {
      throw new QuestioningActionError(
        'Question not found in conversation history',
        'processQuestionResponse',
        'QUESTION_NOT_FOUND',
        { questionId, conversationId }
      );
    }

    // Update question interaction with response
    questionInteraction.userResponse = response.text;
    questionInteraction.responseQuality = response.confidence;

    // Analyze response quality and extract insights - simplified approach
    const responseQuality = response.confidence;
    const keyInsights: string[] = [];
    const misunderstandings: string[] = [];

    // Simple expertise analysis based on response characteristics
    let updatedExpertise = memory.expertiseEvolution[memory.expertiseEvolution.length - 1];
    
    if (updateExpertise) {
      // Task 3: Use simplified assessment in degraded mode
      if (currentDegradationState.capabilities.expertiseTracking) {
        // Simple expertise assessment based on response quality and length
        const responseLength = response.text.length;
        const hasDetailedResponse = responseLength > 100;
        const hasHighConfidence = response.confidence > 0.8;
        
        let newLevel = updatedExpertise.current;
        let newConfidence = updatedExpertise.confidence;
        
        if (hasDetailedResponse && hasHighConfidence) {
          // Potentially advance expertise level
          if (updatedExpertise.current === 'beginner' && response.confidence > 0.7) {
            newLevel = 'intermediate';
            keyInsights.push('Response shows readiness for intermediate-level questions');
          } else if (updatedExpertise.current === 'intermediate' && response.confidence > 0.8) {
            newLevel = 'advanced';
            keyInsights.push('Response demonstrates advanced understanding');
          }
          newConfidence = Math.min(newConfidence + 0.1, 1.0);
        } else if (response.confidence < 0.4) {
          // May need to step back
          if (responseLength < 50) {
            misunderstandings.push('Response appears incomplete or unclear');
          }
          newConfidence = Math.max(newConfidence - 0.1, 0.1);
        }

        updatedExpertise = {
          current: newLevel,
          confidence: newConfidence,
          domainSpecific: updatedExpertise.domainSpecific,
          adaptationHistory: [
            ...updatedExpertise.adaptationHistory,
            {
              timestamp: new Date().toISOString(),
              previousLevel: updatedExpertise.current,
              newLevel,
              trigger: 'user_response',
              context: `Response to question: ${questionId}`
            }
          ]
        };
      } else {
        // Use simplified expertise assessment for degraded mode
        const simplifiedAssessment = assessExpertiseSimplified(response.text, updatedExpertise.current);
        updatedExpertise = {
          current: simplifiedAssessment.newLevel,
          confidence: simplifiedAssessment.confidence,
          domainSpecific: false, // Simplified mode can't determine domain specificity
          adaptationHistory: [
            ...updatedExpertise.adaptationHistory,
            {
              timestamp: new Date().toISOString(),
              previousLevel: updatedExpertise.current,
              newLevel: simplifiedAssessment.newLevel,
              trigger: 'performance_analysis', // Use valid trigger type
              context: simplifiedAssessment.reasoning
            }
          ]
        };
        keyInsights.push(`Simplified assessment: ${simplifiedAssessment.reasoning}`);
      }

      memory.expertiseEvolution.push(updatedExpertise);
    }

    // Generate follow-up question if requested
    let followUpQuestion: AdaptiveQuestion | undefined;
    if (generateFollowUp) {
      const followUpResponse = await generateAdaptiveQuestion({
        domainContext: memory.context,
        expertiseLevel: updatedExpertise,
        conversationContext: memory,
        questionType: 'follow-up'
      });
      followUpQuestion = followUpResponse.question;
    }

    // Generate recommended actions
    const recommendedActions = [
      responseQuality > 0.8 ? 'Consider advancing to more complex questions' : null,
      responseQuality < 0.5 ? 'Provide additional context or examples' : null,
      misunderstandings.length > 0 ? 'Clarify misunderstood concepts' : null,
      keyInsights.length > 0 ? 'Build on demonstrated understanding' : null,
      generateFollowUp && followUpQuestion ? 'Continue with generated follow-up question' : null
    ].filter(Boolean) as string[];

    // Update conversation memory cache
    questioningCache.set(memory.conversationId, memory);

    const analysisResponse: ProcessQuestionResponseResponse = {
      questionId,
      analysisResults: {
        expertiseUpdate: updatedExpertise,
        responseQuality,
        keyInsights: keyInsights.length > 0 ? keyInsights : ['Response processed successfully'],
        misunderstandings
      },
      followUpQuestion,
      recommendedActions,
      conversationId: memory.conversationId,
      timestamp: new Date().toISOString()
    };

    return analysisResponse;

  } catch (error) {
    console.error('Process question response error:', error);
    if (error instanceof QuestioningActionError) {
      throw error;
    }
    throw new QuestioningActionError(
      'Failed to process question response',
      'processQuestionResponse',
      'PROCESSING_ERROR',
      { params, error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Adjust question sophistication level for better user experience
 * Uses existing progressive disclosure system
 */
export async function adjustQuestionSophistication(
  params: AdjustQuestionSophisticationParams
): Promise<AdjustQuestionSophisticationResponse> {
  try {
    const {
      currentLevel,
      direction,
      preserveContext,
      conversationId
    } = params;

    // Calculate new sophistication level
    const newLevel: SophisticationLevel = { ...currentLevel };

    if (direction === 'increase') {
      // Increase complexity
      if (newLevel.complexity === 'simple') newLevel.complexity = 'moderate';
      else if (newLevel.complexity === 'moderate') newLevel.complexity = 'advanced';
      else if (newLevel.complexity === 'advanced') newLevel.complexity = 'expert';
      
      newLevel.depth = Math.min(newLevel.depth + 1, 5);
      newLevel.technicalDetail = true;
      newLevel.requiresValidation = newLevel.complexity === 'expert';
    } else {
      // Decrease complexity
      if (newLevel.complexity === 'expert') newLevel.complexity = 'advanced';
      else if (newLevel.complexity === 'advanced') newLevel.complexity = 'moderate';
      else if (newLevel.complexity === 'moderate') newLevel.complexity = 'simple';
      
      newLevel.depth = Math.max(newLevel.depth - 1, 1);
      newLevel.technicalDetail = newLevel.complexity !== 'simple';
      newLevel.requiresValidation = false;
    }

    // Update conversation context if preserveContext is true
    if (preserveContext && conversationId) {
      const memory = questioningCache.get(conversationId);
      if (memory) {
        // Update preferences based on adjustment
        memory.preferences.preferredComplexity = newLevel.complexity;
        memory.preferences.enableAdaptiveDifficulty = true;
        questioningCache.set(conversationId, memory);
      }
    }

    // Calculate impact of the adjustment
    const impact = {
      questionComplexity: direction === 'increase' ? 
        'Questions will be more detailed and technically focused' :
        'Questions will be simpler and more accessible',
      expectedUserExperience: direction === 'increase' ?
        'Users will encounter more challenging and in-depth questions' :
        'Users will have an easier time understanding and responding to questions',
      learningOptimization: direction === 'increase' ?
        'Faster progression for experienced users' :
        'Better foundation building for developing understanding'
    };

    const response: AdjustQuestionSophisticationResponse = {
      adjustmentMade: true,
      previousLevel: currentLevel,
      newLevel,
      impact,
      conversationId: conversationId || '',
      timestamp: new Date().toISOString()
    };

    return response;

  } catch (error) {
    console.error('Adjust question sophistication error:', error);
    throw new QuestioningActionError(
      'Failed to adjust question sophistication',
      'adjustQuestionSophistication',
      'ADJUSTMENT_ERROR',
      { params, error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * Get questioning progress and insights for the conversation
 * Integrates with existing progress tracking systems
 */
export async function getQuestioningProgress(
  params: GetQuestioningProgressParams
): Promise<GetQuestioningProgressResponse> {
  try {
    const {
      domainContext,
      includeHistory,
      conversationId,
      includeRecommendations = true
    } = params;

    // Get conversation memory
    const memory = conversationId ? questioningCache.get(conversationId) : null;
    if (!memory) {
      // Create basic progress report without conversation context
      const basicResponse: GetQuestioningProgressResponse = {
        progress: {
          domainContext,
          currentExpertise: {
            current: 'beginner',
            confidence: 0.5,
            domainSpecific: false,
            adaptationHistory: []
          },
          questionsAsked: 0,
          questionsAnswered: 0,
          sophisticationEvolution: [],
          completionPercentage: 0,
          nextRecommendedActions: ['Start with basic domain questions']
        },
        insights: {
          learningVelocity: 0,
          expertiseTrends: ['No data available'],
          recommendedNextSteps: ['Begin questioning session'],
          potentialChallenges: ['Establish baseline expertise level']
        },
        history: [],
        conversationId: conversationId || '',
        timestamp: new Date().toISOString()
      };
      return basicResponse;
    }

    // Calculate progress metrics
    const questionsAsked = memory.questionHistory.length;
    const questionsAnswered = memory.questionHistory.filter(q => q.userResponse).length;
    const completionPercentage = questionsAsked > 0 ? (questionsAnswered / questionsAsked) * 100 : 0;

    // Analyze expertise evolution
    const expertiseTrends: string[] = [];
    if (memory.expertiseEvolution.length > 1) {
      const first = memory.expertiseEvolution[0];
      const current = memory.expertiseEvolution[memory.expertiseEvolution.length - 1];
      
      if (current.current !== first.current) {
        expertiseTrends.push(`Expertise progressed from ${first.current} to ${current.current}`);
      }
      if (current.confidence > first.confidence) {
        expertiseTrends.push('Confidence level is increasing');
      }
      if (current.domainSpecific && !first.domainSpecific) {
        expertiseTrends.push('Developing domain-specific expertise');
      }
    } else {
      expertiseTrends.push('Beginning expertise assessment');
    }

    // Calculate learning velocity
    const timeSpan = memory.questionHistory.length > 1 ? 
      new Date(memory.questionHistory[memory.questionHistory.length - 1].timestamp).getTime() -
      new Date(memory.questionHistory[0].timestamp).getTime() : 0;
    const learningVelocity = timeSpan > 0 ? questionsAnswered / (timeSpan / (1000 * 60)) : 0; // questions per minute

    // Get sophistication evolution
    const sophisticationEvolution = memory.questionHistory.map(q => q.sophisticationLevel);

    // Generate recommendations
    const recommendedNextSteps: string[] = [];
    const potentialChallenges: string[] = [];

    if (includeRecommendations) {
      const currentExpertise = memory.expertiseEvolution[memory.expertiseEvolution.length - 1];
      const avgResponseQuality = memory.questionHistory.length > 0 ?
        memory.questionHistory.reduce((sum, q) => sum + q.responseQuality, 0) / memory.questionHistory.length : 0;

      if (avgResponseQuality > 0.8) {
        recommendedNextSteps.push('Consider advancing to more complex question types');
        recommendedNextSteps.push('Introduce technical validation questions');
      } else if (avgResponseQuality < 0.5) {
        recommendedNextSteps.push('Focus on clarifying fundamental concepts');
        recommendedNextSteps.push('Provide more examples and context');
        potentialChallenges.push('User may need additional support with current complexity level');
      }

      if (currentExpertise.current === 'beginner' && questionsAnswered > 5) {
        recommendedNextSteps.push('Assess readiness for intermediate-level questions');
      }

      if (memory.context.compliance.length > 0) {
        recommendedNextSteps.push(`Address ${memory.context.compliance.join(', ')} compliance requirements`);
      }
    }

    const response: GetQuestioningProgressResponse = {
      progress: {
        domainContext: memory.context,
        currentExpertise: memory.expertiseEvolution[memory.expertiseEvolution.length - 1],
        questionsAsked,
        questionsAnswered,
        sophisticationEvolution,
        completionPercentage,
        nextRecommendedActions: recommendedNextSteps
      },
      insights: {
        learningVelocity,
        expertiseTrends,
        recommendedNextSteps,
        potentialChallenges
      },
      history: includeHistory ? memory.questionHistory : [],
      conversationId: memory.conversationId,
      timestamp: new Date().toISOString()
    };

    return response;

  } catch (error) {
    console.error('Get questioning progress error:', error);
    throw new QuestioningActionError(
      'Failed to get questioning progress',
      'getQuestioningProgress',
      'PROGRESS_ERROR',
      { params, error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

// Cleanup function for cache management
export function cleanupQuestioningCache(): number {
  const now = Date.now();
  let removedCount = 0;

  for (const [conversationId, memory] of questioningCache.entries()) {
    const lastActivity = memory.questionHistory.length > 0 ?
      new Date(memory.questionHistory[memory.questionHistory.length - 1].timestamp).getTime() :
      now - CACHE_TIMEOUT - 1;

    if (now - lastActivity > CACHE_TIMEOUT) {
      questioningCache.delete(conversationId);
      removedCount++;
    }
  }

  return removedCount;
}

// Task 2: Enhanced cache management with performance optimization
export function cleanupPerformanceCaches(): {
  mcpCacheCleared: number;
  templateCacheCleared: number;
  expertiseCacheCleared: number;
} {
  const now = Date.now();
  let mcpCacheCleared = 0;
  let templateCacheCleared = 0;
  let expertiseCacheCleared = 0;

  // Cleanup MCP response cache
  for (const [key, cached] of mcpResponseCache.entries()) {
    if (now - cached.timestamp > PERFORMANCE_CACHE_CONFIG.MCP_CACHE_TIMEOUT) {
      mcpResponseCache.delete(key);
      mcpCacheCleared++;
    }
  }

  // Cleanup template cache (longer timeout)
  for (const [key] of questionTemplateCache.entries()) {
    // Template cache doesn't have timestamps, so we'll implement LRU-style cleanup
    if (questionTemplateCache.size > PERFORMANCE_CACHE_CONFIG.MAX_CACHE_SIZE * 0.8) {
      questionTemplateCache.delete(key);
      templateCacheCleared++;
    }
  }

  // Cleanup expertise calculation cache
  for (const [key, cached] of expertiseCalculationCache.entries()) {
    if (now - cached.timestamp > PERFORMANCE_CACHE_CONFIG.EXPERTISE_CACHE_TIMEOUT) {
      expertiseCalculationCache.delete(key);
      expertiseCacheCleared++;
    }
  }

  return { mcpCacheCleared, templateCacheCleared, expertiseCacheCleared };
}

// Performance monitoring and metrics
export function getPerformanceMetrics(): PerformanceMetrics & {
  cacheStats: {
    questioningCacheSize: number;
    mcpCacheSize: number;
    templateCacheSize: number;
    expertiseCacheSize: number;
  };
} {
  return {
    ...performanceMetrics,
    cacheStats: {
      questioningCacheSize: questioningCache.size,
      mcpCacheSize: mcpResponseCache.size,
      templateCacheSize: questionTemplateCache.size,
      expertiseCacheSize: expertiseCalculationCache.size
    }
  };
}

// Background cleanup scheduler
let cleanupInterval: NodeJS.Timeout | null = null;

export function startPerformanceCleanup(intervalMs: number = 5 * 60 * 1000): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
  
  cleanupInterval = setInterval(() => {
    const conversationCleanup = cleanupQuestioningCache();
    const performanceCleanup = cleanupPerformanceCaches();
    
    console.log('Cache cleanup completed:', {
      conversationsRemoved: conversationCleanup,
      ...performanceCleanup,
      totalCacheSize: questioningCache.size + mcpResponseCache.size + 
                     questionTemplateCache.size + expertiseCalculationCache.size
    });
  }, intervalMs);
}

export function stopPerformanceCleanup(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

// Export cache for testing and monitoring
export const getQuestioningCacheStats = () => ({
  totalConversations: questioningCache.size,
  cacheTimeout: CACHE_TIMEOUT,
  memoryUsage: process.memoryUsage ? process.memoryUsage().heapUsed : 0,
  performanceMetrics: getPerformanceMetrics(),
  // Task 3: Add degradation monitoring
  degradationState: currentDegradationState,
  circuitBreakerStatus: {
    mcpFailures: mcpCircuitBreaker.failures,
    mcpCircuitOpen: mcpCircuitBreaker.isOpen,
    lastFailureTime: mcpCircuitBreaker.lastFailure
  }
});

// Task 3: Degradation monitoring and recovery functions
export function getDegradationStatus(): DegradationState {
  return { ...currentDegradationState };
}

export function resetDegradationState(): void {
  currentDegradationState = {
    mode: 'full',
    reason: 'System reset to normal operation',
    capabilities: {
      mcpQueries: true,
      advancedTemplates: true,
      expertiseTracking: true,
      caching: true
    },
    fallbacksActive: [],
    timestamp: Date.now()
  };
  
  // Reset circuit breaker
  mcpCircuitBreaker.failures = 0;
  mcpCircuitBreaker.lastFailure = 0;
  mcpCircuitBreaker.isOpen = false;
  
  console.log('Degradation state reset to full operation');
}

export function forceDegradationMode(mode: DegradationMode, reason: string): void {
  const disabledCapabilities: string[] = [];
  
  switch (mode) {
    case 'limited':
      disabledCapabilities.push('mcpQueries');
      break;
    case 'offline':
      disabledCapabilities.push('mcpQueries', 'advancedTemplates');
      break;
    case 'emergency':
      disabledCapabilities.push('mcpQueries', 'advancedTemplates', 'caching');
      break;
    default:
      // 'full' mode
      break;
  }
  
  updateDegradationState(mode, reason, disabledCapabilities);
  console.log(`Degradation mode manually set to: ${mode}. Reason: ${reason}`);
}

// Task 3: Auto-start performance cleanup on module load
startPerformanceCleanup();

// Task 3: Health check function for monitoring
export function performHealthCheck(): {
  overall: 'healthy' | 'degraded' | 'critical';
  checks: {
    mcpConnection: boolean;
    cacheSystem: boolean;
    templateGeneration: boolean;
    memoryUsage: 'normal' | 'high' | 'critical';
  };
  recommendations: string[];
} {
  const checks = {
    mcpConnection: !mcpCircuitBreaker.isOpen,
    cacheSystem: currentDegradationState.capabilities.caching,
    templateGeneration: currentDegradationState.capabilities.advancedTemplates,
    memoryUsage: 'normal' as 'normal' | 'high' | 'critical'
  };
  
  // Check memory usage if available
  if (process.memoryUsage) {
    const memUsage = process.memoryUsage().heapUsed;
    const memMB = memUsage / (1024 * 1024);
    if (memMB > 500) checks.memoryUsage = 'critical';
    else if (memMB > 200) checks.memoryUsage = 'high';
  }
  
  const recommendations: string[] = [];
  let overall: 'healthy' | 'degraded' | 'critical' = 'healthy';
  
  if (!checks.mcpConnection) {
    overall = 'degraded';
    recommendations.push('MCP servers are unavailable - using fallback question generation');
  }
  
  if (!checks.cacheSystem) {
    overall = 'degraded';
    recommendations.push('Caching system is disabled - performance may be reduced');
  }
  
  if (checks.memoryUsage === 'critical') {
    overall = 'critical';
    recommendations.push('Memory usage is critical - consider restarting the service');
  } else if (checks.memoryUsage === 'high') {
    if (overall === 'healthy') overall = 'degraded';
    recommendations.push('Memory usage is high - monitoring recommended');
  }
  
  if (currentDegradationState.mode === 'emergency') {
    overall = 'critical';
    recommendations.push('System is in emergency mode - immediate attention required');
  }
  
  return { overall, checks, recommendations };
}
