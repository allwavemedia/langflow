// Feature Flag System for Epic 6.4.3 Advanced Socratic Questioning
// Safe activation/deactivation of questioning functionality with graceful degradation

export interface QuestioningFeatureFlags {
  // Main feature toggle for questioning system
  enableSocraticQuestioning: boolean;
  
  // Individual component toggles for granular control
  enableQuestionGeneration: boolean;
  enableExpertiseTracking: boolean;
  enableProgressiveDisclosure: boolean;
  enableAdaptiveComplexity: boolean;
  
  // Development and debugging flags
  enableQuestioningDebugMode: boolean;
  enablePerformanceLogging: boolean;
  enableQuestioningMetrics: boolean;
  
  // Safety and rollback controls
  maxQuestioningLatencyMs: number;
  fallbackToBasicMode: boolean;
  enableCircuitBreaker: boolean;
}

export interface QuestioningConfig {
  featureFlags: QuestioningFeatureFlags;
  performance: {
    maxResponseTimeMs: number;
    cacheEnabled: boolean;
    cacheTTLMs: number;
  };
  limits: {
    maxQuestionsPerSession: number;
    maxConversationHistory: number;
    expertiseTrackingDepth: number;
  };
}

// Default configuration following safe brownfield patterns
const DEFAULT_QUESTIONING_FLAGS: QuestioningFeatureFlags = {
  // Main toggle - starts disabled for safe deployment
  enableSocraticQuestioning: false,
  
  // Component toggles - all disabled by default
  enableQuestionGeneration: false,
  enableExpertiseTracking: false,
  enableProgressiveDisclosure: false,
  enableAdaptiveComplexity: false,
  
  // Debug flags - disabled in production
  enableQuestioningDebugMode: false,
  enablePerformanceLogging: false,
  enableQuestioningMetrics: false,
  
  // Safety controls - conservative defaults
  maxQuestioningLatencyMs: 2000, // 2s max to stay under 3s total budget
  fallbackToBasicMode: true,
  enableCircuitBreaker: true,
};

const DEFAULT_QUESTIONING_CONFIG: QuestioningConfig = {
  featureFlags: DEFAULT_QUESTIONING_FLAGS,
  performance: {
    maxResponseTimeMs: 2000, // Stay within performance budget
    cacheEnabled: true,
    cacheTTLMs: 15 * 60 * 1000, // 15 minutes
  },
  limits: {
    maxQuestionsPerSession: 20,
    maxConversationHistory: 50,
    expertiseTrackingDepth: 10,
  },
};

// Feature flag evaluation with environment variable override
export class QuestioningFeatureFlags {
  private static instance: QuestioningFeatureFlags;
  private config: QuestioningConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  static getInstance(): QuestioningFeatureFlags {
    if (!QuestioningFeatureFlags.instance) {
      QuestioningFeatureFlags.instance = new QuestioningFeatureFlags();
    }
    return QuestioningFeatureFlags.instance;
  }

  private loadConfiguration(): QuestioningConfig {
    const config = { ...DEFAULT_QUESTIONING_CONFIG };
    
    // Override with environment variables if present
    if (typeof window === 'undefined') {
      // Server-side environment variables
      config.featureFlags.enableSocraticQuestioning = 
        process.env.NEXT_PUBLIC_ENABLE_SOCRATIC_QUESTIONING === 'true';
      
      config.featureFlags.enableQuestionGeneration = 
        process.env.NEXT_PUBLIC_ENABLE_QUESTION_GENERATION === 'true';
      
      config.featureFlags.enableExpertiseTracking = 
        process.env.NEXT_PUBLIC_ENABLE_EXPERTISE_TRACKING === 'true';
      
      config.featureFlags.enableProgressiveDisclosure = 
        process.env.NEXT_PUBLIC_ENABLE_PROGRESSIVE_DISCLOSURE === 'true';
      
      config.featureFlags.enableAdaptiveComplexity = 
        process.env.NEXT_PUBLIC_ENABLE_ADAPTIVE_COMPLEXITY === 'true';
      
      config.featureFlags.enableQuestioningDebugMode = 
        process.env.NEXT_PUBLIC_QUESTIONING_DEBUG_MODE === 'true';
      
      config.featureFlags.enablePerformanceLogging = 
        process.env.NEXT_PUBLIC_QUESTIONING_PERFORMANCE_LOG === 'true';
      
      config.featureFlags.enableQuestioningMetrics = 
        process.env.NEXT_PUBLIC_QUESTIONING_METRICS === 'true';
      
      // Performance overrides
      if (process.env.NEXT_PUBLIC_QUESTIONING_MAX_LATENCY_MS) {
        config.featureFlags.maxQuestioningLatencyMs = 
          parseInt(process.env.NEXT_PUBLIC_QUESTIONING_MAX_LATENCY_MS) || 2000;
      }
    }
    
    return config;
  }

