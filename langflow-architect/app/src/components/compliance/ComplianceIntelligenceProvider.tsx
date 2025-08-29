// Compliance Intelligence Provider - Epic 6.4.2 React Integration
// Provides compliance context and validation to React components
// Built upon the pattern established by DomainExpertiseProvider

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  complianceIntelligenceSystem, 
  type ComplianceContext, 
  type ComplianceIntelligenceResult, 
  type ComplianceValidationResult,
  type ComplianceRecommendation,
  type ComplianceViolation
} from '@/lib/enhanced/complianceIntelligenceSystem';

import {
  complianceValidationEngine,
  type ValidationContext,
  type ValidationOptions,
  type ValidationResult
} from '@/lib/enhanced/complianceValidationEngine';

interface ComplianceIntelligenceContextType {
  // Current compliance state
  complianceContext: ComplianceContext | null;
  validationResult: ValidationResult | null;
  isAnalyzing: boolean;
  isValidating: boolean;
  error: string | null;
  
  // Recommendations and violations
  recommendations: ComplianceRecommendation[];
  violations: ComplianceViolation[];
  complianceScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  // Actions
  analyzeCompliance: (input: string, domainContext?: string) => Promise<void>;
  validateWorkflow: (workflowConfig: unknown, options?: ValidationOptions) => Promise<void>;
  updateComplianceForDomain: (newDomainContext: string, input: string) => Promise<void>;
  clearComplianceContext: () => void;
  refreshCompliance: () => Promise<void>;
  
  // Framework management
  detectedFrameworks: string[];
  activeFrameworks: string[];
  setActiveFrameworks: (frameworks: string[]) => void;
  
  // Session management
  sessionId: string;
  persistenceKey: string | null;
  
  // Real-time features
  isRealTimeEnabled: boolean;
  toggleRealTime: () => void;
  lastUpdated: Date | null;
}

const ComplianceIntelligenceContext = createContext<ComplianceIntelligenceContextType | null>(null);

interface ComplianceIntelligenceProviderProps {
  children: ReactNode;
  sessionId?: string;
  domainContext?: string;
  autoActivate?: boolean;
  realTimeEnabled?: boolean;
  strictMode?: boolean;
  onComplianceChange?: (context: ComplianceContext | null) => void;
  onValidationUpdate?: (result: ValidationResult | null) => void;
  onRecommendationsUpdate?: (recommendations: ComplianceRecommendation[]) => void;
  onViolationsDetected?: (violations: ComplianceViolation[]) => void;
}

