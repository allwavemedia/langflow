// Phase 3 Story 1.5: CopilotKit Action Enhancement - Action Types
// Action parameter and response types for questioning system integration

// Note: CopilotKit actions are defined inline in the runtime configuration
// This file provides TypeScript types for our questioning actions

// Core questioning domain types
export interface DomainContext {
  domain: string;
  confidence: number;
  technologies: string[];
  specializations: string[];
  constraints: string[];
  compliance: string[];
}

export interface ExpertiseLevel {
  current: 'beginner' | 'intermediate' | 'advanced';
  confidence: number;
  domainSpecific: boolean;
  adaptationHistory: ExpertiseChange[];
}

export interface ExpertiseChange {
  timestamp: string;
  previousLevel: string;
  newLevel: string;
  trigger: 'user_response' | 'performance_analysis' | 'manual_adjustment';
  context: string;
}

export interface SophisticationLevel {
  complexity: 'simple' | 'moderate' | 'advanced' | 'expert';
  depth: number; // 1-5 scale
  technicalDetail: boolean;
  includeExamples: boolean;
  requiresValidation: boolean;
}

export interface ConversationMemory {
  conversationId: string;
  context: DomainContext;
  questionHistory: QuestionInteraction[];
  expertiseEvolution: ExpertiseLevel[];
  preferences: UserPreferences;
}

export interface QuestionInteraction {
  questionId: string;
  question: string;
  userResponse: string;
  timestamp: string;
  sophisticationLevel: SophisticationLevel;
  responseQuality: number; // 0-1 scale
  followUpGenerated: boolean;
}

export interface UserPreferences {
  preferredComplexity: string;
  learningStyle: 'visual' | 'textual' | 'interactive' | 'example-driven';
  domainFocus: string[];
  skipBasicQuestions: boolean;
  enableAdaptiveDifficulty: boolean;
}

export interface UserResponse {
  text: string;
  confidence: number;
  timestamp: string;
  metadata?: {
    responseTime: number;
    clarificationRequests: number;
    technicalTermsUsed: string[];
  };
}

export interface AdaptiveQuestion {
  id: string;
  question: string;
  type: 'exploratory' | 'clarifying' | 'technical' | 'validation' | 'follow-up';
  sophisticationLevel: SophisticationLevel;
  context: DomainContext;
  expectedResponseType: 'short' | 'detailed' | 'technical' | 'example' | 'preference';
  followUpQuestions?: string[];
  validationCriteria?: string[];
}

export interface QuestioningProgress {
  domainContext: DomainContext;
  currentExpertise: ExpertiseLevel;
  questionsAsked: number;
  questionsAnswered: number;
  sophisticationEvolution: SophisticationLevel[];
  completionPercentage: number;
  nextRecommendedActions: string[];
}

// CopilotKit Action Parameter Types
export interface GenerateAdaptiveQuestionParams {
  domainContext: DomainContext;
  expertiseLevel: ExpertiseLevel;
  conversationContext?: ConversationMemory;
  sophisticationLevel?: SophisticationLevel;
  questionType?: 'exploratory' | 'clarifying' | 'technical' | 'validation' | 'follow-up';
}

export interface ProcessQuestionResponseParams {
  questionId: string;
  response: UserResponse;
  updateExpertise: boolean;
  generateFollowUp?: boolean;
  conversationId?: string;
}

export interface AdjustQuestionSophisticationParams {
  currentLevel: SophisticationLevel;
  direction: 'increase' | 'decrease';
  preserveContext: boolean;
  conversationId?: string;
  reason?: string;
}

export interface GetQuestioningProgressParams {
  domainContext: DomainContext;
  includeHistory: boolean;
  conversationId?: string;
  includeRecommendations?: boolean;
}

// CopilotKit Action Response Types
export interface GenerateAdaptiveQuestionResponse {
  question: AdaptiveQuestion;
  context: {
    domainInsights: string[];
    expertiseAssessment: string;
    sophisticationRationale: string;
  };
  followUpSuggestions: string[];
  adaptationRecommendations: string[];
  conversationId: string;
  timestamp: string;
}

export interface ProcessQuestionResponseResponse {
  questionId: string;
  analysisResults: {
    expertiseUpdate: ExpertiseLevel;
    responseQuality: number;
    keyInsights: string[];
    misunderstandings: string[];
  };
  followUpQuestion?: AdaptiveQuestion;
  recommendedActions: string[];
  conversationId: string;
  timestamp: string;
}

export interface AdjustQuestionSophisticationResponse {
  adjustmentMade: boolean;
  previousLevel: SophisticationLevel;
  newLevel: SophisticationLevel;
  impact: {
    questionComplexity: string;
    expectedUserExperience: string;
    learningOptimization: string;
  };
  conversationId: string;
  timestamp: string;
}

export interface GetQuestioningProgressResponse {
  progress: QuestioningProgress;
  insights: {
    learningVelocity: number;
    expertiseTrends: string[];
    recommendedNextSteps: string[];
    potentialChallenges: string[];
  };
  history: QuestionInteraction[];
  conversationId: string;
  timestamp: string;
}

// CopilotKit Action Type Definitions - These match the inline action definitions
export interface QuestioningActionHandlers {
  generateAdaptiveQuestion: (params: GenerateAdaptiveQuestionParams) => Promise<GenerateAdaptiveQuestionResponse>;
  processQuestionResponse: (params: ProcessQuestionResponseParams) => Promise<ProcessQuestionResponseResponse>;
  adjustQuestionSophistication: (params: AdjustQuestionSophisticationParams) => Promise<AdjustQuestionSophisticationResponse>;
  getQuestioningProgress: (params: GetQuestioningProgressParams) => Promise<GetQuestioningProgressResponse>;
}

// Action Registration Helpers
export interface QuestioningActionConfig {
  enableContextPersistence: boolean;
  enableExpertiseTracking: boolean;
  enableSophisticationAdaptation: boolean;
  enableProgressTracking: boolean;
  cacheTimeout: number; // milliseconds
  maxQuestionHistory: number;
  defaultSophisticationLevel: SophisticationLevel;
}

export interface ActionRegistrationResult {
  success: boolean;
  actionsRegistered: string[];
  errors: string[];
  warnings: string[];
  integrationStatus: 'complete' | 'partial' | 'failed';
}

// Error types for questioning actions
export class QuestioningActionError extends Error {
  constructor(
    message: string,
    public actionName: string,
    public errorCode: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'QuestioningActionError';
  }
}

export interface ActionErrorResponse {
  error: string;
  errorCode: string;
  actionName: string;
  context?: Record<string, unknown>;
  fallbackRecommendations: string[];
  timestamp: string;
}