  // Main feature flag checks
  isSocraticQuestioningEnabled(): boolean {
    return this.config.featureFlags.enableSocraticQuestioning;
  }

  isQuestionGenerationEnabled(): boolean {
    return this.config.featureFlags.enableSocraticQuestioning && 
           this.config.featureFlags.enableQuestionGeneration;
  }

  isExpertiseTrackingEnabled(): boolean {
    return this.config.featureFlags.enableSocraticQuestioning && 
           this.config.featureFlags.enableExpertiseTracking;
  }

  isProgressiveDisclosureEnabled(): boolean {
    return this.config.featureFlags.enableSocraticQuestioning && 
           this.config.featureFlags.enableProgressiveDisclosure;
  }

  isAdaptiveComplexityEnabled(): boolean {
    return this.config.featureFlags.enableSocraticQuestioning && 
           this.config.featureFlags.enableAdaptiveComplexity;
  }

  // Debug and monitoring flags
  isDebugModeEnabled(): boolean {
    return this.config.featureFlags.enableQuestioningDebugMode;
  }

  isPerformanceLoggingEnabled(): boolean {
    return this.config.featureFlags.enablePerformanceLogging;
  }

  isMetricsEnabled(): boolean {
    return this.config.featureFlags.enableQuestioningMetrics;
  }

  // Safety controls
  getMaxLatencyMs(): number {
    return this.config.featureFlags.maxQuestioningLatencyMs;
  }

  shouldFallbackToBasicMode(): boolean {
    return this.config.featureFlags.fallbackToBasicMode;
  }

  isCircuitBreakerEnabled(): boolean {
    return this.config.featureFlags.enableCircuitBreaker;
  }

  // Configuration access
  getPerformanceConfig() {
    return this.config.performance;
  }

  getLimitsConfig() {
    return this.config.limits;
  }

  // Runtime configuration updates (for development)
  updateFeatureFlag(flag: keyof QuestioningFeatureFlags, value: boolean): void {
    if (this.isDebugModeEnabled()) {
      (this.config.featureFlags as any)[flag] = value;
    }
  }

  // Complete feature disable for emergency rollback
  disableAllQuestioningFeatures(): void {
    this.config.featureFlags.enableSocraticQuestioning = false;
    this.config.featureFlags.enableQuestionGeneration = false;
    this.config.featureFlags.enableExpertiseTracking = false;
    this.config.featureFlags.enableProgressiveDisclosure = false;
    this.config.featureFlags.enableAdaptiveComplexity = false;
  }

  // Get current configuration snapshot
  getConfigSnapshot(): QuestioningConfig {
    return JSON.parse(JSON.stringify(this.config));
  }
}

// Convenience functions for common feature flag checks
export const questioningFlags = QuestioningFeatureFlags.getInstance();

export const isSocraticQuestioningEnabled = () => 
  questioningFlags.isSocraticQuestioningEnabled();

export const isQuestionGenerationEnabled = () => 
  questioningFlags.isQuestionGenerationEnabled();

export const isExpertiseTrackingEnabled = () => 
  questioningFlags.isExpertiseTrackingEnabled();

export const isProgressiveDisclosureEnabled = () => 
  questioningFlags.isProgressiveDisclosureEnabled();

export const isAdaptiveComplexityEnabled = () => 
  questioningFlags.isAdaptiveComplexityEnabled();

// Circuit breaker for performance protection
export class QuestioningCircuitBreaker {
  private static instance: QuestioningCircuitBreaker;
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private readonly maxFailures = 3;
  private readonly timeoutMs = 30000; // 30 seconds

  static getInstance(): QuestioningCircuitBreaker {
    if (!QuestioningCircuitBreaker.instance) {
      QuestioningCircuitBreaker.instance = new QuestioningCircuitBreaker();
    }
    return QuestioningCircuitBreaker.instance;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T | null> {
    if (!questioningFlags.isCircuitBreakerEnabled()) {
      return operation();
    }

    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeoutMs) {
        this.state = 'half-open';
      } else {
        // Circuit is open, fail fast
        return null;
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      return null;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.maxFailures) {
      this.state = 'open';
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.state = 'closed';
    this.lastFailureTime = 0;
  }
}

export const questioningCircuitBreaker = QuestioningCircuitBreaker.getInstance();