// TypeScript Interfaces for Epic 6.4.3 Advanced Socratic Questioning System
// Core types and interfaces supporting adaptive questioning, expertise tracking, and progressive disclosure

import { DomainContext } from '../domainDetectionSystem';

// Core Question Types
export type QuestionType = 
  | 'clarification'      // Clarify ambiguous requirements
  | 'exploration'        // Explore domain-specific considerations  
  | 'validation'         // Validate assumptions and constraints
  | 'optimization'       // Optimize for performance, cost, maintainability
  | 'compliance'         // Address regulatory and security requirements
  | 'integration'        // Explore system integration patterns
  | 'scaling'           // Address scalability and growth concerns
  | 'edge-case'         // Identify edge cases and error handling;

export type QuestionComplexity = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type QuestionPriority = 'critical' | 'high' | 'medium' | 'low';

export interface AdaptiveQuestion {
  id: string;
  type: QuestionType;
  complexity: QuestionComplexity;
  priority: QuestionPriority;
  domain: string;
  
  // Question content
  question: string;
  context: string;
  expectedResponseType: 'text' | 'selection' | 'numeric' | 'boolean' | 'json';
  
  // Adaptive behavior
  followUpTriggers: string[];
  prerequisiteQuestions: string[];
  alternativeFormulations: string[];
  
  // Metadata
  domainSpecific: boolean;
  complianceRelated: boolean;
  performanceImpact: 'none' | 'low' | 'medium' | 'high';
  tags: string[];
  
  // Generation context
  generatedAt: Date;
  source: 'template' | 'dynamic' | 'ai-generated' | 'domain-specific';
  confidence: number;
}

// User Response and Analysis
export interface UserResponse {
  questionId: string;
  responseText: string;
  responseType: 'text' | 'selection' | 'numeric' | 'boolean' | 'json';
  confidence: number;
  timestamp: Date;
  
  // Analysis results
  extractedEntities: string[];
  identifiedConcepts: string[];
  detectedComplexity: QuestionComplexity;
  domainSignals: string[];
  complianceIndicators: string[];
}

// Expertise Tracking
export type ExpertiseIndicator = 
  | 'terminology-usage'
  | 'technical-depth'
  | 'solution-sophistication'
  | 'compliance-awareness'
  | 'performance-considerations'
  | 'integration-patterns'
  | 'error-handling-depth'
  | 'scalability-thinking';

export interface ExpertiseSignal {
  indicator: ExpertiseIndicator;
  strength: number; // 0-1 scale
  evidence: string[];
  domain: string;
  timestamp: Date;
}

export interface ExpertiseLevel {
  overall: QuestionComplexity;
  domain: string;
  confidence: number;
  
  // Detailed breakdown
  technicalDepth: QuestionComplexity;
  domainKnowledge: QuestionComplexity;
  integrationAwareness: QuestionComplexity;
  complianceUnderstanding: QuestionComplexity;
  
  // Supporting evidence
  signals: ExpertiseSignal[];
  responseHistory: number; // Number of responses analyzed
  consistencyScore: number; // How consistent the expertise level appears
  
  lastUpdated: Date;
}

// Progressive Disclosure
export interface DisclosureLevel {
  level: number; // 1-5 scale, 1 = basic, 5 = expert
  name: string;
  description: string;
  questionTypes: QuestionType[];
  maxComplexity: QuestionComplexity;
  conceptDepth: 'surface' | 'intermediate' | 'deep' | 'comprehensive';
}

export interface ProgressiveDisclosureState {
  currentLevel: number;
  maxUnlockedLevel: number;
  domainFamiliarity: Record<string, number>; // domain -> familiarity level
  
  // Progression tracking
  questionsAnsweredAtLevel: Record<number, number>;
  expertiseThresholds: Record<number, number>;
  unlockCriteria: Record<number, string[]>;
  
  // Adaptive behavior
  allowLevelSkipping: boolean;
  autoAdvancement: boolean;
  requiresValidation: boolean;
}

// Question Session Management
export interface QuestionSession {
  sessionId: string;
  userId?: string;
  domain: string;
  
  // Session state
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
  
  // Questions and responses
  questions: AdaptiveQuestion[];
  responses: UserResponse[];
  currentQuestionIndex: number;
  
  // Adaptive state
  expertiseLevel: ExpertiseLevel;
  disclosureState: ProgressiveDisclosureState;
  domainContext: DomainContext;
  
  // Session configuration
  maxQuestions: number;
  timeoutMinutes: number;
  allowBacktracking: boolean;
  
  // Analysis and insights
  sessionSummary?: SessionSummary;
  conversationFlow: ConversationFlowState;
}

export interface SessionSummary {
  totalQuestions: number;
  totalResponses: number;
  averageResponseTime: number;
  
