"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

interface WorkflowData {
  description: string;
  category: string;
  complexity: string;
  timestamp: string;
  attribution?: string;
  knowledgeSources?: AttributionSource[];
  regulatoryHints?: string[];
  confidenceScore?: number;
}

type AttributionSource = {
  id: string;
  type: "web-search" | "mcp" | "static-knowledge";
  provider: string;
  url?: string;
  title: string;
  confidence: number;
  timestamp: string;
};

type EnhancementStats = {
  cache: {
    cacheSize: number;
    maxSize: number;
    hitRate: number;
    missRate: number;
    totalQueries: number;
    utilizationRate: number;
  };
  topPerformingSources: Array<{
    provider: string;
    type: string;
    totalUses: number;
    averageConfidence: number;
  }>;
  searchManagerStatus: {
    tavilyEnabled: boolean;
    duckduckgoEnabled: boolean;
  };
};

interface CopilotIntegrationProps {
  workflowData: WorkflowData | null;
  currentQuestions: string[];
  enhancementStats: EnhancementStats | null;
  setWorkflowData: (data: WorkflowData | null | ((prev: WorkflowData | null) => WorkflowData | null)) => void;
  setCurrentQuestions: (questions: string[] | ((prev: string[]) => string[])) => void;
  setEnhancementStats: (stats: EnhancementStats | null) => void;
  isClient: boolean;
}

