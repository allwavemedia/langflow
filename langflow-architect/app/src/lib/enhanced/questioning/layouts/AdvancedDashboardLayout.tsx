import React, { useState, useCallback, useMemo } from 'react';
import { designTokens } from '../design-system';
import { uiUtils } from '../ui-utils';
import ExpertiseIndicatorFinal from '../components/ExpertiseIndicatorFinal';
import EnhancedProgressionTracker from '../components/EnhancedProgressionTracker';
import EnhancedSophisticationControl from '../components/EnhancedSophisticationControl';
import QuestioningDashboard from '../components/QuestioningDashboard';

// Advanced layout types
export type LayoutVariant = 'masonry' | 'grid' | 'sidebar' | 'full-screen' | 'adaptive';
export type ViewportSize = 'mobile' | 'tablet' | 'desktop' | 'wide';

export interface LayoutConfiguration {
  variant: LayoutVariant;
  viewport: ViewportSize;
  density: 'compact' | 'comfortable' | 'spacious';
  enableAnimations: boolean;
  showSecondaryMetrics: boolean;
  customBreakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
    wide: number;
  };
}

export interface AdvancedDashboardLayoutProps {
  session: any; // QuestioningSession type
  configuration?: Partial<LayoutConfiguration>;
  className?: string;
  onLayoutChange?: (layout: LayoutVariant) => void;
  onConfigurationChange?: (config: LayoutConfiguration) => void;
  onExpertiseChange?: (level: string) => void;
  onSophisticationChange?: (level: number) => void;
  onProgressStepClick?: (step: any) => void;
}

/**
 * Advanced Dashboard Layout Component
 * 
 * Features:
 * - Multiple responsive layout variants
 * - Adaptive density modes
 * - Advanced grid systems with CSS Grid and Flexbox
 * - Smart component arrangement based on viewport
 * - Performance-optimized rendering
 * - Accessibility-compliant navigation
 */
