import { useState, useEffect, useMemo } from 'react';

// Responsive utilities and hooks for advanced dashboard layouts
export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'wide';
export type Orientation = 'portrait' | 'landscape';

export interface ViewportInfo {
  size: ViewportSize;
  width: number;
  height: number;
  orientation: Orientation;
  pixelRatio: number;
  isTouch: boolean;
}

export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

export interface ResponsiveConfiguration {
  breakpoints: ResponsiveBreakpoints;
  enableTouch: boolean;
  enableMotion: boolean;
  enableAnimations: boolean;
  preferReducedMotion: boolean;
}

// Default responsive breakpoints
export const defaultBreakpoints: ResponsiveBreakpoints = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280
};

/**
 * Custom hook for responsive viewport detection
 */
export function useViewport(customBreakpoints?: Partial<ResponsiveBreakpoints>): ViewportInfo {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };
  
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        size: 'desktop',
        width: 1024,
        height: 768,
        orientation: 'landscape',
        pixelRatio: 1,
        isTouch: false
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      size: getViewportSize(width, breakpoints),
      width,
      height,
      orientation: width > height ? 'landscape' : 'portrait',
      pixelRatio: window.devicePixelRatio || 1,
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewportInfo({
        size: getViewportSize(width, breakpoints),
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
        pixelRatio: window.devicePixelRatio || 1,
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      });
    };

    const debouncedUpdate = debounce(updateViewport, 150);
    
    window.addEventListener('resize', debouncedUpdate);
    window.addEventListener('orientationchange', debouncedUpdate);
    
    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      window.removeEventListener('orientationchange', debouncedUpdate);
    };
  }, [breakpoints]);

  return viewportInfo;
}

/**
 * Custom hook for responsive configuration
 */
export function useResponsiveConfig(): ResponsiveConfiguration {
  const [config, setConfig] = useState<ResponsiveConfiguration>(() => ({
    breakpoints: defaultBreakpoints,
    enableTouch: typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    enableMotion: true,
    enableAnimations: true,
    preferReducedMotion: false
  }));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => {
      setConfig(prev => ({
        ...prev,
        preferReducedMotion: mediaQuery.matches,
        enableAnimations: !mediaQuery.matches && prev.enableMotion
      }));
    };

    updateMotionPreference();
    mediaQuery.addListener(updateMotionPreference);

    return () => mediaQuery.removeListener(updateMotionPreference);
  }, []);

  return config;
}

/**
 * Get viewport size based on width and breakpoints
 */
function getViewportSize(width: number, breakpoints: ResponsiveBreakpoints): ViewportSize {
  if (width < breakpoints.mobile) return 'mobile';
  if (width < breakpoints.tablet) return 'tablet';  
  if (width < breakpoints.desktop) return 'desktop';
  return 'wide';
}

/**
 * Debounce utility for performance optimization
 */
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
}

/**
 * Responsive grid system utilities
 */
export const responsiveGrid = {
  // Auto-fit grid with minimum column width
  autoFit: (minWidth: number = 250, gap: number = 16) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
    gap: `${gap}px`
  }),

  // Auto-fill grid for consistent item sizing
  autoFill: (minWidth: number = 250, gap: number = 16) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
    gap: `${gap}px`
  }),

  // Responsive columns based on viewport
  responsive: (viewport: ViewportSize, gap: number = 16) => {
    const columns = {
      mobile: 1,
      tablet: 2,
      desktop: 3,
      wide: 4
    };
    
    return {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns[viewport]}, 1fr)`,
      gap: `${gap}px`
    };
  },

  // Masonry-style layout approximation with CSS Grid
  masonry: (columnWidth: number = 250, gap: number = 16) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(auto-fit, minmax(${columnWidth}px, 1fr))`,
    gridAutoRows: 'max-content',
    gap: `${gap}px`
  })
};

/**
 * Responsive flexbox utilities
 */
