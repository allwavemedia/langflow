/**
 * Enhanced Questioning Dashboard
 * Epic 6.4.3 Story 1.4 - Phase 1: Enhanced Component Library
 * 
 * Main dashboard interface integrating all questioning system components
 */

import React, { useState } from 'react';
import { uiUtils } from '../ui-utils';
import ExpertiseIndicator from './ExpertiseIndicatorFinal';
import ProgressionTracker, { ProgressStep } from './EnhancedProgressionTracker';
import SophisticationControl from './SophisticationControlFinal';
import { ExpertiseLevel } from '../expertiseTracker';

export interface QuestioningSession {
  id: string;
  startTime: Date;
  currentStep: string;
  expertise: {
    level: ExpertiseLevel;
    confidence: number;
    domain: string;
  };
  sophistication: number;
  progress: ProgressStep[];
  metadata: {
    questionsAsked: number;
    responseQuality: number;
    topicsExplored: string[];
    adaptations: number;
  };
}

export interface QuestioningDashboardProps {
  session: QuestioningSession;
  variant?: 'full' | 'compact' | 'minimal';
  showControls?: boolean;
  showMetadata?: boolean;
  interactive?: boolean;
  className?: string;
  onExpertiseChange?: (level: ExpertiseLevel) => void;
  onSophisticationChange?: (level: number) => void;
  onStepClick?: (step: ProgressStep) => void;
  onSessionAction?: (action: string, data?: unknown) => void;
}

