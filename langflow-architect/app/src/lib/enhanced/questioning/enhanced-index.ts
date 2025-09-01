/**
 * Enhanced Component Library - Index
 * Epic 6.4.3 Story 1.4 - Phase 1: Enhanced Component Library
 * 
 * Central export for all enhanced questioning components
 */

// Enhanced Components
export { default as EnhancedExpertiseIndicator } from './components/ExpertiseIndicatorFinal';
export { default as EnhancedProgressionTracker } from './components/EnhancedProgressionTracker';
export { default as EnhancedSophisticationControl } from './components/SophisticationControlFinal';
export { default as QuestioningDashboard } from './components/QuestioningDashboard';

// Design System
export { designTokens, getExpertiseColor, getSophisticationColor, mediaQuery, theme } from './design-system';
export { uiUtils } from './ui-utils';

// Types and Interfaces
export type { DesignTokens, ColorPalette, TypographyScale, SpacingScale } from './design-system';
export type { ProgressStep } from './components/EnhancedProgressionTracker';
export type { SophisticationLevel } from './components/SophisticationControlFinal';
export type { QuestioningSession } from './components/QuestioningDashboard';

// Utility Functions
export { utils } from './ui-utils';

// Re-export existing types for compatibility
export type { ExpertiseLevel } from './expertiseTracker';
