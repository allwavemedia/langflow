// Test file for Epic 6.4.3 Story 1.3: Expertise Tracker
// Comprehensive testing for user expertise level detection and tracking

import { DynamicExpertiseTracker, UserResponse } from '../expertiseTracker';
import { AdaptiveQuestion } from '../questionTypes';
import { DomainContext } from '../../domainDetectionSystem';

describe('DynamicExpertiseTracker', () => {
  let tracker: DynamicExpertiseTracker;
  let mockDomainContext: DomainContext;
  let mockQuestion: AdaptiveQuestion;

  beforeEach(() => {
    tracker = new DynamicExpertiseTracker({
      minResponsesForAssessment: 2,
      expertiseCalculationWindow: 5,
      confusionThreshold: 0.3,
      progressionThreshold: 0.2,
      maxResponseHistory: 20,
      enablePerformanceLogging: false
    });

    mockDomainContext = {
      domain: 'web-development',
      confidence: 0.9,
      indicators: ['react', 'typescript', 'nextjs'],
      timestamp: new Date(),
      source: 'conversation',
      knowledgeSynthesis: {
        concepts: ['components', 'hooks', 'state management'],
        technologies: ['React', 'TypeScript', 'Next.js'],
        bestPractices: ['component composition', 'type safety'],
        commonPatterns: ['custom hooks', 'context patterns']
      }
    } as DomainContext;

    mockQuestion = {
      id: 'test-question-1',
      type: 'clarifying',
      complexity: 'intermediate',
      priority: 'medium',
      domain: 'web-development',
      question: 'How would you implement state management in a React application?',
      context: 'Testing expertise level',
      expectedResponseType: 'text',
      followUpTriggers: [],
      prerequisiteQuestions: [],
      alternativeFormulations: [],
      domainSpecific: true,
      complianceRelated: false,
      performanceImpact: 'minimal',
      tags: ['state', 'react'],
      generatedAt: new Date(),
      source: 'dynamic',
      confidence: 0.8
    } as AdaptiveQuestion;
  });

  describe('Response Analysis', () => {
    test('should analyze novice response correctly', () => {
      const noviceResponse: UserResponse = {
        id: 'resp-1',
        text: 'I think you use useState for state in React',
        questionId: 'test-question-1',
        timestamp: new Date(),
        responseTime: 15000,
        domain: 'web-development',
        metadata: {
          wordCount: 8,
          technicalTerms: ['useState', 'state', 'React'],
          codeSnippets: 0,
          questionsAsked: 0,
          clarificationRequests: 0
        }
      };

      const quality = tracker.analyzeUserResponse(noviceResponse, mockQuestion, mockDomainContext);

      expect(quality.score).toBeGreaterThan(0);
      expect(quality.score).toBeLessThan(0.6); // Should be on lower end for basic response
      expect(quality.confusionSignals).toBe(false);
      expect(quality.recommendedAction).toBe('maintain');
    });

    test('should analyze expert response correctly', () => {
      const expertResponse: UserResponse = {
        id: 'resp-2',
        text: 'For state management in React, I would evaluate the complexity of the application first. For simple local state, useState and useReducer are sufficient. For complex global state, I would consider Redux Toolkit with RTK Query for server state, or Zustand for lighter global state management. The choice depends on factors like team familiarity, bundle size constraints, and whether we need time-travel debugging capabilities.',
        questionId: 'test-question-1',
        timestamp: new Date(),
        responseTime: 45000,
        domain: 'web-development',
        metadata: {
          wordCount: 58,
          technicalTerms: ['useState', 'useReducer', 'Redux', 'RTK', 'Zustand', 'bundle', 'debugging'],
          codeSnippets: 0,
          questionsAsked: 0,
          clarificationRequests: 0
        }
      };

      const quality = tracker.analyzeUserResponse(expertResponse, mockQuestion, mockDomainContext);

      expect(quality.score).toBeGreaterThan(0.7); // Should be high for expert response
      expect(quality.confusionSignals).toBe(false);
      expect(quality.recommendedAction).toEqual('increase');
    });

    test('should detect confusion signals', () => {
      const confusedResponses: UserResponse[] = [
        {
          id: 'resp-confused-1',
          text: 'I\'m not sure what you mean by state management. Can you help?',
          questionId: 'test-question-1',
          timestamp: new Date(),
          responseTime: 3000,
          domain: 'web-development',
          metadata: {
            wordCount: 11,
            technicalTerms: [],
            codeSnippets: 0,
            questionsAsked: 1,
            clarificationRequests: 1
          }
        },
        {
          id: 'resp-confused-2', 
          text: 'Um... state? I don\'t understand.',
          questionId: 'test-question-2',
          timestamp: new Date(),
          responseTime: 2000,
          domain: 'web-development',
          metadata: {
            wordCount: 6,
            technicalTerms: [],
            codeSnippets: 0,
            questionsAsked: 0,
            clarificationRequests: 0
          }
        }
      ];

      const hasConfusion = tracker.detectConfusionSignals(confusedResponses);
      expect(hasConfusion).toBe(true);
    });
  });

  describe('Expertise Level Tracking', () => {
    test('should start with beginner level', () => {
      const level = tracker.getCurrentExpertiseLevel('web-development');
      expect(level).toBe('beginner');
    });

    test('should update expertise level with sufficient responses', () => {
      // Add multiple high-quality responses
      const responses = [
        {
          id: 'resp-1',
          text: 'I would use Redux Toolkit with createSlice for predictable state management, implementing proper normalization patterns and using RTK Query for server state synchronization.',
          questionId: 'q1',
          timestamp: new Date(),
          responseTime: 30000,
          domain: 'web-development',
          metadata: {
            wordCount: 23,
            technicalTerms: ['Redux', 'createSlice', 'normalization', 'RTK Query'],
            codeSnippets: 0,
            questionsAsked: 0,
            clarificationRequests: 0
          }
        },
        {
          id: 'resp-2',
          text: 'For performance optimization, I would implement memoization with React.memo and useMemo, use React.lazy for code splitting, and optimize bundle size with tree shaking.',
          questionId: 'q2', 
          timestamp: new Date(),
          responseTime: 25000,
          domain: 'web-development',
          metadata: {
            wordCount: 26,
            technicalTerms: ['memoization', 'React.memo', 'useMemo', 'React.lazy', 'tree shaking'],
            codeSnippets: 0,
            questionsAsked: 0,
            clarificationRequests: 0
          }
        },
        {
          id: 'resp-3',
          text: 'I would implement proper TypeScript interfaces with generic constraints, use discriminated unions for type safety, and leverage conditional types for advanced type manipulation.',
          questionId: 'q3',
          timestamp: new Date(), 
          responseTime: 28000,
          domain: 'web-development',
          metadata: {
            wordCount: 24,
            technicalTerms: ['TypeScript', 'generic', 'discriminated unions', 'conditional types'],
            codeSnippets: 0,
            questionsAsked: 0,
            clarificationRequests: 0
          }
        }
      ];

      responses.forEach(response => {
        tracker.analyzeUserResponse(response, mockQuestion, mockDomainContext);
      });

      const newLevel = tracker.getCurrentExpertiseLevel('web-development');
      expect(['intermediate', 'advanced', 'expert']).toContain(newLevel);
    });

    test('should maintain progression history', () => {
      tracker.updateExpertiseProgression('user1', 'web-development', 'intermediate', 0.8, 'Test progression');
      
      const history = tracker.getProgressionHistory('web-development');
      expect(history).toHaveLength(1);
      expect(history[0].newLevel).toBe('intermediate');
      expect(history[0].domain).toBe('web-development');
    });
  });

  describe('Progressive Complexity', () => {
    test('should recommend appropriate sophistication level', () => {
      const responses: UserResponse[] = [
        {
          id: 'resp-1',
          text: 'Advanced TypeScript patterns with conditional types',
          questionId: 'q1',
          timestamp: new Date(),
          responseTime: 20000,
          domain: 'web-development',
          metadata: {
            wordCount: 7,
            technicalTerms: ['TypeScript', 'conditional types'],
            codeSnippets: 0,
            questionsAsked: 0,
            clarificationRequests: 0
          }
        }
      ];

      const sophistication = tracker.getProgressiveComplexity('advanced', responses);
      expect(sophistication).toBeGreaterThanOrEqual(3);
      expect(sophistication).toBeLessThanOrEqual(5);
    });

    test('should scale sophistication based on expertise level', () => {
      const noviceSophistication = tracker.getProgressiveComplexity('novice', []);
      const expertSophistication = tracker.getProgressiveComplexity('expert', []);

      expect(noviceSophistication).toBeLessThan(expertSophistication);
      expect(noviceSophistication).toBe(1);
      expect(expertSophistication).toBe(5);
    });
  });

  describe('Performance and Memory Management', () => {
    test('should respect response history limits', () => {
      const tracker = new DynamicExpertiseTracker({ maxResponseHistory: 3 });
      
      // Add more responses than the limit
      for (let i = 0; i < 5; i++) {
        const response: UserResponse = {
          id: `resp-${i}`,
          text: `Response ${i}`,
          questionId: 'q1',
          timestamp: new Date(),
          responseTime: 10000,
          domain: 'web-development',
          metadata: {
            wordCount: 2,
            technicalTerms: [],
            codeSnippets: 0,
            questionsAsked: 0,
            clarificationRequests: 0
          }
        };
        tracker.analyzeUserResponse(response, mockQuestion, mockDomainContext);
      }

      // Should only keep the last 3 responses
      const history = tracker.getProgressionHistory();
      expect(history.length).toBeLessThanOrEqual(3);
    });

    test('should handle performance threshold monitoring', () => {
      const tracker = new DynamicExpertiseTracker({ 
        maxAnalysisTimeMs: 1,
        enablePerformanceLogging: true 
      });

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const response: UserResponse = {
        id: 'resp-1',
        text: 'Test response for performance monitoring',
        questionId: 'q1',
        timestamp: new Date(),
        responseTime: 10000,
        domain: 'web-development',
        metadata: {
          wordCount: 6,
          technicalTerms: [],
          codeSnippets: 0,
          questionsAsked: 0,
          clarificationRequests: 0
        }
      };

      tracker.analyzeUserResponse(response, mockQuestion, mockDomainContext);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Domain-Specific Analysis', () => {
    test('should analyze different domains independently', () => {
      const webResponse: UserResponse = {
        id: 'web-resp',
        text: 'React hooks and component state management with TypeScript',
        questionId: 'q1',
        timestamp: new Date(),
        responseTime: 15000,
        domain: 'web-development',
        metadata: {
          wordCount: 8,
          technicalTerms: ['React', 'hooks', 'TypeScript'],
          codeSnippets: 0,
          questionsAsked: 0,
          clarificationRequests: 0
        }
      };

      const dataResponse: UserResponse = {
        id: 'data-resp',
        text: 'Machine learning algorithms and neural network optimization',
        questionId: 'q2',
        timestamp: new Date(),
        responseTime: 18000,
        domain: 'data-science',
        metadata: {
          wordCount: 7,
          technicalTerms: ['algorithms', 'neural network', 'optimization'],
          codeSnippets: 0,
          questionsAsked: 0,
          clarificationRequests: 0
        }
      };

      tracker.analyzeUserResponse(webResponse, mockQuestion, mockDomainContext);
      tracker.analyzeUserResponse(dataResponse, mockQuestion, { ...mockDomainContext, domain: 'data-science' });

      const webLevel = tracker.getCurrentExpertiseLevel('web-development');
      const dataLevel = tracker.getCurrentExpertiseLevel('data-science');

      expect(webLevel).toBe('beginner'); // Should have separate tracking
      expect(dataLevel).toBe('beginner');
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid responses gracefully', () => {
      const invalidResponse = {
        id: 'invalid',
        text: '',
        questionId: 'q1',
        timestamp: new Date(),
        responseTime: 0,
        domain: 'unknown-domain'
      } as UserResponse;

      expect(() => {
        tracker.analyzeUserResponse(invalidResponse, mockQuestion, mockDomainContext);
      }).not.toThrow();
    });

    test('should provide default quality metrics on error', () => {
      const errorTracker = new DynamicExpertiseTracker();
      
      // Mock a scenario that might cause analysis to fail
      const problemResponse: UserResponse = {
        id: 'problem',
        text: '', // Empty string that might cause issues
        questionId: 'q1',
        timestamp: new Date(),
        responseTime: 10000,
        domain: 'web-development',
        metadata: {
          wordCount: 0,
          technicalTerms: [],
          codeSnippets: 0,
          questionsAsked: 0,
          clarificationRequests: 0
        }
      };

      const quality = errorTracker.analyzeUserResponse(problemResponse, mockQuestion, mockDomainContext);
      
      expect(quality.score).toBe(0.5); // Default fallback score
      expect(quality.recommendedAction).toBe('maintain');
    });
  });
});
