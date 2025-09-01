/**
 * SophisticationControl Component
 * Epic 6.4.3 Story 1.3 - Task 5
 * 
 * Interactive control for adjusting question sophistication level
 */

import React, { useState, useCallback } from 'react';
import { SophisticationLevel } from '../questionTypes';

export interface SophisticationControlProps {
  currentLevel: SophisticationLevel;
  onLevelChange: (level: SophisticationLevel) => void;
  disabled?: boolean;
  showLabels?: boolean;
  showDescription?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'slider' | 'buttons' | 'dropdown';
  className?: string;
  autoAdjust?: boolean;
  onAutoAdjustChange?: (enabled: boolean) => void;
}

interface SophisticationInfo {
  label: string;
  description: string;
  color: string;
  backgroundColor: string;
  examples: string[];
}

const SOPHISTICATION_INFO: Record<SophisticationLevel, SophisticationInfo> = {
  1: {
    label: 'Simple',
    description: 'Basic questions with clear yes/no or simple answers',
    color: '#EF4444', // red-500
    backgroundColor: '#FEE2E2', // red-100
    examples: ['What is this?', 'Do you know about...?', 'Have you tried...?']
  },
  2: {
    label: 'Basic',
    description: 'Straightforward questions requiring brief explanations',
    color: '#F97316', // orange-500
    backgroundColor: '#FED7AA', // orange-100
    examples: ['How would you...?', 'What happens when...?', 'Why is this important?']
  },
  3: {
    label: 'Moderate',
    description: 'Questions requiring thoughtful consideration and examples',
    color: '#F59E0B', // amber-500
    backgroundColor: '#FEF3C7', // amber-100
    examples: ['Compare and contrast...', 'What factors would you consider...?', 'How might this affect...?']
  },
  4: {
    label: 'Complex',
    description: 'Multi-layered questions requiring analysis and reasoning',
    color: '#3B82F6', // blue-500
    backgroundColor: '#DBEAFE', // blue-100
    examples: ['Analyze the implications of...', 'Design a solution that considers...', 'What trade-offs exist between...?']
  },
  5: {
    label: 'Advanced',
    description: 'Deep questions requiring synthesis and expert-level thinking',
    color: '#8B5CF6', // violet-500
    backgroundColor: '#EDE9FE', // violet-100
    examples: ['Synthesize multiple perspectives on...', 'Evaluate the long-term consequences...', 'How would you innovate...?']
  }
};

const SIZE_VARIANTS = {
  small: {
    slider: 'h-2',
    button: 'px-2 py-1 text-xs',
    text: 'text-xs',
    spacing: 'space-x-1'
  },
  medium: {
    slider: 'h-3',
    button: 'px-3 py-2 text-sm',
    text: 'text-sm',
    spacing: 'space-x-2'
  },
  large: {
    slider: 'h-4',
    button: 'px-4 py-3 text-base',
    text: 'text-base',
    spacing: 'space-x-3'
  }
};

