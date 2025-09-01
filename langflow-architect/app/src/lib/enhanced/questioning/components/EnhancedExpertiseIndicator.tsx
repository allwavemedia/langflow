/**
 * Enhanced Expertise Indicator Component
 * Epic 6.4.3 Story 1.4 - Phase 1: Enhanced Component Library
 * 
 * Visual indicator showing user's expertise level with enhanced design system
 * Features: Smooth animations, responsive design, accessibility improvements
 */

import React, { useState, useEffect } from 'react';
import { uiUtils } from '../ui-utils';
import { ExpertiseLevel } from '../expertiseTracker';
import './EnhancedExpertiseIndicator.css';

export interface ExpertiseIndicatorProps {
  currentLevel: ExpertiseLevel;
  progressionHistory?: ExpertiseLevel[];
  variant?: 'default' | 'compact' | 'detailed' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showProgression?: boolean;
  showMetadata?: boolean;
  interactive?: boolean;
  confidence?: number;
  domain?: string;
  className?: string;
  onLevelClick?: (level: ExpertiseLevel) => void;
  onProgressionClick?: () => void;
}

const ExpertiseIndicator: React.FC<ExpertiseIndicatorProps> = ({
  currentLevel,
  progressionHistory,
  variant = 'default',
  size = 'md',
  animated = true,
  showProgression = false,
  showMetadata = false,
  interactive = false,
  confidence = 0.8,
  domain,
  className = '',
  onLevelClick,
  onProgressionClick,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const confidencePercentage = Math.round(confidence * 100);

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'p-2',
      badge: 'px-2 py-1 text-xs',
      icon: 'w-4 h-4',
      text: 'text-xs',
      confidence: 'h-1',
    },
    md: {
      container: 'p-3',
      badge: 'px-3 py-1.5 text-sm',
      icon: 'w-5 h-5',
      text: 'text-sm',
      confidence: 'h-2',
    },
    lg: {
      container: 'p-4',
      badge: 'px-4 py-2 text-base',
      icon: 'w-6 h-6',
      text: 'text-base',
      confidence: 'h-3',
    },
    xl: {
      container: 'p-6',
      badge: 'px-6 py-3 text-lg',
      icon: 'w-8 h-8',
      text: 'text-lg',
      confidence: 'h-4',
    },
  };

  const config = sizeConfig[size];

  // Variant configurations
  const variantStyles = {
    default: `${uiUtils.interactive.card.base} ${uiUtils.interactive.card.padding.md}`,
    compact: 'inline-flex items-center space-x-2',
    detailed: `${uiUtils.interactive.card.base} ${uiUtils.interactive.card.padding.lg}`,
    minimal: 'inline-flex items-center space-x-1',
  };

  // Level display names and descriptions
  const levelInfo = {
    novice: {
      display: 'Novice',
      description: 'Learning the fundamentals',
      icon: '🌱',
    },
    beginner: {
      display: 'Beginner',
      description: 'Building basic skills',
      icon: '🌿',
    },
    intermediate: {
      display: 'Intermediate',
      description: 'Developing proficiency',
      icon: '🌳',
    },
    advanced: {
      display: 'Advanced',
      description: 'Demonstrating mastery',
      icon: '🎯',
    },
    expert: {
      display: 'Expert',
      description: 'Exceptional expertise',
      icon: '👑',
    },
  };

  const currentLevelInfo = levelInfo[currentLevel];

  // Animation classes
  const animationClasses = animated 
    ? uiUtils.utils.cn(
        uiUtils.animations.transition.normal,
        isVisible ? uiUtils.animations.scale.enter : uiUtils.animations.scale.exit,
        interactive && isHovered ? uiUtils.animations.scale.hover : '',
      )
    : '';

  // Interactive classes
  const interactiveClasses = interactive 
    ? uiUtils.utils.cn(
        uiUtils.interactive.card.hover,
        'cursor-pointer',
        uiUtils.utils.a11y.focusVisible,
      )
    : '';

  const handleClick = () => {
    if (interactive && onLevelClick) {
      onLevelClick(currentLevel);
    }
  };

  const handleProgressionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onProgressionClick) {
      onProgressionClick();
    }
  };

  if (variant === 'minimal') {
    return (
      <div
        className={uiUtils.utils.cn(
          variantStyles.minimal,
          animationClasses,
          interactiveClasses,
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={`Expertise level: ${currentLevelInfo.display}`}
      >
        <span className={config.text} role="img" aria-label={currentLevelInfo.description}>
          {currentLevelInfo.icon}
        </span>
        <span 
          className={uiUtils.utils.cn(config.text, 'font-medium', `expertiseColor ${currentLevel}`)}
        >
          {currentLevelInfo.display}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={uiUtils.utils.cn(
          variantStyles.compact,
          animationClasses,
          interactiveClasses,
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
        aria-label={`Expertise level: ${currentLevelInfo.display}, ${confidencePercentage}% confidence`}
      >
        <div
          className={uiUtils.utils.cn(
            config.badge,
            'rounded-full font-medium border-2 transition-all duration-200',
            `expertiseColor ${currentLevel}`
          )}
        >
          <span className="mr-1" role="img" aria-hidden="true">
            {currentLevelInfo.icon}
          </span>
          {currentLevelInfo.display}
        </div>
        <div className="flex items-center space-x-1">
          <div className={uiUtils.utils.cn('bg-gray-200 rounded-full overflow-hidden', config.confidence, 'w-12')}>
            <div
              className={uiUtils.utils.cn(config.confidence, 'transition-all duration-500 ease-out', `confidenceBar ${currentLevel}`)}
              style={{ width: `${confidencePercentage}%` }}
            />
          </div>
          <span className={uiUtils.utils.cn(config.text, 'text-gray-600 font-medium')}>
            {confidencePercentage}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={uiUtils.utils.cn(
        variantStyles[variant],
        animationClasses,
        interactiveClasses,
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={`Expertise indicator for ${domain || 'current domain'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={config.icon} role="img" aria-label={currentLevelInfo.description}>
            {currentLevelInfo.icon}
          </span>
          <div>
            <h3 className={uiUtils.utils.cn(uiUtils.typography.heading.h5, 'mb-0')}>
              {currentLevelInfo.display}
            </h3>
            {domain && (
              <p className={uiUtils.utils.cn(uiUtils.typography.body.small, 'text-gray-500 mb-0')}>
                in {domain}
              </p>
            )}
          </div>
        </div>
        
        {showProgression && progressionHistory && progressionHistory.length > 0 && (
          <button
            onClick={handleProgressionClick}
            className={uiUtils.utils.cn(
              'text-xs px-2 py-1 rounded-md transition-colors duration-200',
              'bg-gray-100 text-gray-600 hover:bg-gray-200',
              uiUtils.utils.a11y.focusVisible
            )}
            aria-label="View expertise progression"
          >
            View Progress
          </button>
        )}
      </div>

      {/* Confidence Level */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className={uiUtils.utils.cn(uiUtils.typography.special.label, 'text-gray-700')}>
            Confidence Level
          </span>
          <span className={uiUtils.utils.cn(uiUtils.typography.body.small, 'font-semibold text-gray-900')}>
            {confidencePercentage}%
          </span>
        </div>
        <div className={uiUtils.utils.cn('bg-gray-200 rounded-full overflow-hidden', config.confidence)}>
          <div
            className={uiUtils.utils.cn(
              config.confidence,
              'transition-all duration-700 ease-out',
              animated ? 'animate-pulse' : '',
              `confidenceBar ${currentLevel}`
            )}
            style={{ width: isVisible ? `${confidencePercentage}%` : '0%' }}
          />
        </div>
      </div>

      {/* Description */}
      <p className={uiUtils.utils.cn(uiUtils.typography.body.small, 'text-gray-600 mb-3')}>
        {currentLevelInfo.description}
      </p>

      {/* Progression History */}
      {showProgression && progressionHistory && progressionHistory.length > 0 && (
        <div className="pt-3 border-t border-gray-200">
          <h4 className={uiUtils.utils.cn(uiUtils.typography.special.label, 'mb-2')}>
            Recent Progression
          </h4>
          <div className="flex items-center space-x-1">
            {progressionHistory.slice(-5).map((level, index) => (
              <div
                key={index}
                className={uiUtils.utils.cn(
                  'progressionDot',
                  level,
                  index === progressionHistory.length - 1 ? 'current' : ''
                )}
                title={`${levelInfo[level].display} level`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {showMetadata && (
        <div className="pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Current Level:</span>
              <span className="font-medium text-gray-900 ml-1">
                {currentLevelInfo.display}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Confidence:</span>
              <span className="font-medium text-gray-900 ml-1">
                {confidencePercentage}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertiseIndicator;
