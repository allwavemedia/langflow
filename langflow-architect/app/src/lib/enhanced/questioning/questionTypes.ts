// TypeScript interfaces for Epic 6.4.3 Advanced Socratic Questioning System
// Comprehensive type system supporting adaptive questioning architecture

import { DomainContext, EnhancedDomainContext as BaseDomainContext } from '../domainDetectionSystem';

// Core question complexity and expertise levels
export type QuestionComplexity = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'research';
export type SophisticationLevel = 1 | 2 | 3 | 4 | 5;
export type DisclosureLevel = 1 | 2 | 3 | 4 | 5;

// Question types and categories
export type QuestionType = 
  | 'clarifying'
  | 'exploration' 
  | 'assumption-testing'
  | 'concept-validation'
  | 'pattern-discovery'
  | 'integration-focused'
  | 'compliance-aware'
  | 'performance-oriented'
  | 'security-focused';

// Adaptive question structure
export interface AdaptiveQuestion {
  id: string;
  type: QuestionType;
  complexity: QuestionComplexity;
  priority: 'low' | 'medium' | 'high' | 'critical';
  domain: string;
  question: string;
  context: string;
  expectedResponseType: 'text' | 'selection' | 'structured' | 'boolean';
  followUpTriggers: string[];
  prerequisiteQuestions: string[];
  alternativeFormulations: string[];
  domainSpecific: boolean;
  complianceRelated: boolean;
  performanceImpact: 'minimal' | 'low' | 'medium' | 'high';
  tags: string[];
  generatedAt: Date;
  source: 'template' | 'dynamic' | 'context-derived';
  confidence: number;
}

// User response tracking and analysis
export interface UserResponse {
  id: string;
  questionId: string;
  sessionId: string;
  response: string;
  responseType: 'text' | 'selection' | 'structured' | 'boolean';
  submittedAt: Date;
  processingTime: number;
  confidence: number;
  expertiseIndicators: string[];
  clarificationNeeded: boolean;
  followUpGenerated: boolean;
  metadata: {
    responseLength: number;
    technicalTermsUsed: string[];
    conceptsReferenced: string[];
    uncertaintySignals: string[];
  };
}

// User expertise level assessment
export interface ExpertiseLevel {
  overall: QuestionComplexity;
  domain: string;
  confidence: number;
  technicalDepth: QuestionComplexity;
  domainKnowledge: QuestionComplexity;
  integrationAwareness: QuestionComplexity;
  complianceUnderstanding: QuestionComplexity;
  signals: ExpertiseSignal[];
  responseHistory: number;
  consistencyScore: number;
  lastUpdated: Date;
}

// Expertise assessment indicators
export interface ExpertiseSignal {
  type: 'terminology' | 'concept-depth' | 'pattern-recognition' | 'integration-awareness';
  indicator: string;
  strength: 'weak' | 'moderate' | 'strong';
  domain: string;
  confidence: number;
  source: 'response-analysis' | 'conversation-history' | 'domain-context';
}

// Progressive disclosure state management
export interface ProgressiveDisclosureState {
  currentLevel: DisclosureLevel;
  maxUnlockedLevel: DisclosureLevel;
  domainFamiliarity: Record<string, DisclosureLevel>;
  questionsAnsweredAtLevel: Record<DisclosureLevel, number>;
  expertiseThresholds: Record<DisclosureLevel, number>;
  unlockCriteria: Record<DisclosureLevel, string[]>;
  allowLevelSkipping: boolean;
  autoAdvancement: boolean;
  requiresValidation: boolean;
}

// Question session management
export interface QuestionSession {
  sessionId: string;
  domain: string;
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
  questions: AdaptiveQuestion[];
  responses: UserResponse[];
  currentQuestionIndex: number;
  expertiseLevel: ExpertiseLevel;
  disclosureState: ProgressiveDisclosureState;
  domainContext: DomainContext;
  maxQuestions: number;
  timeoutMinutes: number;
  allowBacktracking: boolean;
  conversationFlow: ConversationFlow;
}