export const responsiveFlex = {
  // Stack items on small screens, row on larger
  stackToRow: (breakpoint: ViewportSize = 'tablet') => {
    const mediaQueries = {
      mobile: '@media (min-width: 640px)',
      tablet: '@media (min-width: 768px)',
      desktop: '@media (min-width: 1024px)',
      wide: '@media (min-width: 1280px)'
    };
    
    return {
      display: 'flex',
      flexDirection: 'column' as const,
      [`${mediaQueries[breakpoint]}`]: {
        flexDirection: 'row' as const
      }
    };
  },

  // Adaptive flex wrapping
  adaptiveWrap: (viewport: ViewportSize) => {
    const shouldWrap = viewport === 'mobile' || viewport === 'tablet';
    return {
      display: 'flex',
      flexWrap: shouldWrap ? 'wrap' as const : 'nowrap' as const
    };
  }
};

/**
 * Container queries utilities (CSS Container Queries)
 */
export const containerQueries = {
  // Container with responsive behavior
  container: (name: string) => ({
    containerType: 'inline-size',
    containerName: name
  }),

  // Query based on container size
  query: (containerName: string, minWidth: number) => 
    `@container ${containerName} (min-width: ${minWidth}px)`
};

/**
 * Responsive spacing utilities
 */
export const responsiveSpacing = {
  // Fluid spacing that scales with viewport
  fluid: (min: number, max: number, minViewport: number = 320, maxViewport: number = 1200) => {
    const slope = (max - min) / (maxViewport - minViewport);
    const yIntercept = min - slope * minViewport;
    
    return `clamp(${min}px, ${yIntercept}px + ${slope * 100}vw, ${max}px)`;
  },

  // Stepped spacing based on viewport
  stepped: (viewport: ViewportSize) => {
    const spacing = {
      mobile: { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 },
      tablet: { xs: 12, sm: 16, md: 24, lg: 32, xl: 48 },
      desktop: { xs: 16, sm: 24, md: 32, lg: 48, xl: 64 },
      wide: { xs: 24, sm: 32, md: 48, lg: 64, xl: 96 }
    };
    
    return spacing[viewport];
  }
};

/**
 * Responsive typography utilities
 */
export const responsiveTypography = {
  // Fluid font sizes
  fluidSize: (min: number, max: number, minViewport: number = 320, maxViewport: number = 1200) => {
    const slope = (max - min) / (maxViewport - minViewport);
    const yIntercept = min - slope * minViewport;
    
    return `clamp(${min}px, ${yIntercept}px + ${slope * 100}vw, ${max}px)`;
  },

  // Responsive font scale
  scale: (viewport: ViewportSize) => {
    const scales = {
      mobile: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24 },
      tablet: { xs: 14, sm: 16, md: 18, lg: 20, xl: 24, '2xl': 28 },
      desktop: { xs: 16, sm: 18, md: 20, lg: 24, xl: 28, '2xl': 32 },
      wide: { xs: 18, sm: 20, md: 24, lg: 28, xl: 32, '2xl': 36 }
    };
    
    return scales[viewport];
  }
};

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  // Intersection Observer for lazy loading
  createIntersectionObserver: (
    callback: IntersectionObserverCallback,
    options: IntersectionObserverInit = {}
  ) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return null;
    }
    
    return new IntersectionObserver(callback, {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
      ...options
    });
  },

  // Resize Observer for responsive components
  createResizeObserver: (callback: ResizeObserverCallback) => {
    if (typeof window === 'undefined' || !('ResizeObserver' in window)) {
      return null;
    }
    
    return new ResizeObserver(callback);
  },

  // Passive event listeners for performance
  addPassiveListener: (
    element: EventTarget,
    event: string,
    handler: EventListener
  ) => {
    element.addEventListener(event, handler, { passive: true });
    
    return () => element.removeEventListener(event, handler);
  }
};

/**
 * Accessibility utilities for responsive design
 */
export const a11yUtils = {
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check if user prefers high contrast
  prefersHighContrast: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    return window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Focus management for responsive layouts
  manageFocus: {
    // Skip to main content
    skipToMain: () => {
      const main = document.querySelector('main') || document.querySelector('[role="main"]');
      if (main) {
        (main as HTMLElement).focus();
      }
    },

    // Focus first interactive element
    focusFirst: (container: HTMLElement) => {
      const focusable = container.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (focusable) {
        focusable.focus();
      }
    }
  }
};

/**
 * Responsive debugger configuration interface
 */
export interface ResponsiveDebuggerProps {
  showBreakpoints?: boolean;
  showViewportInfo?: boolean;
  className?: string;
}
