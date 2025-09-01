/**
 * Enhanced Progression Tracker Component
 * Epic 6.4.3 Story 1.4 - Phase 1: Enhanced Component Library
 * 
 * Visual tracker for conversation flow and topic progression
 */

import React, { useState, useEffect } from 'react';
import { uiUtils } from '../ui-utils';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'current' | 'completed' | 'skipped';
  timestamp?: Date;
  metadata?: {
    questionsAsked?: number;
    responseQuality?: number;
    topics?: string[];
  };
}

export interface ProgressionTrackerProps {
  steps: ProgressStep[];
  variant?: 'horizontal' | 'vertical' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showMetadata?: boolean;
  interactive?: boolean;
  className?: string;
  onStepClick?: (step: ProgressStep) => void;
}

const ProgressionTracker: React.FC<ProgressionTrackerProps> = ({
  steps,
  variant = 'horizontal',
  size = 'md',
  animated = true,
  showMetadata = false,
  interactive = false,
  className = '',
  onStepClick,
}) => {
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);

  useEffect(() => {
    if (animated) {
      steps.forEach((step, index) => {
        setTimeout(() => {
          setVisibleSteps(prev => [...prev, step.id]);
        }, index * 150);
      });
    } else {
      setVisibleSteps(steps.map(step => step.id));
    }
  }, [steps, animated]);

  const sizeConfig = {
    sm: {
      container: 'p-2',
      step: 'w-6 h-6 text-xs',
      connector: 'h-0.5',
      text: 'text-xs',
      title: 'text-sm',
    },
    md: {
      container: 'p-3',
      step: 'w-8 h-8 text-sm',
      connector: 'h-1',
      text: 'text-sm',
      title: 'text-base',
    },
    lg: {
      container: 'p-4',
      step: 'w-10 h-10 text-base',
      connector: 'h-1.5',
      text: 'text-base',
      title: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  const getStepStyles = (status: ProgressStep['status']) => {
    const baseStyles = 'rounded-full flex items-center justify-center font-medium transition-all duration-300';
    
    switch (status) {
      case 'completed':
        return `${baseStyles} bg-green-600 text-white shadow-md`;
      case 'current':
        return `${baseStyles} bg-blue-600 text-white shadow-lg ring-4 ring-blue-200`;
      case 'pending':
        return `${baseStyles} bg-gray-200 text-gray-600 border-2 border-gray-300`;
      case 'skipped':
        return `${baseStyles} bg-yellow-100 text-yellow-700 border-2 border-yellow-300`;
      default:
        return `${baseStyles} bg-gray-200 text-gray-600`;
    }
  };

  const getConnectorStyles = (fromStatus: ProgressStep['status'], toStatus: ProgressStep['status']) => {
    const baseStyles = 'transition-all duration-500';
    
    if (fromStatus === 'completed' && (toStatus === 'completed' || toStatus === 'current')) {
      return `${baseStyles} bg-green-600`;
    } else if (fromStatus === 'completed' || fromStatus === 'current') {
      return `${baseStyles} bg-blue-600`;
    }
    
    return `${baseStyles} bg-gray-300`;
  };

  const getStepIcon = (step: ProgressStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return '✓';
      case 'current':
        return '●';
      case 'skipped':
        return '⚬';
      default:
        return (index + 1).toString();
    }
  };

  const handleStepClick = (step: ProgressStep) => {
    if (interactive && onStepClick) {
      onStepClick(step);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={uiUtils.utils.cn('flex items-center space-x-2', className)}>
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={uiUtils.utils.cn(
                  config.step,
                  getStepStyles(step.status),
                  interactive ? 'cursor-pointer hover:scale-110' : '',
                  animated && !visibleSteps.includes(step.id) ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                )}
                onClick={() => handleStepClick(step)}
                title={step.title}
              >
                {getStepIcon(step, index)}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={uiUtils.utils.cn(
                    'w-4',
                    config.connector,
                    getConnectorStyles(step.status, steps[index + 1].status)
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          {steps.findIndex(s => s.status === 'current') + 1} of {steps.length}
        </div>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={uiUtils.utils.cn('space-y-4', config.container, className)}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-3">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={uiUtils.utils.cn(
                  config.step,
                  getStepStyles(step.status),
                  interactive ? 'cursor-pointer hover:scale-110' : '',
                  animated && !visibleSteps.includes(step.id) ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                )}
                onClick={() => handleStepClick(step)}
              >
                {getStepIcon(step, index)}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={uiUtils.utils.cn(
                    'w-0.5 h-8 mt-2',
                    getConnectorStyles(step.status, steps[index + 1].status)
                  )}
                />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <h4 className={uiUtils.utils.cn(config.title, 'font-medium text-gray-900 mb-1')}>
                {step.title}
              </h4>
              {step.description && (
                <p className={uiUtils.utils.cn(config.text, 'text-gray-600 mb-2')}>
                  {step.description}
                </p>
              )}
              
              {showMetadata && step.metadata && (
                <div className="space-y-1">
                  {step.metadata.questionsAsked && (
                    <div className={uiUtils.utils.cn(config.text, 'text-gray-500')}>
                      Questions: {step.metadata.questionsAsked}
                    </div>
                  )}
                  {step.metadata.responseQuality && (
                    <div className={uiUtils.utils.cn(config.text, 'text-gray-500')}>
                      Quality: {Math.round(step.metadata.responseQuality * 100)}%
                    </div>
                  )}
                  {step.metadata.topics && step.metadata.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {step.metadata.topics.map((topic, topicIndex) => (
                        <span
                          key={topicIndex}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-md"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {step.timestamp && (
                <div className={uiUtils.utils.cn(config.text, 'text-gray-400 mt-1')}>
                  {step.timestamp.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={uiUtils.utils.cn('w-full', config.container, className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step indicator */}
            <div className="flex flex-col items-center">
              <div
                className={uiUtils.utils.cn(
                  config.step,
                  getStepStyles(step.status),
                  interactive ? 'cursor-pointer hover:scale-110' : '',
                  animated && !visibleSteps.includes(step.id) ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                )}
                onClick={() => handleStepClick(step)}
              >
                {getStepIcon(step, index)}
              </div>
              
              {/* Step label */}
              <div className="mt-2 text-center">
                <div className={uiUtils.utils.cn(config.text, 'font-medium text-gray-900')}>
                  {step.title}
                </div>
                {step.description && (
                  <div className={uiUtils.utils.cn('text-xs text-gray-600 mt-1 max-w-20')}>
                    {step.description}
                  </div>
                )}
                {showMetadata && step.metadata?.questionsAsked && (
                  <div className="text-xs text-gray-500 mt-1">
                    {step.metadata.questionsAsked} questions
                  </div>
                )}
              </div>
            </div>

            {/* Connector */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={uiUtils.utils.cn(
                    'w-full',
                    config.connector,
                    getConnectorStyles(step.status, steps[index + 1].status)
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress summary */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div>
          Step {steps.findIndex(s => s.status === 'current') + 1} of {steps.length}
        </div>
        <div>
          {steps.filter(s => s.status === 'completed').length} completed
        </div>
      </div>
    </div>
  );
};

export default ProgressionTracker;
