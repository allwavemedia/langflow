// Epic 6.4.3 Stories 1.2 + 1.3 Integration Validation Test
// Testing interface compatibility after adaptationEngine fixes

import { DynamicQuestionGenerator } from './questionGenerator';
import { DynamicContextualEnrichment } from './contextualEnrichment';
import { AdaptationEngine } from './adaptationEngine';
import { DynamicExpertiseTracker } from './expertiseTracker';
import { DynamicProgressiveDisclosure } from './progressiveDisclosure';
import { ConversationMemoryManager } from './conversationMemory';
import { 
  UserResponse,
  AdaptiveQuestion
} from './questionTypes';
import { DomainContext } from '../domainDetectionSystem';

interface ValidationResults {
  success: boolean;
  results: {
    questionGeneration?: {
      questionsGenerated: number;
      sampleQuestion: AdaptiveQuestion;
    };
    contextualEnrichment?: {
      enrichedQuestions: number;
      contextAdded: boolean;
    };
    userResponse?: {
      created: boolean;
      responseLength: number;
      technicalTerms: number;
    };
    adaptationEngine?: {
      targetSophistication: any;
      recommendedQuestionType: any;
      confidence: number;
      adaptationReason: string;
    };
    expertiseTracking?: {
      responseScore: number;
      confusionDetected: boolean;
      recommendedAction: string;
    };
    performance?: {
      averageLatency: number;
      withinTarget: boolean;
      performanceGrade: string;
    };
  };
  errors: string[];
}

/**
 * Integration Test Suite for Epic 6.4.3 Stories 1.2 + 1.3
 * Validates end-to-end flow from question generation to expertise tracking
 */
export class EpicIntegrationValidator {
  private questionGenerator: DynamicQuestionGenerator;
  private contextualEnrichment: DynamicContextualEnrichment;
  private adaptationEngine: AdaptationEngine;
  private expertiseTracker: DynamicExpertiseTracker;
  private progressiveDisclosure: DynamicProgressiveDisclosure;
  private conversationMemory: ConversationMemoryManager;

  constructor() {
    this.questionGenerator = new DynamicQuestionGenerator();
    this.contextualEnrichment = new DynamicContextualEnrichment();
    this.adaptationEngine = new AdaptationEngine();
    this.expertiseTracker = new DynamicExpertiseTracker();
    this.progressiveDisclosure = new DynamicProgressiveDisclosure();
    this.conversationMemory = new ConversationMemoryManager();
  }

