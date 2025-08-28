// Compliance Recommendations - Epic 6.4.2 React Integration
// Interactive compliance guidance with actionable recommendations
// Following patterns from ComponentRecommendations.tsx

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useComplianceState, useComplianceActions } from './ComplianceIntelligenceProvider';
import type { ComplianceRecommendation, ComplianceViolation } from '@/lib/enhanced/complianceIntelligenceSystem';
import styles from './ComplianceRecommendations.module.css';

interface ComplianceRecommendationsProps {
  showViolations?: boolean;
  showAutoFix?: boolean;
  maxRecommendations?: number;
  maxViolations?: number;
  groupByFramework?: boolean;
  className?: string;
  onRecommendationSelect?: (recommendation: ComplianceRecommendation) => void;
  onViolationSelect?: (violation: ComplianceViolation) => void;
  onImplementationStart?: (recommendation: ComplianceRecommendation) => void;
}

type FilterType = 'all' | 'critical' | 'high' | 'medium' | 'low';
type CategoryType = 'all' | 'component' | 'pattern' | 'configuration' | 'documentation';

export function ComplianceRecommendations({
  showViolations = true,
  showAutoFix = true,
  maxRecommendations = 10,
  maxViolations = 5,
  groupByFramework = false,
  className = '',
  onRecommendationSelect,
  onViolationSelect,
  onImplementationStart
}: ComplianceRecommendationsProps) {
  const {
    recommendations,
    violations,
    isAnalyzing,
    isValidating,
    error,
    complianceScore,
    detectedFrameworks
  } = useComplianceState();

  const { refreshCompliance } = useComplianceActions();

  // Filter and sorting state
  const [priorityFilter, setPriorityFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');
  const [showImplemented, setShowImplemented] = useState(false);
  const [implementedItems, setImplementedItems] = useState<Set<string>>(new Set());

  // Process recommendations with filtering and sorting
  const filteredRecommendations = useMemo(() => {
    let filtered = recommendations.filter(rec => {
      if (priorityFilter !== 'all' && rec.priority !== priorityFilter) return false;
      if (categoryFilter !== 'all' && rec.type !== categoryFilter) return false;
      if (!showImplemented && implementedItems.has(rec.title)) return false;
      return true;
    });

    // Sort by priority and then by type
    filtered.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      return a.type.localeCompare(b.type);
    });

    return filtered.slice(0, maxRecommendations);
  }, [recommendations, priorityFilter, categoryFilter, showImplemented, implementedItems, maxRecommendations]);

  // Process violations with filtering
  const filteredViolations = useMemo(() => {
    let filtered = violations.filter(violation => {
      if (priorityFilter !== 'all' && violation.severity !== priorityFilter) return false;
      return true;
    });

    // Sort by severity
    filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    return filtered.slice(0, maxViolations);
  }, [violations, priorityFilter, maxViolations]);

  // Group recommendations by framework if requested
  const groupedRecommendations = useMemo(() => {
    if (!groupByFramework) return null;

    const groups: Record<string, ComplianceRecommendation[]> = {};
    filteredRecommendations.forEach(rec => {
      const framework = rec.framework || 'General';
      if (!groups[framework]) groups[framework] = [];
      groups[framework].push(rec);
    });

    return groups;
  }, [filteredRecommendations, groupByFramework]);

  // Handle recommendation implementation
  const handleImplement = useCallback((recommendation: ComplianceRecommendation) => {
    setImplementedItems(prev => new Set([...prev, recommendation.title]));
    onImplementationStart?.(recommendation);
  }, [onImplementationStart]);

  // Handle recommendation selection
  const handleRecommendationClick = useCallback((recommendation: ComplianceRecommendation) => {
    onRecommendationSelect?.(recommendation);
  }, [onRecommendationSelect]);

  // Handle violation selection
  const handleViolationClick = useCallback((violation: ComplianceViolation) => {
    onViolationSelect?.(violation);
  }, [onViolationSelect]);

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'component': return '🧩';
      case 'pattern': return '🎯';
      case 'configuration': return '⚙️';
      case 'documentation': return '📄';
      default: return '💡';
    }
  };

  // Get severity icon (for violations)
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '💥';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💭';
      default: return '❓';
    }
  };

  if (error) {
    return (
      <div className={`${styles.recommendationsContainer} ${styles.error} ${className}`}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorMessage}>
            <strong>Recommendation Error</strong>
            <p>{error}</p>
          </div>
          <button
            onClick={refreshCompliance}
            className={styles.retryButton}
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (isAnalyzing || isValidating) {
    return (
      <div className={`${styles.recommendationsContainer} ${styles.loading} ${className}`}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <div className={styles.loadingText}>
            {isAnalyzing ? 'Analyzing compliance...' : 'Validating workflow...'}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0 && violations.length === 0) {
    return (
      <div className={`${styles.recommendationsContainer} ${styles.empty} ${className}`}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}>✅</div>
          <div className={styles.emptyMessage}>
            <strong>No Recommendations</strong>
            <p>Your workflow appears to be compliant with detected frameworks.</p>
            {complianceScore >= 90 && (
              <p className={styles.excellentScore}>Excellent compliance score: {complianceScore}%</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.recommendationsContainer} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>💡</span>
          <h3>Compliance Recommendations</h3>
          <span className={styles.count}>
            ({filteredRecommendations.length + filteredViolations.length})
          </span>
        </div>
        <div className={styles.actions}>
          <button
            onClick={refreshCompliance}
            className={styles.refreshButton}
            title="Refresh recommendations"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Priority:</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as FilterType)}
            className={styles.filterSelect}
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as CategoryType)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            <option value="component">Components</option>
            <option value="pattern">Patterns</option>
            <option value="configuration">Configuration</option>
            <option value="documentation">Documentation</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showImplemented}
              onChange={(e) => setShowImplemented(e.target.checked)}
              className={styles.filterCheckbox}
            />
            Show implemented
          </label>
        </div>
      </div>

      {/* Violations Section */}
      {showViolations && filteredViolations.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🚨</span>
            <h4>Compliance Violations ({filteredViolations.length})</h4>
          </div>
          <div className={styles.violationsList}>
            {filteredViolations.map((violation, index) => (
              <div
                key={`${violation.requirementId}-${index}`}
                className={`${styles.violationItem} ${styles[`severity${violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}`]}`}
                onClick={() => handleViolationClick(violation)}
              >
                <div className={styles.violationHeader}>
                  <div className={styles.violationInfo}>
                    <span className={styles.severityIcon}>
                      {getSeverityIcon(violation.severity)}
                    </span>
                    <span className={styles.violationFramework}>
                      {violation.framework}
                    </span>
                    <span className={styles.violationSeverity}>
                      {violation.severity.toUpperCase()}
                    </span>
                  </div>
                  {violation.autoFixable && (
                    <span className={styles.autoFixBadge}>Auto-fixable</span>
                  )}
                </div>
                <div className={styles.violationDescription}>
                  {violation.description}
                </div>
                {violation.remediation.length > 0 && (
                  <div className={styles.violationRemediation}>
                    <strong>Remediation:</strong>
                    <ul>
                      {violation.remediation.slice(0, 2).map((remedy, idx) => (
                        <li key={idx}>{remedy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {filteredRecommendations.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>🎯</span>
            <h4>Recommendations ({filteredRecommendations.length})</h4>
          </div>

          {groupedRecommendations ? (
            // Grouped by framework
            <div className={styles.groupedRecommendations}>
              {Object.entries(groupedRecommendations).map(([framework, recs]) => (
                <div key={framework} className={styles.frameworkGroup}>
                  <div className={styles.frameworkHeader}>
                    <span className={styles.frameworkIcon}>📋</span>
                    <h5>{framework}</h5>
                    <span className={styles.frameworkCount}>({recs.length})</span>
                  </div>
                  <div className={styles.recommendationsList}>
                    {recs.map((recommendation, index) => (
                      <RecommendationItem
                        key={`${recommendation.title}-${index}`}
                        recommendation={recommendation}
                        isImplemented={implementedItems.has(recommendation.title)}
                        onImplement={() => handleImplement(recommendation)}
                        onClick={() => handleRecommendationClick(recommendation)}
                        getPriorityIcon={getPriorityIcon}
                        getTypeIcon={getTypeIcon}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Flat list
            <div className={styles.recommendationsList}>
              {filteredRecommendations.map((recommendation, index) => (
                <RecommendationItem
                  key={`${recommendation.title}-${index}`}
                  recommendation={recommendation}
                  isImplemented={implementedItems.has(recommendation.title)}
                  onImplement={() => handleImplement(recommendation)}
                  onClick={() => handleRecommendationClick(recommendation)}
                  getPriorityIcon={getPriorityIcon}
                  getTypeIcon={getTypeIcon}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{recommendations.length}</span>
            <span className={styles.statLabel}>Total Recommendations</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{violations.length}</span>
            <span className={styles.statLabel}>Violations</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{implementedItems.size}</span>
            <span className={styles.statLabel}>Implemented</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{detectedFrameworks.length}</span>
            <span className={styles.statLabel}>Frameworks</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual recommendation item component
interface RecommendationItemProps {
  recommendation: ComplianceRecommendation;
  isImplemented: boolean;
  onImplement: () => void;
  onClick: () => void;
  getPriorityIcon: (priority: string) => string;
  getTypeIcon: (type: string) => string;
}

function RecommendationItem({
  recommendation,
  isImplemented,
  onImplement,
  onClick,
  getPriorityIcon,
  getTypeIcon
}: RecommendationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImplementing, setIsImplementing] = useState(false);

  const handleImplementClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsImplementing(true);
    
    try {
      onImplement();
      // Simulate implementation time
      setTimeout(() => {
        setIsImplementing(false);
      }, 1000);
    } catch (error) {
      setIsImplementing(false);
    }
  };

  return (
    <div
      className={`${styles.recommendationItem} ${styles[`priority${recommendation.priority.charAt(0).toUpperCase() + recommendation.priority.slice(1)}`]} ${isImplemented ? styles.implemented : ''}`}
      onClick={onClick}
    >
      <div className={styles.recommendationHeader}>
        <div className={styles.recommendationInfo}>
          <span className={styles.priorityIcon}>
            {getPriorityIcon(recommendation.priority)}
          </span>
          <span className={styles.typeIcon}>
            {getTypeIcon(recommendation.type)}
          </span>
          <span className={styles.recommendationTitle}>
            {recommendation.title}
          </span>
          <span className={styles.recommendationPriority}>
            {recommendation.priority.toUpperCase()}
          </span>
        </div>
        <div className={styles.recommendationActions}>
          {isImplemented ? (
            <span className={styles.implementedBadge}>✅ Implemented</span>
          ) : (
            <button
              onClick={handleImplementClick}
              disabled={isImplementing}
              className={styles.implementButton}
            >
              {isImplementing ? (
                <>
                  <span className={styles.spinner}></span>
                  Implementing...
                </>
              ) : (
                'Implement'
              )}
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className={styles.expandButton}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      <div className={styles.recommendationDescription}>
        {recommendation.description}
      </div>

      {isExpanded && (
        <div className={styles.recommendationDetails}>
          <div className={styles.detailsSection}>
            <strong>Framework:</strong> {recommendation.framework}
          </div>
          
          {recommendation.implementation.length > 0 && (
            <div className={styles.detailsSection}>
              <strong>Implementation Steps:</strong>
              <ol className={styles.implementationSteps}>
                {recommendation.implementation.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {recommendation.references.length > 0 && (
            <div className={styles.detailsSection}>
              <strong>References:</strong>
              <ul className={styles.referencesList}>
                {recommendation.references.map((ref, index) => (
                  <li key={index}>{ref}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Specialized hook for recommendation management
export function useRecommendationManager() {
  const { recommendations, violations } = useComplianceState();
  const [implementedItems, setImplementedItems] = useState<Set<string>>(new Set());

  const markAsImplemented = useCallback((recommendationTitle: string) => {
    setImplementedItems(prev => new Set([...prev, recommendationTitle]));
  }, []);

  const markAsNotImplemented = useCallback((recommendationTitle: string) => {
    setImplementedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(recommendationTitle);
      return newSet;
    });
  }, []);

  const getImplementationProgress = useCallback(() => {
    if (recommendations.length === 0) return 0;
    return Math.round((implementedItems.size / recommendations.length) * 100);
  }, [recommendations.length, implementedItems.size]);

  const getCriticalViolations = useCallback(() => {
    return violations.filter(v => v.severity === 'critical');
  }, [violations]);

  const getHighPriorityRecommendations = useCallback(() => {
    return recommendations.filter(r => r.priority === 'critical' || r.priority === 'high');
  }, [recommendations]);

  return {
    implementedItems,
    markAsImplemented,
    markAsNotImplemented,
    getImplementationProgress,
    getCriticalViolations,
    getHighPriorityRecommendations
  };
}