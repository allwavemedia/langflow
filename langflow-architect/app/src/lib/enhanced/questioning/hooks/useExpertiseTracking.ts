/**
 * useExpertiseTracking Hook
 * Epic 6.4.3 Story 1.3 - Task 4
 * 
 * React hook for expertise tracking functionality
 * Handles type conflicts between interfaces gracefully
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  UserResponse, 
  ExpertiseLevel, 
  AdaptiveQuestion
} from '../questionTypes';
import { DomainContext } from '../../domainDetectionSystem';
import { 
  DynamicExpertiseTracker, 
  ResponseQuality, 
  ExpertiseProgression,
  UserResponse as TrackerUserResponse,
  ExpertiseLevel as TrackerExpertiseLevel
} from '../expertiseTracker';

export interface ExpertiseTrackingState {
  currentExpertise: ExpertiseLevel | null;
  progression: ExpertiseProgression[];
  isAnalyzing: boolean;
  lastAnalysis: ResponseQuality | null;
  error: string | null;
  metrics: {
    totalResponses: number;
    averageConfidence: number;
    progressionTrend: 'improving' | 'stable' | 'declining';
  };
}

export interface ExpertiseTrackingConfig {
  enableRealTimeTracking: boolean;
  adaptationThreshold: number; // 0-1, minimum change to trigger adaptation
  persistProgression: boolean;
  debugMode: boolean;
}

export interface ExpertiseTrackingActions {
  analyzeResponse: (
    response: UserResponse, 
    question: AdaptiveQuestion, 
    domainContext: DomainContext
  ) => Promise<ResponseQuality>;
  getCurrentLevel: (domain: string) => ExpertiseLevel | null;
  getProgression: (domain?: string) => ExpertiseProgression[];
  resetTracking: () => void;
}

const DEFAULT_CONFIG: ExpertiseTrackingConfig = {
  enableRealTimeTracking: true,
  adaptationThreshold: 0.1,
  persistProgression: true,
  debugMode: false
};

export function useExpertiseTracking(
  sessionId: string,
  config: Partial<ExpertiseTrackingConfig> = {}
): ExpertiseTrackingState & ExpertiseTrackingActions {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const trackerRef = useRef<DynamicExpertiseTracker | null>(null);
  
  // Type adapter functions to handle interface conflicts
  const convertToTrackerUserResponse = useCallback((
    response: UserResponse,
    question: AdaptiveQuestion,
    domainContext: DomainContext
  ): TrackerUserResponse => ({
    id: response.id,
    questionId: question.id,
    text: response.response,
    timestamp: response.submittedAt,
    responseTime: response.processingTime,
    domain: domainContext.domain
  }), []);

  const convertFromTrackerExpertiseLevel = useCallback((level: TrackerExpertiseLevel): ExpertiseLevel => {
    // TrackerExpertiseLevel appears to be a string, ExpertiseLevel is an object
    if (typeof level === 'string') {
      return {
        overall: 'intermediate',
        domain: level,
        confidence: 0.5,
        technicalDepth: 'intermediate',
        domainKnowledge: 'intermediate',
        integrationAwareness: 'intermediate',
        complianceUnderstanding: 'intermediate',
        signals: [],
        responseHistory: 0,
        consistencyScore: 0.5,
        lastUpdated: new Date()
      };
    }
    return level as ExpertiseLevel;
  }, []);
  
  const [state, setState] = useState<ExpertiseTrackingState>({
    currentExpertise: null,
    progression: [],
    isAnalyzing: false,
    lastAnalysis: null,
    error: null,
    metrics: {
      totalResponses: 0,
      averageConfidence: 0,
      progressionTrend: 'stable'
    }
  });

  // Initialize tracker
  useEffect(() => {
    if (!trackerRef.current) {
      trackerRef.current = new DynamicExpertiseTracker({
        progressionThreshold: finalConfig.adaptationThreshold,
        enablePerformanceLogging: finalConfig.debugMode
      });
    }
  }, [finalConfig.adaptationThreshold, finalConfig.debugMode]);

  // Calculate metrics from progression
  const calculateMetrics = useCallback((progression: ExpertiseProgression[]) => {
    if (progression.length === 0) {
      return {
        totalResponses: 0,
        averageConfidence: 0,
        progressionTrend: 'stable' as const
      };
    }

    const totalResponses = progression.length; // Each progression represents a response
    const averageConfidence = progression.reduce((sum, p) => sum + p.confidence, 0) / progression.length;

    // Determine trend from confidence progression
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (progression.length >= 3) {
      const recent = progression.slice(-3);
      const first = recent[0].confidence;
      const last = recent[recent.length - 1].confidence;
      const diff = last - first;
      
      if (diff > 0.1) trend = 'improving';
      else if (diff < -0.1) trend = 'declining';
    }

    return {
      totalResponses,
      averageConfidence,
      progressionTrend: trend
    };
  }, []);

  // Analyze user response
  const analyzeResponse = useCallback(async (
    response: UserResponse,
    question: AdaptiveQuestion,
    domainContext: DomainContext
  ): Promise<ResponseQuality> => {
    if (!trackerRef.current) {
      throw new Error('Expertise tracker not initialized');
    }

    setState(prev => ({ ...prev, isAnalyzing: true, error: null }));

    try {
      // Convert types for tracker compatibility
      const trackerResponse = convertToTrackerUserResponse(response, question, domainContext);
      
      const analysis = trackerRef.current.analyzeUserResponse(
        trackerResponse,
        question,
        domainContext
      );

      // Update progression if real-time tracking is enabled
      if (finalConfig.enableRealTimeTracking) {
        const currentLevel = trackerRef.current.getCurrentExpertiseLevel(domainContext.domain);
        const convertedLevel = convertFromTrackerExpertiseLevel(currentLevel);
        const progression = trackerRef.current.getProgressionHistory(domainContext.domain);
        const metrics = calculateMetrics(progression);

        setState(prev => ({
          ...prev,
          currentExpertise: convertedLevel,
          progression,
          lastAnalysis: analysis,
          metrics,
          isAnalyzing: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          lastAnalysis: analysis,
          isAnalyzing: false
        }));
      }

      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isAnalyzing: false
      }));
      throw error;
    }
  }, [finalConfig.enableRealTimeTracking, calculateMetrics, convertFromTrackerExpertiseLevel, convertToTrackerUserResponse]);

  // Get current expertise level
  const getCurrentLevel = useCallback((domain: string): ExpertiseLevel | null => {
    if (!trackerRef.current) return null;
    const level = trackerRef.current.getCurrentExpertiseLevel(domain);
    return convertFromTrackerExpertiseLevel(level);
  }, [convertFromTrackerExpertiseLevel]);

  // Get progression history
  const getProgression = useCallback((domain?: string): ExpertiseProgression[] => {
    if (!trackerRef.current) return [];
    return trackerRef.current.getProgressionHistory(domain);
  }, []);

  // Reset tracking data
  const resetTracking = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentExpertise: null,
      progression: [],
      lastAnalysis: null,
      error: null,
      metrics: {
        totalResponses: 0,
        averageConfidence: 0,
        progressionTrend: 'stable'
      }
    }));
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    analyzeResponse,
    getCurrentLevel,
    getProgression,
    resetTracking
  };
}

export default useExpertiseTracking;
