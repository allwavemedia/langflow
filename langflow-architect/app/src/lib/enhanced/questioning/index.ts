/**
 * Enhanced Questioning System
 * Epic 6.4.3 Story 1.3 - Complete Implementation
 * 
 * Main barrel export for all functionality
 */

// Core Engines - Export the classes that are actually available
export { DynamicExpertiseTracker } from './expertiseTracker';
export type { 
  ExpertiseLevel as TrackerExpertiseLevel, 
  ResponseQuality, 
  ExpertiseProgression,
  UserResponse as TrackerUserResponse
} from './expertiseTracker';

export { DynamicProgressiveDisclosure } from './progressiveDisclosure';

export { ConversationMemoryManager } from './conversationMemory';
export type { 
  ConversationContext,
  ConversationTurn,
  ConversationPattern,
  MemoryMetrics,
  LearningPatternAnalysis
} from './conversationMemory';

export { AdaptationEngine } from './adaptationEngineV2';

// Question Types
export type {
  AdaptiveQuestion,
  UserResponse,
  ExpertiseLevel,
  SophisticationLevel,
  QuestionType,
  QuestionComplexity
} from './questionTypes';

// React Hooks
export {
  useExpertiseTracking,
  useProgressiveDisclosure,
  useConversationMemory
} from './hooks';

export type {
  ExpertiseTrackingState,
  ExpertiseTrackingActions,
  ExpertiseTrackingConfig,
  ProgressiveDisclosureState,
  ProgressiveDisclosureActions,
  DisclosureConfig,
  ConversationMemoryState,
  ConversationMemoryActions,
  MemoryConfig
} from './hooks';

// UI Components
export {
  ExpertiseIndicator,
  ProgressionTracker,
  SophisticationControl
} from './components';

export type {
  ExpertiseIndicatorProps,
  ProgressionTrackerProps,
  ProgressionStep,
  SophisticationControlProps
} from './components';