export function ComplianceIntelligenceProvider({
  children,
  sessionId: providedSessionId,
  domainContext,
  autoActivate = true,
  realTimeEnabled = false,
  strictMode = false,
  onComplianceChange,
  onValidationUpdate,
  onRecommendationsUpdate,
  onViolationsDetected
}: ComplianceIntelligenceProviderProps) {
  // Session management
  const [sessionId] = useState(
    providedSessionId || `compliance-session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  
  // Core compliance state
  const [complianceContext, setComplianceContext] = useState<ComplianceContext | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Derived state from compliance analysis
  const [recommendations, setRecommendations] = useState<ComplianceRecommendation[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [complianceScore, setComplianceScore] = useState(100);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  
  // Framework management
  const [detectedFrameworks, setDetectedFrameworks] = useState<string[]>([]);
  const [activeFrameworks, setActiveFrameworks] = useState<string[]>([]);
  
  // Session persistence
  const [persistenceKey, setPersistenceKey] = useState<string | null>(null);
  
  // Real-time features
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(realTimeEnabled);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Analyze compliance context for given input
  const analyzeCompliance = useCallback(async (input: string, inputDomainContext?: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await complianceIntelligenceSystem.activateComplianceIntelligence(
        input,
        inputDomainContext || domainContext,
        sessionId
      );
      
      if (result.success) {
        // Update compliance context
        setComplianceContext(result.complianceContext);
        setValidationResult(result.validationResult);
        
        // Update derived state
        setRecommendations(result.recommendations);
        setViolations(result.validationResult.violations);
        setComplianceScore(result.validationResult.score);
        setRiskLevel(result.complianceContext.riskLevel);
        
        // Update framework state
        const frameworkNames = result.complianceContext.detectedFrameworks.map(f => f.name);
        setDetectedFrameworks(frameworkNames);
        
        // Auto-activate high-confidence frameworks
        const highConfidenceFrameworks = result.complianceContext.detectedFrameworks
          .filter(f => f.confidence > 0.7)
          .map(f => f.name);
        setActiveFrameworks(highConfidenceFrameworks);
        
        // Set persistence key
        setPersistenceKey(result.persistenceKey);
        setLastUpdated(new Date());
        
        // Trigger callbacks
        onComplianceChange?.(result.complianceContext);
        onValidationUpdate?.(result.validationResult);
        onRecommendationsUpdate?.(result.recommendations);
        
        if (result.validationResult.violations.length > 0) {
          onViolationsDetected?.(result.validationResult.violations);
        }
        
      } else {
        setError(result.error || 'Compliance analysis failed');
        setComplianceContext(null);
        setValidationResult(null);
        setRecommendations([]);
        setViolations([]);
        setComplianceScore(0);
        setRiskLevel('low');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Compliance analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, domainContext, onComplianceChange, onValidationUpdate, onRecommendationsUpdate, onViolationsDetected]);

  // Validate workflow configuration against compliance frameworks
  const validateWorkflow = useCallback(async (workflowConfig: unknown, options?: ValidationOptions) => {
    if (!complianceContext) {
      setError('No compliance context available. Run compliance analysis first.');
      return;
    }
    
    setIsValidating(true);
    setError(null);
    
    try {
      const validationContext: ValidationContext = {
        workflowConfig: workflowConfig as any, // Type assertion for demo
        domainContext: complianceContext.domainContext || 'general',
        dataTypes: ['general'], // Would be extracted from workflow config
        riskTolerance: 'medium'
      };
      
      const defaultOptions: ValidationOptions = {
        strictMode,
        includeWarnings: true,
        autoFix: false,
        performanceMode: 'thorough'
      };
      
      const result = await complianceValidationEngine.validateCompliance(
        validationContext,
        complianceContext.detectedFrameworks,
        { ...defaultOptions, ...options }
      );
      
      // Update validation state
      setValidationResult(result);
      setViolations(result.frameworkResults.flatMap(fr => fr.criticalViolations));
      setComplianceScore(result.complianceScore);
      
      // Update recommendations from validation
      const validationRecommendations = result.recommendations;
      setRecommendations(prev => {
        // Merge with existing recommendations, avoiding duplicates
        const existingTitles = new Set(prev.map(r => r.title));
        const newRecommendations = validationRecommendations.filter(r => 
          !existingTitles.has(r.title)
        );
        return [...prev, ...newRecommendations];
      });
      
      setLastUpdated(new Date());
      
      // Trigger callbacks
      onValidationUpdate?.(result);
      onRecommendationsUpdate?.(result.recommendations);
      
      if (result.frameworkResults.some(fr => fr.criticalViolations.length > 0)) {
        const allViolations = result.frameworkResults.flatMap(fr => fr.criticalViolations);
        onViolationsDetected?.(allViolations);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Validation failed';
      setError(errorMessage);
      console.error('Workflow validation failed:', err);
    } finally {
      setIsValidating(false);
    }
  }, [complianceContext, strictMode, onValidationUpdate, onRecommendationsUpdate, onViolationsDetected]);

  // Update compliance context when domain changes
  const updateComplianceForDomain = useCallback(async (newDomainContext: string, input: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const result = await complianceIntelligenceSystem.updateComplianceForDomain(
        sessionId,
        newDomainContext,
        input
      );
      
      if (result.success) {
        setComplianceContext(result.complianceContext);
        setValidationResult(result.validationResult);
        setRecommendations(result.recommendations);
        setViolations(result.validationResult.violations);
        setComplianceScore(result.validationResult.score);
        setRiskLevel(result.complianceContext.riskLevel);
        
        // Update framework state
        const frameworkNames = result.complianceContext.detectedFrameworks.map(f => f.name);
        setDetectedFrameworks(frameworkNames);
        
        setLastUpdated(new Date());
        
        // Trigger callbacks
        onComplianceChange?.(result.complianceContext);
        onValidationUpdate?.(result.validationResult);
        onRecommendationsUpdate?.(result.recommendations);
        
      } else {
        setError(result.error || 'Domain update failed');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Domain update failed';
      setError(errorMessage);
      console.error('Domain compliance update failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [sessionId, onComplianceChange, onValidationUpdate, onRecommendationsUpdate]);

  // Clear compliance context
  const clearComplianceContext = useCallback(() => {
    setComplianceContext(null);
    setValidationResult(null);
    setRecommendations([]);
    setViolations([]);
    setComplianceScore(100);
    setRiskLevel('low');
    setDetectedFrameworks([]);
    setActiveFrameworks([]);
    setPersistenceKey(null);
    setError(null);
    setLastUpdated(null);
    
    onComplianceChange?.(null);
    onValidationUpdate?.(null);
    onRecommendationsUpdate?([]);
  }, [onComplianceChange, onValidationUpdate, onRecommendationsUpdate]);

  // Refresh current compliance analysis
  const refreshCompliance = useCallback(async () => {
    if (complianceContext && complianceContext.domainContext) {
      // Re-analyze with current domain context
      await analyzeCompliance('refresh compliance analysis', complianceContext.domainContext);
    }
  }, [complianceContext, analyzeCompliance]);

  // Toggle real-time compliance monitoring
  const toggleRealTime = useCallback(() => {
    setIsRealTimeEnabled(prev => !prev);
  }, []);

  // Auto-activate compliance intelligence on mount if enabled
  useEffect(() => {
    if (autoActivate && domainContext) {
      analyzeCompliance('auto-activation', domainContext);
    }
  }, [autoActivate, domainContext, analyzeCompliance]);

  // Load existing compliance context from session
  useEffect(() => {
    const loadExistingContext = () => {
      try {
        const existingContext = complianceIntelligenceSystem.getActiveComplianceContext(sessionId);
        if (existingContext) {
          setComplianceContext(existingContext);
          setRiskLevel(existingContext.riskLevel);
          setDetectedFrameworks(existingContext.detectedFrameworks.map(f => f.name));
          setLastUpdated(existingContext.timestamp);
        }
      } catch (err) {
        console.warn('Failed to load existing compliance context:', err);
      }
    };

    loadExistingContext();
  }, [sessionId]);

  // Real-time compliance monitoring effect
  useEffect(() => {
    if (!isRealTimeEnabled || !complianceContext) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        // Check for compliance updates periodically
        await refreshCompliance();
      } catch (err) {
        console.warn('Real-time compliance update failed:', err);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTimeEnabled, complianceContext, refreshCompliance]);

  // Update active frameworks handler
  const handleSetActiveFrameworks = useCallback((frameworks: string[]) => {
    setActiveFrameworks(frameworks);
    
    // Optionally re-validate with new framework selection
    if (validationResult && frameworks.length > 0) {
      // Could trigger re-validation here if needed
    }
  }, [validationResult]);

  const contextValue: ComplianceIntelligenceContextType = {
    // Current compliance state
    complianceContext,
    validationResult,
    isAnalyzing,
    isValidating,
    error,
    
    // Recommendations and violations
    recommendations,
    violations,
    complianceScore,
    riskLevel,
    
    // Actions
    analyzeCompliance,
    validateWorkflow,
    updateComplianceForDomain,
    clearComplianceContext,
    refreshCompliance,
    
    // Framework management
    detectedFrameworks,
    activeFrameworks,
    setActiveFrameworks: handleSetActiveFrameworks,
    
    // Session management
    sessionId,
    persistenceKey,
    
    // Real-time features
    isRealTimeEnabled,
    toggleRealTime,
    lastUpdated
  };

  return (
    <ComplianceIntelligenceContext.Provider value={contextValue}>
      {children}
    </ComplianceIntelligenceContext.Provider>
  );
}

// Hook to use compliance intelligence context
export function useComplianceIntelligence(): ComplianceIntelligenceContextType {
  const context = useContext(ComplianceIntelligenceContext);
  
  if (!context) {
    throw new Error('useComplianceIntelligence must be used within a ComplianceIntelligenceProvider');
  }
  
  return context;
}

// Hook to use compliance state only (subset of full context)
export function useComplianceState() {
  const {
    complianceContext,
    validationResult,
    isAnalyzing,
    isValidating,
    error,
    recommendations,
    violations,
    complianceScore,
    riskLevel,
    detectedFrameworks,
    activeFrameworks,
    lastUpdated
  } = useComplianceIntelligence();
  
  return {
    complianceContext,
    validationResult,
    isAnalyzing,
    isValidating,
    error,
    recommendations,
    violations,
    complianceScore,
    riskLevel,
    detectedFrameworks,
    activeFrameworks,
    lastUpdated
  };
}

// Hook to use compliance actions only
export function useComplianceActions() {
  const {
    analyzeCompliance,
    validateWorkflow,
    updateComplianceForDomain,
    clearComplianceContext,
    refreshCompliance,
    setActiveFrameworks,
    toggleRealTime
  } = useComplianceIntelligence();
  
  return {
    analyzeCompliance,
    validateWorkflow,
    updateComplianceForDomain,
    clearComplianceContext,
    refreshCompliance,
    setActiveFrameworks,
    toggleRealTime
  };
}

// High-level hook for simple compliance checking
export function useComplianceCheck(input?: string, domainContext?: string) {
  const { analyzeCompliance, complianceScore, riskLevel, violations, isAnalyzing } = useComplianceIntelligence();
  
  const checkCompliance = useCallback(async (checkInput?: string, checkDomain?: string) => {
    if (checkInput || input) {
      await analyzeCompliance(checkInput || input!, checkDomain || domainContext);
    }
  }, [analyzeCompliance, input, domainContext]);
  
  return {
    checkCompliance,
    complianceScore,
    riskLevel,
    violations,
    isAnalyzing,
    isCompliant: violations.length === 0 && complianceScore >= 85
  };
}