export default function AdvancedDashboardLayout({
  session,
  configuration = {},
  className,
  onLayoutChange,
  onConfigurationChange,
  onExpertiseChange,
  onSophisticationChange,
  onProgressStepClick
}: AdvancedDashboardLayoutProps) {
  // Default configuration with intelligent defaults
  const defaultConfig: LayoutConfiguration = {
    variant: 'adaptive',
    viewport: 'desktop',
    density: 'comfortable',
    enableAnimations: true,
    showSecondaryMetrics: true,
    customBreakpoints: {
      mobile: 640,
      tablet: 768,
      desktop: 1024,
      wide: 1280
    }
  };

  const config = useMemo(() => ({ ...defaultConfig, ...configuration }), [configuration]);
  const [currentLayout, setCurrentLayout] = useState<LayoutVariant>(config.variant);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Viewport detection hook
  const [viewport, setViewport] = useState<ViewportSize>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < config.customBreakpoints!.mobile) return 'mobile';
    if (width < config.customBreakpoints!.tablet) return 'tablet';
    if (width < config.customBreakpoints!.desktop) return 'desktop';
    return 'wide';
  });

  // Handle layout transitions with smooth animations
  const handleLayoutChange = useCallback(async (newLayout: LayoutVariant) => {
    if (newLayout === currentLayout) return;
    
    setIsTransitioning(true);
    
    // Smooth transition delay
    await new Promise(resolve => setTimeout(resolve, 150));
    
    setCurrentLayout(newLayout);
    onLayoutChange?.(newLayout);
    
    // Complete transition
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentLayout, onLayoutChange]);

  // Responsive layout calculation
  const getResponsiveLayout = useCallback((): LayoutVariant => {
    if (config.variant !== 'adaptive') return config.variant;
    
    switch (viewport) {
      case 'mobile':
        return 'sidebar';
      case 'tablet':
        return 'grid';
      case 'desktop':
        return 'masonry';
      case 'wide':
        return 'full-screen';
      default:
        return 'grid';
    }
  }, [config.variant, viewport]);

  const effectiveLayout = useMemo(() => getResponsiveLayout(), [getResponsiveLayout]);

  // Dynamic CSS classes based on configuration
  const containerClasses = useMemo(() => {
    const base = 'advanced-dashboard-layout';
    const variant = `layout-${effectiveLayout}`;
    const density = `density-${config.density}`;
    const animations = config.enableAnimations ? 'animations-enabled' : 'animations-disabled';
    const transitioning = isTransitioning ? 'transitioning' : '';
    
    return uiUtils.utils.cn(
      base,
      variant,
      density,
      animations,
      transitioning,
      className
    );
  }, [effectiveLayout, config.density, config.enableAnimations, isTransitioning, className]);

  // Component sizing based on density
  const getComponentSize = useCallback(() => {
    switch (config.density) {
      case 'compact':
        return 'sm';
      case 'comfortable':
        return 'md';
      case 'spacious':
        return 'lg';
      default:
        return 'md';
    }
  }, [config.density]);

  const componentSize = getComponentSize();

  // Render different layout variants
  const renderLayout = () => {
    const commonProps = {
      session,
      size: componentSize,
      animated: config.enableAnimations,
      interactive: true,
      onExpertiseChange,
      onSophisticationChange,
      onProgressStepClick
    };

    switch (effectiveLayout) {
      case 'masonry':
        return renderMasonryLayout(commonProps);
      case 'grid':
        return renderGridLayout(commonProps);
      case 'sidebar':
        return renderSidebarLayout(commonProps);
      case 'full-screen':
        return renderFullScreenLayout(commonProps);
      default:
        return renderGridLayout(commonProps);
    }
  };

  // Masonry layout for desktop - Pinterest-style arrangement
  const renderMasonryLayout = (props: any) => (
    <div className="masonry-container grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div className="masonry-item">
        <div className="card p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Expertise Level</h3>
          <ExpertiseIndicatorFinal
            currentLevel={props.session?.expertise?.level || 'beginner'}
            variant="default"
            size={componentSize}
            confidence={props.session?.expertise?.confidence}
            domain={props.session?.expertise?.domain}
            animated={config.enableAnimations}
            interactive={true}
            showProgression={true}
            onLevelClick={props.onExpertiseChange}
          />
        </div>
      </div>

      <div className="masonry-item">
        <div className="card p-4 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Question Sophistication</h3>
          <EnhancedSophisticationControl
            currentLevel={props.session?.sophistication || 1}
            variant="buttons"
            size={componentSize}
            showLabels={true}
            showDescriptions={config.density !== 'compact'}
            interactive={true}
            onChange={props.onSophisticationChange}
          />
        </div>
      </div>

      <div className="masonry-item col-span-full">
        <div className="card p-4 rounded-lg border bg-white shadow-sm">
          <h3 className="text-sm font-medium mb-3 text-gray-700">Learning Progress</h3>
          <EnhancedProgressionTracker
            steps={props.session?.progress || []}
            variant="horizontal"
            size={componentSize}
            animated={config.enableAnimations}
            showMetadata={config.showSecondaryMetrics}
            interactive={true}
            onStepClick={props.onProgressStepClick}
          />
        </div>
      </div>

      <div className="masonry-item col-span-full">
        <QuestioningDashboard
          session={props.session}
          variant={config.density === 'compact' ? 'compact' : 'full'}
          interactive={true}
          onExpertiseChange={props.onExpertiseChange}
          onSophisticationChange={props.onSophisticationChange}
        />
      </div>
    </div>
  );

  // Grid layout for tablets - structured 2x2 arrangement
  const renderGridLayout = (props: any) => (
    <div className="grid-container grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="grid-item">
        <div className="card p-6 rounded-lg border bg-white shadow-sm h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Current Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <ExpertiseIndicatorFinal
              currentLevel={props.session?.expertise?.level || 'beginner'}
              variant="default"
              size={componentSize}
              confidence={props.session?.expertise?.confidence}
              domain={props.session?.expertise?.domain}
              animated={config.enableAnimations}
              interactive={true}
              showProgression={true}
              onLevelClick={props.onExpertiseChange}
            />
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2 text-gray-600">Sophistication Level</h4>
              <EnhancedSophisticationControl
                currentLevel={props.session?.sophistication || 1}
                variant="slider"
                size={componentSize}
                showLabels={true}
                showDescriptions={false}
                interactive={true}
                onChange={props.onSophisticationChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-item">
        <div className="card p-6 rounded-lg border bg-white shadow-sm h-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Learning Journey</h3>
          <EnhancedProgressionTracker
            steps={props.session?.progress || []}
            variant="vertical"
            size={componentSize}
            animated={config.enableAnimations}
            showMetadata={config.showSecondaryMetrics}
            interactive={true}
            onStepClick={props.onProgressStepClick}
          />
        </div>
      </div>

      <div className="grid-item md:col-span-2">
        <QuestioningDashboard
          session={props.session}
          variant="full"
          interactive={true}
          onExpertiseChange={props.onExpertiseChange}
          onSophisticationChange={props.onSophisticationChange}
        />
      </div>
    </div>
  );

  // Sidebar layout for mobile - vertical stacking with collapsible sections
  const renderSidebarLayout = (props: any) => (
    <div className="sidebar-container flex flex-col space-y-4">
      <div className="sidebar-header card p-4 rounded-lg border bg-white shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Learning Session</h2>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
        
        <ExpertiseIndicatorFinal
          currentLevel={props.session?.expertise?.level || 'beginner'}
          variant="compact"
          size="sm"
          confidence={props.session?.expertise?.confidence}
          domain={props.session?.expertise?.domain}
          animated={config.enableAnimations}
          interactive={true}
          onLevelClick={props.onExpertiseChange}
        />
      </div>

      <div className="sidebar-controls card p-4 rounded-lg border bg-white shadow-sm">
        <h3 className="text-sm font-medium mb-3 text-gray-700">Adjust Complexity</h3>
        <EnhancedSophisticationControl
          currentLevel={props.session?.sophistication || 1}
          variant="compact"
          size="sm"
          showLabels={true}
          showDescriptions={false}
          interactive={true}
          onChange={props.onSophisticationChange}
        />
      </div>

      <div className="sidebar-progress card p-4 rounded-lg border bg-white shadow-sm">
        <h3 className="text-sm font-medium mb-3 text-gray-700">Progress</h3>
        <EnhancedProgressionTracker
          steps={props.session?.progress || []}
          variant="compact"
          size="sm"
          animated={config.enableAnimations}
          showMetadata={false}
          interactive={true}
          onStepClick={props.onProgressStepClick}
        />
      </div>

      <div className="sidebar-dashboard">
        <QuestioningDashboard
          session={props.session}
          variant="minimal"
          interactive={true}
          onExpertiseChange={props.onExpertiseChange}
          onSophisticationChange={props.onSophisticationChange}
        />
      </div>
    </div>
  );

  // Full-screen layout for wide displays - immersive experience
  const renderFullScreenLayout = (props: any) => (
    <div className="fullscreen-container min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="fullscreen-header bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-gray-900">Advanced Learning Dashboard</h1>
              <ExpertiseIndicatorFinal
                currentLevel={props.session?.expertise?.level || 'beginner'}
                variant="default"
                size="lg"
                confidence={props.session?.expertise?.confidence}
                domain={props.session?.expertise?.domain}
                animated={config.enableAnimations}
                interactive={true}
                showProgression={true}
                onLevelClick={props.onExpertiseChange}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="sophistication-control">
                <EnhancedSophisticationControl
                  currentLevel={props.session?.sophistication || 1}
                  variant="buttons"
                  size="md"
                  showLabels={true}
                  showDescriptions={false}
                  interactive={true}
                  onChange={props.onSophisticationChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fullscreen-body max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-3">
            <div className="sticky top-8">
              <div className="card p-6 rounded-lg border bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Learning Progress</h3>
                <EnhancedProgressionTracker
                  steps={props.session?.progress || []}
                  variant="vertical"
                  size="lg"
                  animated={config.enableAnimations}
                  showMetadata={config.showSecondaryMetrics}
                  interactive={true}
                  onStepClick={props.onProgressStepClick}
                />
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-9">
            <QuestioningDashboard
              session={props.session}
              variant="full"
              interactive={true}
              onExpertiseChange={props.onExpertiseChange}
              onSophisticationChange={props.onSophisticationChange}
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Layout switcher component
  const renderLayoutSwitcher = () => (
    <div className="layout-switcher fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-lg border p-2 flex space-x-1">
        {(['masonry', 'grid', 'sidebar', 'full-screen'] as LayoutVariant[]).map((layout) => (
          <button
            key={layout}
            onClick={() => handleLayoutChange(layout)}
            className={uiUtils.utils.cn(
              'p-2 rounded transition-colors',
              currentLayout === layout
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            )}
            title={`Switch to ${layout} layout`}
          >
            <LayoutIcon layout={layout} />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={containerClasses}>
      {renderLayout()}
      {config.variant === 'adaptive' && renderLayoutSwitcher()}
      
      <style jsx>{`
        .advanced-dashboard-layout {
          transition: all 0.3s ease;
        }
        
        .masonry-container {
          display: grid;
          gap: 1rem;
        }
        
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 1rem;
        }
        
        .grid-container {
          transition: all 0.3s ease;
        }
        
        .sidebar-container {
          max-width: 100%;
        }
        
        .fullscreen-container {
          min-height: 100vh;
        }
        
        .transitioning {
          opacity: 0.7;
          transform: scale(0.98);
        }
        
        .animations-enabled .card {
          transition: all 0.2s ease;
        }
        
        .animations-enabled .card:hover {
          transform: translateY(-2px);
        }
        
        .density-compact .card {
          padding: 0.75rem;
        }
        
        .density-comfortable .card {
          padding: 1rem;
        }
        
        .density-spacious .card {
          padding: 1.5rem;
        }
        
        @media (max-width: 640px) {
          .masonry-container {
            grid-template-columns: 1fr;
          }
        }
        
        @media (min-width: 1280px) {
          .masonry-container {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </div>
  );
}

// Layout icon component for switcher
function LayoutIcon({ layout }: { layout: LayoutVariant }) {
  const iconProps = { className: "w-4 h-4", fill: "none", stroke: "currentColor", strokeWidth: 2 };
  
  switch (layout) {
    case 'masonry':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      );
    case 'grid':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      );
    case 'sidebar':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="3" y="3" width="6" height="18" />
          <rect x="11" y="3" width="10" height="18" />
        </svg>
      );
    case 'full-screen':
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps} viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" />
        </svg>
      );
  }
}