// Conversation flow and context management
export interface ConversationFlow {
  currentPhase: 'discovery' | 'exploration' | 'refinement' | 'validation' | 'completion';
  phaseProgress: number; // 0-1
  overallProgress: number; // 0-1
  availableTransitions: string[];
  blockedTransitions: string[];
  conditionalBranches: ConditionalBranch[];
  accumulatedContext: Record<string, unknown>;
  verifiedFacts: string[];
  assumptionsMade: string[];
  unknownsIdentified: string[];
}

// Conditional conversation branching
export interface ConditionalBranch {
  condition: string;
  trigger: 'expertise-level' | 'domain-confidence' | 'response-pattern' | 'time-elapsed';
  threshold: number;
  action: 'advance-complexity' | 'simplify' | 'change-focus' | 'add-clarification';
  metadata: Record<string, unknown>;
}

// Main socratic questioning context
export interface SocraticQuestioningContext {
  isActive: boolean;
  currentSession: QuestionSession | null;
  questioningStrategy: 'linear' | 'adaptive' | 'exploratory' | 'validation-focused';
  adaptationEnabled: boolean;
  expertiseTrackingEnabled: boolean;
  progressiveDisclosureEnabled: boolean;
  
  // Performance metrics
  averageResponseTime: number;
  questionGenerationLatency: number;
  expertiseAnalysisLatency: number;
  
  // Session management
  activeSessions: Map<string, QuestionSession>;
  maxConcurrentSessions: number;
  
  // Error handling and circuit breaker
  errorCount: number;
  circuitBreakerOpen: boolean;
}

// Enhanced domain context with questioning capabilities
export interface EnhancedDomainContext extends BaseDomainContext {
  questioningCapabilities: {
    availableQuestionTypes: QuestionType[];
    supportedComplexityLevels: QuestionComplexity[];
    domainSpecificTemplates: string[];
    expertiseAdaptationEnabled: boolean;
  };
  
  questioningHistory: {
    totalQuestions: number;
    averageComplexity: QuestionComplexity;
    mostEffectiveTypes: QuestionType[];
    userPreferences: Record<string, unknown>;
  };
}

// Question generation parameters
export interface QuestionGenerationParams {
  domainContext: DomainContext;
  expertiseLevel: ExpertiseLevel;
  conversationHistory: UserResponse[];
  targetComplexity?: QuestionComplexity;
  questionType?: QuestionType;
  maxQuestions?: number;
  avoidRecentTopics?: boolean;
  prioritizeUncertainAreas?: boolean;
  includeFollowUps?: boolean;
}

// Question validation and quality metrics
export interface QuestionQuality {
  relevanceScore: number; // 0-1
  clarityScore: number; // 0-1
  appropriatenessScore: number; // 0-1
  engagementPotential: number; // 0-1
  learningValue: number; // 0-1
  overallScore: number; // 0-1
  validationCriteria: string[];
  improvementSuggestions: string[];
}

// Questioning performance metrics
export interface QuestioningPerformance {
  sessionId: string;
  totalQuestions: number;
  averageResponseTime: number;
  questionGenerationTime: number;
  expertiseAnalysisTime: number;
  userSatisfactionScore?: number;
  learningProgressScore: number;
  systemLatency: number;
  errorRate: number;
  circuitBreakerActivations: number;
}

// Questioning event for analytics and monitoring
export interface QuestioningEvent {
  type: 'question-generated' | 'response-submitted' | 'expertise-updated' | 'session-started' | 'session-ended' | 'error-occurred';
  sessionId: string;
  questionId?: string;
  timestamp: Date;
  data: Record<string, unknown>;
  performance?: Partial<QuestioningPerformance>;
}

// Export all interfaces for use throughout the questioning system
