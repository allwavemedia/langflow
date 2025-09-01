/**
 * Enhanced Expertise Indicator Component
 * Epic 6.4.3 Story 1.4 - Phase 1: Enhanced Component Library
 * 
 * Visual indicator showing user's expertise level with enhanced design system
 */

import React, { useState, useEffect } from 'react';
import { uiUtils } from '../ui-utils';
import { ExpertiseLevel } from '../expertiseTracker';

export interface ExpertiseIndicatorProps {
  currentLevel: ExpertiseLevel;
  progressionHistory?: ExpertiseLevel[];
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showProgression?: boolean;
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
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const confidencePercentage = Math.round(confidence * 100);

  const sizeConfig = {
    sm: {
      container: 'p-2',
      badge: 'px-2 py-1 text-xs',
      icon: 'text-lg',
      text: 'text-xs',
      confidence: 'h-1',
    },
    md: {
      container: 'p-3',
      badge: 'px-3 py-1.5 text-sm',
      icon: 'text-xl',
      text: 'text-sm',
      confidence: 'h-2',
    },
    lg: {
      container: 'p-4',
      badge: 'px-4 py-2 text-base',
      icon: 'text-2xl',
      text: 'text-base',
      confidence: 'h-3',
    },
  };

  const config = sizeConfig[size];

  const levelInfo = {
    novice: {
      display: 'Novice',
      description: 'Learning the fundamentals',
      icon: '🌱',
      colorClass: 'text-emerald-600 border-emerald-600 bg-emerald-50',
      progressClass: 'bg-emerald-600',
    },
    beginner: {
      display: 'Beginner',
      description: 'Building basic skills',
      icon: '🌿',
      colorClass: 'text-cyan-600 border-cyan-600 bg-cyan-50',
      progressClass: 'bg-cyan-600',
    },
    intermediate: {
      display: 'Intermediate',
      description: 'Developing proficiency',
      icon: '🌳',
      colorClass: 'text-amber-600 border-amber-600 bg-amber-50',
      progressClass: 'bg-amber-600',
    },
    advanced: {
      display: 'Advanced',
      description: 'Demonstrating mastery',
      icon: '🎯',
      colorClass: 'text-violet-600 border-violet-600 bg-violet-50',
      progressClass: 'bg-violet-600',
    },
    expert: {
      display: 'Expert',
      description: 'Exceptional expertise',
      icon: '👑',
      colorClass: 'text-red-600 border-red-600 bg-red-50',
      progressClass: 'bg-red-600',
    },
  };

  const currentLevelInfo = levelInfo[currentLevel];

  const animationClasses = animated 
    ? uiUtils.utils.cn(
        uiUtils.animations.transition.normal,
        isVisible ? uiUtils.animations.scale.enter : uiUtils.animations.scale.exit,
        interactive && isHovered ? uiUtils.animations.scale.hover : '',
      )
    : '';

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
          'inline-flex items-center space-x-1',
          animationClasses,
          interactiveClasses,
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...(interactive && {
          role: 'button',
          tabIndex: 0,
          'aria-label': `Expertise level: ${currentLevelInfo.display}`,
        })}
      >
        <span className={config.icon} title={currentLevelInfo.description}>
          {currentLevelInfo.icon}
        </span>
        <span className={uiUtils.utils.cn(config.text, 'font-medium', currentLevelInfo.colorClass)}>
          {currentLevelInfo.display}
        </span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={uiUtils.utils.cn(
          'inline-flex items-center space-x-2',
          animationClasses,
          interactiveClasses,
          className
        )}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...(interactive && {
          role: 'button',
          tabIndex: 0,
          'aria-label': `Expertise level: ${currentLevelInfo.display}, ${confidencePercentage}% confidence`,
        })}
      >
        <div
          className={uiUtils.utils.cn(
            config.badge,
            'rounded-full font-medium border-2 transition-all duration-200',
            currentLevelInfo.colorClass
          )}
        >
          <span className="mr-1">
            {currentLevelInfo.icon}
          </span>
          {currentLevelInfo.display}
        </div>
        <div className="flex items-center space-x-1">
          <div className={uiUtils.utils.cn('bg-gray-200 rounded-full overflow-hidden', config.confidence, 'w-12')}>
            <div
              className={uiUtils.utils.cn(
                config.confidence, 
                'transition-all duration-500 ease-out',
                currentLevelInfo.progressClass,
                `w-[${confidencePercentage}%]`
              )}
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
        uiUtils.interactive.card.base,
        uiUtils.interactive.card.padding.md,
        animationClasses,
        interactiveClasses,
        className
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...(interactive && {
        role: 'button',
        tabIndex: 0,
        'aria-label': `Expertise indicator for ${domain || 'current domain'}`,
      })}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className={config.icon} title={currentLevelInfo.description}>
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
              currentLevelInfo.progressClass,
              `w-[${isVisible ? confidencePercentage : 0}%]`
            )}
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
                  'w-3 h-3 rounded-full transition-all duration-200',
                  levelInfo[level].progressClass,
                  index === progressionHistory.length - 1 ? 'scale-125' : ''
                )}
                title={`${levelInfo[level].display} level`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertiseIndicator;