export const SophisticationControl: React.FC<SophisticationControlProps> = ({
  currentLevel,
  onLevelChange,
  disabled = false,
  showLabels = true,
  showDescription = true,
  size = 'medium',
  variant = 'slider',
  className = '',
  autoAdjust = false,
  onAutoAdjustChange
}) => {
  const [isHovering, setIsHovering] = useState<SophisticationLevel | null>(null);
  const [showExamples, setShowExamples] = useState(false);

  const sizeClasses = SIZE_VARIANTS[size];
  const currentInfo = SOPHISTICATION_INFO[currentLevel];
  const displayInfo = isHovering ? SOPHISTICATION_INFO[isHovering] : currentInfo;

  const handleLevelChange = useCallback((level: SophisticationLevel) => {
    if (!disabled) {
      onLevelChange(level);
    }
  }, [disabled, onLevelChange]);

  const renderSliderVariant = () => (
    <div className="sophistication-slider">
      <div className="relative">
        {/* Slider track */}
        <div className={`w-full bg-gray-200 rounded-full ${sizeClasses.slider}`}>
          <div 
            className={`${sizeClasses.slider} rounded-full transition-all duration-300`}
            style={{
              width: `${(currentLevel / 5) * 100}%`,
              backgroundColor: currentInfo.color
            }}
          />
        </div>
        
        {/* Slider handle */}
        <div 
          className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 bg-white border-2 rounded-full shadow-md cursor-pointer transition-all duration-200 hover:scale-110"
          style={{
            left: `calc(${((currentLevel - 1) / 4) * 100}% - 12px)`,
            borderColor: currentInfo.color
          }}
        />
        
        {/* Level markers */}
        <div className="flex justify-between mt-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => handleLevelChange(level as SophisticationLevel)}
              onMouseEnter={() => setIsHovering(level as SophisticationLevel)}
              onMouseLeave={() => setIsHovering(null)}
              disabled={disabled}
              className={`
                w-8 h-8 rounded-full border-2 flex items-center justify-center
                transition-all duration-200 hover:scale-110 disabled:opacity-50
                ${currentLevel === level ? 'shadow-md' : 'hover:shadow-sm'}
                ${sizeClasses.text}
              `}
              style={{
                backgroundColor: currentLevel === level ? SOPHISTICATION_INFO[level as SophisticationLevel].backgroundColor : 'white',
                borderColor: SOPHISTICATION_INFO[level as SophisticationLevel].color,
                color: SOPHISTICATION_INFO[level as SophisticationLevel].color
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderButtonVariant = () => (
    <div className={`sophistication-buttons flex ${sizeClasses.spacing}`}>
      {[1, 2, 3, 4, 5].map((level) => {
        const levelInfo = SOPHISTICATION_INFO[level as SophisticationLevel];
        const isActive = currentLevel === level;
        
        return (
          <button
            key={level}
            onClick={() => handleLevelChange(level as SophisticationLevel)}
            onMouseEnter={() => setIsHovering(level as SophisticationLevel)}
            onMouseLeave={() => setIsHovering(null)}
            disabled={disabled}
            className={`
              ${sizeClasses.button} rounded-lg border-2 font-medium transition-all duration-200
              hover:scale-105 disabled:opacity-50 disabled:hover:scale-100
              ${isActive ? 'shadow-md' : 'hover:shadow-sm'}
            `}
            style={{
              backgroundColor: isActive ? levelInfo.backgroundColor : 'white',
              borderColor: levelInfo.color,
              color: levelInfo.color
            }}
          >
            {showLabels ? levelInfo.label : level}
          </button>
        );
      })}
    </div>
  );

  const renderDropdownVariant = () => (
    <div className="sophistication-dropdown relative">
      <select
        value={currentLevel}
        onChange={(e) => handleLevelChange(Number(e.target.value) as SophisticationLevel)}
        disabled={disabled}
        className={`
          w-full ${sizeClasses.button} rounded-lg border-2 bg-white
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses.text}
        `}
        style={{
          borderColor: currentInfo.color,
          color: currentInfo.color
        }}
      >
        {[1, 2, 3, 4, 5].map((level) => {
          const levelInfo = SOPHISTICATION_INFO[level as SophisticationLevel];
          return (
            <option key={level} value={level}>
              {level} - {levelInfo.label}
            </option>
          );
        })}
      </select>
    </div>
  );

  const renderAutoAdjustToggle = () => {
    if (!onAutoAdjustChange) return null;

    return (
      <div className="auto-adjust-toggle flex items-center justify-between mt-4 p-3 bg-gray-50 rounded-lg">
        <div>
          <div className={`font-medium text-gray-700 ${sizeClasses.text}`}>
            Auto-adjust complexity
          </div>
          <div className="text-xs text-gray-500">
            Automatically adjust based on your responses
          </div>
        </div>
        <button
          onClick={() => onAutoAdjustChange(!autoAdjust)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${autoAdjust ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${autoAdjust ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    );
  };

  const renderDescription = () => {
    if (!showDescription) return null;

    return (
      <div className="sophistication-description mt-4">
        <div className={`font-medium text-gray-700 ${sizeClasses.text} mb-2`}>
          Level {displayInfo === currentInfo ? currentLevel : isHovering}: {displayInfo.label}
        </div>
        <div className="text-xs text-gray-600 mb-3">
          {displayInfo.description}
        </div>
        
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showExamples ? 'Hide' : 'Show'} examples
        </button>
        
        {showExamples && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-600 mb-2">Example questions:</div>
            <ul className="text-xs text-gray-700 space-y-1">
              {displayInfo.examples.map((example, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>{example}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderControlVariant = () => {
    switch (variant) {
      case 'buttons':
        return renderButtonVariant();
      case 'dropdown':
        return renderDropdownVariant();
      default:
        return renderSliderVariant();
    }
  };

  return (
    <div className={`sophistication-control ${className}`}>
      <div className="control-header mb-4">
        <h4 className={`font-medium text-gray-700 ${sizeClasses.text}`}>
          Question Complexity
        </h4>
      </div>
      
      {renderControlVariant()}
      {renderDescription()}
      {renderAutoAdjustToggle()}
    </div>
  );
};

export default SophisticationControl;
