// Epic 6.4 Story 6.4.1 - Domain Detector Component
// React component for displaying domain detection status and expertise activation

import React, { useState, useEffect } from 'react';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { DomainContext } from '../../../lib/enhanced/domainExpertise.types';

interface DomainDetectorProps {
  onDomainChange?: (domain: string, confidence: number) => void;
  showConfidence?: boolean;
  showCompliance?: boolean;
  className?: string;
}

interface DomainDetectionState {
  isDetecting: boolean;
  currentDomain: string | null;
  confidence: number;
  expertiseAreas: string[];
  complianceRequirements: string[];
  lastDetection: string | null;
  activationStatus: 'inactive' | 'detecting' | 'activated' | 'failed';
}

export function DomainDetector({ 
  onDomainChange, 
  showConfidence = true, 
  showCompliance = true,
  className = ''
}: DomainDetectorProps) {
  const [detectionState, setDetectionState] = useState<DomainDetectionState>({
    isDetecting: false,
    currentDomain: null,
    confidence: 0,
    expertiseAreas: [],
    complianceRequirements: [],
    lastDetection: null,
    activationStatus: 'inactive'
  });

  // Make domain context readable by CopilotKit
  useCopilotReadable({
    description: "Current domain detection status and expertise activation state",
    value: {
      domain: detectionState.currentDomain,
      confidence: detectionState.confidence,
      expertise_areas: detectionState.expertiseAreas,
      compliance_requirements: detectionState.complianceRequirements,
      activation_status: detectionState.activationStatus,
      last_detection: detectionState.lastDetection
    }
  });

  // CopilotKit action for triggering domain detection
  useCopilotAction({
    name: "trigger_domain_detection",
    description: "Manually trigger domain detection based on current conversation",
    parameters: {
      force_redetection: {
        type: "boolean",
        description: "Force re-detection even if domain was previously detected",
        optional: true
      }
    },
    handler: async ({ force_redetection = false }) => {
      setDetectionState(prev => ({
        ...prev,
        isDetecting: true,
        activationStatus: 'detecting'
      }));

      try {
        // This would integrate with the domain detection action
        // For now, simulating detection process
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real implementation, this would call the domain detection service
        const mockDetection = {
          domain: 'healthcare',
          confidence: 0.85,
          expertise_areas: ['patient_data_handler', 'fhir_integration'],
          compliance_requirements: ['HIPAA'],
          timestamp: new Date().toISOString()
        };

        setDetectionState(prev => ({
          ...prev,
          isDetecting: false,
          currentDomain: mockDetection.domain,
          confidence: mockDetection.confidence,
          expertiseAreas: mockDetection.expertise_areas,
          complianceRequirements: mockDetection.compliance_requirements,
          lastDetection: mockDetection.timestamp,
          activationStatus: mockDetection.confidence >= 0.6 ? 'activated' : 'inactive'
        }));

        // Notify parent component of domain change
        if (onDomainChange) {
          onDomainChange(mockDetection.domain, mockDetection.confidence);
        }

        return {
          success: true,
          domain: mockDetection.domain,
          confidence: mockDetection.confidence,
          activation_status: mockDetection.confidence >= 0.6 ? 'activated' : 'inactive'
        };

      } catch (error) {
        setDetectionState(prev => ({
          ...prev,
          isDetecting: false,
          activationStatus: 'failed'
        }));

        return {
          success: false,
          error: 'Domain detection failed',
          activation_status: 'failed'
        };
      }
    }
  });

  // Auto-detect domain on component mount
  useEffect(() => {
    // Auto-trigger detection when component mounts
    // This would typically be triggered by conversation changes
    const autoDetect = async () => {
      // Simulate auto-detection after component mount
      setTimeout(() => {
        setDetectionState(prev => ({
          ...prev,
          isDetecting: true,
          activationStatus: 'detecting'
        }));
      }, 1000);
    };

    autoDetect();
  }, []);

  const getStatusIcon = () => {
    switch (detectionState.activationStatus) {
      case 'inactive':
        return '⚪';
      case 'detecting':
        return '🔄';
      case 'activated':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStatusColor = () => {
    switch (detectionState.activationStatus) {
      case 'inactive':
        return 'text-gray-500';
      case 'detecting':
        return 'text-blue-500';
      case 'activated':
        return 'text-green-600';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatDomainName = (domain: string | null) => {
    if (!domain) return 'No domain detected';
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  return (
    <div className={`domain-detector bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon()}</span>
          <h3 className="text-sm font-medium text-gray-900">Domain Expertise</h3>
        </div>
        
        {detectionState.isDetecting && (
          <div className="flex items-center space-x-1 text-blue-500">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            <span className="text-xs">Detecting...</span>
          </div>
        )}
      </div>

      {/* Domain Status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Detected Domain:</span>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {formatDomainName(detectionState.currentDomain)}
          </span>
        </div>

        {showConfidence && detectionState.confidence > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Confidence:</span>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${detectionState.confidence * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-500">
                {formatConfidence(detectionState.confidence)}
              </span>
            </div>
          </div>
        )}

        {/* Expertise Areas */}
        {detectionState.expertiseAreas.length > 0 && (
          <div className="mt-3">
            <span className="text-sm text-gray-600 block mb-1">Active Expertise:</span>
            <div className="flex flex-wrap gap-1">
              {detectionState.expertiseAreas.map((area, index) => (
                <span 
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  {area.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Compliance Requirements */}
        {showCompliance && detectionState.complianceRequirements.length > 0 && (
          <div className="mt-3">
            <span className="text-sm text-gray-600 block mb-1">Compliance Required:</span>
            <div className="flex flex-wrap gap-1">
              {detectionState.complianceRequirements.map((requirement, index) => (
                <span 
                  key={index}
                  className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full"
                >
                  {requirement}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last Detection Time */}
        {detectionState.lastDetection && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Last detection: {new Date(detectionState.lastDetection).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Manual Detection Button */}
      <div className="mt-4">
        <button
          onClick={() => {
            // Trigger manual detection through CopilotKit action
            setDetectionState(prev => ({
              ...prev,
              isDetecting: true,
              activationStatus: 'detecting'
            }));
          }}
          disabled={detectionState.isDetecting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm py-2 px-3 rounded-md transition-colors duration-200"
        >
          {detectionState.isDetecting ? 'Detecting Domain...' : 'Re-detect Domain'}
        </button>
      </div>
    </div>
  );
}

export default DomainDetector;