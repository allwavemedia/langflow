// Domain Expertise Provider - Epic 6.4.1 React Integration
// Provides domain context and expertise activation to React components

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { domainDetectionSystem, type EnhancedDomainContext, type DomainActivationResult, type ComponentRecommendation } from '@/lib/enhanced/domainDetectionSystem';

interface DomainExpertiseContextType {
  // Current domain state
  activeDomain: EnhancedDomainContext | null;
  isAnalyzing: boolean;
  error: string | null;
  
  // Component recommendations
  recommendations: ComponentRecommendation[];
  isLoadingRecommendations: boolean;
  
  // Actions
  analyzeDomainContext: (input: string) => Promise<void>;
  switchDomain: (newInput: string) => Promise<void>;
  clearDomainContext: () => void;
  refreshRecommendations: () => Promise<void>;
  
  // Session management
  sessionId: string;
  persistenceKey: string | null;
}

const DomainExpertiseContext = createContext<DomainExpertiseContextType | null>(null);

interface DomainExpertiseProviderProps {
  children: ReactNode;
  sessionId?: string;
  autoActivate?: boolean;
  onDomainChange?: (domain: EnhancedDomainContext | null) => void;
  onRecommendationsUpdate?: (recommendations: ComponentRecommendation[]) => void;
}

