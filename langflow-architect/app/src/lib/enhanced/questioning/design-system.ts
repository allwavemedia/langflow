/**
 * Design System for Epic 6.4.3 UI Integration
 * Phase 1: Enhanced Component Library
 * 
 * Central design tokens and theming system for the questioning interface
 */

export interface DesignTokens {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  shadows: ShadowScale;
  breakpoints: BreakpointScale;
  animation: AnimationTokens;
  zIndex: ZIndexScale;
}

export interface ColorPalette {
  // Primary brand colors for expertise levels
  expertise: {
    novice: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    expert: string;
  };
  
  // Sophistication level colors
  sophistication: {
    level1: string; // Simple
    level2: string; // Basic
    level3: string; // Moderate
    level4: string; // Complex
    level5: string; // Advanced
  };
  
  // UI semantic colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
    primary: string;
    secondary: string;
  };
  
  // Neutral grays for interface
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Background and surface colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    link: string;
    linkHover: string;
  };
  
  // Border colors
  border: {
    subtle: string;
    default: string;
    strong: string;
    focus: string;
  };
}

export interface TypographyScale {
  fontFamily: {
    sans: string;
    mono: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

export interface SpacingScale {
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

export interface ShadowScale {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  focus: string;
}

export interface BreakpointScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface AnimationTokens {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
  };
  transition: {
    all: string;
    colors: string;
    transform: string;
    opacity: string;
  };
}

export interface ZIndexScale {
  base: number;
  dropdown: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

// Main design system implementation
export const designTokens: DesignTokens = {
  colors: {
    expertise: {
      novice: '#059669',     // emerald-600 - Growth/Learning
      beginner: '#0891B2',   // cyan-600 - Exploration  
      intermediate: '#D97706', // amber-600 - Development
      advanced: '#7C3AED',   // violet-600 - Mastery
      expert: '#DC2626',     // red-600 - Excellence
    },
    
    sophistication: {
      level1: '#EF4444',     // red-500 - Simple
      level2: '#F97316',     // orange-500 - Basic
      level3: '#F59E0B',     // amber-500 - Moderate
      level4: '#3B82F6',     // blue-500 - Complex
      level5: '#8B5CF6',     // violet-500 - Advanced
    },
    
    semantic: {
      success: '#10B981',    // emerald-500
      warning: '#F59E0B',    // amber-500
      error: '#EF4444',      // red-500
      info: '#3B82F6',       // blue-500
      primary: '#6366F1',    // indigo-500
      secondary: '#64748B',  // slate-500
    },
    
    neutral: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },
    
    background: {
      primary: '#FFFFFF',
      secondary: '#F8FAFC',
      tertiary: '#F1F5F9',
      overlay: 'rgba(15, 23, 42, 0.6)',
    },
    
    text: {
      primary: '#0F172A',
      secondary: '#475569',
      tertiary: '#64748B',
      inverse: '#FFFFFF',
      link: '#3B82F6',
      linkHover: '#2563EB',
    },
    
    border: {
      subtle: '#F1F5F9',
      default: '#E2E8F0',
      strong: '#CBD5E1',
      focus: '#3B82F6',
    },
  },
  
  typography: {
    fontFamily: {
      sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'JetBrains Mono, Consolas, "Liberation Mono", Menlo, Courier, monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
    },
  },
  
  spacing: {
    0: '0rem',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    32: '8rem',       // 128px
    40: '10rem',      // 160px
    48: '12rem',      // 192px
    56: '14rem',      // 224px
    64: '16rem',      // 256px
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  },
  
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    transition: {
      all: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  
  zIndex: {
    base: 0,
    dropdown: 100,
    modal: 1000,
    popover: 1100,
    tooltip: 1200,
    toast: 1300,
  },
};

// Utility functions for working with design tokens
export const getExpertiseColor = (level: string, opacity = 1): string => {
  const baseColor = designTokens.colors.expertise[level as keyof typeof designTokens.colors.expertise];
  if (opacity === 1) return baseColor;
  
  // Convert hex to rgba
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getSophisticationColor = (level: number, opacity = 1): string => {
  const levelKey = `level${level}` as keyof typeof designTokens.colors.sophistication;
  const baseColor = designTokens.colors.sophistication[levelKey];
  if (opacity === 1) return baseColor;
  
  // Convert hex to rgba
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const mediaQuery = (breakpoint: keyof BreakpointScale): string => {
  return `@media (min-width: ${designTokens.breakpoints[breakpoint]})`;
};

// CSS-in-JS styled-components friendly theme
export const theme = {
  ...designTokens,
  // Helper functions
  getExpertiseColor,
  getSophisticationColor,
  mediaQuery,
};

export default designTokens;
