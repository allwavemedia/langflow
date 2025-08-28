// Compliance Validation Indicator - Epic 6.4.2 React Integration
// Real-time validation feedback with visual indicators
// Shows validation status, progress, and detailed results

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useComplianceState, useComplianceActions } from './ComplianceIntelligenceProvider';
import styles from './ComplianceValidationIndicator.module.css';

interface ComplianceValidationIndicatorProps {
  showProgress?: boolean;
  showDetails?: boolean;
  showFrameworkBreakdown?: boolean;
  autoValidate?: boolean;
  validationTrigger?: 'manual' | 'realtime' | 'periodic';
  updateInterval?: number; // seconds
  className?: string;
  onValidationComplete?: (result: any) => void;
  onValidationError?: (error: string) => void;
}

export function ComplianceValidationIndicator({
  showProgress = true,
  showDetails = true,
  showFrameworkBreakdown = false,
  autoValidate = false,
  validationTrigger = 'manual',
  updateInterval = 30,
  className = '',
  onValidationComplete,
  onValidationError
}: ComplianceValidationIndicatorProps) {
  const {
    validationResult,
    complianceScore,
    violations,
    isValidating,
    error,
    activeFrameworks,
    lastUpdated
  } = useComplianceState();

  const { validateWorkflow, refreshCompliance } = useComplianceActions();

  // Local state
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'completed' | 'error'>('idle');
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<string>>(new Set());

  // Handle manual validation
  const handleValidate = useCallback(async () => {
    if (isValidating) return;
    
    setValidationStatus('validating');
    setValidationProgress(0);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setValidationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Mock workflow config for validation
      const mockWorkflowConfig = {
        id: 'mock-workflow',
        name: 'Test Workflow',
        description: 'Mock workflow for validation',
        components: [],
        dataFlow: [],
        integrations: [],
        security: {
          encryption: { enabled: true, atRest: true, inTransit: true },
          authentication: { method: 'oauth', multiFactor: true },
          authorization: { model: 'rbac', roles: ['user', 'admin'], permissions: [], principleOfLeastPrivilege: true },
          logging: { enabled: true, level: 'info', auditTrail: true, retention: '1y' },
          monitoring: { enabled: true, metrics: [], alerting: true, realTimeMonitoring: true }
        },
        dataHandling: {
          collection: { consentRequired: true, purposeSpecification: true, dataMinimization: true },
          processing: { purposeLimitation: true, dataQuality: true, processingRecord: true },
          storage: { location: 'us-east', encryption: true, accessControls: true, backupProcedures: true },
          transmission: { encryption: true, secureProtocols: true, dataIntegrityChecks: true, auditLogging: true },
          retention: { policy: 'data-retention-policy', duration: '7y', reviewProcedures: true, automaticDeletion: true },
          deletion: { secureErasure: true, verificationProcedures: true, auditTrail: true, rightOfErasure: true }
        },
        metadata: {}
      };

      await validateWorkflow(mockWorkflowConfig, {
        strictMode: false,
        includeWarnings: true,
        autoFix: false,
        performanceMode: 'thorough'
      });

      clearInterval(progressInterval);
      setValidationProgress(100);
      setValidationStatus('completed');
      
      onValidationComplete?.(validationResult);
      
    } catch (err) {
      setValidationStatus('error');
      const errorMessage = err instanceof Error ? err.message : 'Validation failed';
      onValidationError?.(errorMessage);
    }
  }, [isValidating, validateWorkflow, validationResult, onValidationComplete, onValidationError]);

  // Auto-validation effect
  useEffect(() => {
    if (!autoValidate || validationTrigger !== 'periodic') return;

    const interval = setInterval(async () => {
      if (!isValidating && activeFrameworks.length > 0) {
        await handleValidate();
      }
    }, updateInterval * 1000);

    return () => clearInterval(interval);
  }, [autoValidate, validationTrigger, updateInterval, handleValidate, isValidating, activeFrameworks.length]);

  // Real-time validation effect
  useEffect(() => {
    if (!autoValidate || validationTrigger !== 'realtime') return;

    if (activeFrameworks.length > 0 && !isValidating) {
      const timeoutId = setTimeout(() => {
        handleValidate();
      }, 2000); // Debounce for 2 seconds

      return () => clearTimeout(timeoutId);
    }
  }, [autoValidate, validationTrigger, activeFrameworks, handleValidate, isValidating]);

  // Framework expansion handler
  const handleFrameworkExpand = useCallback((frameworkName: string) => {
    const newExpanded = new Set(expandedFrameworks);
    if (newExpanded.has(frameworkName)) {
      newExpanded.delete(frameworkName);
    } else {
      newExpanded.add(frameworkName);
    }
    setExpandedFrameworks(newExpanded);
  }, [expandedFrameworks]);

  // Get validation status icon
  const getStatusIcon = () => {
    switch (validationStatus) {
      case 'validating': return '⏳';
      case 'completed': return complianceScore >= 90 ? '✅' : complianceScore >= 70 ? '⚠️' : '❌';
      case 'error': return '💥';
      default: return '🔍';
    }
  };

  // Get validation status text
  const getStatusText = () => {
    switch (validationStatus) {
      case 'validating': return 'Validating compliance...';
      case 'completed': 
        if (complianceScore >= 90) return 'Excellent compliance';
        if (complianceScore >= 70) return 'Good compliance with issues';
        return 'Poor compliance - action needed';
      case 'error': return 'Validation error occurred';
      default: return 'Ready to validate';
    }
  };

  // Get validation status class
  const getStatusClass = () => {
    switch (validationStatus) {
      case 'validating': return styles.validating;
      case 'completed': 
        if (complianceScore >= 90) return styles.excellent;
        if (complianceScore >= 70) return styles.good;
        return styles.poor;
      case 'error': return styles.error;
      default: return styles.idle;
    }
  };

  if (error) {
    return (
      <div className={`${styles.indicatorContainer} ${styles.error} ${className}`}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorMessage}>
            <strong>Validation Error</strong>
            <p>{error}</p>
          </div>
          <button
            onClick={refreshCompliance}
            className={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.indicatorContainer} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🔍</span>
          <h3>Compliance Validation</h3>
          {validationResult && (
            <span className={styles.timestamp}>
              {lastUpdated?.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className={styles.actions}>
          <button
            onClick={handleValidate}
            disabled={isValidating || activeFrameworks.length === 0}
            className={styles.validateButton}
          >
            {isValidating ? (
              <>
                <span className={styles.spinner}></span>
                Validating...
              </>
            ) : (
              'Validate'
            )}
          </button>
        </div>
      </div>

      {/* Status */}
      <div className={`${styles.status} ${getStatusClass()}`}>
        <div className={styles.statusMain}>
          <span className={styles.statusIcon}>{getStatusIcon()}</span>
          <span className={styles.statusText}>{getStatusText()}</span>
          {validationResult && (
            <span className={styles.scoreDisplay}>
              {complianceScore}%
            </span>
          )}
        </div>
        
        {showProgress && validationStatus === 'validating' && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${validationProgress}%` }}
              />
            </div>
            <span className={styles.progressText}>
              {validationProgress}%
            </span>
          </div>
        )}
      </div>

      {/* Summary */}
      {validationResult && showDetails && (
        <div className={styles.summary}>
          <div className={styles.summaryStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {validationResult.frameworkResults.length}
              </span>
              <span className={styles.statLabel}>Frameworks</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {validationResult.summary.totalRequirementsChecked}
              </span>
              <span className={styles.statLabel}>Requirements</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {validationResult.summary.compliantRequirements}
              </span>
              <span className={styles.statLabel}>Compliant</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>
                {validationResult.summary.violatedRequirements}
              </span>
              <span className={styles.statLabel}>Violations</span>
            </div>
          </div>
        </div>
      )}

      {/* Violations */}
      {violations.length > 0 && showDetails && (
        <div className={styles.violationsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🚨</span>
            <h4>Critical Issues ({violations.filter(v => v.severity === 'critical').length})</h4>
          </div>
          <div className={styles.violationsList}>
            {violations
              .filter(v => v.severity === 'critical')
              .slice(0, 3)
              .map((violation, index) => (
                <div key={index} className={styles.violationItem}>
                  <div className={styles.violationHeader}>
                    <span className={styles.violationIcon}>💥</span>
                    <span className={styles.violationFramework}>
                      {violation.framework}
                    </span>
                    <span className={styles.violationSeverity}>
                      {violation.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.violationDescription}>
                    {violation.description}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Framework Breakdown */}
      {validationResult && showFrameworkBreakdown && (
        <div className={styles.frameworksSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>📋</span>
            <h4>Framework Results ({validationResult.frameworkResults.length})</h4>
          </div>
          <div className={styles.frameworksList}>
            {validationResult.frameworkResults.map((frameworkResult, index) => (
              <div key={index} className={styles.frameworkItem}>
                <div 
                  className={styles.frameworkHeader}
                  onClick={() => handleFrameworkExpand(frameworkResult.frameworkName)}
                >
                  <div className={styles.frameworkInfo}>
                    <span className={styles.frameworkIcon}>
                      {frameworkResult.compliant ? '✅' : '❌'}
                    </span>
                    <span className={styles.frameworkName}>
                      {frameworkResult.frameworkName}
                    </span>
                    <span className={styles.frameworkScore}>
                      {frameworkResult.score}%
                    </span>
                  </div>
                  <span className={styles.expandButton}>
                    {expandedFrameworks.has(frameworkResult.frameworkName) ? '▼' : '▶'}
                  </span>
                </div>
                
                {expandedFrameworks.has(frameworkResult.frameworkName) && (
                  <div className={styles.frameworkDetails}>
                    <div className={styles.frameworkStats}>
                      <div className={styles.frameworkStat}>
                        <span className={styles.frameworkStatValue}>
                          {frameworkResult.requirementResults.length}
                        </span>
                        <span className={styles.frameworkStatLabel}>Requirements</span>
                      </div>
                      <div className={styles.frameworkStat}>
                        <span className={styles.frameworkStatValue}>
                          {frameworkResult.criticalViolations.length}
                        </span>
                        <span className={styles.frameworkStatLabel}>Critical</span>
                      </div>
                      <div className={styles.frameworkStat}>
                        <span className={styles.frameworkStatValue}>
                          {frameworkResult.warnings.length}
                        </span>
                        <span className={styles.frameworkStatLabel}>Warnings</span>
                      </div>
                    </div>
                    
                    {frameworkResult.criticalViolations.length > 0 && (
                      <div className={styles.frameworkViolations}>
                        <strong>Critical Issues:</strong>
                        <ul>
                          {frameworkResult.criticalViolations.slice(0, 3).map((violation, vIndex) => (
                            <li key={vIndex}>{violation.description}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {validationResult && (
        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <span className={styles.footerText}>
              Validation completed in {validationResult.validationMetrics.validationTime}ms
            </span>
            <span className={styles.footerText}>
              {validationResult.validationMetrics.autoFixesAvailable} auto-fixes available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized components and hooks would continue here...
// Following the same patterns as the main component

export function ValidationStatusBadge({ className = '' }: { className?: string }) {
  const { complianceScore, isValidating, validationResult } = useComplianceState();

  if (isValidating) {
    return (
      <div className={`${styles.statusBadge} ${styles.validating} ${className}`}>
        <span className={styles.spinner}></span>
        <span>Validating...</span>
      </div>
    );
  }

  if (!validationResult) {
    return (
      <div className={`${styles.statusBadge} ${styles.idle} ${className}`}>
        <span>🔍</span>
        <span>Not validated</span>
      </div>
    );
  }

  const getStatusClass = () => {
    if (complianceScore >= 90) return styles.excellent;
    if (complianceScore >= 70) return styles.good;
    return styles.poor;
  };

  const getStatusIcon = () => {
    if (complianceScore >= 90) return '✅';
    if (complianceScore >= 70) return '⚠️';
    return '❌';
  };

  return (
    <div className={`${styles.statusBadge} ${getStatusClass()} ${className}`}>
      <span>{getStatusIcon()}</span>
      <span>{complianceScore}%</span>
    </div>
  );
}