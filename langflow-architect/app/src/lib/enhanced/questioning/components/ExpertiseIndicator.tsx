/**
 * ExpertiseIndicator Component
 * Epic 6.4.3 Story 1.3 - Task 5
 * 
 * Visual indicator for current user expertise level with progression history
 */

import React from 'react';
import { ExpertiseLevel } from '../expertiseTracker';

export interface ExpertiseIndicatorProps {
  currentLevel: ExpertiseLevel;
  progressionHistory?: ExpertiseLevel[];
  showProgression?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onLevelClick?: (level: ExpertiseLevel) => void;
}

interface ExpertiseLevelInfo {
  label: string;
  description: string;
  color: string;
  backgroundColor: string;
  icon: string;
}

const EXPERTISE_INFO: Record<ExpertiseLevel, ExpertiseLevelInfo> = {
  'novice': {
    label: 'Novice',
    description: 'Completely new to the topic, needs careful guidance',
    color: '#059669', // emerald-600
    backgroundColor: '#D1FAE5', // emerald-100
    icon: '🌱'
  },
  'beginner': {
    label: 'Beginner',
    description: 'Learning the basics, can follow simple explanations',
    color: '#0891B2', // cyan-600
    backgroundColor: '#CFFAFE', // cyan-100
    icon: '🌿'
  },
  'intermediate': {
    label: 'Intermediate',
    description: 'Comfortable with core concepts, ready for details',
    color: '#D97706', // amber-600
    backgroundColor: '#FEF3C7', // amber-100
    icon: '🌳'
  },
  'advanced': {
    label: 'Advanced',
    description: 'Deep understanding, can handle complex scenarios',
    color: '#DC2626', // red-600
    backgroundColor: '#FEE2E2', // red-100
    icon: '🌲'
  },
  'expert': {
    label: 'Expert',
    description: 'Mastery level, can teach others',
    color: '#7C3AED', // violet-600
    backgroundColor: '#EDE9FE', // violet-100
    icon: '🏔️'
  }
};

const SIZE_CLASSES = {
  small: {
    container: 'w-24 h-8',
    text: 'text-xs',
    icon: 'text-sm',
    badge: 'px-2 py-1'
  },
  medium: {
    container: 'w-32 h-10',
    text: 'text-sm',
    icon: 'text-base',
    badge: 'px-3 py-2'
  },
  large: {
    container: 'w-40 h-12',
    text: 'text-base',
    icon: 'text-lg',
    badge: 'px-4 py-2'
  }
};

export const ExpertiseIndicator: React.FC<ExpertiseIndicatorProps> = ({
  currentLevel,
  progressionHistory = [],
  showProgression = false,
  size = 'medium',
  className = '',
  onLevelClick
}) => {
  const expertiseInfo = EXPERTISE_INFO[currentLevel];
  const sizeClasses = SIZE_CLASSES[size];
  
  const handleClick = () => {
    if (onLevelClick) {
      onLevelClick(currentLevel);
    }
  };

  const renderMainIndicator = () => (
    <div
      className={`
        inline-flex items-center justify-center rounded-lg border-2 
        transition-all duration-200 hover:shadow-md
        ${sizeClasses.container} ${sizeClasses.badge}
        ${onLevelClick ? 'cursor-pointer hover:scale-105' : ''}
        ${className}
      `}
      // eslint-disable-next-line react/forbid-dom-props
      style={{
        borderColor: expertiseInfo.color,
        backgroundColor: expertiseInfo.backgroundColor,
        color: expertiseInfo.color
      }}
      onClick={handleClick}
      title={expertiseInfo.description}
    >
      <span className={`${sizeClasses.icon} mr-1`}>
        {expertiseInfo.icon}
      </span>
      <span className={`${sizeClasses.text} font-medium`}>
        {expertiseInfo.label}
      </span>
    </div>
  );

  const renderProgressionHistory = () => {
    if (!showProgression || progressionHistory.length === 0) {
      return null;
    }

    return (
      <div className="mt-2 flex items-center space-x-1">
        <span className="text-xs text-gray-500 mr-2">Progress:</span>
        {progressionHistory.map((level, index) => {
          const levelInfo = EXPERTISE_INFO[level];
          const isCurrentLevel = level === currentLevel;
          
          return (
            <div
              key={`${level}-${index}`}
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs
                border transition-all duration-200
                ${isCurrentLevel ? 'border-2 shadow-sm' : 'border opacity-60'}
              `}
              // eslint-disable-next-line react/forbid-dom-props
              style={{
                borderColor: levelInfo.color,
                backgroundColor: isCurrentLevel ? levelInfo.backgroundColor : '#F9FAFB',
                color: levelInfo.color
              }}
              title={`${levelInfo.label} (Step ${index + 1})`}
            >
              {levelInfo.icon}
            </div>
          );
        })}
        {progressionHistory.length > 1 && (
          <div className="ml-2 text-xs text-gray-500">
            +{progressionHistory.length - 1} step{progressionHistory.length > 2 ? 's' : ''}
          </div>
        )}
      </div>
    );
  };

  const renderProgressionBar = () => {
    if (!showProgression) return null;

    // Convert string expertise level to numeric for progress calculation
    const expertiseLevels = ['novice', 'beginner', 'intermediate', 'advanced', 'expert'] as const;
    const currentIndex = expertiseLevels.indexOf(currentLevel);
    const progressPercentage = ((currentIndex + 1) / expertiseLevels.length) * 100;
    
    return (
      <div className="mt-2">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPercentage}%`,
              backgroundColor: expertiseInfo.color
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Novice</span>
          <span>Expert</span>
        </div>
      </div>
    );
  };

  return (
    <div className="expertise-indicator">
      {renderMainIndicator()}
      {renderProgressionHistory()}
      {renderProgressionBar()}
    </div>
  );
};

export default ExpertiseIndicator;
