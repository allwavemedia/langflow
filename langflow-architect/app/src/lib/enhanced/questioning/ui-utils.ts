/**
 * UI Utilities for Epic 6.4.3 Enhanced Components
 * Phase 1: Enhanced Component Library
 * 
 * Common utility functions and classes for consistent UI behavior
 */

import { getExpertiseColor, getSophisticationColor } from './design-system';

// Animation utility classes
export const animations = {
  // Smooth transitions
  transition: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-300 ease-out',
    slow: 'transition-all duration-500 ease-out',
  },
  
  // Transform animations
  scale: {
    enter: 'transform scale-100 opacity-100',
    exit: 'transform scale-95 opacity-0',
    hover: 'hover:scale-105',
  },
  
  // Slide animations
  slide: {
    up: 'transform translate-y-0 opacity-100',
    down: 'transform translate-y-2 opacity-0',
    left: 'transform -translate-x-2 opacity-0',
    right: 'transform translate-x-2 opacity-0',
  },
  
  // Fade animations
  fade: {
    in: 'opacity-100',
    out: 'opacity-0',
  },
  
  // Pulse animation for loading states
  pulse: 'animate-pulse',
  
  // Bounce for interactive elements
  bounce: 'hover:animate-bounce',
};

// Layout utility classes
export const layout = {
  // Flexbox utilities
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center',
    wrap: 'flex flex-wrap',
  },
  
  // Grid utilities
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-2',
    cols3: 'grid grid-cols-3',
    cols4: 'grid grid-cols-4',
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  },
  
  // Spacing utilities
  spacing: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  },
  
  // Container utilities
  container: {
    sm: 'max-w-sm mx-auto',
    md: 'max-w-md mx-auto',
    lg: 'max-w-lg mx-auto',
    xl: 'max-w-xl mx-auto',
    full: 'w-full',
  },
};

// Typography utility classes
export const typography = {
  // Heading styles
  heading: {
    h1: 'text-4xl font-bold text-gray-900 leading-tight',
    h2: 'text-3xl font-semibold text-gray-900 leading-tight',
    h3: 'text-2xl font-semibold text-gray-900 leading-tight',
    h4: 'text-xl font-medium text-gray-900 leading-tight',
    h5: 'text-lg font-medium text-gray-900 leading-tight',
    h6: 'text-base font-medium text-gray-900 leading-tight',
  },
  
  // Body text styles
  body: {
    large: 'text-lg text-gray-700 leading-relaxed',
    normal: 'text-base text-gray-700 leading-normal',
    small: 'text-sm text-gray-600 leading-normal',
    xs: 'text-xs text-gray-500 leading-normal',
  },
  
  // Special text styles
  special: {
    label: 'text-sm font-medium text-gray-700 leading-normal',
    caption: 'text-xs text-gray-500 leading-normal',
    code: 'font-mono text-sm bg-gray-100 px-1 py-0.5 rounded',
    link: 'text-blue-600 hover:text-blue-800 underline cursor-pointer',
  },
  
  // Text alignment
  align: {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  },
};

// Interactive element utilities
export const interactive = {
  // Button base styles
  button: {
    base: 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizes: {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    },
    variants: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
      error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    },
  },
  
  // Input base styles
  input: {
    base: 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200',
    sizes: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg',
    },
    states: {
      error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
      success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
      disabled: 'bg-gray-100 text-gray-500 cursor-not-allowed',
    },
  },
  
  // Card styles
  card: {
    base: 'bg-white rounded-lg border border-gray-200 shadow-sm',
    hover: 'hover:shadow-md cursor-pointer transition-shadow duration-200',
    interactive: 'hover:shadow-lg hover:border-gray-300 cursor-pointer transition-all duration-200',
    padding: {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    },
  },
};

// Status and feedback utilities
export const feedback = {
  // Loading states
  loading: {
    spinner: 'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
    pulse: 'animate-pulse bg-gray-200 rounded',
    skeleton: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
  },
  
  // Status indicators
  status: {
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
  },
  
  // Progress indicators
  progress: {
    bar: 'bg-gray-200 rounded-full overflow-hidden',
    fill: 'bg-blue-600 h-full transition-all duration-300 ease-out',
    ring: 'circular-progress',
  },
};

