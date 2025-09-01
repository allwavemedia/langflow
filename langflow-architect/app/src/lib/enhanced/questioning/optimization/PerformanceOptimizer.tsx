import React, { 
  useState, 
  useEffect, 
  useCallback, 
  useMemo, 
  useRef,
  Suspense,
  lazy
} from 'react';

// Performance optimization types
export interface PerformanceMetrics {
  renderTime: number;
  bundleSize: number;
  memoryUsage: number;
  frameRate: number;
  loadTime: number;
  interactionLatency: number;
}

export interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableVirtualization: boolean;
  enableMemoization: boolean;
  enableCodeSplitting: boolean;
  enablePrefetching: boolean;
  chunkSize: number;
  maxConcurrentRequests: number;
}

export interface PerformanceOptimizerProps {
  children: React.ReactNode;
  config?: Partial<OptimizationConfig>;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  className?: string;
}

// Lazy-loaded components for code splitting
const LazyQuestioningDashboard = lazy(() => import('../components/QuestioningDashboard'));
const LazyAdvancedDashboardLayout = lazy(() => import('../layouts/AdvancedDashboardLayout'));

/**
 * Performance Optimizer Component
 * 
 * Implements advanced performance optimization techniques:
 * - Component-level lazy loading
 * - Virtual scrolling for large lists
 * - Intelligent memoization
 * - Bundle code splitting
 * - Resource prefetching
 * - Performance monitoring
 */
