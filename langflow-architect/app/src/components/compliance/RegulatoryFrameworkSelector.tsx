// Regulatory Framework Selector - Epic 6.4.2 React Integration
// Interface for selecting and managing active compliance frameworks
// Provides interactive framework selection with confidence scoring

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useComplianceState, useComplianceActions } from './ComplianceIntelligenceProvider';
import styles from './RegulatoryFrameworkSelector.module.css';

interface RegulatoryFrameworkSelectorProps {
  showConfidence?: boolean;
  showDescription?: boolean;
  allowMultiSelection?: boolean;
  maxSelections?: number;
  showSearch?: boolean;
  groupByCategory?: boolean;
  className?: string;
  onSelectionChange?: (selectedFrameworks: string[]) => void;
  onFrameworkDetails?: (frameworkName: string) => void;
}

export function RegulatoryFrameworkSelector({
  showConfidence = true,
  showDescription = true,
  allowMultiSelection = true,
  maxSelections = 10,
  showSearch = true,
  groupByCategory = false,
  className = '',
  onSelectionChange,
  onFrameworkDetails
}: RegulatoryFrameworkSelectorProps) {
  const {
    complianceContext,
    detectedFrameworks,
    activeFrameworks,
    isAnalyzing,
    error
  } = useComplianceState();

  const { setActiveFrameworks } = useComplianceActions();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFrameworks, setSelectedFrameworks] = useState<Set<string>>(
    new Set(activeFrameworks)
  );
  const [expandedFrameworks, setExpandedFrameworks] = useState<Set<string>>(new Set());

  // Filter frameworks based on search
  const filteredFrameworks = useMemo(() => {
    if (!complianceContext) return [];
    
    let frameworks = complianceContext.detectedFrameworks;
    
    if (searchTerm.trim()) {
      frameworks = frameworks.filter(framework =>
        framework.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        framework.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return frameworks;
  }, [complianceContext, searchTerm]);

  // Group frameworks by category
  const groupedFrameworks = useMemo(() => {
    if (!groupByCategory) return null;
    
    const groups: Record<string, typeof filteredFrameworks> = {};
    
    filteredFrameworks.forEach(framework => {
      // Categorize frameworks based on their names/domains
      let category = 'General';
      
      if (framework.applicableDomains.some(d => d.includes('healthcare') || d.includes('medical'))) {
        category = 'Healthcare';
      } else if (framework.applicableDomains.some(d => d.includes('financial') || d.includes('banking'))) {
        category = 'Financial';
      } else if (framework.applicableDomains.some(d => d.includes('data') || d.includes('privacy'))) {
        category = 'Data Protection';
      } else if (framework.applicableDomains.some(d => d.includes('security'))) {
        category = 'Security';
      }
      
      if (!groups[category]) groups[category] = [];
      groups[category].push(framework);
    });
    
    return groups;
  }, [filteredFrameworks, groupByCategory]);

  // Handle framework selection
  const handleFrameworkSelect = useCallback((frameworkName: string) => {
    const newSelection = new Set(selectedFrameworks);
    
    if (newSelection.has(frameworkName)) {
      newSelection.delete(frameworkName);
    } else {
      if (!allowMultiSelection) {
        newSelection.clear();
      }
      
      if (newSelection.size < maxSelections) {
        newSelection.add(frameworkName);
      }
    }
    
    setSelectedFrameworks(newSelection);
    
    const selectedArray = Array.from(newSelection);
    setActiveFrameworks(selectedArray);
    onSelectionChange?.(selectedArray);
  }, [selectedFrameworks, allowMultiSelection, maxSelections, setActiveFrameworks, onSelectionChange]);

  // Handle framework expansion
  const handleFrameworkExpand = useCallback((frameworkName: string) => {
    const newExpanded = new Set(expandedFrameworks);
    
    if (newExpanded.has(frameworkName)) {
      newExpanded.delete(frameworkName);
    } else {
      newExpanded.add(frameworkName);
    }
    
    setExpandedFrameworks(newExpanded);
  }, [expandedFrameworks]);

  // Handle framework details
  const handleFrameworkDetails = useCallback((frameworkName: string) => {
    onFrameworkDetails?.(frameworkName);
  }, [onFrameworkDetails]);

  // Get confidence color class
  const getConfidenceClass = (confidence: number) => {
    if (confidence >= 0.8) return styles.confidenceHigh;
    if (confidence >= 0.6) return styles.confidenceMedium;
    return styles.confidenceLow;
  };

  // Get framework icon
  const getFrameworkIcon = (frameworkName: string) => {
    const name = frameworkName.toLowerCase();
    
    if (name.includes('gdpr')) return '🇪🇺';
    if (name.includes('hipaa')) return '🏥';
    if (name.includes('pci')) return '💳';
    if (name.includes('sox')) return '📊';
    if (name.includes('nist')) return '🛡️';
    if (name.includes('iso')) return '🌐';
    if (name.includes('fda')) return '💊';
    if (name.includes('ccpa')) return '🏛️';
    
    return '📋';
  };

  if (error) {
    return (
      <div className={`${styles.selectorContainer} ${styles.error} ${className}`}>
        <div className={styles.errorContent}>
          <div className={styles.errorIcon}>⚠️</div>
          <div className={styles.errorMessage}>
            <strong>Framework Selection Error</strong>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className={`${styles.selectorContainer} ${styles.loading} ${className}`}>
        <div className={styles.loadingContent}>
          <div className={styles.spinner}></div>
          <div className={styles.loadingText}>
            Detecting regulatory frameworks...
          </div>
        </div>
      </div>
    );
  }

  if (!complianceContext || filteredFrameworks.length === 0) {
    return (
      <div className={`${styles.selectorContainer} ${styles.empty} ${className}`}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}>📋</div>
          <div className={styles.emptyMessage}>
            <strong>No Frameworks Detected</strong>
            <p>Run compliance analysis to detect applicable regulatory frameworks.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.selectorContainer} ${className}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🎯</span>
          <h3>Regulatory Frameworks</h3>
          <span className={styles.count}>
            ({filteredFrameworks.length} detected)
          </span>
        </div>
        <div className={styles.selection}>
          <span className={styles.selectedCount}>
            {selectedFrameworks.size} selected
          </span>
          {selectedFrameworks.size > 0 && (
            <button
              onClick={() => {
                setSelectedFrameworks(new Set());
                setActiveFrameworks([]);
                onSelectionChange?.([]);
              }}
              className={styles.clearButton}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      {showSearch && (
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search frameworks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className={styles.clearSearchButton}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selection Info */}
      {allowMultiSelection && (
        <div className={styles.selectionInfo}>
          <span className={styles.selectionText}>
            Select up to {maxSelections} frameworks for validation
          </span>
          {selectedFrameworks.size === maxSelections && (
            <span className={styles.maxReachedText}>
              Maximum selection reached
            </span>
          )}
        </div>
      )}

      {/* Frameworks List */}
      <div className={styles.frameworksList}>
        {groupedFrameworks ? (
          // Grouped display
          Object.entries(groupedFrameworks).map(([category, frameworks]) => (
            <div key={category} className={styles.frameworkGroup}>
              <div className={styles.groupHeader}>
                <span className={styles.groupIcon}>📁</span>
                <h4>{category}</h4>
                <span className={styles.groupCount}>({frameworks.length})</span>
              </div>
              <div className={styles.groupFrameworks}>
                {frameworks.map((framework) => (
                  <FrameworkItem
                    key={framework.id}
                    framework={framework}
                    isSelected={selectedFrameworks.has(framework.name)}
                    isExpanded={expandedFrameworks.has(framework.name)}
                    showConfidence={showConfidence}
                    showDescription={showDescription}
                    canSelect={selectedFrameworks.size < maxSelections || selectedFrameworks.has(framework.name)}
                    onSelect={() => handleFrameworkSelect(framework.name)}
                    onExpand={() => handleFrameworkExpand(framework.name)}
                    onDetails={() => handleFrameworkDetails(framework.name)}
                    getConfidenceClass={getConfidenceClass}
                    getFrameworkIcon={getFrameworkIcon}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Flat display
          filteredFrameworks.map((framework) => (
            <FrameworkItem
              key={framework.id}
              framework={framework}
              isSelected={selectedFrameworks.has(framework.name)}
              isExpanded={expandedFrameworks.has(framework.name)}
              showConfidence={showConfidence}
              showDescription={showDescription}
              canSelect={selectedFrameworks.size < maxSelections || selectedFrameworks.has(framework.name)}
              onSelect={() => handleFrameworkSelect(framework.name)}
              onExpand={() => handleFrameworkExpand(framework.name)}
              onDetails={() => handleFrameworkDetails(framework.name)}
              getConfidenceClass={getConfidenceClass}
              getFrameworkIcon={getFrameworkIcon}
            />
          ))
        )}
      </div>

      {/* Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{filteredFrameworks.length}</span>
            <span className={styles.statLabel}>Available</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{selectedFrameworks.size}</span>
            <span className={styles.statLabel}>Selected</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {filteredFrameworks.filter(f => f.confidence >= 0.8).length}
            </span>
            <span className={styles.statLabel}>High Confidence</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual framework item component
interface FrameworkItemProps {
  framework: any; // ComplianceFramework type
  isSelected: boolean;
  isExpanded: boolean;
  showConfidence: boolean;
  showDescription: boolean;
  canSelect: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onDetails: () => void;
  getConfidenceClass: (confidence: number) => string;
  getFrameworkIcon: (name: string) => string;
}

function FrameworkItem({
  framework,
  isSelected,
  isExpanded,
  showConfidence,
  showDescription,
  canSelect,
  onSelect,
  onExpand,
  onDetails,
  getConfidenceClass,
  getFrameworkIcon
}: FrameworkItemProps) {
  return (
    <div
      className={`${styles.frameworkItem} ${isSelected ? styles.selected : ''} ${!canSelect ? styles.disabled : ''}`}
    >
      <div className={styles.frameworkHeader}>
        <div className={styles.frameworkInfo} onClick={canSelect ? onSelect : undefined}>
          <div className={styles.frameworkMain}>
            <span className={styles.frameworkIcon}>
              {getFrameworkIcon(framework.name)}
            </span>
            <span className={styles.frameworkName}>
              {framework.name}
            </span>
            {isSelected && (
              <span className={styles.selectedBadge}>✓</span>
            )}
          </div>
          
          {showConfidence && (
            <div className={`${styles.confidence} ${getConfidenceClass(framework.confidence)}`}>
              <span className={styles.confidenceLabel}>
                {Math.round(framework.confidence * 100)}%
              </span>
            </div>
          )}
        </div>
        
        <div className={styles.frameworkActions}>
          <button
            onClick={onDetails}
            className={styles.detailsButton}
            title="View framework details"
          >
            ℹ️
          </button>
          <button
            onClick={onExpand}
            className={styles.expandButton}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
      </div>

      {showDescription && (
        <div className={styles.frameworkDescription}>
          {framework.description}
        </div>
      )}

      {isExpanded && (
        <div className={styles.frameworkDetails}>
          <div className={styles.detailsSection}>
            <strong>Source:</strong> {framework.source}
          </div>
          
          <div className={styles.detailsSection}>
            <strong>Applicable Domains:</strong>
            <div className={styles.domainsList}>
              {framework.applicableDomains.map((domain: string, index: number) => (
                <span key={index} className={styles.domainTag}>
                  {domain}
                </span>
              ))}
            </div>
          </div>
          
          {framework.requirements.length > 0 && (
            <div className={styles.detailsSection}>
              <strong>Requirements:</strong> {framework.requirements.length} identified
            </div>
          )}
          
          {framework.validationRules.length > 0 && (
            <div className={styles.detailsSection}>
              <strong>Validation Rules:</strong> {framework.validationRules.length} available
            </div>
          )}
          
          <div className={styles.detailsSection}>
            <strong>Last Updated:</strong> {framework.lastUpdated.toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}

// Specialized components for different use cases
export function FrameworkQuickSelector({ 
  onSelectionChange,
  className = ''
}: {
  onSelectionChange?: (frameworks: string[]) => void;
  className?: string;
}) {
  return (
    <RegulatoryFrameworkSelector
      showConfidence={false}
      showDescription={false}
      allowMultiSelection={true}
      maxSelections={5}
      showSearch={false}
      groupByCategory={false}
      className={`${styles.quickSelector} ${className}`}
      onSelectionChange={onSelectionChange}
    />
  );
}

export function FrameworkDetails({ 
  frameworkName,
  className = ''
}: {
  frameworkName: string;
  className?: string;
}) {
  const { complianceContext } = useComplianceState();
  
  const framework = complianceContext?.detectedFrameworks.find(f => 
    f.name === frameworkName
  );
  
  if (!framework) {
    return (
      <div className={`${styles.frameworkDetails} ${styles.notFound} ${className}`}>
        <p>Framework "{frameworkName}" not found.</p>
      </div>
    );
  }
  
  return (
    <div className={`${styles.frameworkDetails} ${styles.standalone} ${className}`}>
      <div className={styles.detailsHeader}>
        <span className={styles.frameworkIcon}>
          {framework.name.toLowerCase().includes('gdpr') ? '🇪🇺' : '📋'}
        </span>
        <h4>{framework.name}</h4>
      </div>
      
      <div className={styles.detailsContent}>
        <div className={styles.detailsSection}>
          <strong>Description:</strong>
          <p>{framework.description}</p>
        </div>
        
        <div className={styles.detailsSection}>
          <strong>Confidence:</strong> {Math.round(framework.confidence * 100)}%
        </div>
        
        <div className={styles.detailsSection}>
          <strong>Source:</strong> {framework.source}
        </div>
        
        <div className={styles.detailsSection}>
          <strong>Applicable Domains:</strong>
          <div className={styles.domainsList}>
            {framework.applicableDomains.map((domain, index) => (
              <span key={index} className={styles.domainTag}>
                {domain}
              </span>
            ))}
          </div>
        </div>
        
        <div className={styles.detailsSection}>
          <strong>Requirements:</strong> {framework.requirements.length}
        </div>
        
        <div className={styles.detailsSection}>
          <strong>Validation Rules:</strong> {framework.validationRules.length}
        </div>
        
        <div className={styles.detailsSection}>
          <strong>Last Updated:</strong> {framework.lastUpdated.toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Hook for framework selection management
export function useFrameworkSelector() {
  const { detectedFrameworks, activeFrameworks } = useComplianceState();
  const { setActiveFrameworks } = useComplianceActions();
  
  const selectFramework = useCallback((frameworkName: string) => {
    if (!activeFrameworks.includes(frameworkName)) {
      setActiveFrameworks([...activeFrameworks, frameworkName]);
    }
  }, [activeFrameworks, setActiveFrameworks]);
  
  const deselectFramework = useCallback((frameworkName: string) => {
    setActiveFrameworks(activeFrameworks.filter(name => name !== frameworkName));
  }, [activeFrameworks, setActiveFrameworks]);
  
  const toggleFramework = useCallback((frameworkName: string) => {
    if (activeFrameworks.includes(frameworkName)) {
      deselectFramework(frameworkName);
    } else {
      selectFramework(frameworkName);
    }
  }, [activeFrameworks, selectFramework, deselectFramework]);
  
  const selectAll = useCallback(() => {
    setActiveFrameworks(detectedFrameworks);
  }, [detectedFrameworks, setActiveFrameworks]);
  
  const clearAll = useCallback(() => {
    setActiveFrameworks([]);
  }, [setActiveFrameworks]);
  
  return {
    detectedFrameworks,
    activeFrameworks,
    selectFramework,
    deselectFramework,
    toggleFramework,
    selectAll,
    clearAll
  };
}