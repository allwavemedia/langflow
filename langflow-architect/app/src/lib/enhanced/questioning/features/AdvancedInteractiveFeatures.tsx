import React, { useState, useCallback, useEffect, useRef } from 'react';
import { uiUtils } from '../ui-utils';
import { designTokens } from '../design-system';

// Advanced interaction types
export interface GestureEvent {
  type: 'swipe' | 'pinch' | 'rotate' | 'long-press' | 'double-tap';
  data: {
    deltaX?: number;
    deltaY?: number;
    scale?: number;
    rotation?: number;
    duration?: number;
    position: { x: number; y: number };
  };
}

export interface AnimationState {
  isAnimating: boolean;
  progress: number;
  direction: 'forward' | 'reverse';
  duration: number;
}

export interface InteractiveFeature {
  id: string;
  type: 'hover-reveal' | 'gesture-control' | 'micro-animation' | 'progressive-disclosure';
  enabled: boolean;
  configuration: Record<string, any>;
}

// Props for advanced interactive features
export interface AdvancedInteractiveFeaturesProps {
  children: React.ReactNode;
  enableGestures?: boolean;
  enableMicroAnimations?: boolean;
  enableProgressiveDisclosure?: boolean;
  enableSmartTooltips?: boolean;
  enableKeyboardShortcuts?: boolean;
  className?: string;
  onGesture?: (gesture: GestureEvent) => void;
  onAnimationComplete?: (animation: AnimationState) => void;
}

/**
 * Advanced Interactive Features Component
 * 
 * Provides sophisticated interaction patterns including:
 * - Touch gesture recognition
 * - Micro-animations and transitions
 * - Progressive disclosure patterns
 * - Smart tooltip system
 * - Keyboard shortcut management
 * - Accessibility enhancements
 */
