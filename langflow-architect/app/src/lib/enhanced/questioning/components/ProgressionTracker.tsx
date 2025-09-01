/**
 * ProgressionTracker Component
 * Epic 6.4.3 Story 1.3 - Task 5
 * 
 * Visual tracking of user progress through expertise levels and sophistication
 */

import React from 'react';
import { ExpertiseLevel } from '../expertiseTracker';
import { SophisticationLevel } from '../questionTypes';

export interface ProgressionStep {
  timestamp: number;
  expertiseLevel: ExpertiseLevel;
  sophisticationLevel: SophisticationLevel;
  context?: string;
  trigger?: string;
}

export interface ProgressionTrackerProps {
  progression: ProgressionStep[];
  currentExpertise: ExpertiseLevel;
  currentSophistication: SophisticationLevel;
  showTimeline?: boolean;
  showMetrics?: boolean;
  maxStepsShown?: number;
  className?: string;
  onStepClick?: (step: ProgressionStep) => void;
}

interface ProgressionMetrics {
  totalSteps: number;
  averageTimePerStep: number;
  expertiseGrowth: number;
  sophisticationGrowth: number;
  sessionDuration: number;
}

const EXPERTISE_LEVELS = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'] as const;
const SOPHISTICATION_COLORS = {
  1: '#EF4444', // red-500 - Simple
  2: '#F97316', // orange-500 - Basic
  3: '#F59E0B', // amber-500 - Moderate
  4: '#3B82F6', // blue-500 - Complex
  5: '#8B5CF6'  // violet-500 - Advanced
};

