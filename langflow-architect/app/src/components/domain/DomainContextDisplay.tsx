// Domain Context Display - Epic 6.4.1 UI Component
// Visual representation of active domain context and expertise level

'use client';

import React from 'react';
import { useDomainExpertise } from './DomainExpertiseProvider';
import styles from './DomainContextDisplay.module.css';

interface DomainContextDisplayProps {
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

export function DomainContextDisplay({ 
  className = "", 
  showActions = true, 
  compact = false 
}: DomainContextDisplayProps) {
  const { 
    activeDomain, 
    isAnalyzing, 
    clearDomainContext, 
    refreshRecommendations,
    isLoadingRecommendations 
  } = useDomainExpertise();

  if (!activeDomain) {
    return (
      <div className={`w-full border rounded-lg p-4 bg-white shadow-sm ${className}`}>
        <div className={`flex items-center gap-2 mb-3 ${compact ? 'text-sm' : 'text-base'}`}>
          <span className="w-4 h-4 bg-gray-400 rounded opacity-50">🧠</span>
          <h3 className="font-medium">Domain Intelligence</h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded opacity-50 flex items-center justify-center">
            🧠
          </div>
          <p className={compact ? "text-xs" : "text-sm"}>
            No domain context detected. Start a conversation to activate domain expertise.
          </p>
        </div>
      </div>
    );
  }

  const confidenceLevel = Math.round(activeDomain.confidence * 100);
  const expertiseColorClass = getExpertiseColorClass(activeDomain.expertiseLevel);
  const sourceEmoji = getSourceEmoji(activeDomain.source);

  return (
    <div className={`w-full border rounded-lg p-4 bg-white shadow-sm ${className}`}>
      {/* Header */}
      <div className={`flex items-center justify-between mb-3 ${compact ? 'mb-2' : 'mb-4'}`}>
        <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
          <span className="w-4 h-4 text-blue-600">🧠</span>
          <h3 className="font-medium">Domain Intelligence</h3>
          {isAnalyzing && <span className="text-xs text-gray-500 animate-pulse">Analyzing...</span>}
        </div>
        {showActions && (
          <div className="flex items-center gap-1">
            <button
              onClick={refreshRecommendations}
              disabled={isLoadingRecommendations}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              title="Refresh recommendations"
            >
              {isLoadingRecommendations ? '⟳' : '↻'}
            </button>
            <button
              onClick={clearDomainContext}
              className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              title="Clear domain context"
            >
              🕒
            </button>
          </div>
        )}
      </div>
      
      {/* Domain and Confidence */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 bg-gray-100 rounded text-sm font-medium capitalize ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}>
              {activeDomain.domain.replace('-', ' ')}
            </span>
            <span className="text-sm" title={`Source: ${activeDomain.source}`}>
              {sourceEmoji}
            </span>
          </div>
          <div className="text-right">
            <div className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
              {confidenceLevel}% confidence
            </div>
            <div className={`w-16 bg-gray-200 rounded-full ${compact ? 'h-1' : 'h-2'}`} data-confidence={confidenceLevel}>
              <div className={`bg-blue-600 rounded-full h-full transition-all duration-300 ${styles['domain-confidence-fill']}`}>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expertise Level */}
      {activeDomain.expertiseLevel && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-gray-500">👥</span>
          <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
            Expertise Level:
          </span>
          <span className={`px-2 py-1 border rounded text-sm capitalize ${expertiseColorClass} ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}>
            {activeDomain.expertiseLevel}
          </span>
        </div>
      )}

      {/* Knowledge Sources */}
      {activeDomain.knowledge.sources.length > 0 && !compact && (
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">💡</span>
            <span className="text-xs text-gray-600">Knowledge Sources:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {activeDomain.knowledge.sources.map((source, index) => (
              <span 
                key={index} 
                className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs"
              >
                {formatSourceName(source)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Frameworks */}
      {activeDomain.complianceFrameworks && activeDomain.complianceFrameworks.length > 0 && (
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">🛡️</span>
            <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
              Compliance:
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {activeDomain.complianceFrameworks.map((framework, index) => (
              <span 
                key={index} 
                className={`px-1.5 py-0.5 bg-orange-100 text-orange-800 border-orange-200 border rounded text-xs ${compact ? 'px-1 py-0.5' : ''}`}
              >
                {framework}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Domains */}
      {activeDomain.relatedDomains.length > 0 && !compact && (
        <div className="space-y-1 mb-3">
          <div className="text-xs text-gray-600">Related Domains:</div>
          <div className="flex flex-wrap gap-1">
            {activeDomain.relatedDomains.map((domain, index) => (
              <span 
                key={index} 
                className="px-1.5 py-0.5 bg-gray-100 border rounded text-xs capitalize"
              >
                {domain.replace('-', ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {!compact && activeDomain.metadata && (
        <div className="text-xs text-gray-500 pt-2 border-t">
          <div className="flex justify-between">
            <span>Detected: {new Date(activeDomain.timestamp).toLocaleTimeString()}</span>
            <span>Source: {activeDomain.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function getExpertiseColorClass(level?: string): string {
  switch (level) {
    case 'beginner':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'intermediate':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'advanced':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getSourceEmoji(source: string): string {
  switch (source) {
    case 'mcp':
      return '🧠';
    case 'web_search':
      return '💡';
    case 'hybrid':
      return '🔄';
    default:
      return '👥';
  }
}

function formatSourceName(source: string): string {
  return source
    .replace(/[-_]/g, ' ')
    .replace(/\bmcp\b/gi, 'MCP')
    .replace(/\bapi\b/gi, 'API')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default DomainContextDisplay;