// Utility functions for dynamic styling
export const utils = {
  // Combine class names with conditional logic
  cn: (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
  },
  
  // Get expertise level styling
  getExpertiseStyle: (level: string): string => {
    const color = getExpertiseColor(level);
    return `border-[${color}] bg-[${color}]/10 text-[${color}]`;
  },
  
  // Get sophistication level styling
  getSophisticationStyle: (level: number): string => {
    const color = getSophisticationColor(level);
    return `border-[${color}] bg-[${color}]/10 text-[${color}]`;
  },
  
  // Generate gradient backgrounds
  getGradient: (from: string, to: string): string => {
    return `bg-gradient-to-r from-[${from}] to-[${to}]`;
  },
  
  // Responsive breakpoint utilities
  responsive: {
    // Show/hide at breakpoints
    hideOn: {
      mobile: 'hidden sm:block',
      tablet: 'hidden md:block',
      desktop: 'hidden lg:block',
    },
    showOn: {
      mobile: 'block sm:hidden',
      tablet: 'block md:hidden',
      desktop: 'block lg:hidden',
    },
  },
  
  // Accessibility utilities
  a11y: {
    srOnly: 'sr-only',
    focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
    skipLink: 'absolute left-[-10000px] top-auto width-1 height-1 overflow-hidden focus:left-auto focus:top-auto focus:width-auto focus:height-auto',
  },
};

// Component composition utilities
export const compose = {
  // Merge component props with defaults
  mergeProps: <T extends Record<string, unknown>>(
    defaultProps: T,
    props: Partial<T>
  ): T => {
    return { ...defaultProps, ...props };
  },
  
  // Create variant-based styling
  createVariants: <T extends string>(
    base: string,
    variants: Record<T, string>
  ) => (variant: T): string => {
    return `${base} ${variants[variant]}`;
  },
  
  // Create size-based styling
  createSizes: <T extends string>(
    base: string,
    sizes: Record<T, string>
  ) => (size: T): string => {
    return `${base} ${sizes[size]}`;
  },
};

// Animation presets for common UI patterns
export const animationPresets = {
  // Modal/dialog animations
  modal: {
    backdrop: {
      enter: 'opacity-0',
      enterActive: 'opacity-100 transition-opacity duration-300',
      exit: 'opacity-100',
      exitActive: 'opacity-0 transition-opacity duration-300',
    },
    content: {
      enter: 'opacity-0 scale-95 translate-y-4',
      enterActive: 'opacity-100 scale-100 translate-y-0 transition-all duration-300 ease-out',
      exit: 'opacity-100 scale-100 translate-y-0',
      exitActive: 'opacity-0 scale-95 translate-y-4 transition-all duration-200 ease-in',
    },
  },
  
  // Dropdown animations
  dropdown: {
    enter: 'opacity-0 scale-95',
    enterActive: 'opacity-100 scale-100 transition-all duration-200 ease-out',
    exit: 'opacity-100 scale-100',
    exitActive: 'opacity-0 scale-95 transition-all duration-150 ease-in',
  },
  
  // Slide animations
  slideUp: {
    enter: 'transform translate-y-full',
    enterActive: 'transform translate-y-0 transition-transform duration-300 ease-out',
    exit: 'transform translate-y-0',
    exitActive: 'transform translate-y-full transition-transform duration-300 ease-in',
  },
  
  // Fade animations
  fade: {
    enter: 'opacity-0',
    enterActive: 'opacity-100 transition-opacity duration-300',
    exit: 'opacity-100',
    exitActive: 'opacity-0 transition-opacity duration-300',
  },
  
  // Collapse animations
  collapse: {
    enter: 'max-h-0 overflow-hidden',
    enterActive: 'max-h-screen transition-all duration-300 ease-out',
    exit: 'max-h-screen overflow-hidden',
    exitActive: 'max-h-0 transition-all duration-300 ease-in',
  },
};

// Export all utilities as a single object for easy importing
export const uiUtils = {
  animations,
  layout,
  typography,
  interactive,
  feedback,
  utils,
  compose,
  animationPresets,
};

export default uiUtils;