export default function AdvancedInteractiveFeatures({
  children,
  enableGestures = true,
  enableMicroAnimations = true,
  enableProgressiveDisclosure = true,
  enableSmartTooltips = true,
  enableKeyboardShortcuts = true,
  className,
  onGesture,
  onAnimationComplete
}: AdvancedInteractiveFeaturesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFeatures, setActiveFeatures] = useState<Set<string>>(new Set());
  const [gestureState, setGestureState] = useState<{
    isActive: boolean;
    startPosition: { x: number; y: number };
    currentPosition: { x: number; y: number };
    startTime: number;
  }>({
    isActive: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    startTime: 0
  });

  // Gesture recognition system
  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (!enableGestures || event.touches.length !== 1) return;

    const touch = event.touches[0];
    setGestureState({
      isActive: true,
      startPosition: { x: touch.clientX, y: touch.clientY },
      currentPosition: { x: touch.clientX, y: touch.clientY },
      startTime: Date.now()
    });
  }, [enableGestures]);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    if (!enableGestures || !gestureState.isActive || event.touches.length !== 1) return;

    const touch = event.touches[0];
    setGestureState(prev => ({
      ...prev,
      currentPosition: { x: touch.clientX, y: touch.clientY }
    }));
  }, [enableGestures, gestureState.isActive]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    if (!enableGestures || !gestureState.isActive) return;

    const deltaX = gestureState.currentPosition.x - gestureState.startPosition.x;
    const deltaY = gestureState.currentPosition.y - gestureState.startPosition.y;
    const duration = Date.now() - gestureState.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;

    // Detect gesture type
    let gestureType: GestureEvent['type'] | null = null;

    if (duration > 500 && distance < 10) {
      gestureType = 'long-press';
    } else if (velocity > 0.5 && distance > 50) {
      gestureType = 'swipe';
    } else if (duration < 300 && distance < 10) {
      // Check for double-tap (simplified)
      gestureType = 'double-tap';
    }

    if (gestureType && onGesture) {
      onGesture({
        type: gestureType,
        data: {
          deltaX,
          deltaY,
          duration,
          position: gestureState.currentPosition
        }
      });
    }

    setGestureState({
      isActive: false,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 },
      startTime: 0
    });
  }, [enableGestures, gestureState, onGesture]);

  // Micro-animation system
  const triggerMicroAnimation = useCallback((element: HTMLElement, type: string) => {
    if (!enableMicroAnimations) return;

    const animations = {
      'bounce': [
        { transform: 'scale(1)' },
        { transform: 'scale(1.05)' },
        { transform: 'scale(0.98)' },
        { transform: 'scale(1)' }
      ],
      'pulse': [
        { opacity: '1' },
        { opacity: '0.7' },
        { opacity: '1' }
      ],
      'shake': [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-2px)' },
        { transform: 'translateX(2px)' },
        { transform: 'translateX(-2px)' },
        { transform: 'translateX(0)' }
      ],
      'glow': [
        { boxShadow: '0 0 0 rgba(59, 130, 246, 0)' },
        { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
        { boxShadow: '0 0 0 rgba(59, 130, 246, 0)' }
      ]
    };

    const keyframes = animations[type as keyof typeof animations];
    if (!keyframes) return;

    const animation = element.animate(keyframes, {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
    });

    animation.addEventListener('finish', () => {
      if (onAnimationComplete) {
        onAnimationComplete({
          isAnimating: false,
          progress: 1,
          direction: 'forward',
          duration: 300
        });
      }
    });
  }, [enableMicroAnimations, onAnimationComplete]);

  // Progressive disclosure system
  const ProgressiveDisclosure = ({ 
    trigger, 
    content, 
    level = 1 
  }: { 
    trigger: React.ReactNode; 
    content: React.ReactNode; 
    level?: number;
  }) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [hasBeenViewed, setHasBeenViewed] = useState(false);

    const handleReveal = useCallback(() => {
      setIsRevealed(!isRevealed);
      if (!hasBeenViewed) {
        setHasBeenViewed(true);
      }
    }, [isRevealed, hasBeenViewed]);

    if (!enableProgressiveDisclosure) {
      return <>{trigger}{content}</>;
    }

    return (
      <div className={`progressive-disclosure level-${level}`}>
        <div 
          className="disclosure-trigger cursor-pointer"
          onClick={handleReveal}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleReveal();
            }
          }}
          tabIndex={0}
          role="button"
          aria-expanded={isRevealed}
          aria-label={`${isRevealed ? 'Hide' : 'Show'} additional content`}
        >
          {trigger}
          <span className={`disclosure-indicator ${isRevealed ? 'expanded' : ''}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </span>
        </div>
        
        <div className={`disclosure-content ${isRevealed ? 'revealed' : 'hidden'}`}>
          {content}
        </div>
      </div>
    );
  };

  // Smart tooltip system
  const SmartTooltip = ({ 
    children, 
    content, 
    position = 'top',
    delay = 500
  }: {
    children: React.ReactNode;
    content: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
  }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [actualPosition, setActualPosition] = useState(position);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const tooltipRef = useRef<HTMLDivElement>(null);

    const showTooltip = useCallback(() => {
      if (!enableSmartTooltips) return;
      
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        
        // Smart positioning - adjust if tooltip would go off screen
        if (tooltipRef.current) {
          const rect = tooltipRef.current.getBoundingClientRect();
          const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
          };
          
          let newPosition = position;
          
          if (position === 'top' && rect.top < 10) {
            newPosition = 'bottom';
          } else if (position === 'bottom' && rect.bottom > viewport.height - 10) {
            newPosition = 'top';
          } else if (position === 'left' && rect.left < 10) {
            newPosition = 'right';
          } else if (position === 'right' && rect.right > viewport.width - 10) {
            newPosition = 'left';
          }
          
          setActualPosition(newPosition);
        }
      }, delay);
    }, [enableSmartTooltips, position, delay]);

    const hideTooltip = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    }, []);

    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    if (!enableSmartTooltips) {
      return <>{children}</>;
    }

    return (
      <div 
        className="smart-tooltip-container relative inline-block"
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
        {isVisible && (
          <div
            ref={tooltipRef}
            className={`smart-tooltip position-${actualPosition} absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg pointer-events-none transition-opacity duration-200`}
            role="tooltip"
          >
            {content}
            <div className={`tooltip-arrow position-${actualPosition}`} />
          </div>
        )}
      </div>
    );
  };

  // Keyboard shortcut system
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Common shortcuts for questioning interface
      const shortcuts: Record<string, () => void> = {
        'Escape': () => {
          // Close any open modals or progressive disclosures
          setActiveFeatures(new Set());
        },
        'ArrowRight': () => {
          // Navigate to next step
          if (event.altKey) {
            event.preventDefault();
            // Trigger next step navigation
          }
        },
        'ArrowLeft': () => {
          // Navigate to previous step
          if (event.altKey) {
            event.preventDefault();
            // Trigger previous step navigation
          }
        },
        'Space': () => {
          // Toggle current step completion
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            // Trigger step toggle
          }
        }
      };

      const shortcut = shortcuts[event.key];
      if (shortcut) {
        shortcut();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts]);

  // Container classes with feature flags
  const containerClasses = uiUtils.utils.cn(
    'advanced-interactive-features',
    {
      'gestures-enabled': enableGestures,
      'animations-enabled': enableMicroAnimations,
      'progressive-disclosure-enabled': enableProgressiveDisclosure,
      'tooltips-enabled': enableSmartTooltips,
      'shortcuts-enabled': enableKeyboardShortcuts,
      'gesture-active': gestureState.isActive
    },
    className
  );

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}

      <style jsx>{`
        .advanced-interactive-features {
          position: relative;
          touch-action: manipulation;
        }

        .progressive-disclosure {
          margin: 0.5rem 0;
        }

        .disclosure-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid ${designTokens.colors.neutral.gray3};
          transition: all 0.2s ease;
        }

        .disclosure-trigger:hover {
          background-color: ${designTokens.colors.neutral.gray1};
          border-radius: 0.25rem;
        }

        .disclosure-trigger:focus {
          outline: 2px solid ${designTokens.colors.semantic.info};
          outline-offset: 2px;
        }

        .disclosure-indicator {
          transition: transform 0.2s ease;
        }

        .disclosure-indicator.expanded {
          transform: rotate(180deg);
        }

        .disclosure-content {
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .disclosure-content.hidden {
          max-height: 0;
          opacity: 0;
          margin: 0;
        }

        .disclosure-content.revealed {
          max-height: 1000px;
          opacity: 1;
          margin: 0.5rem 0;
        }

        .smart-tooltip {
          max-width: 200px;
          word-wrap: break-word;
        }

        .smart-tooltip.position-top {
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-bottom: 0.5rem;
        }

        .smart-tooltip.position-bottom {
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          margin-top: 0.5rem;
        }

        .smart-tooltip.position-left {
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-right: 0.5rem;
        }

        .smart-tooltip.position-right {
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          margin-left: 0.5rem;
        }

        .tooltip-arrow {
          position: absolute;
          width: 0;
          height: 0;
        }

        .tooltip-arrow.position-top {
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid #1f2937;
        }

        .tooltip-arrow.position-bottom {
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 5px solid #1f2937;
        }

        .tooltip-arrow.position-left {
          left: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-left: 5px solid #1f2937;
        }

        .tooltip-arrow.position-right {
          right: 100%;
          top: 50%;
          transform: translateY(-50%);
          border-top: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-right: 5px solid #1f2937;
        }

        .gestures-enabled {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }

        .gesture-active {
          cursor: grabbing;
        }

        @media (prefers-reduced-motion: reduce) {
          .disclosure-content,
          .disclosure-indicator,
          .smart-tooltip {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

// Export sub-components for direct use
export { AdvancedInteractiveFeatures };