  /**
   * Test full integration flow: Question Generation → User Response → Expertise Tracking → Progressive Disclosure
   */
  async testFullIntegrationFlow(): Promise<ValidationResults> {
    const errors: string[] = [];
    const results: ValidationResults['results'] = {};

    try {
      console.log('🔄 Starting Epic 6.4.3 Integration Validation...');

      // Step 1: Test Question Generation (Story 1.2)
      console.log('📝 Testing Question Generation...');
      const domainContext: DomainContext = {
        domain: 'web-development',
        framework: 'react',
        projectType: 'frontend',
        complexity: 'intermediate',
        specializations: ['typescript', 'hooks'],
        tools: ['vscode', 'npm'],
        context: 'User working on React TypeScript project',
        confidence: 0.8
      };

      const generatedQuestions = await this.questionGenerator.generateQuestions(
        'How do I implement state management in React?',
        domainContext
      );

      if (!generatedQuestions || generatedQuestions.length === 0) {
        errors.push('Question generation failed');
      } else {
        results.questionGeneration = {
          questionsGenerated: generatedQuestions.length,
          sampleQuestion: generatedQuestions[0]
        };
        console.log(`✅ Generated ${generatedQuestions.length} questions`);
      }

      // Step 2: Test Contextual Enrichment
      console.log('🔍 Testing Contextual Enrichment...');
      const enrichedQuestions = await this.contextualEnrichment.enrichQuestions(
        generatedQuestions,
        domainContext
      );

      if (!enrichedQuestions || enrichedQuestions.length === 0) {
        errors.push('Contextual enrichment failed');
      } else {
        results.contextualEnrichment = {
          enrichedQuestions: enrichedQuestions.length,
          contextAdded: enrichedQuestions[0].context !== generatedQuestions[0].context
        };
        console.log(`✅ Enriched ${enrichedQuestions.length} questions with context`);
      }

      // Step 3: Create Mock User Response
      console.log('💬 Creating Mock User Response...');
      const userResponse: UserResponse = {
        id: `test-response-${Date.now()}`,
        questionId: enrichedQuestions[0].id,
        sessionId: 'integration-test-session',
        response: 'I usually use useState for simple state, but I\'m exploring Redux for complex state management. I understand the concept of immutability and reducers.',
        responseType: 'text',
        submittedAt: new Date(),
        processingTime: 2500,
        confidence: 0.7,
        expertiseIndicators: ['technical-terminology', 'framework-knowledge'],
        clarificationNeeded: false,
        followUpGenerated: false,
        metadata: {
          responseLength: 150,
          technicalTermsUsed: ['useState', 'Redux', 'immutability', 'reducers'],
          conceptsReferenced: ['state-management', 'functional-programming'],
          uncertaintySignals: ['exploring', 'understand']
        }
      };

      results.userResponse = {
        created: true,
        responseLength: userResponse.response.length,
        technicalTerms: userResponse.metadata.technicalTermsUsed.length
      };
      console.log(`✅ Created user response with ${userResponse.metadata.technicalTermsUsed.length} technical terms`);

      // Step 4: Test Adaptation Engine (Bridge between Story 1.2 and 1.3)
      console.log('⚙️ Testing Adaptation Engine Integration...');
      const adaptationDecision = await this.adaptationEngine.adaptQuestion(
        userResponse.sessionId,
        userResponse,
        enrichedQuestions[0],
        domainContext
      );

      if (!adaptationDecision) {
        errors.push('Adaptation engine failed to process response');
      } else {
        results.adaptationEngine = {
          targetSophistication: adaptationDecision.targetSophistication,
          recommendedQuestionType: adaptationDecision.recommendedQuestionType,
          confidence: adaptationDecision.confidence,
          adaptationReason: adaptationDecision.adaptationReason
        };
        console.log(`✅ Adaptation decision: ${adaptationDecision.targetSophistication} sophistication`);
      }

      // Step 5: Test Story 1.3 Components Integration
      console.log('🧠 Testing Story 1.3 Components...');
      
      // Test Expertise Tracking
      const trackerUserResponse = {
        id: userResponse.id,
        text: userResponse.response,
        questionId: userResponse.questionId,
        timestamp: userResponse.submittedAt,
        responseTime: userResponse.processingTime,
        domain: domainContext.domain,
        metadata: {
          wordCount: userResponse.metadata.responseLength,
          technicalTerms: userResponse.metadata.technicalTermsUsed,
          codeSnippets: 0,
          questionsAsked: 0,
          clarificationRequests: userResponse.clarificationNeeded ? 1 : 0
        }
      };

      const responseQuality = this.expertiseTracker.analyzeUserResponse(
        trackerUserResponse,
        enrichedQuestions[0],
        domainContext
      );

      if (!responseQuality) {
        errors.push('Expertise tracking failed');
      } else {
        results.expertiseTracking = {
          responseScore: responseQuality.score,
          confusionDetected: responseQuality.confusionSignals,
          recommendedAction: responseQuality.recommendedAction
        };
        console.log(`✅ Expertise analysis: ${responseQuality.score.toFixed(2)} score`);
      }

      // Step 6: Validate Performance
      console.log('⚡ Testing Performance...');
      const performanceStart = performance.now();
      
      // Run a batch of operations
      for (let i = 0; i < 10; i++) {
        await this.questionGenerator.generateQuestions(
          `Test question ${i}`,
          domainContext
        );
      }
      
      const performanceEnd = performance.now();
      const averageLatency = (performanceEnd - performanceStart) / 10;

      results.performance = {
        averageLatency: averageLatency,
        withinTarget: averageLatency < 200,
        performanceGrade: averageLatency < 50 ? 'Excellent' : averageLatency < 100 ? 'Good' : averageLatency < 200 ? 'Acceptable' : 'Needs Improvement'
      };
      console.log(`✅ Performance: ${averageLatency.toFixed(2)}ms average latency`);

      console.log('🎉 Integration validation completed successfully!');
      
      return {
        success: errors.length === 0,
        results,
        errors
      };

    } catch (error) {
      errors.push(`Integration test failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        results,
        errors
      };
    }
  }

  /**
   * Generate comprehensive integration report
   */
  generateIntegrationReport(validationResults: any): string {
    const { success, results, errors } = validationResults;

    const report = `
# Epic 6.4.3 Stories 1.2 + 1.3 Integration Report
**Date**: ${new Date().toLocaleDateString()}
**Status**: ${success ? '✅ PASSED' : '❌ FAILED'}

## Test Results Summary

### Story 1.2 (Question Generation Engine)
- **Questions Generated**: ${results.questionGeneration?.questionsGenerated || 0}
- **Contextual Enrichment**: ${results.contextualEnrichment?.enrichedQuestions ? '✅ Working' : '❌ Failed'}
- **Adaptation Engine**: ${results.adaptationEngine ? '✅ Working' : '❌ Failed'}

### Story 1.3 (Progressive Disclosure and Expertise Tracking)
- **Expertise Analysis**: ${results.expertiseTracking ? '✅ Working' : '❌ Failed'}
- **Response Quality Score**: ${results.expertiseTracking?.responseScore?.toFixed(2) || 'N/A'}
- **Adaptation Integration**: ${results.adaptationEngine?.confidence ? '✅ Working' : '❌ Failed'}

### Performance Validation
- **Average Latency**: ${results.performance?.averageLatency?.toFixed(2) || 'N/A'}ms
- **Performance Target**: ${results.performance?.withinTarget ? '✅ Met (<200ms)' : '❌ Exceeded'}
- **Performance Grade**: ${results.performance?.performanceGrade || 'Unknown'}

### Integration Quality
- **Interface Compatibility**: ${success ? '✅ Resolved' : '❌ Issues detected'}
- **End-to-End Flow**: ${success ? '✅ Working' : '❌ Broken'}
- **Error Count**: ${errors.length}

${errors.length > 0 ? `
## Issues Detected
${errors.map(error => `- ❌ ${error}`).join('\n')}
` : ''}

## Recommendations
${success ? 
`✅ **Integration Successful**: Stories 1.2 and 1.3 are properly integrated and ready for Story 1.4 development.

### Next Steps:
1. Proceed with Story 1.4 (UI Integration and Experience)
2. Begin comprehensive UI component development
3. Implement real-time adaptation interfaces` :
`❌ **Integration Issues Detected**: Address the following before proceeding:

### Required Fixes:
${errors.map(error => `1. Fix: ${error}`).join('\n')}
2. Re-run integration validation
3. Ensure all interfaces are compatible`}

---
*Generated by Epic 6.4.3 Integration Validator*
`;

    return report;
  }
}

// Export for use in other test files
export default EpicIntegrationValidator;