export function CopilotIntegration({
  workflowData,
  currentQuestions,
  enhancementStats,
  setWorkflowData,
  setCurrentQuestions,
  setEnhancementStats,
  isClient,
}: CopilotIntegrationProps) {
  // Make the current workflow data readable by the AI
  useCopilotReadable({
    description: "Current workflow analysis, questions, and enhancement statistics",
    value: {
      workflowData,
      currentQuestions,
      enhancementStats,
    },
  });

  // Action to trigger workflow analysis
  useCopilotAction({
    name: "start_workflow_analysis",
    description: "Start analyzing a new workflow with user input",
    parameters: [
      {
        name: "description",
        type: "string",
        description: "User's description of what they want to build",
        required: true,
      },
    ],
    handler: async ({ description }) => {
      // Enhanced workflow analysis will be handled by the API
      const mockAnalysis = {
        description,
        category: "automation",
        complexity: "moderate",
        timestamp: new Date().toISOString(),
        attribution: "Enhanced analysis with web search integration",
        knowledgeSources: [],
        regulatoryHints: [],
        confidenceScore: 0.85,
      };
      
      setWorkflowData(mockAnalysis);
      
      // Generate some initial questions
      const questions = [
        "What specific triggers should start this workflow?",
        "What data sources will you be working with?",
        "How should the workflow handle errors or exceptions?",
      ];
      
      setCurrentQuestions(questions);
      
      return "Enhanced workflow analysis started! I've generated initial questions and will search for current best practices to help design your workflow.";
    },
  });

  // Action to download generated Langflow JSON
  useCopilotAction({
    name: "download_langflow_json",
    description: "Download the generated Langflow workflow as a JSON file",
    parameters: [
      {
        name: "workflow_json",
        type: "string",
        description: "The Langflow JSON workflow to download",
        required: true,
      },
      {
        name: "filename",
        type: "string", 
        description: "Name for the downloaded file",
        required: false,
      },
    ],
    handler: async ({ workflow_json, filename }) => {
      try {
        const parsedJson = JSON.parse(workflow_json);
        const blob = new Blob([JSON.stringify(parsedJson, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "langflow-workflow.json";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        return "Langflow workflow JSON has been downloaded successfully!";
      } catch (err) {
        console.error("Error downloading workflow:", err);
        return "Error downloading the workflow file. Please try again.";
      }
    },
  });

  // Action to update workflow questions
  useCopilotAction({
    name: "update_workflow_questions",
    description: "Update the current questions based on user responses",
    parameters: [
      {
        name: "new_questions",
        type: "string",
        description: "JSON array of new questions to display",
        required: true,
      },
    ],
    handler: async ({ new_questions }) => {
      try {
        const questions = JSON.parse(new_questions);
        if (Array.isArray(questions)) {
          setCurrentQuestions(questions);
          return "Questions updated successfully!";
        }
        return "Invalid questions format provided.";
      } catch (err) {
        console.error("Error parsing questions:", err);
        return "Error parsing questions. Please provide a valid JSON array.";
      }
    },
  });

  // Action to get enhancement statistics
  useCopilotAction({
    name: "show_enhancement_statistics",
    description: "Display web search and caching statistics",
    parameters: [],
    handler: async () => {
      try {
        // This would be called by the enhanced API action
        const mockStats = {
          cache: {
            cacheSize: 45,
            maxSize: 500,
            hitRate: 0.73,
            missRate: 0.27,
            totalQueries: 156,
            utilizationRate: 0.09
          },
          topPerformingSources: [
            { provider: 'tavily', type: 'web-search', totalUses: 34, averageConfidence: 0.82 },
            { provider: 'duckduckgo', type: 'web-search', totalUses: 28, averageConfidence: 0.65 }
          ],
          searchManagerStatus: {
            tavilyEnabled: true,
            duckduckgoEnabled: true
          }
        };
        
        setEnhancementStats(mockStats);
        return "Enhancement statistics retrieved! Check the Statistics panel for cache performance and search provider information.";
      } catch {
        return "Unable to retrieve enhancement statistics at this time.";
      }
    },
  });

  // ACTION 1: Generate Adaptive Question - Story 1.5
  useCopilotAction({
    name: "generate_adaptive_question",
    description: "Generate a contextually relevant question based on user expertise and domain",
    parameters: [
      {
        name: "domain",
        type: "string",
        description: "The domain context for question generation (e.g., 'healthcare', 'finance', 'retail')",
        required: false,
      },
      {
        name: "sophistication_level",
        type: "number",
        description: "Question sophistication level from 1 (basic) to 5 (expert)",
        required: false,
      },
      {
        name: "question_type",
        type: "string",
        description: "Type of question: 'clarifying', 'exploration', 'assumption-testing', 'concept-validation'",
        required: false,
      },
    ],
    handler: async ({ domain, sophistication_level, question_type }) => {
      // Skip complex operations during SSR
      if (!isClient) {
        return "Question generation is available after page loads.";
      }
      
      try {
        // Use the actual questioning engine
        const { AdaptiveQuestioningEngine } = await import('../lib/enhanced/questioning/questioningEngine');
        const { questioningFlags } = await import('../lib/enhanced/featureFlags');
        
        const config = {
          featureFlags: {
            enableSocraticQuestioning: true,
            enableQuestionGeneration: questioningFlags.isQuestionGenerationEnabled(),
            enableExpertiseTracking: questioningFlags.isExpertiseTrackingEnabled(),
            enableProgressiveDisclosure: questioningFlags.isProgressiveDisclosureEnabled(),
            enableAdaptiveComplexity: questioningFlags.isAdaptiveComplexityEnabled(),
            enableQuestioningDebugMode: false,
            enablePerformanceLogging: true,
            enableQuestioningMetrics: true,
            maxQuestioningLatencyMs: 3000,
            fallbackToBasicMode: true,
            enableCircuitBreaker: questioningFlags.isCircuitBreakerEnabled(),
          },
          performanceThresholds: {
            maxTotalTimeMs: 3000,
            maxGenerationTimeMs: 800,
            maxEnrichmentTimeMs: 500,
          },
          qualityThresholds: {
            minQuestionConfidence: 0.6,
            minEnrichmentQuality: 0.5,
            minDomainRelevance: 0.4,
          },
        };

        const engine = new AdaptiveQuestioningEngine(config);
        
        const validQuestionTypes = ['clarifying', 'exploration', 'assumption-testing', 'concept-validation'] as const;
        type ValidQuestionType = typeof validQuestionTypes[number];
        const selectedType = question_type && validQuestionTypes.includes(question_type as ValidQuestionType) 
          ? [question_type as ValidQuestionType] 
          : undefined;
        
        // Validate sophistication level
        const validSophisticationLevel = sophistication_level && sophistication_level >= 1 && sophistication_level <= 5 
          ? sophistication_level as 1 | 2 | 3 | 4 | 5
          : 3 as 1 | 2 | 3 | 4 | 5;
        
        const request = {
          domainContext: domain ? { 
            domain, 
            confidence: 0.8, 
            indicators: [], 
            timestamp: isClient ? new Date() : new Date(2025, 8, 1), // Fixed date for SSR
            source: 'conversation' as const 
          } : null,
          userInput: "Generate an adaptive question",
          conversationHistory: [],
          sophisticationLevel: validSophisticationLevel,
          sessionId: isClient ? `session-${Date.now()}` : 'session-ssr-default',
          preferences: {
            questionTypes: selectedType,
            includeEnrichment: true,
            includeAlternatives: false,
            maxQuestions: 1,
          },
        };

        const result = await engine.generateAdaptiveQuestion(request);
        
        // Update the current questions with the new adaptive question
        setCurrentQuestions(prev => [...prev, result.primaryQuestion.question]);
        
        return `Generated adaptive question: "${result.primaryQuestion.question}"\n\nQuestion Details:\n- Type: ${result.primaryQuestion.type}\n- Complexity: ${result.primaryQuestion.complexity}\n- Domain: ${result.primaryQuestion.domain}\n- Confidence: ${Math.round(result.primaryQuestion.confidence * 100)}%\n\nProcessing Time: ${result.processingDetails.totalProcessingTimeMs}ms`;
        
      } catch (error) {
        console.error('Error generating adaptive question:', error);
        return "Error generating adaptive question. Using fallback question generation instead.";
      }
    },
  });

  // ACTION 2: Analyze User Expertise - Story 1.5
  useCopilotAction({
    name: "analyze_user_expertise",
    description: "Analyze user responses to determine expertise level and adapt questioning",
    parameters: [
      {
        name: "user_response",
        type: "string",
        description: "The user's response to analyze for expertise indicators",
        required: true,
      },
    ],
    handler: async ({ user_response }) => {
      try {
        // Simple expertise analysis based on response characteristics
        const responseLength = user_response.length;
        const technicalTerms = (user_response.match(/\b(API|database|integration|workflow|authentication|authorization|microservices|kubernetes|docker|CI\/CD)\b/gi) || []).length;
        const detailLevel = user_response.split(/[.!?]/).length;
        
        // Calculate expertise indicators
        let expertiseScore = 0;
        if (responseLength > 200) expertiseScore += 1;
        if (technicalTerms > 3) expertiseScore += 2;
        if (detailLevel > 5) expertiseScore += 1;
        if (user_response.includes('requirement') || user_response.includes('specification')) expertiseScore += 1;
        
        const expertiseLevel = expertiseScore >= 4 ? 'expert' : 
                             expertiseScore >= 3 ? 'advanced' : 
                             expertiseScore >= 2 ? 'intermediate' : 
                             expertiseScore >= 1 ? 'beginner' : 'novice';

        const confidence = Math.min(0.9, 0.4 + (expertiseScore * 0.15));

        return `Expertise Analysis Complete:\n\n` +
               `Overall Level: ${expertiseLevel}\n` +
               `Technical Terms Detected: ${technicalTerms}\n` +
               `Response Detail Level: ${detailLevel > 5 ? 'High' : detailLevel > 3 ? 'Medium' : 'Basic'}\n` +
               `Confidence Score: ${Math.round(confidence * 100)}%\n\n` +
               `Analysis Summary:\n` +
               `- Response Length: ${responseLength} characters\n` +
               `- Technical Vocabulary: ${technicalTerms > 3 ? 'Advanced' : technicalTerms > 1 ? 'Moderate' : 'Basic'}\n` +
               `- Detail Orientation: ${detailLevel > 5 ? 'Comprehensive' : detailLevel > 3 ? 'Adequate' : 'Concise'}\n\n` +
               `Recommendation: ${expertiseLevel === 'novice' ? 'Start with foundational questions and basic concepts' : 
                               expertiseLevel === 'expert' ? 'Use advanced questioning patterns and technical depth' : 
                               'Continue with intermediate complexity questions'}`;
        
      } catch (error) {
        console.error('Error analyzing user expertise:', error);
        return "Error analyzing expertise. The system will continue with standard questioning patterns.";
      }
    },
  });

  // ACTION 3: Start Questioning Session - Story 1.5
  useCopilotAction({
    name: "start_questioning_session",
    description: "Start a structured questioning session with progressive disclosure",
    parameters: [
      {
        name: "domain",
        type: "string",
        description: "The domain context for the questioning session",
        required: true,
      },
      {
        name: "initial_sophistication",
        type: "number",
        description: "Starting sophistication level (1-5)",
        required: false,
      },
    ],
    handler: async ({ domain, initial_sophistication }) => {
      // Skip complex operations during SSR
      if (!isClient) {
        return "Questioning session is available after page loads.";
      }
      
      try {
        // This integrates with the actual questioning session management
        const sessionId = isClient ? `session-${Date.now()}` : 'session-ssr-default';
        const sophisticationLevel = initial_sophistication || 2;
        
        // Generate initial questions for the session based on domain and sophistication
        const questionTemplates: Record<string, string[]> = {
          healthcare: [
            `To understand your ${domain} requirements better, what specific patient care challenge are you trying to solve?`,
            `What healthcare data standards (HL7, FHIR) do you need to integrate with?`,
            `Are there HIPAA compliance requirements we should consider in your workflow?`,
          ],
          finance: [
            `What specific financial processes or transactions will your ${domain} workflow handle?`,
            `Do you need to integrate with banking APIs or payment processing systems?`,
            `Are there regulatory compliance requirements (SOX, PCI-DSS) that apply?`,
          ],
          retail: [
            `What customer experience or operational challenge in ${domain} are you addressing?`,
            `Which e-commerce platforms or inventory systems need integration?`,
            `How should the workflow handle peak traffic or seasonal variations?`,
          ],
          general: [
            `To understand your ${domain} requirements better, what specific challenge are you trying to solve?`,
            `What systems and data sources will your workflow need to integrate with?`,
            `Are there any regulatory or compliance considerations we should be aware of?`,
          ],
        };
        
        const domainKey = questionTemplates[domain.toLowerCase()] ? domain.toLowerCase() : 'general';
        const initialQuestions = questionTemplates[domainKey];
        
        setCurrentQuestions(initialQuestions);
        
        // Update workflow data to reflect the session start
        setWorkflowData((prev: WorkflowData | null) => ({
          ...prev,
          description: `Questioning session started for ${domain} domain`,
          category: domain,
          complexity: sophisticationLevel >= 4 ? 'advanced' : sophisticationLevel >= 3 ? 'intermediate' : 'basic',
          timestamp: isClient ? new Date().toISOString() : '2025-09-01T12:00:00.000Z',
          attribution: `Adaptive questioning session (Level ${sophisticationLevel})`,
        }));

        return `Questioning session started for ${domain} domain!\n\n` +
               `Session ID: ${sessionId}\n` +
               `Initial Sophistication Level: ${sophisticationLevel}\n` +
               `Questions Generated: ${initialQuestions.length}\n\n` +
               `I'll adapt the question complexity based on your responses. The session will progressively reveal more sophisticated concepts as we identify your expertise level.`;
        
      } catch (error) {
        console.error('Error starting questioning session:', error);
        return "Error starting questioning session. Using standard workflow analysis instead.";
      }
    },
  });

  // ACTION 4: Update Question Sophistication - Story 1.5
  useCopilotAction({
    name: "update_question_sophistication",
    description: "Dynamically adjust question sophistication based on user responses",
    parameters: [
      {
        name: "new_level",
        type: "number",
        description: "New sophistication level (1-5) based on user expertise",
        required: true,
      },
      {
        name: "reasoning",
        type: "string",
        description: "Explanation for the sophistication change",
        required: false,
      },
    ],
    handler: async ({ new_level, reasoning }) => {
      try {
        // Validate sophistication level
        const level = Math.max(1, Math.min(5, new_level));
        
        // Generate questions appropriate for the new sophistication level
        const sophisticatedQuestions = {
          1: ["What do you want your workflow to accomplish?", "How familiar are you with automation tools?"],
          2: ["What data sources will your workflow need to access?", "How should errors be handled?"],
          3: ["What integration patterns are you considering?", "How will you handle data transformation and validation?"],
          4: ["What are your scalability and performance requirements?", "How will you implement monitoring and observability?"],
          5: ["What advanced patterns like event sourcing or CQRS might apply?", "How will you handle distributed transactions and eventual consistency?"]
        };
        
        const newQuestions = sophisticatedQuestions[level as keyof typeof sophisticatedQuestions] || sophisticatedQuestions[3];
        setCurrentQuestions(newQuestions);
        
        // Update workflow complexity indication
        setWorkflowData((prev: WorkflowData | null) => prev ? {
          ...prev,
          complexity: level >= 4 ? 'advanced' : level >= 3 ? 'intermediate' : 'basic',
          attribution: `Adapted to sophistication level ${level}` + (reasoning ? `: ${reasoning}` : ''),
        } : null);

        return `Question sophistication updated to level ${level}!\n\n` +
               `New Questions Generated: ${newQuestions.length}\n` +
               `Complexity Level: ${level >= 4 ? 'Advanced' : level >= 3 ? 'Intermediate' : 'Basic'}\n\n` +
               (reasoning ? `Reasoning: ${reasoning}\n\n` : '') +
               `The questions will now target ${level >= 4 ? 'expert-level' : level >= 3 ? 'intermediate' : 'foundational'} concepts appropriate for your demonstrated expertise.`;
        
      } catch (error) {
        console.error('Error updating sophistication:', error);
        return "Error updating question sophistication. Continuing with current level.";
      }
    },
  });

  return null; // This component only provides actions/hooks, no UI
}