  // Expertise insights
  expertiseProgression: ExpertiseLevel[];
  identifiedGaps: string[];
  strengthAreas: string[];
  
  // Question effectiveness
  mostEffectiveQuestions: string[];
  leastEffectiveQuestions: string[];
  
  // Recommendations
  nextSteps: string[];
  recommendedResources: string[];
  additionalDomains: string[];
}

// Conversation Flow and Context
export interface ConversationFlowState {
  currentPhase: 'discovery' | 'exploration' | 'validation' | 'optimization' | 'completion';
  phaseProgress: number; // 0-1 within current phase
  overallProgress: number; // 0-1 for entire conversation
  
  // Flow control
  availableTransitions: string[];
  blockedTransitions: string[];
  conditionalBranches: ConversationBranch[];
  
  // Context accumulation
  accumulatedContext: Record<string, unknown>;
  verifiedFacts: string[];
  assumptionsMade: string[];
  unknownsIdentified: string[];
}

export interface ConversationBranch {
  branchId: string;
  condition: string;
  triggeredBy: string[];
  targetPhase: string;
  questionSequence: string[];
  priority: number;
}

// Question Generation Context
export interface QuestionGenerationContext {
  domain: string;
  userExpertise: ExpertiseLevel;
  conversationHistory: UserResponse[];
  currentPhase: string;
  
  // Generation constraints
  maxQuestions: number;
  complexity: QuestionComplexity;
  focusAreas: string[];
  avoidTopics: string[];
  
  // Domain-specific context
  complianceRequirements: string[];
  technologyConstraints: string[];
  performanceRequirements: string[];
  integrationNeeds: string[];
}

// Socratic Questioning Engine State
export interface SocraticQuestioningContext {
  isActive: boolean;
  currentSession: QuestionSession | null;
  
  // Engine configuration
  questioningStrategy: 'linear' | 'adaptive' | 'exploratory' | 'targeted';
  adaptationEnabled: boolean;
  expertiseTrackingEnabled: boolean;
  progressiveDisclosureEnabled: boolean;
  
  // Performance monitoring
  averageResponseTime: number;
  questionGenerationLatency: number;
  expertiseAnalysisLatency: number;
  
  // Session management
  activeSessions: Map<string, QuestionSession>;
  maxConcurrentSessions: number;
  
  // Error handling
  lastError?: string;
  errorCount: number;
  circuitBreakerOpen: boolean;
}

// Integration with existing Domain Detection System
export interface EnhancedDomainContext extends DomainContext {
  // Original domain context preserved
  
  // Enhanced questioning capabilities
  questioningContext: SocraticQuestioningContext;
  availableQuestionTypes: QuestionType[];
  suggestedComplexityLevel: QuestionComplexity;
  
  // Progressive disclosure integration
  disclosureRecommendations: DisclosureLevel[];
  expertiseAssessment: ExpertiseLevel | null;
  
  // Performance tracking
  questioningPerformanceMetrics: {
    averageQuestionGenerationTime: number;
    averageExpertiseAnalysisTime: number;
    totalQuestioningLatency: number;
    cacheHitRate: number;
  };
}

// Action and Event Types
export type QuestioningAction = 
  | 'generate-question'
  | 'analyze-response'
  | 'update-expertise'
  | 'advance-disclosure'
  | 'complete-session'
  | 'pause-session'
  | 'resume-session';

export interface QuestioningEvent {
  type: QuestioningAction;
  sessionId: string;
  timestamp: Date;
  payload: Record<string, unknown>;
  success: boolean;
  duration: number;
  error?: string;
}

// Configuration and Settings
export interface QuestioningSystemConfig {
  // Engine behavior
  defaultStrategy: 'linear' | 'adaptive' | 'exploratory' | 'targeted';
  enableAdaptiveComplexity: boolean;
  enableProgressiveDisclosure: boolean;
  enableExpertiseTracking: boolean;
  
  // Performance limits
  maxQuestionGenerationTime: number;
  maxExpertiseAnalysisTime: number;
  maxSessionDuration: number;
  maxConcurrentSessions: number;
  
  // Cache settings
  enableQuestionCache: boolean;
  questionCacheTTL: number;
  maxCacheSize: number;
  
  // Feature flags integration
  featureFlagsEnabled: boolean;
  debugMode: boolean;
  performanceLogging: boolean;
}

// Export convenience type aliases for common use cases
export type QuestioningState = SocraticQuestioningContext;
export type QuestioningConfig = QuestioningSystemConfig;
export type Question = AdaptiveQuestion;
export type Response = UserResponse;
export type Session = QuestionSession;
export type Expertise = ExpertiseLevel;
export type Disclosure = ProgressiveDisclosureState;