// Component Recommendations Display - Epic 6.4.1 UI Component
// Shows domain-specific component recommendations with filtering and actions

'use client';

import React, { useState } from 'react';
import { useDomainRecommendations } from './DomainExpertiseProvider';
import type { ComponentRecommendation } from '@/lib/enhanced/domainDetectionSystem';

interface ComponentRecommendationsProps {
  className?: string;
  maxRecommendations?: number;
  showFilters?: boolean;
  onComponentSelect?: (component: ComponentRecommendation) => void;
}

export function ComponentRecommendations({ 
  className = "",
  maxRecommendations = 10,
  showFilters = true,
  onComponentSelect
}: ComponentRecommendationsProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const { recommendations, isLoading, hasDomain, domainConfidence } = useDomainRecommendations(selectedFilter);

  if (!hasDomain) {
    return (
      <div className={`w-full border rounded-lg p-4 bg-white shadow-sm ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-4 h-4 bg-gray-400 rounded opacity-50">⚡</span>
          <h3 className="font-medium text-base">Component Recommendations</h3>
        </div>
        <div className="text-center py-4 text-gray-500">
          <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded opacity-50 flex items-center justify-center">
            ⚡
          </div>
          <p className="text-sm">
            Activate domain expertise to get personalized component recommendations.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`w-full border rounded-lg p-4 bg-white shadow-sm ${className}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-4 h-4 text-blue-600 animate-pulse">⚡</span>
          <h3 className="font-medium text-base">Component Recommendations</h3>
          <span className="text-xs text-gray-500 animate-pulse">Loading...</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const displayedRecommendations = recommendations.slice(0, maxRecommendations);
  const availableFilters = Array.from(new Set(recommendations.flatMap(r => r.usagePatterns)));

  return (
    <div className={`w-full border rounded-lg p-4 bg-white shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 text-blue-600">⚡</span>
          <h3 className="font-medium text-base">Component Recommendations</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            {recommendations.length} available
          </span>
        </div>
        <div className="text-xs text-gray-500">
          {Math.round(domainConfidence * 100)}% confidence
        </div>
      </div>

      {/* Filters */}
      {showFilters && availableFilters.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSelectedFilter('')}
              className={`px-2 py-1 text-xs rounded border ${
                selectedFilter === '' 
                  ? 'bg-blue-100 text-blue-800 border-blue-200' 
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {availableFilters.slice(0, 6).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-2 py-1 text-xs rounded border capitalize ${
                  selectedFilter === filter 
                    ? 'bg-blue-100 text-blue-800 border-blue-200' 
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {filter.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations List */}
      {displayedRecommendations.length === 0 ? (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">
            No recommendations found{selectedFilter ? ` for "${selectedFilter}"` : ''}.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedRecommendations.map((recommendation, index) => (
            <ComponentRecommendationCard
              key={`${recommendation.name}-${index}`}
              recommendation={recommendation}
              onClick={onComponentSelect}
            />
          ))}
        </div>
      )}

      {/* Show more indicator */}
      {recommendations.length > maxRecommendations && (
        <div className="text-center pt-3 border-t">
          <span className="text-xs text-gray-500">
            Showing {maxRecommendations} of {recommendations.length} recommendations
          </span>
        </div>
      )}
    </div>
  );
}

interface ComponentRecommendationCardProps {
  recommendation: ComponentRecommendation;
  onClick?: (component: ComponentRecommendation) => void;
}

function ComponentRecommendationCard({ recommendation, onClick }: ComponentRecommendationCardProps) {
  const relevanceBarWidth = Math.round(recommendation.relevanceScore * 100);
  const sourceColor = getSourceColor(recommendation.source);
  
  return (
    <div 
      className={`border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={() => onClick?.(recommendation)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm">{recommendation.name}</h4>
            {recommendation.domainSpecific && (
              <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                Domain Specific
              </span>
            )}
            <span className={`text-xs px-1.5 py-0.5 rounded ${sourceColor}`}>
              {recommendation.source}
            </span>
          </div>
          <p className="text-xs text-gray-600 mb-2">{recommendation.description}</p>
        </div>
        <div className="text-right ml-3">
          <div className="text-xs font-medium mb-1">
            {Math.round(recommendation.relevanceScore * 100)}%
          </div>
          <div className="w-12 h-1 bg-gray-200 rounded" data-relevance={relevanceBarWidth}>
            <div className="h-full bg-blue-600 rounded transition-all duration-300 relevance-bar"></div>
          </div>
        </div>
      </div>
      
      {recommendation.usagePatterns.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {recommendation.usagePatterns.slice(0, 4).map((pattern, index) => (
            <span 
              key={index}
              className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200"
            >
              {pattern.replace(/-/g, ' ')}
            </span>
          ))}
          {recommendation.usagePatterns.length > 4 && (
            <span className="text-xs text-gray-500 px-1.5 py-0.5">
              +{recommendation.usagePatterns.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function getSourceColor(source: string): string {
  switch (source) {
    case 'langflow':
      return 'bg-blue-100 text-blue-800';
    case 'custom':
      return 'bg-purple-100 text-purple-800';
    case 'external':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export default ComponentRecommendations;
