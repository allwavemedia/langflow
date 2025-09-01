/**
 * useConversationMemory Hook
 * Epic 6.4.3 Story 1.3 - Task 4
 * 
 * React hook for conversation memory functionality
 * Simplified version to handle interface complexity gracefully
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  UserResponse, 
  ExpertiseLevel, 
  AdaptiveQuestion,
  SophisticationLevel 
} from '../questionTypes';
import { DomainContext } from '../../domainDetectionSystem';
import { 
  ConversationMemoryManager, 
  ConversationContext,
  ConversationTurn,
  MemoryMetrics
} from '../conversationMemory';

export interface ConversationMemoryState {
  conversationContext: ConversationContext | null;
  recentTurns: ConversationTurn[];
  isRecording: boolean;
  error: string | null;
  memoryStats: {
    totalTurns: number;
    sessionDuration: number;
    averageResponseTime: number;
  };
}

export interface MemoryConfig {
  enableRealTimeRecording: boolean;
  maxTurnsInMemory: number;
  persistMemory: boolean;
  debugMode: boolean;
}

export interface ConversationMemoryActions {
  recordTurn: (
    question: AdaptiveQuestion,
    response: UserResponse,
    expertise: ExpertiseLevel,
    domain: DomainContext
  ) => void;
  getConversationContext: () => ConversationContext | null;
  getMemoryMetrics: () => MemoryMetrics | null;
  updateExpertiseProgression: (level: ExpertiseLevel) => void;
  clearMemory: () => void;
  getAdaptationRecommendations: () => AdaptationRecommendation[];
}

interface AdaptationRecommendation {
  type: 'sophistication_increase' | 'sophistication_decrease' | 'question_type_change' | 'domain_shift';
  confidence: number;
  reasoning: string;
  targetValue?: SophisticationLevel | string;
}

const DEFAULT_CONFIG: MemoryConfig = {
  enableRealTimeRecording: true,
  maxTurnsInMemory: 50,
  persistMemory: true,
  debugMode: false
};

export function useConversationMemory(
  sessionId: string,
  config: Partial<MemoryConfig> = {}
): ConversationMemoryState & ConversationMemoryActions {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const memoryManagerRef = useRef<ConversationMemoryManager | null>(null);
  
  const [state, setState] = useState<ConversationMemoryState>({
    conversationContext: null,
    recentTurns: [],
    isRecording: false,
    error: null,
    memoryStats: {
      totalTurns: 0,
      sessionDuration: 0,
      averageResponseTime: 0
    }
  });

  // Initialize memory manager
  useEffect(() => {
    if (!memoryManagerRef.current) {
      memoryManagerRef.current = new ConversationMemoryManager();
    }
  }, []);

  // Helper function to create conversation context
  const createConversationContext = useCallback((
    expertise: ExpertiseLevel,
    domain: DomainContext,
    turn: ConversationTurn
  ): ConversationContext => ({
    sessionId: sessionId,
    currentExpertise: expertise,
    currentSophistication: 3, // Default sophistication level
    dominantDomain: domain,
    recentTurns: [turn],
    expertiseProgression: [expertise],
    sophisticationProgression: [3],
    adaptationHistory: [],
    conversationLength: 1,
    sessionDuration: Date.now() - (turn.timestamp || 0),
    patterns: [],
    metrics: {
      totalTurns: 1,
      averageResponseTime: turn.userResponse?.processingTime || 0,
      expertiseProgression: [expertise],
      sophisticationProgression: [3],
      adaptationSuccessRate: 1.0,
      dominantPatterns: [],
      memoryUsage: 1024, // Estimated bytes for one turn
      compressionRatio: 1.0
    }
  }), [sessionId]);

  // Helper function to update state from memory manager
  const updateStateFromMemory = useCallback(() => {
    if (!memoryManagerRef.current) return;

    try {
      const context = memoryManagerRef.current.getConversationContext(sessionId);
      
      // Calculate memory stats
      const totalTurns = context?.recentTurns.length || 0;
      const sessionDuration = context?.sessionDuration || 0;
      const averageResponseTime = totalTurns > 0 && context?.recentTurns
        ? context.recentTurns.reduce((sum, turn) => {
            const responseTime = turn.userResponse?.processingTime || 0;
            return sum + responseTime;
          }, 0) / totalTurns
        : 0;

      setState(prev => ({
        ...prev,
        conversationContext: context,
        recentTurns: context?.recentTurns || [],
        memoryStats: {
          totalTurns,
          sessionDuration,
          averageResponseTime
        },
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Memory update failed';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    }
  }, [sessionId]);

  // Record a conversation turn
  const recordTurn = useCallback((
    question: AdaptiveQuestion,
    response: UserResponse,
    expertise: ExpertiseLevel,
    domain: DomainContext
  ) => {
    if (!memoryManagerRef.current) return;

    setState(prev => ({ ...prev, isRecording: true, error: null }));

    try {
      const turn: ConversationTurn = {
        id: `${sessionId}-${Date.now()}`,
        timestamp: Date.now(),
        questionId: question.id,
        questionText: question.question,
        questionType: question.type,
        sophisticationLevel: 3, // Default sophistication level
        userResponse: response,
        expertiseLevel: expertise,
        domainContext: domain
      };

      // Create or get existing conversation context
      let context = memoryManagerRef.current.getConversationContext(sessionId);
      if (!context) {
        context = createConversationContext(expertise, domain, turn);
      }

      memoryManagerRef.current.recordTurn(sessionId, turn, context);
      
      if (finalConfig.enableRealTimeRecording) {
        updateStateFromMemory();
      }

      setState(prev => ({ ...prev, isRecording: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Turn recording failed';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isRecording: false
      }));
    }
  }, [sessionId, finalConfig.enableRealTimeRecording, updateStateFromMemory, createConversationContext]);

  // Get conversation context
  const getConversationContext = useCallback((): ConversationContext | null => {
    if (!memoryManagerRef.current) return null;
    return memoryManagerRef.current.getConversationContext(sessionId);
  }, [sessionId]);

  // Get memory metrics
  const getMemoryMetrics = useCallback((): MemoryMetrics | null => {
    const context = getConversationContext();
    return context?.metrics || null;
  }, [getConversationContext]);

  // Update expertise progression
  const updateExpertiseProgression = useCallback((level: ExpertiseLevel) => {
    try {
      setState(prev => ({
        ...prev,
        conversationContext: prev.conversationContext ? {
          ...prev.conversationContext,
          currentExpertise: level,
          expertiseProgression: [...prev.conversationContext.expertiseProgression, level]
        } : null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Expertise update failed';
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
    }
  }, []);

  // Clear conversation memory
  const clearMemory = useCallback(() => {
    setState({
      conversationContext: null,
      recentTurns: [],
      isRecording: false,
      error: null,
      memoryStats: {
        totalTurns: 0,
        sessionDuration: 0,
        averageResponseTime: 0
      }
    });
  }, []);

  // Get adaptation recommendations based on conversation patterns
  const getAdaptationRecommendations = useCallback((): AdaptationRecommendation[] => {
    try {
      const recommendations: AdaptationRecommendation[] = [];

      // Analyze response times for recommendations
      const avgResponseTime = state.memoryStats.averageResponseTime;
      if (avgResponseTime > 30000) { // More than 30 seconds
        recommendations.push({
          type: 'sophistication_decrease',
          confidence: 0.7,
          reasoning: 'Long response times suggest content may be too complex'
        });
      } else if (avgResponseTime < 5000) { // Less than 5 seconds
        recommendations.push({
          type: 'sophistication_increase',
          confidence: 0.6,
          reasoning: 'Quick response times suggest readiness for more complexity'
        });
      }

      // Analyze session duration
      if (state.memoryStats.sessionDuration > 30 * 60 * 1000) { // More than 30 minutes
        recommendations.push({
          type: 'domain_shift',
          confidence: 0.5,
          reasoning: 'Long session suggests potential topic fatigue'
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Failed to generate adaptation recommendations:', error);
      return [];
    }
  }, [state.memoryStats.averageResponseTime, state.memoryStats.sessionDuration]);

  return {
    // State
    ...state,
    
    // Actions
    recordTurn,
    getConversationContext,
    getMemoryMetrics,
    updateExpertiseProgression,
    clearMemory,
    getAdaptationRecommendations
  };
}

export default useConversationMemory;