export function DomainExpertiseProvider({
  children,
  sessionId: providedSessionId,
  autoActivate = true,
  onDomainChange,
  onRecommendationsUpdate
}: DomainExpertiseProviderProps) {
  const [sessionId] = useState(providedSessionId || `domain-session-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [activeDomain, setActiveDomain] = useState<EnhancedDomainContext | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ComponentRecommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [persistenceKey, setPersistenceKey] = useState<string | null>(null);

  // Load existing domain context on mount
  useEffect(() => {
    const loadExistingContext = async () => {
      if (autoActivate) {
        const existingContext = domainDetectionSystem.getActiveDomainContext(sessionId);
        if (existingContext) {
          setActiveDomain(existingContext);
          onDomainChange?.(existingContext);
          
          // Load recommendations for existing context
          setIsLoadingRecommendations(true);
          try {
            const newRecommendations = await domainDetectionSystem.generateComponentRecommendations(existingContext);
            setRecommendations(newRecommendations);
            onRecommendationsUpdate?.(newRecommendations);
          } catch (err) {
            console.error('Failed to load recommendations:', err);
          } finally {
            setIsLoadingRecommendations(false);
          }
        }
      }
    };
    
    loadExistingContext();
  }, [sessionId, autoActivate, onDomainChange, onRecommendationsUpdate]);

  const analyzeDomainContext = useCallback(async (input: string) => {
    if (!input.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result: DomainActivationResult = await domainDetectionSystem.activateDomainExpertise(input, sessionId);
      
      if (result.success) {
        setActiveDomain(result.domainContext);
        setRecommendations(result.recommendations);
        setPersistenceKey(result.persistenceKey);
        
        // Notify parent components
        onDomainChange?.(result.domainContext);
        onRecommendationsUpdate?.(result.recommendations);
        
        console.log('Domain activated:', {
          domain: result.domainContext.domain,
          confidence: result.domainContext.confidence,
          recommendations: result.recommendations.length
        });
      } else {
        setError(result.error || 'Failed to analyze domain context');
        console.warn('Domain analysis failed:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Domain analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, onDomainChange, onRecommendationsUpdate]);

  const switchDomain = useCallback(async (newInput: string) => {
    if (!newInput.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result: DomainActivationResult = await domainDetectionSystem.switchDomain(sessionId, newInput);
      
      if (result.success) {
        setActiveDomain(result.domainContext);
        setRecommendations(result.recommendations);
        setPersistenceKey(result.persistenceKey);
        
        // Notify parent components
        onDomainChange?.(result.domainContext);
        onRecommendationsUpdate?.(result.recommendations);
        
        console.log('Domain switched:', {
          from: activeDomain?.domain,
          to: result.domainContext.domain,
          confidence: result.domainContext.confidence
        });
      } else {
        setError(result.error || 'Failed to switch domain');
        console.warn('Domain switch failed:', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Domain switch error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, activeDomain?.domain, onDomainChange, onRecommendationsUpdate]);

  const clearDomainContext = useCallback(() => {
    setActiveDomain(null);
    setRecommendations([]);
    setError(null);
    setPersistenceKey(null);
    
    onDomainChange?.(null);
    onRecommendationsUpdate?.([]);
    
    console.log('Domain context cleared');
  }, [onDomainChange, onRecommendationsUpdate]);

  const refreshRecommendations = useCallback(async () => {
    if (!activeDomain) return;
    
    setIsLoadingRecommendations(true);
    
    try {
      const newRecommendations = await domainDetectionSystem.generateComponentRecommendations(activeDomain);
      setRecommendations(newRecommendations);
      onRecommendationsUpdate?.(newRecommendations);
      
      console.log('Recommendations refreshed:', newRecommendations.length);
    } catch (err) {
      console.error('Failed to refresh recommendations:', err);
      setError('Failed to refresh component recommendations');
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [activeDomain, onRecommendationsUpdate]);

  const contextValue: DomainExpertiseContextType = {
    activeDomain,
    isAnalyzing,
    error,
    recommendations,
    isLoadingRecommendations,
    analyzeDomainContext,
    switchDomain,
    clearDomainContext,
    refreshRecommendations,
    sessionId,
    persistenceKey
  };

  return (
    <DomainExpertiseContext.Provider value={contextValue}>
      {children}
    </DomainExpertiseContext.Provider>
  );
}

// Hook for accessing domain expertise context
export function useDomainExpertise() {
  const context = useContext(DomainExpertiseContext);
  
  if (!context) {
    throw new Error('useDomainExpertise must be used within a DomainExpertiseProvider');
  }
  
  return context;
}

// Hook for automatic domain detection on input changes
export function useAutoDomainDetection(input: string, enabled = true, debounceMs = 1000) {
  const { analyzeDomainContext, isAnalyzing } = useDomainExpertise();
  const [lastInput, setLastInput] = useState('');
  
  useEffect(() => {
    if (!enabled || !input.trim() || input === lastInput || isAnalyzing) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      analyzeDomainContext(input);
      setLastInput(input);
    }, debounceMs);
    
    return () => clearTimeout(timeoutId);
  }, [input, enabled, lastInput, isAnalyzing, analyzeDomainContext, debounceMs]);
}

// Hook for component recommendations based on current domain
export function useDomainRecommendations(filterType?: string) {
  const { recommendations, isLoadingRecommendations, activeDomain } = useDomainExpertise();
  
  const filteredRecommendations = React.useMemo(() => {
    if (!filterType) return recommendations;
    
    return recommendations.filter(rec => 
      rec.componentType === filterType || 
      rec.usagePatterns.includes(filterType)
    );
  }, [recommendations, filterType]);
  
  return {
    recommendations: filteredRecommendations,
    isLoading: isLoadingRecommendations,
    hasDomain: !!activeDomain,
    domainConfidence: activeDomain?.confidence || 0
  };
}

// Hook for domain-aware form validation
export function useDomainValidation() {
  const { activeDomain } = useDomainExpertise();
  
  const validateInput = useCallback((input: string, fieldType: string) => {
    if (!activeDomain) return { isValid: true, suggestions: [] };
    
    const suggestions: string[] = [];
    const isValid = true; // Will be enhanced with actual validation logic
    
    // Domain-specific validation logic
    if (activeDomain.domain === 'healthcare' && fieldType === 'data') {
      if (!input.includes('hipaa') && !input.includes('phi')) {
        suggestions.push('Consider HIPAA compliance for healthcare data');
      }
    }
    
    if (activeDomain.domain === 'finance' && fieldType === 'api') {
      if (!input.includes('encrypt') && !input.includes('secure')) {
        suggestions.push('Financial APIs should include security considerations');
      }
    }
    
    if (activeDomain.complianceFrameworks?.length && fieldType === 'workflow') {
      suggestions.push(`Consider compliance requirements: ${activeDomain.complianceFrameworks.join(', ')}`);
    }
    
    return { isValid, suggestions };
  }, [activeDomain]);
  
  return { validateInput, activeDomain };
}

export default DomainExpertiseProvider;
