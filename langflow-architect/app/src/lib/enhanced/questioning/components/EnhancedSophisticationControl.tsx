/**
 * Enhanced Sophistication Control Component
 * Epic 6.4.3 Story 1.4 - Phase 1: Enhanced Component Library
 * 
 * Interactive control for adjusting question complexity and detail level
 */

import React, { useState, useCallback } from 'react';
import { uiUtils } from '../ui-utils';

export interface SophisticationLevel {
  level: number;
  label: string;
  description: string;
  characteristics: string[];
  color: string;
  examples?: string[];
}

export interface SophisticationControlProps {
  currentLevel: number;
  maxLevel?: number;
  variant?: 'slider' | 'buttons' | 'compact' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showLabels?: boolean;
  showDescriptions?: boolean;
  showExamples?: boolean;
  interactive?: boolean;
  className?: string;
  onChange?: (level: number) => void;
  onLevelSelect?: (levelInfo: SophisticationLevel) => void;
}

const SophisticationControl: React.FC<SophisticationControlProps> = ({
  currentLevel,
  maxLevel = 5,
  variant = 'slider',
  size = 'md',
  animated = true,
  showLabels = true,
  showDescriptions = false,
  showExamples = false,
  interactive = true,
  className = '',
  onChange,
  onLevelSelect,
}) => {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  const sophisticationLevels: SophisticationLevel[] = [
    {
      level: 1,
      label: 'Simple',
      description: 'Basic questions with straightforward answers',
      characteristics: ['Yes/No questions', 'Simple concepts', 'Direct responses'],
      color: 'red',
      examples: ['What is X?', 'Do you like Y?'],
    },
    {
      level: 2,
      label: 'Basic',
      description: 'Elementary explanations with concrete examples',
      characteristics: ['Simple explanations', 'Concrete examples', 'Step-by-step guidance'],
      color: 'orange',
      examples: ['How does X work?', 'Can you explain Y?'],
    },
    {
      level: 3,
      label: 'Moderate',
      description: 'Intermediate depth with some abstract concepts',
      characteristics: ['Moderate complexity', 'Some abstraction', 'Contextual understanding'],
      color: 'yellow',
      examples: ['Why does X happen?', 'What are the implications of Y?'],
    },
    {
      level: 4,
      label: 'Complex',
      description: 'Advanced topics with nuanced understanding',
      characteristics: ['Complex relationships', 'Nuanced thinking', 'Multi-faceted analysis'],
      color: 'blue',
      examples: ['How do X and Y interact?', 'What are the trade-offs?'],
    },
    {
      level: 5,
      label: 'Advanced',
      description: 'Expert-level discussion with deep analysis',
      characteristics: ['Expert terminology', 'Deep analysis', 'Theoretical concepts'],
      color: 'purple',
      examples: ['Analyze the theoretical framework', 'Critique the methodology'],
    },
  ];

  const activeLevels = sophisticationLevels.slice(0, maxLevel);
  const currentLevelInfo = activeLevels.find(l => l.level === currentLevel) || activeLevels[0];
  
  const sizeConfig = {
    sm: {
      container: 'p-2',
      button: 'w-6 h-6 text-xs',
      slider: 'h-1',
      thumb: 'w-4 h-4',
      text: 'text-xs',
      title: 'text-sm',
    },
    md: {
      container: 'p-3',
      button: 'w-8 h-8 text-sm',
      slider: 'h-2',
      thumb: 'w-5 h-5',
      text: 'text-sm',
      title: 'text-base',
    },
    lg: {
      container: 'p-4',
      button: 'w-10 h-10 text-base',
      slider: 'h-3',
      thumb: 'w-6 h-6',
      text: 'text-base',
      title: 'text-lg',
    },
  };

  const config = sizeConfig[size];

  const getColorClasses = (color: string, isActive = false, isHovered = false) => {
    const colorMap = {
      red: {
        bg: isActive ? 'bg-red-600' : isHovered ? 'bg-red-100' : 'bg-red-50',
        text: isActive ? 'text-white' : 'text-red-700',
        border: 'border-red-300',
        ring: 'ring-red-200',
      },
      orange: {
        bg: isActive ? 'bg-orange-600' : isHovered ? 'bg-orange-100' : 'bg-orange-50',
        text: isActive ? 'text-white' : 'text-orange-700',
        border: 'border-orange-300',
        ring: 'ring-orange-200',
      },
      yellow: {
        bg: isActive ? 'bg-yellow-600' : isHovered ? 'bg-yellow-100' : 'bg-yellow-50',
        text: isActive ? 'text-white' : 'text-yellow-700',
        border: 'border-yellow-300',
        ring: 'ring-yellow-200',
      },
      blue: {
        bg: isActive ? 'bg-blue-600' : isHovered ? 'bg-blue-100' : 'bg-blue-50',
        text: isActive ? 'text-white' : 'text-blue-700',
        border: 'border-blue-300',
        ring: 'ring-blue-200',
      },
      purple: {
        bg: isActive ? 'bg-purple-600' : isHovered ? 'bg-purple-100' : 'bg-purple-50',
        text: isActive ? 'text-white' : 'text-purple-700',
        border: 'border-purple-300',
        ring: 'ring-purple-200',
      },
    };

    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const handleLevelChange = useCallback((level: number) => {
    if (!interactive) return;
    
    if (onChange) {
      onChange(level);
    }
    
    if (onLevelSelect) {
      const levelInfo = activeLevels.find(l => l.level === level);
      if (levelInfo) {
        onLevelSelect(levelInfo);
      }
    }
  }, [interactive, onChange, onLevelSelect, activeLevels]);

  if (variant === 'compact') {
    return (
      <div className={uiUtils.utils.cn('inline-flex items-center space-x-2', className)}>
        <span className={uiUtils.utils.cn(config.text, 'text-gray-600')}>
          Sophistication:
        </span>
        <div className="flex items-center space-x-1">
          {activeLevels.map((level) => {
            const isActive = level.level === currentLevel;
            const colors = getColorClasses(level.color, isActive);
            
            return (
              <button
                key={level.level}
                className={uiUtils.utils.cn(
                  'w-3 h-3 rounded-full transition-all duration-200',
                  colors.bg,
                  interactive ? 'hover:scale-125 cursor-pointer' : 'cursor-default',
                  uiUtils.utils.a11y.focusVisible
                )}
                onClick={() => handleLevelChange(level.level)}
                title={`${level.label}: ${level.description}`}
                disabled={!interactive}
              />
            );
          })}
        </div>
        <span className={uiUtils.utils.cn(config.text, 'font-medium text-gray-900')}>
          {currentLevelInfo.label}
        </span>
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={uiUtils.utils.cn('space-y-3', config.container, className)}>
        {showLabels && (
          <h3 className={uiUtils.utils.cn(config.title, 'font-medium text-gray-900')}>
            Question Sophistication Level
          </h3>
        )}
        
        <div className="flex flex-wrap gap-2">
          {activeLevels.map((level) => {
            const isActive = level.level === currentLevel;
            const isHovered = hoveredLevel === level.level;
            const colors = getColorClasses(level.color, isActive, isHovered);
            
            return (
              <button
                key={level.level}
                className={uiUtils.utils.cn(
                  config.button,
                  'rounded-lg border-2 font-medium transition-all duration-200 flex items-center justify-center',
                  colors.bg,
                  colors.text,
                  colors.border,
                  interactive ? 'hover:scale-105 cursor-pointer' : 'cursor-default',
                  isActive ? `ring-2 ${colors.ring}` : '',
                  uiUtils.utils.a11y.focusVisible
                )}
                onClick={() => handleLevelChange(level.level)}
                onMouseEnter={() => setHoveredLevel(level.level)}
                onMouseLeave={() => setHoveredLevel(null)}
                title={level.description}
                disabled={!interactive}
              >
                {level.level}
              </button>
            );
          })}
        </div>
        
        {showLabels && (
          <div className="flex items-center space-x-2">
            <span className={uiUtils.utils.cn(config.text, 'text-gray-600')}>
              Current:
            </span>
            <span className={uiUtils.utils.cn(config.text, 'font-medium text-gray-900')}>
              {currentLevelInfo.label}
            </span>
          </div>
        )}
        
        {showDescriptions && (
          <p className={uiUtils.utils.cn(config.text, 'text-gray-600')}>
            {currentLevelInfo.description}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={uiUtils.utils.cn('space-y-4', config.container, className)}>
        <h3 className={uiUtils.utils.cn(config.title, 'font-medium text-gray-900')}>
          Question Sophistication Control
        </h3>
        
        {/* Level selector */}
        <div className="grid grid-cols-1 gap-3">
          {activeLevels.map((level) => {
            const isActive = level.level === currentLevel;
            const colors = getColorClasses(level.color, isActive);
            
            return (
              <button
                key={level.level}
                className={uiUtils.utils.cn(
                  'p-3 rounded-lg border-2 text-left transition-all duration-200',
                  colors.bg,
                  colors.border,
                  interactive ? 'hover:shadow-md cursor-pointer' : 'cursor-default',
                  isActive ? `ring-2 ${colors.ring}` : '',
                  uiUtils.utils.a11y.focusVisible
                )}
                onClick={() => handleLevelChange(level.level)}
                disabled={!interactive}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={uiUtils.utils.cn('font-medium', colors.text)}>
                    Level {level.level}: {level.label}
                  </div>
                  {isActive && (
                    <div className={uiUtils.utils.cn('w-3 h-3 rounded-full', colors.bg.replace('bg-', 'bg-'))} />
                  )}
                </div>
                <p className={uiUtils.utils.cn(config.text, colors.text, 'mb-2')}>
                  {level.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {level.characteristics.map((char, index) => (
                    <span
                      key={index}
                      className={uiUtils.utils.cn(
                        'px-2 py-0.5 text-xs rounded-md',
                        isActive ? 'bg-white bg-opacity-20' : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {char}
                    </span>
                  ))}
                </div>
                {showExamples && level.examples && (
                  <div className="mt-2">
                    <div className={uiUtils.utils.cn('text-xs font-medium mb-1', colors.text)}>
                      Example questions:
                    </div>
                    <div className="space-y-1">
                      {level.examples.map((example, index) => (
                        <div key={index} className={uiUtils.utils.cn('text-xs', colors.text)}>
                          &quot;{example}&quot;
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Slider variant (default)
  return (
    <div className={uiUtils.utils.cn('space-y-3', config.container, className)}>
      {showLabels && (
        <div className="flex items-center justify-between">
          <h3 className={uiUtils.utils.cn(config.title, 'font-medium text-gray-900')}>
            Sophistication Level
          </h3>
          <span className={uiUtils.utils.cn(config.text, 'font-medium text-gray-700')}>
            {currentLevelInfo.label}
          </span>
        </div>
      )}
      
      {/* Custom slider */}
      <div className="relative">
        <div className={uiUtils.utils.cn('w-full bg-gray-200 rounded-full', config.slider)}>
          <div
            className={uiUtils.utils.cn(
              'h-full rounded-full transition-all duration-300',
              getColorClasses(currentLevelInfo.color, true).bg
            )}
            style={{ width: `${(currentLevel / maxLevel) * 100}%` }}
          />
        </div>
        
        {/* Level markers */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full">
          {activeLevels.map((level) => {
            const isActive = level.level === currentLevel;
            const colors = getColorClasses(level.color, isActive);
            
            return (
              <button
                key={level.level}
                className={uiUtils.utils.cn(
                  config.thumb,
                  'absolute rounded-full border-2 border-white shadow-sm transition-all duration-200',
                  colors.bg,
                  interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default',
                  uiUtils.utils.a11y.focusVisible
                )}
                style={{ left: `${((level.level - 1) / (maxLevel - 1)) * 100}%` }}
                onClick={() => handleLevelChange(level.level)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                title={`${level.label}: ${level.description}`}
                disabled={!interactive}
              />
            );
          })}
        </div>
      </div>
      
      {/* Level labels */}
      {showLabels && (
        <div className="flex justify-between">
          {activeLevels.map((level) => (
            <span
              key={level.level}
              className={uiUtils.utils.cn(
                config.text,
                level.level === currentLevel ? 'font-medium text-gray-900' : 'text-gray-500'
              )}
            >
              {level.label}
            </span>
          ))}
        </div>
      )}
      
      {showDescriptions && (
        <p className={uiUtils.utils.cn(config.text, 'text-gray-600')}>
          {currentLevelInfo.description}
        </p>
      )}
    </div>
  );
};

export default SophisticationControl;
