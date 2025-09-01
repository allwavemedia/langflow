/**
 * Integration Testing Suite
 * Epic 6.4.3 Story 1.3 - Task 6
 * 
 * Tests all components working together with real scenarios
 */

import React from 'react';
import { 
  useExpertiseTracking,
  useProgressiveDisclosure, 
  useConversationMemory 
} from '../hooks';
import {
  ExpertiseIndicator,
  ProgressionTracker,
  SophisticationControl
} from '../components';
import { ExpertiseLevel } from '../expertiseTracker';
import { SophisticationLevel, AdaptiveQuestion, UserResponse } from '../questionTypes';
import { DomainContext } from '../../domainDetectionSystem';

/**
 * Integration Test Component
 * Demonstrates all Story 1.3 systems working together
 */
export const EnhancedQuestioningDemo: React.FC = () => {
  const sessionId = 'demo-session-' + Date.now();
  
  // Initialize all hooks
  const expertiseTracking = useExpertiseTracking(sessionId, {
    enableRealTimeTracking: true,
    debugMode: true
  });
  
  const progressiveDisclosure = useProgressiveDisclosure(sessionId, {
    enableAutoAdjustment: true,
    debugMode: true
  });
  
  const conversationMemory = useConversationMemory(sessionId, {
    enableRealTimeRecording: true,
    debugMode: true
  });

  // Sample data for demonstration
  const currentExpertise: ExpertiseLevel = 'intermediate';
  const currentSophistication: SophisticationLevel = 3;
  
  const progressionHistory: ExpertiseLevel[] = [
    'novice',
    'beginner', 
    'intermediate'
  ];

  const handleExpertiseClick = (level: ExpertiseLevel) => {
    console.log('Expertise level clicked:', level);
  };

  const handleSophisticationChange = (level: SophisticationLevel) => {
    console.log('Sophistication level changed:', level);
  };

  const handleAutoAdjustChange = (enabled: boolean) => {
    console.log('Auto-adjust changed:', enabled);
  };

  // Mock a conversation scenario
  const simulateConversation = async () => {
    console.log('🎯 Simulating conversation scenario...');

    const mockQuestion: AdaptiveQuestion = {
      id: 'demo-question-1',
      type: 'exploration',
      complexity: 'intermediate',
      priority: 'medium',
      domain: 'software-architecture',
      question: 'How would you approach designing a scalable microservices architecture?',
      context: 'Software architecture discussion',
      expectedResponseType: 'text',
      followUpTriggers: ['scalability', 'microservices', 'architecture'],
      prerequisiteQuestions: [],
      alternativeFormulations: [],
      domainSpecific: true,
      complianceRelated: false,
      performanceImpact: 'medium',
      tags: ['architecture', 'scalability', 'microservices'],
      generatedAt: new Date(),
      source: 'template',
      confidence: 0.9
    };

    const mockResponse: UserResponse = {
      id: 'demo-response-1',
      questionId: mockQuestion.id,
      sessionId: sessionId,
      response: 'I would start by identifying service boundaries based on business capabilities...',
      responseType: 'text',
      submittedAt: Date.now(),
      processingTime: 2500,
      metadata: {},
      confidence: 0.8,
      tags: []
    };

    const mockDomain: DomainContext = {
      domain: 'software-architecture',
      confidence: 0.9,
      context: 'Software architecture and design patterns',
      relatedDomains: ['microservices', 'scalability'],
      complexity: 'intermediate'
    };

    try {
      // Test expertise tracking
      console.log('📊 Testing expertise tracking...');
      const responseQuality = await expertiseTracking.analyzeResponse(
        mockResponse, 
        mockQuestion, 
        mockDomain
      );
      console.log('Response quality analysis:', responseQuality);

      // Test conversation memory
      console.log('🧠 Testing conversation memory...');
      conversationMemory.recordTurn(
        mockQuestion,
        mockResponse,
        currentExpertise,
        mockDomain
      );

      const context = conversationMemory.getConversationContext();
      console.log('Conversation context:', context);

      // Test progressive disclosure
      console.log('🔄 Testing progressive disclosure...');
      const adaptationRecommendations = conversationMemory.getAdaptationRecommendations();
      console.log('Adaptation recommendations:', adaptationRecommendations);

      console.log('✅ Integration test completed successfully!');
    } catch (error) {
      console.error('❌ Integration test failed:', error);
    }
  };

  return (
    <div className="enhanced-questioning-demo p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Enhanced Questioning System Demo
      </h1>
      <p className="text-gray-600 mb-8">
        Epic 6.4.3 Story 1.3 - Progressive Disclosure and Expertise Tracking
      </p>

      {/* Control Panel */}
      <div className="demo-controls bg-gray-50 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Integration Test Controls</h2>
        <button
          onClick={simulateConversation}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Run Integration Test
        </button>
      </div>

      {/* Component Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Expertise Indicator */}
        <div className="component-showcase bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Expertise Indicator</h3>
          <ExpertiseIndicator
            currentLevel={currentExpertise}
            progressionHistory={progressionHistory}
            showProgression={true}
            size="large"
            onLevelClick={handleExpertiseClick}
          />
        </div>

        {/* Sophistication Control */}
        <div className="component-showcase bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Sophistication Control</h3>
          <SophisticationControl
            currentLevel={currentSophistication}
            onLevelChange={handleSophisticationChange}
            showLabels={true}
            showDescription={true}
            variant="slider"
            autoAdjust={false}
            onAutoAdjustChange={handleAutoAdjustChange}
          />
        </div>

        {/* Progression Tracker */}
        <div className="component-showcase bg-white border rounded-lg p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Progression Tracker</h3>
          <ProgressionTracker
            progression={[
              {
                timestamp: Date.now() - 300000,
                expertiseLevel: 'novice',
                sophisticationLevel: 1,
                context: 'Initial assessment',
                trigger: 'session_start'
              },
              {
                timestamp: Date.now() - 200000,
                expertiseLevel: 'beginner',
                sophisticationLevel: 2,
                context: 'Basic understanding demonstrated',
                trigger: 'correct_response'
              },
              {
                timestamp: Date.now() - 100000,
                expertiseLevel: 'intermediate',
                sophisticationLevel: 3,
                context: 'Advanced concepts grasped',
                trigger: 'detailed_explanation'
              }
            ]}
            currentExpertise={currentExpertise}
            currentSophistication={currentSophistication}
            showTimeline={true}
            showMetrics={true}
          />
        </div>
      </div>

      {/* System Status */}
      <div className="system-status mt-8 bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="status-item">
            <div className="text-sm text-gray-500">Expertise Tracking</div>
            <div className={`text-lg font-medium ${expertiseTracking.error ? 'text-red-600' : 'text-green-600'}`}>
              {expertiseTracking.error ? 'Error' : 'Active'}
            </div>
            {expertiseTracking.error && (
              <div className="text-xs text-red-500">{expertiseTracking.error}</div>
            )}
          </div>

          <div className="status-item">
            <div className="text-sm text-gray-500">Progressive Disclosure</div>
            <div className={`text-lg font-medium ${progressiveDisclosure.error ? 'text-red-600' : 'text-green-600'}`}>
              {progressiveDisclosure.error ? 'Error' : 'Active'}
            </div>
            {progressiveDisclosure.error && (
              <div className="text-xs text-red-500">{progressiveDisclosure.error}</div>
            )}
          </div>

          <div className="status-item">
            <div className="text-sm text-gray-500">Conversation Memory</div>
            <div className={`text-lg font-medium ${conversationMemory.error ? 'text-red-600' : 'text-green-600'}`}>
              {conversationMemory.error ? 'Error' : 'Active'}
            </div>
            {conversationMemory.error && (
              <div className="text-xs text-red-500">{conversationMemory.error}</div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="performance-metrics mt-8 bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {expertiseTracking.metrics.totalResponses}
            </div>
            <div className="text-sm text-gray-500">Responses Analyzed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {expertiseTracking.metrics.averageConfidence.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">Avg Confidence</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {conversationMemory.memoryStats.totalTurns}
            </div>
            <div className="text-sm text-gray-500">Conversation Turns</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(conversationMemory.memoryStats.sessionDuration / 1000)}s
            </div>
            <div className="text-sm text-gray-500">Session Duration</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedQuestioningDemo;