const QuestioningDashboard: React.FC<QuestioningDashboardProps> = ({
  session,
  variant = 'full',
  showControls = true,
  showMetadata = true,
  interactive = true,
  className = '',
  onExpertiseChange,
  onSophisticationChange,
  onStepClick,
  onSessionAction,
}) => {
  const [isExpanded, setIsExpanded] = useState(variant !== 'minimal');
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'controls'>('overview');

  const sessionDuration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
  const currentProgress = session.progress.filter(s => s.status === 'completed').length;
  const totalProgress = session.progress.length;
  const progressPercentage = totalProgress > 0 ? (currentProgress / totalProgress) * 100 : 0;

  const handleExpertiseClick = (level: ExpertiseLevel) => {
    if (interactive && onExpertiseChange) {
      onExpertiseChange(level);
    }
  };

  const handleSophisticationChange = (level: number) => {
    if (interactive && onSophisticationChange) {
      onSophisticationChange(level);
    }
  };

  const handleProgressStepClick = (step: ProgressStep) => {
    if (interactive && onStepClick) {
      onStepClick(step);
    }
  };

  const handleSessionAction = (action: string, data?: unknown) => {
    if (interactive && onSessionAction) {
      onSessionAction(action, data);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (variant === 'minimal') {
    return (
      <div className={uiUtils.utils.cn('flex items-center space-x-4 p-3 bg-white rounded-lg border', className)}>
        <ExpertiseIndicator
          currentLevel={session.expertise.level}
          variant="minimal"
          size="sm"
          confidence={session.expertise.confidence}
          interactive={interactive}
          onLevelClick={handleExpertiseClick}
        />
        
        <div className="h-4 w-px bg-gray-300" />
        
        <SophisticationControl
          currentLevel={session.sophistication}
          variant="compact"
          size="sm"
          interactive={interactive}
          onChange={handleSophisticationChange}
        />
        
        <div className="h-4 w-px bg-gray-300" />
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{currentProgress}/{totalProgress}</span>
          <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={uiUtils.utils.cn('h-full bg-blue-600 transition-all duration-300', `w-[${progressPercentage}%]`)}
            />
          </div>
        </div>
        
        {!isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            aria-label="Expand dashboard"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={uiUtils.utils.cn('bg-white rounded-lg border shadow-sm', className)}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Questioning Session
            </h2>
            <div className="text-sm text-gray-500">
              {formatDuration(sessionDuration)}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ExpertiseIndicator
              currentLevel={session.expertise.level}
              variant="compact"
              confidence={session.expertise.confidence}
              domain={session.expertise.domain}
              interactive={interactive}
              onLevelClick={handleExpertiseClick}
            />
            
            <SophisticationControl
              currentLevel={session.sophistication}
              variant="buttons"
              size="sm"
              interactive={interactive}
              onChange={handleSophisticationChange}
            />
          </div>

          <ProgressionTracker
            steps={session.progress}
            variant="compact"
            interactive={interactive}
            onStepClick={handleProgressStepClick}
          />

          {showMetadata && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{session.metadata.questionsAsked}</div>
                <div className="text-xs text-gray-500">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(session.metadata.responseQuality * 100)}%
                </div>
                <div className="text-xs text-gray-500">Quality</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{session.metadata.topicsExplored.length}</div>
                <div className="text-xs text-gray-500">Topics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{session.metadata.adaptations}</div>
                <div className="text-xs text-gray-500">Adaptations</div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className={uiUtils.utils.cn('bg-white rounded-lg border shadow-sm', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Advanced Questioning System
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Session started {session.startTime.toLocaleTimeString()} • {session.expertise.domain}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatDuration(sessionDuration)}
              </div>
              <div className="text-xs text-gray-500">
                Duration
              </div>
            </div>
            {showControls && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleSessionAction('pause')}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors duration-200"
                >
                  Pause
                </button>
                <button
                  onClick={() => handleSessionAction('reset')}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex space-x-6 mt-4">
          {['overview', 'progress', 'controls'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={uiUtils.utils.cn(
                'pb-2 text-sm font-medium border-b-2 transition-colors duration-200',
                activeTab === tab
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{session.metadata.questionsAsked}</div>
                <div className="text-sm text-blue-700 mt-1">Questions Asked</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(session.metadata.responseQuality * 100)}%
                </div>
                <div className="text-sm text-green-700 mt-1">Response Quality</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{session.metadata.topicsExplored.length}</div>
                <div className="text-sm text-purple-700 mt-1">Topics Explored</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{session.metadata.adaptations}</div>
                <div className="text-sm text-orange-700 mt-1">Adaptations Made</div>
              </div>
            </div>

            {/* Current State */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpertiseIndicator
                currentLevel={session.expertise.level}
                variant="default"
                confidence={session.expertise.confidence}
                domain={session.expertise.domain}
                showProgression={true}
                interactive={interactive}
                onLevelClick={handleExpertiseClick}
              />
              
              <div className="space-y-4">
                <SophisticationControl
                  currentLevel={session.sophistication}
                  variant="slider"
                  showLabels={true}
                  showDescriptions={true}
                  interactive={interactive}
                  onChange={handleSophisticationChange}
                />
                
                {showMetadata && session.metadata.topicsExplored.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Topics Explored</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.metadata.topicsExplored.map((topic, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            <ProgressionTracker
              steps={session.progress}
              variant="vertical"
              showMetadata={showMetadata}
              interactive={interactive}
              onStepClick={handleProgressStepClick}
            />
          </div>
        )}

        {activeTab === 'controls' && showControls && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Expertise Level</h3>
                <ExpertiseIndicator
                  currentLevel={session.expertise.level}
                  variant="default"
                  confidence={session.expertise.confidence}
                  domain={session.expertise.domain}
                  interactive={interactive}
                  onLevelClick={handleExpertiseClick}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Question Sophistication</h3>
                <SophisticationControl
                  currentLevel={session.sophistication}
                  variant="buttons"
                  showLabels={true}
                  showDescriptions={true}
                  interactive={interactive}
                  onChange={handleSophisticationChange}
                />
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Session Actions</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSessionAction('export')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Export Session
                </button>
                <button
                  onClick={() => handleSessionAction('save')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Save Progress
                </button>
                <button
                  onClick={() => handleSessionAction('analyze')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
                >
                  Analyze Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestioningDashboard;