export default function PerformanceOptimizer({
  children,
  config = {},
  onMetricsUpdate,
  className
}: PerformanceOptimizerProps) {
  const defaultConfig: OptimizationConfig = {
    enableLazyLoading: true,
    enableVirtualization: true,
    enableMemoization: true,
    enableCodeSplitting: true,
    enablePrefetching: true,
    chunkSize: 50,
    maxConcurrentRequests: 6
  };

  const optimizationConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    frameRate: 60,
    loadTime: 0,
    interactionLatency: 0
  });

  const metricsRef = useRef<PerformanceMetrics>(metrics);
  const rafId = useRef<number>();
  const observerRef = useRef<PerformanceObserver>();

  // Performance monitoring system
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const startTime = performance.now();

    // Monitor rendering performance
    const measureRenderTime = () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => {
        const newMetrics = { ...prev, renderTime };
        metricsRef.current = newMetrics;
        return newMetrics;
      });
    };

    // Frame rate monitoring
    let frameCount = 0;
    let lastFrameTime = performance.now();
    
    const trackFrameRate = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastFrameTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFrameTime));
        setMetrics(prev => {
          const newMetrics = { ...prev, frameRate: fps };
          metricsRef.current = newMetrics;
          return newMetrics;
        });
        
        frameCount = 0;
        lastFrameTime = currentTime;
      }
      
      rafId.current = requestAnimationFrame(trackFrameRate);
    };

    // Memory usage monitoring
    const trackMemoryUsage = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        setMetrics(prev => {
          const newMetrics = { 
            ...prev, 
            memoryUsage: memInfo.usedJSHeapSize / (1024 * 1024) // Convert to MB
          };
          metricsRef.current = newMetrics;
          return newMetrics;
        });
      }
    };

    // Performance Observer for more detailed metrics
    if ('PerformanceObserver' in window) {
      observerRef.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            setMetrics(prev => {
              const newMetrics = {
                ...prev,
                loadTime: navEntry.loadEventEnd - navEntry.navigationStart
              };
              metricsRef.current = newMetrics;
              return newMetrics;
            });
          }
          
          if (entry.entryType === 'measure') {
            if (entry.name.includes('interaction')) {
              setMetrics(prev => {
                const newMetrics = {
                  ...prev,
                  interactionLatency: entry.duration
                };
                metricsRef.current = newMetrics;
                return newMetrics;
              });
            }
          }
        });
      });

      observerRef.current.observe({ entryTypes: ['navigation', 'measure', 'paint'] });
    }

    // Initial measurements
    measureRenderTime();
    trackFrameRate();
    trackMemoryUsage();

    // Periodic memory monitoring
    const memoryInterval = setInterval(trackMemoryUsage, 5000);

    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearInterval(memoryInterval);
    };
  }, []);

  // Notify parent of metrics updates
  useEffect(() => {
    if (onMetricsUpdate) {
      onMetricsUpdate(metrics);
    }
  }, [metrics, onMetricsUpdate]);

  // Intersection Observer for lazy loading
  const createIntersectionObserver = useCallback(() => {
    if (!optimizationConfig.enableLazyLoading || typeof window === 'undefined') {
      return null;
    }

    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            const lazyComponent = element.getAttribute('data-lazy-component');
            
            if (lazyComponent) {
              // Trigger lazy component loading
              element.setAttribute('data-should-load', 'true');
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  }, [optimizationConfig.enableLazyLoading]);

  // Virtual scrolling implementation
  const VirtualizedList = useMemo(() => {
    if (!optimizationConfig.enableVirtualization) {
      return ({ items, renderItem }: { items: any[]; renderItem: (item: any, index: number) => React.ReactNode }) => (
        <div className="virtualized-list">
          {items.map((item, index) => renderItem(item, index))}
        </div>
      );
    }

    return ({ 
      items, 
      renderItem, 
      itemHeight = 50, 
      containerHeight = 400 
    }: { 
      items: any[]; 
      renderItem: (item: any, index: number) => React.ReactNode;
      itemHeight?: number;
      containerHeight?: number;
    }) => {
      const [scrollTop, setScrollTop] = useState(0);
      const containerRef = useRef<HTMLDivElement>(null);

      const visibleStart = Math.floor(scrollTop / itemHeight);
      const visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
      );

      const totalHeight = items.length * itemHeight;
      const offsetY = visibleStart * itemHeight;

      const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(event.currentTarget.scrollTop);
      }, []);

      return (
        <div
          ref={containerRef}
          className="virtualized-container"
          style={{ height: containerHeight, overflow: 'auto' }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {items.slice(visibleStart, visibleEnd).map((item, index) => (
                <div key={visibleStart + index} style={{ height: itemHeight }}>
                  {renderItem(item, visibleStart + index)}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };
  }, [optimizationConfig.enableVirtualization]);

  // Memoized component wrapper
  const MemoizedComponent = useMemo(() => {
    if (!optimizationConfig.enableMemoization) {
      return ({ children: memoChildren }: { children: React.ReactNode }) => <>{memoChildren}</>;
    }

    return React.memo(({ children: memoChildren }: { children: React.ReactNode }) => {
      return <>{memoChildren}</>;
    });
  }, [optimizationConfig.enableMemoization]);

  // Code splitting wrapper
  const CodeSplitWrapper = useCallback(({ 
    componentName, 
    fallback = <div>Loading...</div>,
    children: splitChildren 
  }: { 
    componentName?: string;
    fallback?: React.ReactNode;
    children: React.ReactNode;
  }) => {
    if (!optimizationConfig.enableCodeSplitting) {
      return <>{splitChildren}</>;
    }

    return (
      <Suspense fallback={fallback}>
        {splitChildren}
      </Suspense>
    );
  }, [optimizationConfig.enableCodeSplitting]);

  // Resource prefetching
  useEffect(() => {
    if (!optimizationConfig.enablePrefetching || typeof window === 'undefined') {
      return;
    }

    const prefetchResources = async () => {
      // Prefetch critical components
      const criticalComponents = [
        () => import('../components/QuestioningDashboard'),
        () => import('../layouts/AdvancedDashboardLayout')
      ];

      // Limit concurrent requests
      let activeRequests = 0;
      const maxConcurrent = optimizationConfig.maxConcurrentRequests;

      for (const componentLoader of criticalComponents) {
        if (activeRequests >= maxConcurrent) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        activeRequests++;
        componentLoader()
          .then(() => {
            activeRequests--;
          })
          .catch(() => {
            activeRequests--;
          });
      }
    };

    // Prefetch after initial render
    const prefetchTimer = setTimeout(prefetchResources, 1000);

    return () => clearTimeout(prefetchTimer);
  }, [optimizationConfig.enablePrefetching, optimizationConfig.maxConcurrentRequests]);

  // Performance debugging component
  const PerformanceDebugger = useMemo(() => {
    if (process.env.NODE_ENV === 'production') {
      return null;
    }

    return (
      <div className="performance-debugger fixed bottom-4 right-4 z-50 bg-black bg-opacity-75 text-white p-3 rounded text-xs font-mono max-w-xs">
        <div className="font-semibold mb-2">Performance Metrics</div>
        <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
        <div>FPS: {metrics.frameRate}</div>
        <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
        <div>Load: {metrics.loadTime.toFixed(2)}ms</div>
        <div>Interaction: {metrics.interactionLatency.toFixed(2)}ms</div>
        
        <div className="mt-2 font-semibold">Optimizations</div>
        <div className="text-xs space-y-1">
          <div>Lazy: {optimizationConfig.enableLazyLoading ? '✅' : '❌'}</div>
          <div>Virtual: {optimizationConfig.enableVirtualization ? '✅' : '❌'}</div>
          <div>Memo: {optimizationConfig.enableMemoization ? '✅' : '❌'}</div>
          <div>Split: {optimizationConfig.enableCodeSplitting ? '✅' : '❌'}</div>
          <div>Prefetch: {optimizationConfig.enablePrefetching ? '✅' : '❌'}</div>
        </div>
      </div>
    );
  }, [metrics, optimizationConfig]);

  return (
    <div className={`performance-optimizer ${className || ''}`}>
      <MemoizedComponent>
        <CodeSplitWrapper>
          {children}
        </CodeSplitWrapper>
      </MemoizedComponent>
      
      {PerformanceDebugger}

      <style jsx>{`
        .performance-optimizer {
          position: relative;
        }

        .virtualized-container {
          position: relative;
        }

        .virtualized-list {
          display: flex;
          flex-direction: column;
        }

        .performance-debugger {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          line-height: 1.4;
        }

        @media (max-width: 640px) {
          .performance-debugger {
            font-size: 10px;
            padding: 0.5rem;
            max-width: 200px;
          }
        }
      `}</style>
    </div>
  );
}

// Export utilities for external use
export {
  LazyQuestioningDashboard,
  LazyAdvancedDashboardLayout
};

// Performance monitoring hooks
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    bundleSize: 0,
    memoryUsage: 0,
    frameRate: 60,
    loadTime: 0,
    interactionLatency: 0
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      setMetrics({
        renderTime: performance.now(),
        bundleSize: 0, // Would need to be measured at build time
        memoryUsage: 'memory' in performance ? (performance as any).memory.usedJSHeapSize / (1024 * 1024) : 0,
        frameRate: 60, // Default assumption
        loadTime: navigation ? navigation.loadEventEnd - navigation.navigationStart : 0,
        interactionLatency: 0 // Measured during interactions
      });
    };

    measurePerformance();
  }, []);

  return metrics;
}

// Optimization utilities
export const optimizationUtils = {
  // Debounce for performance-sensitive operations
  debounce: <T extends (...args: any[]) => any>(func: T, delay: number): T => {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  },

  // Throttle for scroll/resize handlers
  throttle: <T extends (...args: any[]) => any>(func: T, limit: number): T => {
    let inThrottle: boolean;
    
    return ((...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }) as T;
  },

  // Batch DOM updates
  batchUpdates: (updates: (() => void)[]) => {
    requestAnimationFrame(() => {
      updates.forEach(update => update());
    });
  }
};