export const ProgressionTracker: React.FC<ProgressionTrackerProps> = ({
  progression,
  currentExpertise,
  currentSophistication,
  showTimeline = true,
  showMetrics = true,
  maxStepsShown = 10,
  className = '',
  onStepClick
}) => {
  // Calculate progression metrics
  const calculateMetrics = (): ProgressionMetrics => {
    if (progression.length === 0) {
      return {
        totalSteps: 0,
        averageTimePerStep: 0,
        expertiseGrowth: 0,
        sophisticationGrowth: 0,
        sessionDuration: 0
      };
    }

    const sortedProgression = [...progression].sort((a, b) => a.timestamp - b.timestamp);
    const first = sortedProgression[0];
    const last = sortedProgression[sortedProgression.length - 1];
    
    const sessionDuration = last.timestamp - first.timestamp;
    const averageTimePerStep = sessionDuration / Math.max(1, progression.length - 1);
    
    // Calculate expertise growth
    const firstExpertiseIndex = EXPERTISE_LEVELS.indexOf(first.expertiseLevel);
    const lastExpertiseIndex = EXPERTISE_LEVELS.indexOf(last.expertiseLevel);
    const expertiseGrowth = lastExpertiseIndex - firstExpertiseIndex;
    
    // Calculate sophistication growth
    const sophisticationGrowth = last.sophisticationLevel - first.sophisticationLevel;

    return {
      totalSteps: progression.length,
      averageTimePerStep,
      expertiseGrowth,
      sophisticationGrowth,
      sessionDuration
    };
  };

  const metrics = calculateMetrics();
  const recentSteps = progression.slice(-maxStepsShown);

  const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 60000) {
      return `${Math.round(milliseconds / 1000)}s`;
    } else if (milliseconds < 3600000) {
      return `${Math.round(milliseconds / 60000)}m`;
    } else {
      return `${Math.round(milliseconds / 3600000)}h`;
    }
  };

  const renderMetrics = () => {
    if (!showMetrics || progression.length === 0) return null;

    return (
      <div className="progression-metrics bg-gray-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Session Progress</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="metric-item">
            <div className="text-lg font-bold text-blue-600">{metrics.totalSteps}</div>
            <div className="text-xs text-gray-500">Steps Taken</div>
          </div>
          <div className="metric-item">
            <div className="text-lg font-bold text-green-600">
              {formatDuration(metrics.sessionDuration)}
            </div>
            <div className="text-xs text-gray-500">Session Time</div>
          </div>
          <div className="metric-item">
            <div className="text-lg font-bold text-purple-600">
              {metrics.expertiseGrowth >= 0 ? '+' : ''}{metrics.expertiseGrowth}
            </div>
            <div className="text-xs text-gray-500">Expertise Growth</div>
          </div>
          <div className="metric-item">
            <div className="text-lg font-bold text-orange-600">
              {metrics.sophisticationGrowth >= 0 ? '+' : ''}{metrics.sophisticationGrowth}
            </div>
            <div className="text-xs text-gray-500">Complexity Growth</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimelineStep = (step: ProgressionStep, index: number) => {
    const isLast = index === recentSteps.length - 1;
    const expertiseIndex = EXPERTISE_LEVELS.indexOf(step.expertiseLevel);
    const sophisticationColor = SOPHISTICATION_COLORS[step.sophisticationLevel];
    
    return (
      <div
        key={`${step.timestamp}-${index}`}
        className={`timeline-step flex items-center ${!isLast ? 'pb-4' : ''}`}
        onClick={() => onStepClick?.(step)}
      >
        {/* Timeline line */}
        {!isLast && (
          <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
        )}
        
        {/* Step indicator */}
        <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full border-2 border-white shadow-md flex items-center justify-center text-sm font-bold text-white mr-4"
             style={{ backgroundColor: sophisticationColor }}>
          {step.sophisticationLevel}
        </div>
        
        {/* Step content */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-900">
              {step.expertiseLevel.charAt(0).toUpperCase() + step.expertiseLevel.slice(1)}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(step.timestamp).toLocaleTimeString()}
            </div>
          </div>
          
          {step.context && (
            <div className="text-xs text-gray-600 mt-1 truncate">
              {step.context}
            </div>
          )}
          
          {step.trigger && (
            <div className="text-xs text-blue-600 mt-1">
              Trigger: {step.trigger}
            </div>
          )}
          
          {/* Progress indicators */}
          <div className="flex items-center mt-2 space-x-4">
            <div className="expertise-indicator flex items-center">
              <div className="w-16 h-1 bg-gray-200 rounded-full mr-2">
                <div 
                  className="h-1 bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${((expertiseIndex + 1) / EXPERTISE_LEVELS.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">Expertise</span>
            </div>
            
            <div className="sophistication-indicator flex items-center">
              <div className="w-16 h-1 bg-gray-200 rounded-full mr-2">
                <div 
                  className="h-1 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(step.sophisticationLevel / 5) * 100}%`,
                    backgroundColor: sophisticationColor
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">Complexity</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    if (!showTimeline || recentSteps.length === 0) return null;

    return (
      <div className="progression-timeline">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Progress</h4>
        <div className="relative">
          {recentSteps.map((step, index) => renderTimelineStep(step, index))}
        </div>
        
        {progression.length > maxStepsShown && (
          <div className="text-center mt-4">
            <button className="text-xs text-blue-600 hover:text-blue-800">
              View {progression.length - maxStepsShown} earlier steps
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentStatus = () => {
    const currentExpertiseIndex = EXPERTISE_LEVELS.indexOf(currentExpertise);
    const currentSophisticationColor = SOPHISTICATION_COLORS[currentSophistication];
    
    return (
      <div className="current-status bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Current Status</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-lg font-bold text-gray-800">
              {currentExpertise.charAt(0).toUpperCase() + currentExpertise.slice(1)}
            </div>
            <div className="text-xs text-gray-500 mb-2">Expertise Level</div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentExpertiseIndex + 1) / EXPERTISE_LEVELS.length) * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-gray-800">
              Level {currentSophistication}
            </div>
            <div className="text-xs text-gray-500 mb-2">Complexity Level</div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(currentSophistication / 5) * 100}%`,
                  backgroundColor: currentSophisticationColor
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (progression.length === 0) {
    return (
      <div className={`progression-tracker empty-state text-center py-8 ${className}`}>
        <div className="text-gray-400 text-lg mb-2">📈</div>
        <div className="text-sm text-gray-500">No progression data yet</div>
        <div className="text-xs text-gray-400 mt-1">
          Progress will be tracked as you interact with questions
        </div>
      </div>
    );
  }

  return (
    <div className={`progression-tracker ${className}`}>
      {renderCurrentStatus()}
      {renderMetrics()}
      {renderTimeline()}
    </div>
  );
};

export default ProgressionTracker;
