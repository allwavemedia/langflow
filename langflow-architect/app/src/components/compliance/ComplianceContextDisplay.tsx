// Compliance Context Display - Epic 6.4.2 React Integration
// Shows current compliance status, detected frameworks, and risk level
// Follows the design patterns from DomainContextDisplay

'use client';

import React from 'react';
import { useComplianceState } from './ComplianceIntelligenceProvider';
import styles from './ComplianceContextDisplay.module.css';

interface ComplianceContextDisplayProps {
  showFrameworks?: boolean;
  showScore?: boolean;
  showRiskLevel?: boolean;
  showLastUpdated?: boolean;
  compact?: boolean;
  className?: string;
}

export function ComplianceContextDisplay({
  showFrameworks = true,
  showScore = true,
  showRiskLevel = true,
  showLastUpdated = true,
  compact = false,
  className = ''
}: ComplianceContextDisplayProps) {
  const {
    complianceContext,
    complianceScore,
    riskLevel,
    detectedFrameworks,
    isAnalyzing,
    error,
    lastUpdated
  } = useComplianceState();

  if (error) {
    return (
      <div className={`${styles.complianceDisplay} ${styles.error} ${className}`}>
        <div className={styles.errorIcon}>⚠️</div>
        <div className={styles.errorMessage}>
          <strong>Compliance Analysis Error</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className={`${styles.complianceDisplay} ${styles.analyzing} ${className}`}>
        <div className={styles.spinner}></div>
        <div className={styles.analyzingText}>
          Analyzing compliance requirements...
        </div>
      </div>
    );
  }

  if (!complianceContext) {
    return compact ? null : (
      <div className={`${styles.complianceDisplay} ${styles.empty} ${className}`}>
        <div className={styles.emptyIcon}>📋</div>
        <div className={styles.emptyMessage}>
          No compliance analysis available
        </div>
      </div>
    );
  }

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '✅';
    if (score >= 75) return '⚠️';
    if (score >= 50) return '🔶';
    return '❌';
  };

  const getScoreClass = (score: number) => {
    if (score >= 90) return styles.scoreExcellent;
    if (score >= 75) return styles.scoreGood;
    if (score >= 50) return styles.scoreFair;
    return styles.scorePoor;
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (compact) {
    return (
      <div className={`${styles.complianceDisplay} ${styles.compact} ${className}`}>
        <div className={styles.compactContent}>
          {showScore && (
            <div className={`${styles.compactScore} ${getScoreClass(complianceScore)}`}>
              <span className={styles.scoreIcon}>{getScoreIcon(complianceScore)}</span>
              <span className={styles.scoreValue}>{complianceScore}%</span>
            </div>
          )}
          {showRiskLevel && (
            <div className={`${styles.compactRisk} ${styles[`risk${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}`]}`}>
              <span className={styles.riskIcon}>{getRiskLevelIcon(riskLevel)}</span>
              <span className={styles.riskText}>{riskLevel.toUpperCase()}</span>
            </div>
          )}
          {showFrameworks && detectedFrameworks.length > 0 && (
            <div className={styles.compactFrameworks}>
              <span className={styles.frameworkCount}>
                {detectedFrameworks.length} framework{detectedFrameworks.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.complianceDisplay} ${className}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🛡️</span>
          <h3>Compliance Status</h3>
        </div>
        {complianceContext && (
          <div className={styles.confidence}>
            Confidence: {Math.round(complianceContext.confidence * 100)}%
          </div>
        )}
      </div>

      <div className={styles.content}>
        {showScore && (
          <div className={styles.scoreSection}>
            <div className={styles.scoreLabel}>Compliance Score</div>
            <div className={`${styles.scoreDisplay} ${getScoreClass(complianceScore)}`}>
              <span className={styles.scoreIcon}>{getScoreIcon(complianceScore)}</span>
              <span className={styles.scoreValue}>{complianceScore}%</span>
            </div>
            <div className={styles.scoreDescription}>
              {complianceScore >= 90 && 'Excellent compliance'}
              {complianceScore >= 75 && complianceScore < 90 && 'Good compliance with minor issues'}
              {complianceScore >= 50 && complianceScore < 75 && 'Fair compliance, attention needed'}
              {complianceScore < 50 && 'Poor compliance, immediate action required'}
            </div>
          </div>
        )}

        {showRiskLevel && (
          <div className={styles.riskSection}>
            <div className={styles.riskLabel}>Risk Level</div>
            <div className={`${styles.riskDisplay} ${styles[`risk${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}`]}`}>
              <span className={styles.riskIcon}>{getRiskLevelIcon(riskLevel)}</span>
              <span className={styles.riskText}>{riskLevel.toUpperCase()}</span>
            </div>
            <div className={styles.riskDescription}>
              {riskLevel === 'critical' && 'Critical compliance violations detected'}
              {riskLevel === 'high' && 'High-priority compliance issues found'}
              {riskLevel === 'medium' && 'Medium-priority compliance concerns'}
              {riskLevel === 'low' && 'Low compliance risk detected'}
            </div>
          </div>
        )}

        {showFrameworks && detectedFrameworks.length > 0 && (
          <div className={styles.frameworksSection}>
            <div className={styles.frameworksLabel}>
              Detected Frameworks ({detectedFrameworks.length})
            </div>
            <div className={styles.frameworksList}>
              {detectedFrameworks.map((framework, index) => (
                <div key={index} className={styles.frameworkItem}>
                  <span className={styles.frameworkIcon}>📋</span>
                  <span className={styles.frameworkName}>{framework}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {complianceContext && (
          <div className={styles.metadataSection}>
            <div className={styles.metadataItem}>
              <span className={styles.metadataLabel}>Source:</span>
              <span className={styles.metadataValue}>
                {complianceContext.source === 'mcp' ? 'MCP Server' :
                 complianceContext.source === 'web_search' ? 'Web Search' :
                 complianceContext.source === 'hybrid' ? 'MCP + Web' :
                 'Conversation'}
              </span>
            </div>
            {complianceContext.domainContext && (
              <div className={styles.metadataItem}>
                <span className={styles.metadataLabel}>Domain:</span>
                <span className={styles.metadataValue}>{complianceContext.domainContext}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {showLastUpdated && lastUpdated && (
        <div className={styles.footer}>
          <div className={styles.lastUpdated}>
            Last updated: {formatLastUpdated(lastUpdated)}
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized components for specific use cases
export function ComplianceScoreBadge({ className = '' }: { className?: string }) {
  const { complianceScore, isAnalyzing } = useComplianceState();

  if (isAnalyzing) {
    return (
      <div className={`${styles.scoreBadge} ${styles.analyzing} ${className}`}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  const getScoreClass = (score: number) => {
    if (score >= 90) return styles.scoreExcellent;
    if (score >= 75) return styles.scoreGood;
    if (score >= 50) return styles.scoreFair;
    return styles.scorePoor;
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return '✅';
    if (score >= 75) return '⚠️';
    if (score >= 50) return '🔶';
    return '❌';
  };

  return (
    <div className={`${styles.scoreBadge} ${getScoreClass(complianceScore)} ${className}`}>
      <span className={styles.scoreIcon}>{getScoreIcon(complianceScore)}</span>
      <span className={styles.scoreValue}>{complianceScore}%</span>
    </div>
  );
}

export function RiskLevelIndicator({ className = '' }: { className?: string }) {
  const { riskLevel, isAnalyzing } = useComplianceState();

  if (isAnalyzing) {
    return (
      <div className={`${styles.riskIndicator} ${styles.analyzing} ${className}`}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  return (
    <div className={`${styles.riskIndicator} ${styles[`risk${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}`]} ${className}`}>
      <span className={styles.riskIcon}>{getRiskLevelIcon(riskLevel)}</span>
      <span className={styles.riskText}>{riskLevel.toUpperCase()}</span>
    </div>
  );
}

export function FrameworksList({ className = '' }: { className?: string }) {
  const { detectedFrameworks, isAnalyzing } = useComplianceState();

  if (isAnalyzing) {
    return (
      <div className={`${styles.frameworksList} ${styles.analyzing} ${className}`}>
        <div className={styles.spinner}></div>
        <span>Detecting frameworks...</span>
      </div>
    );
  }

  if (detectedFrameworks.length === 0) {
    return (
      <div className={`${styles.frameworksList} ${styles.empty} ${className}`}>
        <span className={styles.emptyText}>No frameworks detected</span>
      </div>
    );
  }

  return (
    <div className={`${styles.frameworksList} ${className}`}>
      {detectedFrameworks.map((framework, index) => (
        <div key={index} className={styles.frameworkItem}>
          <span className={styles.frameworkIcon}>📋</span>
          <span className={styles.frameworkName}>{framework}</span>
        </div>
      ))}
    </div>
  );
}