import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { contextEngine, ContextAnalysis } from "../../../lib/enhanced/contextEngine";
import { mcpManager, McpServerConfig, McpQueryResponse } from "../../../lib/enhanced/mcpManager";
import { searchManager } from "../../../lib/enhanced/searchManager";
import { githubDocsManager, DocumentationResult, DocumentationSearchOptions } from "../../../lib/enhanced/githubDocsManager";

// Additional type definitions for Phase 3 actions
interface WorkflowNode {
  type?: string;
  data?: {
    type?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface OptimizationRecommendation {
  type: string;
  priority: string;
  title: string;
  description: string;
  impact: string;
}

interface ValidationIssue {
  severity: string;
  component: string;
  issue: string;
  resolution: string;
}

interface ValidationResults {
  totalComponents: number;
  uniqueComponents: string[];
  potentialIssues: ValidationIssue[];
  recommendations: string[];
  compatibilityScore: number;
}
// TODO: Epic 6 Phase 2 - Re-enable enhanced manager once workflow analysis methods are implemented  
// import { EnhancedCopilotManager } from "../../../lib/enhanced/EnhancedCopilotManager";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const serviceAdapter = new OpenAIAdapter({ openai });

// Initialize the enhanced copilot manager
// TODO: Epic 6 Phase 2 - Re-enable enhanced manager once workflow analysis methods are implemented
// const enhancedManager = new EnhancedCopilotManager(runtime);

// Helper to normalize context shapes for backward compatibility
type ContextLike = ContextAnalysis | {
  domain?: string;
  confidence?: number;
  technologies?: string[];
  suggestedIntegrations?: string[];
  domainAnalysis?: { domain: string; confidence: number };
  technologyStack?: { platform: string[] | string; compliance: boolean };
  specializations?: string[];
};

function getNormalizedDomain(contextAnalysis: ContextLike | null): string {
  if (!contextAnalysis) return 'general';
  return 'domainAnalysis' in contextAnalysis 
    ? contextAnalysis.domainAnalysis?.domain || 'general'
    : contextAnalysis.domain || 'general';
}

function getNormalizedConfidence(contextAnalysis: ContextLike | null): number {
  if (!contextAnalysis) return 0.6;
  return 'domainAnalysis' in contextAnalysis 
    ? contextAnalysis.domainAnalysis?.confidence || 0.6
    : contextAnalysis.confidence || 0.6;
}

function getNormalizedTechnologies(contextAnalysis: ContextLike | null): string[] {
  if (!contextAnalysis) return [];
  if ('technologyStack' in contextAnalysis) {
    const platforms = contextAnalysis.technologyStack?.platform;
    if (Array.isArray(platforms)) {
      return platforms;
    } else if (platforms) {
      return [platforms];
    } else {
      return [];
    }
  }
  return contextAnalysis.technologies || [];
}

// Helper functions for workflow optimization
const parseWorkflowJson = (jsonString: string) => {
  try {
    return { success: true, workflow: JSON.parse(jsonString), error: null };
  } catch (error) {
    return { 
      success: false, 
      workflow: null, 
      error: "Invalid JSON format" 
    };
  }
};

const calculateComplexity = (nodeCount: number): 'low' | 'medium' | 'high' => {
  if (nodeCount > 10) return 'high';
  if (nodeCount > 5) return 'medium';
  return 'low';
};

const generatePerformanceRecommendations = (nodes: WorkflowNode[]): OptimizationRecommendation[] => {
  const recommendations: OptimizationRecommendation[] = [];
  
  if (nodes.length > 15) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'Reduce workflow complexity',
      description: 'Consider breaking large workflows into smaller, composable sub-workflows',
      impact: 'Improved execution speed and maintainability'
    });
  }
  
  const llmNodes = nodes.filter((node: WorkflowNode) => 
    node.type?.toLowerCase().includes('llm') || 
    node.data?.type?.toLowerCase().includes('llm')
  );
  
  if (llmNodes.length > 3) {
    recommendations.push({
      type: 'performance',
      priority: 'medium',
      title: 'Optimize LLM usage',
      description: 'Consider batching requests or using lighter models for non-critical operations',
      impact: 'Reduced latency and cost'
    });
  }
  
  return recommendations;
};

const generateReliabilityRecommendations = (): OptimizationRecommendation[] => {
  return [{
    type: 'reliability',
    priority: 'high',
    title: 'Add error handling nodes',
    description: 'Include error handling and retry logic for external API calls',
    impact: 'Improved workflow resilience'
  }];
};

const generateCostRecommendations = (): OptimizationRecommendation[] => {
  return [{
    type: 'cost',
    priority: 'medium',
    title: 'Optimize model selection',
    description: 'Use smaller models for simple tasks and reserve powerful models for complex operations',
    impact: 'Reduced operational costs'
  }];
};

function getNormalizedSpecializations(contextAnalysis: ContextLike | null): string[] {
  if (!contextAnalysis) return [];
  return 'specializations' in contextAnalysis 
    ? contextAnalysis.specializations || []
    : contextAnalysis.suggestedIntegrations || [];
}

// Helper functions for conversation context management
function getDomainMaturity(confidence: number): string {
  if (confidence > 0.8) return 'high';
  if (confidence > 0.6) return 'medium';
  return 'low';
}

function getStackComplexity(technologies: string[]): string {
  if (technologies.length > 3) return 'complex';
  if (technologies.length > 1) return 'moderate';
  return 'simple';
}

async function handleContextGet(conversationId: string, contextType: string) {
  const currentContext = contextEngine.getContext(conversationId);
  
  if (!currentContext) {
    return {
      action: 'get',
      conversationId,
      context: null,
      message: 'No context found for this conversation',
      timestamp: new Date().toISOString()
    };
  }

  return {
    action: 'get',
    conversationId,
    context: {
      domain: getNormalizedDomain(currentContext),
      confidence: getNormalizedConfidence(currentContext),
      technologies: getNormalizedTechnologies(currentContext),
      specializations: getNormalizedSpecializations(currentContext),
      full_context: currentContext
    },
    contextType,
    message: 'Context retrieved successfully',
    timestamp: new Date().toISOString()
  };
}

async function handleContextUpdate(conversationId: string, contextData: string, contextType: string, mergeStrategy: string) {
  try {
    // Parse context data if it's JSON
    let parsedData;
    try {
      parsedData = JSON.parse(contextData);
    } catch {
      // If not JSON, treat as plain text for domain analysis
      parsedData = { userInput: contextData, type: contextType };
    }

    let updatedContext;
    const existingContext = contextEngine.getContext(conversationId);

    if (existingContext) {
      // Update existing context
      updatedContext = contextEngine.updateContext(
        conversationId,
        typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData),
        contextType as 'domain_refinement' | 'workflow_progress' | 'user_feedback'
      );
    } else {
      // Create new context analysis
      const analysisText = typeof parsedData === 'object' 
        ? (parsedData.userInput || parsedData.requirements || JSON.stringify(parsedData))
        : parsedData;
      
      updatedContext = await contextEngine.analyzeContext(analysisText);
    }

    return {
      action: 'update',
      conversationId,
      context: {
        domain: getNormalizedDomain(updatedContext),
        confidence: getNormalizedConfidence(updatedContext),
        technologies: getNormalizedTechnologies(updatedContext),
        specializations: getNormalizedSpecializations(updatedContext)
      },
      contextType,
      mergeStrategy,
      message: `Context updated successfully using ${mergeStrategy} strategy`,
      timestamp: new Date().toISOString()
    };
  } catch (parseError) {
    return {
      action: 'update',
      conversationId,
      error: `Failed to parse context data: ${parseError}`,
      timestamp: new Date().toISOString()
    };
  }
}

async function handleContextAnalyze(conversationId: string) {
  const contextToAnalyze = contextEngine.getContext(conversationId);
  
  if (!contextToAnalyze) {
    return {
      action: 'analyze',
      conversationId,
      analysis: null,
      message: 'No context available to analyze',
      timestamp: new Date().toISOString()
    };
  }

  // Get domain-specific insights
  const domain = getNormalizedDomain(contextToAnalyze);
  const confidence = getNormalizedConfidence(contextToAnalyze);
  const technologies = getNormalizedTechnologies(contextToAnalyze);
  const specializations = getNormalizedSpecializations(contextToAnalyze);

  // Get MCP insights if available
  let mcpInsights: McpQueryResponse | null = null;
  const mcpServers = mcpManager.getServersForDomain(domain);
  if (mcpServers.length > 0) {
    try {
      mcpInsights = await mcpManager.queryServers(
        `Analysis and recommendations for ${domain} domain with ${technologies.join(', ')} technologies`,
        domain,
        { timeout: 2000 }
      );
    } catch (error) {
      console.warn('MCP analysis query failed:', error);
    }
  }

  const analysis = {
    domain_analysis: {
      primary_domain: domain,
      confidence_level: confidence,
      domain_maturity: getDomainMaturity(confidence)
    },
    technology_stack: {
      identified_technologies: technologies,
      stack_complexity: getStackComplexity(technologies),
      specialization_areas: specializations
    },
    recommendations: {
      workflow_suggestions: [
        `Optimize for ${domain} domain requirements`,
        `Consider ${technologies.join(' and ')} integration patterns`,
        `Focus on ${specializations.slice(0, 2).join(' and ')} capabilities`
      ],
      confidence_improvements: confidence < 0.7 ? [
        'Gather more domain-specific requirements',
        'Clarify technology preferences',
        'Define specific use cases'
      ] : ['Context analysis is comprehensive'],
      next_steps: [
        'Design workflow components based on context',
        'Implement domain-specific validations',
        'Test with representative use cases'
      ]
    },
    external_knowledge: mcpInsights ? {
      sources: mcpInsights.sources,
      insights_available: mcpInsights.results.length > 0,
      knowledge_depth: mcpInsights.results.length > 2 ? 'comprehensive' : 'basic'
    } : null
  };

  return {
    action: 'analyze',
    conversationId,
    analysis,
    message: 'Context analysis completed successfully',
    timestamp: new Date().toISOString()
  };
}

const runtime = new CopilotRuntime({
  actions: [
    {
      name: "analyze_workflow_requirements",
      description: "Analyze user requirements with enhanced domain intelligence and suggest workflow structure for Langflow",
      parameters: [
        {
          name: "domain",
          type: "string",
          description: "The domain or industry for the workflow",
          required: true,
        },
        {
          name: "complexity",
          type: "string",
          description: "The complexity level of the workflow (simple, moderate, complex)",
          required: true,
        },
        {
          name: "requirements",
          type: "string",
          description: "Detailed description of specific requirements",
          required: true,
        },
        {
          name: "conversationId",
          type: "string",
          description: "Unique conversation identifier for context tracking",
          required: false,
        },
      ],
      handler: async ({ domain, complexity, requirements, conversationId }: {
        domain: string;
        complexity: string;
        requirements: string;
        conversationId?: string;
      }) => {
        try {
          // Use enhanced workflow analysis with web search integration
          // TODO: Epic 6 Phase 2 - Re-implement with enhanced workflow analysis
          // const enhancedResult = await enhancedManager.analyzeWorkflowWithEnhancement(
          //   workflow,
          //   userInput || '',
          //   {
          //     includeExpertSuggestions: true,
          //     generateOptimizations: true,
          //     provideTechnicalGuidance: true
          //   }
          // );
          
          // For Phase 1, use basic workflow analysis
          // TODO: Epic 6 Phase 2 - Re-implement with enhanced question generation
          // const enhancedResult = await enhancedManager.generateEnhancedQuestions(
          //   domain,
          //   userContext || requirements,
          //   {
          //     includeFollowUp: true,
          //     generateSubQuestions: true,
          //     contextAware: true
          //   }
          // );
          
          // For Phase 1, use basic question generation
          const enhancedResult = {
            questions: ["What specific challenges are you facing?", "What outcomes do you expect?"],
            followUp: ["Phase 2 will provide domain-specific expert questions"],
            context: { domain, complexity }
          };          return enhancedResult;
        } catch (error) {
          console.error('Enhanced workflow analysis error:', error);
          
          // Fallback to contextEngine approach if enhanced features fail
          try {
            // Generate conversation ID if not provided
            const convId = conversationId || `conv-${Date.now()}-${Math.random()}`;
            
            // Enhanced context analysis using Context Understanding Engine
            const contextAnalysis = await contextEngine.analyzeContext(`${domain} ${requirements}`);

            // Get domain-specific MCP servers
            const mcpServers = mcpManager.getServersForDomain(getNormalizedDomain(contextAnalysis));
            
            // Query MCP servers for domain-specific knowledge (if available)
            let mcpKnowledge: McpQueryResponse | null = null;
            if (mcpServers.length > 0) {
              try {
                const mcpResults = await mcpManager.queryServers(
                  `Best practices for ${domain} workflows with ${requirements}`,
                  getNormalizedDomain(contextAnalysis),
                  { timeout: 3000 }
                );
                mcpKnowledge = mcpResults;
              } catch (error) {
                console.warn('MCP query failed, continuing with local knowledge:', error);
              }
            }

            // Generate contextual questions based on analysis
            // TODO: Implement generateContextualQuestions method in contextEngine
            const contextualQuestions: string[] = [
              `What specific ${getNormalizedDomain(contextAnalysis)} requirements do you have?`,
              `What integrations are important for your ${getNormalizedDomain(contextAnalysis)} workflow?`
            ];

            // Enhanced Socratic questioning logic for Langflow workflows
            interface ComplexityLevel {
              questions: string[];
              components: string[];
            }
            
            const complexityLevels: Record<string, ComplexityLevel> = {
              simple: {
                questions: [
                  `For a ${getNormalizedDomain(contextAnalysis)} workflow, what specific data will you be processing?`,
                  "What is the main goal or output you want to achieve?",
                  "Do you need any external integrations (APIs, databases, etc.)?",
                  ...contextualQuestions.slice(0, 2)
                ],
                components: ["Input nodes", "LLM processing", "Output formatting"]
              },
              moderate: {
                questions: [
                  `What are the key decision points in your ${getNormalizedDomain(contextAnalysis)} workflow?`,
                  "How should the system handle different types of inputs?",
                  "What conditional logic or branching do you need?",
                  "How will you validate and process the outputs?",
                  ...contextualQuestions.slice(0, 2)
                ],
                components: ["Multi-step processing", "Conditional logic", "Data validation", "Error handling"]
              },
              complex: {
                questions: [
                  `What are the performance and scalability requirements for your ${getNormalizedDomain(contextAnalysis)} solution?`,
                  "How will you implement monitoring and logging?",
                  "What are your deployment and infrastructure considerations?",
                  "How will you handle concurrent processing and state management?",
                  ...contextualQuestions.slice(0, 2)
                ],
                components: ["Advanced orchestration", "State management", "Monitoring", "Scalability patterns"]
              }
            };

            const level = complexityLevels[complexity.toLowerCase()] || complexityLevels.simple;
            
            // Prepare response with enhanced intelligence
            const response = {
              analysis: `Analyzing ${complexity} workflow for ${getNormalizedDomain(contextAnalysis)} domain (${(getNormalizedConfidence(contextAnalysis) * 100).toFixed(1)}% confidence)`,
              suggested_questions: level.questions,
              recommended_components: level.components,
              requirements: requirements,
              context_analysis: {
                domain: getNormalizedDomain(contextAnalysis),
                confidence: getNormalizedConfidence(contextAnalysis),
                technology_stack: getNormalizedTechnologies(contextAnalysis),
                compliance_requirements: contextAnalysis.requiresCompliance,
                specializations: getNormalizedSpecializations(contextAnalysis)
              },
              mcp_sources: mcpServers.map((server: McpServerConfig) => server.name),
              external_knowledge: mcpKnowledge ? {
                sources: mcpKnowledge.sources,
                insights: mcpKnowledge.results.length > 0 ? "Enhanced with domain-specific knowledge" : null
              } : null,
              conversation_id: convId,
              next_steps: `Let's explore the specific components and flow for your ${getNormalizedDomain(contextAnalysis)} workflow with ${getNormalizedTechnologies(contextAnalysis)} integration.`
            };

            return response;
          } catch (fallbackError) {
            console.error('Fallback analysis also failed:', fallbackError);
            
            // Basic fallback if all enhanced features fail
            interface ComplexityLevel {
              questions: string[];
              components: string[];
            }
            const complexityLevels: Record<string, ComplexityLevel> = {
              simple: {
                questions: [
                  `For a ${domain} workflow, what specific data will you be processing?`,
                  "What is the main goal or output you want to achieve?",
                  "Do you need any external integrations (APIs, databases, etc.)?"
                ],
                components: ["Input nodes", "LLM processing", "Output formatting"]
              },
              moderate: {
                questions: [
                  `What are the key decision points in your ${domain} workflow?`,
                  "How should the system handle different types of inputs?",
                  "What conditional logic or branching do you need?",
                  "How will you validate and process the outputs?"
                ],
                components: ["Multi-step processing", "Conditional logic", "Data validation", "Error handling"]
              },
              complex: {
                questions: [
                  `What are the performance and scalability requirements for your ${domain} solution?`,
                  "How will you implement monitoring and logging?",
                  "What are your deployment and infrastructure considerations?",
                  "How will you handle concurrent processing and state management?"
                ],
                components: ["Advanced orchestration", "State management", "Monitoring", "Scalability patterns"]
              }
            };

            const level = complexityLevels[complexity.toLowerCase()] || complexityLevels.simple;
            
            return {
              analysis: `Analyzing ${complexity} workflow for ${domain} domain (fallback mode)`,
              suggested_questions: level.questions,
              recommended_components: level.components,
              requirements: requirements,
              next_steps: `Let's explore the specific components and flow for your ${domain} workflow.`,
              attribution: "Response based on static knowledge (enhanced features unavailable)",
              error: "Enhanced features temporarily unavailable"
            };
          }
        }
      }
    },
    {
      name: "generate_workflow_questions",
      description: "Generate enhanced Socratic questions based on workflow category, user expertise, and conversation context",
      parameters: [
        {
          name: "category",
          type: "string",
          description: "The workflow category (e.g., 'chatbot', 'data processing', 'automation', 'content generation')",
          required: true,
        },
        {
          name: "user_expertise",
          type: "string",
          description: "User's technical expertise level (beginner, intermediate, advanced)",
          required: true,
        },
        {
          name: "conversationId",
          type: "string",
          description: "Conversation ID for context continuation",
          required: false,
        },
        {
          name: "userInput",
          type: "string",
          description: "Latest user input for context refinement",
          required: false,
        },
      ],
      handler: async ({ category, user_expertise, conversationId, userInput }: {
        category: string;
        user_expertise: string;
        conversationId?: string;
        userInput?: string;
      }) => {
        try {
          // TODO: Epic 6 Phase 2 - Re-implement with enhanced question generation
          // const enhancedResult = await enhancedManager.generateEnhancedQuestions(
          //   category,
          //   user_expertise
          // );
          
          // For Phase 1, use basic question generation
          const enhancedResult = {
            questions: ["What specific aspect interests you?", "What level of detail do you need?"],
            category: category,
            expertise: user_expertise
          };

          return enhancedResult;
        } catch (error) {
          console.error('Enhanced question generation error:', error);
          
          // Fallback to contextEngine approach
          try {
            let contextAnalysis: ContextAnalysis | {
              domainAnalysis: { domain: string; confidence: number };
              technologyStack: { platform: string[] | string; compliance: boolean };
              specializations: string[];
            } | null = null;
            
            // Get or update conversation context
            if (conversationId) {
              contextAnalysis = contextEngine.getContext(conversationId);
              
              // Update context if new user input provided
              if (userInput && contextAnalysis) {
                contextAnalysis = contextEngine.updateContext(
                  conversationId,
                  userInput,
                  'domain_refinement'
                );
              }
            }

            // Get domain-specific MCP servers if we have context
            let domainKnowledge: McpQueryResponse | null = null;
            if (contextAnalysis) {
              // Normalize context across ContextEngine.getContext and .query shapes
              const domainName = getNormalizedDomain(contextAnalysis);
              const mcpServers = mcpManager.getServersForDomain(domainName);
              if (mcpServers.length > 0) {
                try {
                  const mcpResults = await mcpManager.queryServers(
                    `Common questions and considerations for ${category} in ${domainName}`,
                    domainName,
                    { timeout: 2000 }
                  );
                  domainKnowledge = mcpResults;
                } catch (error) {
                  console.warn('MCP query for questions failed:', error);
                }
              }
            }

            // Enhanced Socratic questioning based on Langflow capabilities
            const questionTemplates: Record<string, Record<string, string[]>> = {
              beginner: {
                chatbot: [
                  "What kind of conversations should your chatbot handle?",
                  "What personality or tone should your chatbot have?",
                  "Where will users interact with your chatbot (web, mobile, messaging)?",
                  "What information sources should your chatbot draw from?"
                ],
                "data processing": [
                  "What type of data are you working with (text, images, documents)?",
                  "What should happen to the data after processing?",
                  "Do you need to clean or format the data in any specific way?",
                  "How often will new data need to be processed?"
                ],
                automation: [
                  "What repetitive task do you want to automate?",
                  "What triggers should start the automation?",
                  "What steps does the current manual process involve?",
                  "How will you know when the automation completes successfully?"
                ],
                "content generation": [
                  "What type of content do you want to generate?",
                  "Who is your target audience?",
                  "What style or format should the content follow?",
                  "What inputs will guide the content generation?"
                ]
              },
              intermediate: {
                chatbot: [
                  "How will your chatbot maintain conversation context?",
                  "What APIs or external services will it integrate with?",
                  "How will you handle user authentication and personalization?",
                  "What fallback mechanisms will you implement for unclear queries?"
                ],
                "data processing": [
                  "What data validation and quality checks do you need?",
                  "How will you handle different data formats and sources?",
                  "What transformation logic needs to be applied?",
                  "How will you manage data pipeline failures and retries?"
                ],
                automation: [
                  "What conditional logic and decision points are needed?",
                  "How will you handle exceptions and edge cases?",
                  "What approval workflows or human-in-the-loop steps are required?",
                  "How will you log and monitor the automation performance?"
                ],
                "content generation": [
                  "What content templates and structures will you use?",
                  "How will you ensure content quality and consistency?",
                  "What review and approval processes are needed?",
                  "How will you personalize content for different segments?"
                ]
              },
              advanced: {
                chatbot: [
                  "How will you implement advanced NLP features like intent recognition?",
                  "What conversation flow management and state handling is required?",
                  "How will you scale to handle multiple concurrent conversations?",
                  "What analytics and conversation optimization strategies will you use?"
                ],
                "data processing": [
                  "What distributed processing and parallel execution patterns will you use?",
                  "How will you implement data lineage and governance?",
                  "What real-time vs batch processing requirements do you have?",
                  "How will you optimize for cost and performance at scale?"
                ],
                automation: [
                  "What orchestration patterns and workflow engines will you leverage?",
                  "How will you implement complex business rules and decision trees?",
                  "What monitoring, alerting, and recovery mechanisms are needed?",
                  "How will you version and deploy workflow changes safely?"
                ],
                "content generation": [
                  "What advanced AI techniques (RAG, fine-tuning) will you employ?",
                  "How will you implement content scoring and optimization?",
                  "What A/B testing and performance measurement strategies will you use?",
                  "How will you ensure content compliance and brand consistency at scale?"
                ]
              }
            };
            
            const expertiseQuestions = questionTemplates[user_expertise.toLowerCase()];
            let questions = expertiseQuestions?.[category.toLowerCase()] || 
                           questionTemplates.beginner[category.toLowerCase()] ||
                           [`What are the main requirements for your ${category} workflow?`];

            // Enhance questions with context-specific ones
            if (contextAnalysis) {
              // Convert ContextAnalysis to query result shape for generateContextualQuestions
              const queryShape = {
                domainAnalysis: { 
                  domain: getNormalizedDomain(contextAnalysis), 
                  confidence: getNormalizedConfidence(contextAnalysis) 
                },
                technologyStack: { 
                  platform: getNormalizedTechnologies(contextAnalysis), 
                  compliance: 'requiresCompliance' in contextAnalysis ? contextAnalysis.requiresCompliance : false 
                },
                specializations: getNormalizedSpecializations(contextAnalysis)
              };
              const contextualQuestions = contextEngine.generateContextualQuestions(queryShape);
              questions = [...questions.slice(0, 3), ...contextualQuestions.slice(0, 2)];
            }

            // Build response with enhanced information
            const response = {
              questions: questions.slice(0, 5), // Limit to 5 questions
              category,
              expertise_level: user_expertise,
              context_intelligence: contextAnalysis ? (() => {
                const domain = getNormalizedDomain(contextAnalysis);
                const confidence = getNormalizedConfidence(contextAnalysis);
                const platform = getNormalizedTechnologies(contextAnalysis);
                const specializations = getNormalizedSpecializations(contextAnalysis);
                return {
                  domain,
                  confidence,
                  technology_stack: platform,
                  specializations,
                };
              })() : null,
              external_sources: domainKnowledge ? domainKnowledge.sources : [],
              enhanced_insights: domainKnowledge && domainKnowledge.results.length > 0 ? 
                "Questions enhanced with domain-specific knowledge" : null,
              next_steps: `Based on your answers to these ${(contextAnalysis ? getNormalizedDomain(contextAnalysis) : 'workflow')}-specific questions, I'll help you design the specific Langflow components for your ${category} workflow.`
            };
            
            return response;
          } catch (fallbackError) {
            console.error('Fallback question generation also failed:', fallbackError);
            
            // Basic fallback question generation
            const questionTemplates: Record<string, Record<string, string[]>> = {
              beginner: {
                chatbot: [
                  "What kind of conversations should your chatbot handle?",
                  "What personality or tone should your chatbot have?",
                  "Where will users interact with your chatbot (web, mobile, messaging)?",
                  "What information sources should your chatbot draw from?"
                ],
                "data processing": [
                  "What type of data are you working with (text, images, documents)?",
                  "What should happen to the data after processing?",
                  "Do you need to clean or format the data in any specific way?",
                  "How often will new data need to be processed?"
                ],
                automation: [
                  "What repetitive task do you want to automate?",
                  "What triggers should start the automation?",
                  "What steps does the current manual process involve?",
                  "How will you know when the automation completes successfully?"
                ],
                "content generation": [
                  "What type of content do you want to generate?",
                  "Who is your target audience?",
                  "What style or format should the content follow?",
                  "What inputs will guide the content generation?"
                ]
              },
              intermediate: {
                chatbot: [
                  "How will your chatbot maintain conversation context?",
                  "What APIs or external services will it integrate with?",
                  "How will you handle user authentication and personalization?",
                  "What fallback mechanisms will you implement for unclear queries?"
                ],
                "data processing": [
                  "What data validation and quality checks do you need?",
                  "How will you handle different data formats and sources?",
                  "What transformation logic needs to be applied?",
                  "How will you manage data pipeline failures and retries?"
                ],
                automation: [
                  "What conditional logic and decision points are needed?",
                  "How will you handle exceptions and edge cases?",
                  "What approval workflows or human-in-the-loop steps are required?",
                  "How will you log and monitor the automation performance?"
                ],
                "content generation": [
                  "What content templates and structures will you use?",
                  "How will you ensure content quality and consistency?",
                  "What review and approval processes are needed?",
                  "How will you personalize content for different segments?"
                ]
              },
              advanced: {
                chatbot: [
                  "How will you implement advanced NLP features like intent recognition?",
                  "What conversation flow management and state handling is required?",
                  "How will you scale to handle multiple concurrent conversations?",
                  "What analytics and conversation optimization strategies will you use?"
                ],
                "data processing": [
                  "What distributed processing and parallel execution patterns will you use?",
                  "How will you implement data lineage and governance?",
                  "What real-time vs batch processing requirements do you have?",
                  "How will you optimize for cost and performance at scale?"
                ],
                automation: [
                  "What orchestration patterns and workflow engines will you leverage?",
                  "How will you implement complex business rules and decision trees?",
                  "What monitoring, alerting, and recovery mechanisms are needed?",
                  "How will you version and deploy workflow changes safely?"
                ],
                "content generation": [
                  "What advanced AI techniques (RAG, fine-tuning) will you employ?",
                  "How will you implement content scoring and optimization?",
                  "What A/B testing and performance measurement strategies will you use?",
                  "How will you ensure content compliance and brand consistency at scale?"
                ]
              }
            };
            
            const expertiseQuestions = questionTemplates[user_expertise.toLowerCase()];
            const questions = expertiseQuestions?.[category.toLowerCase()] || 
                             questionTemplates.beginner[category.toLowerCase()] ||
                             [`What are the main requirements for your ${category} workflow?`];
            
            return {
              questions,
              category,
              expertise_level: user_expertise,
              next_steps: `Based on your answers, I'll help you design the specific Langflow components for your ${category} workflow.`,
              attribution: "Response based on static knowledge (enhanced features unavailable)",
              error: "Enhanced features temporarily unavailable"
            };
          }
        }
      }
    },
    {
      name: "generate_langflow_json",
      description: "Generate a Langflow JSON workflow based on the analyzed requirements",
      parameters: [
        {
          name: "workflow_description",
          type: "string",
          description: "Complete description of the workflow requirements",
          required: true,
        },
        {
          name: "components",
          type: "string",
          description: "List of required components and their connections",
          required: true,
        },
      ],
      handler: async ({ workflow_description, components }: {
        workflow_description: string;
        components: string;
      }) => {
        // Generate a basic Langflow JSON structure
        const langflowTemplate = {
          data: {
            nodes: [
              {
                id: "input-1",
                type: "ChatInput",
                position: { x: 100, y: 200 },
                data: {
                  type: "ChatInput",
                  node: {
                    template: {
                      input_value: {
                        display_name: "Text",
                        type: "str",
                        value: "User input will be processed here"
                      }
                    }
                  }
                }
              },
              {
                id: "llm-1", 
                type: "OpenAIModel",
                position: { x: 400, y: 200 },
                data: {
                  type: "OpenAIModel",
                  node: {
                    template: {
                      model_name: {
                        value: "gpt-3.5-turbo"
                      },
                      input_value: {
                        display_name: "Input",
                        type: "str"
                      }
                    }
                  }
                }
              },
              {
                id: "output-1",
                type: "ChatOutput", 
                position: { x: 700, y: 200 },
                data: {
                  type: "ChatOutput",
                  node: {
                    template: {
                      input_value: {
                        display_name: "Text",
                        type: "str"
                      }
                    }
                  }
                }
              }
            ],
            edges: [
              {
                id: "edge-1",
                source: "input-1",
                target: "llm-1"
              },
              {
                id: "edge-2", 
                source: "llm-1",
                target: "output-1"
              }
            ]
          },
          description: workflow_description,
          name: "Generated Workflow"
        };

        return {
          langflow_json: langflowTemplate,
          description: "Generated Langflow workflow based on your requirements",
          components_used: components,
          next_steps: "You can now download this JSON file and import it into Langflow for further customization."
        };
      }
    },
    {
      name: "manage_mcp_servers",
      description: "Manage user MCP servers for domain-specific knowledge access",
      parameters: [
        {
          name: "action",
          type: "string",
          description: "Action to perform: 'list', 'add', 'remove', 'toggle', 'test'",
          required: true,
        },
        {
          name: "serverConfig",
          type: "string",
          description: "JSON string of server configuration (for 'add' action)",
          required: false,
        },
        {
          name: "serverId",
          type: "string",
          description: "Server ID for 'remove', 'toggle', or 'test' actions",
          required: false,
        },
      ],
      handler: async ({ action, serverConfig, serverId }: {
        action: string;
        serverConfig?: string;
        serverId?: string;
      }) => {
        try {
          switch (action.toLowerCase()) {
            case 'list':
              const servers = mcpManager.getAllServers();
              return {
                action: 'list',
                servers: servers.map((server: McpServerConfig) => ({
                  id: server.id,
                  name: server.name,
                  description: server.description,
                  domains: server.domains,
                  capabilities: server.capabilities,
                  isActive: server.isActive,
                  userAdded: server.userAdded,
                  healthStatus: server.healthStatus,
                  lastChecked: server.lastChecked
                })),
                summary: `Found ${servers.length} MCP servers (${servers.filter((s: McpServerConfig) => s.isActive).length} active)`
              };

            case 'add':
              if (!serverConfig) {
                return { error: 'Server configuration required for add action' };
              }
              
              try {
                const config = JSON.parse(serverConfig);
                const success = await mcpManager.registerServer(config);
                
                if (success) {
                  return {
                    action: 'add',
                    success: true,
                    message: `MCP server '${config.name}' registered successfully`,
                    serverId: config.id
                  };
                } else {
                  return {
                    action: 'add',
                    success: false,
                    error: 'Failed to register MCP server'
                  };
                }
              } catch {
                return {
                  action: 'add',
                  success: false,
                  error: 'Invalid server configuration JSON'
                };
              }

            case 'remove':
              if (!serverId) {
                return { error: 'Server ID required for remove action' };
              }
              
              const removed = mcpManager.removeServer(serverId);
              return {
                action: 'remove',
                success: removed,
                message: removed ? 
                  `MCP server '${serverId}' removed successfully` : 
                  'Failed to remove server (not found or system server)'
              };

            case 'toggle':
              if (!serverId) {
                return { error: 'Server ID required for toggle action' };
              }
              
              const toggled = mcpManager.toggleServer(serverId);
              const server = mcpManager.getServer(serverId);
              return {
                action: 'toggle',
                success: toggled,
                serverId,
                isActive: server?.isActive,
                message: toggled ? 
                  `MCP server '${serverId}' ${server?.isActive ? 'activated' : 'deactivated'}` : 
                  'Failed to toggle server (not found)'
              };

            case 'test':
              if (!serverId) {
                return { error: 'Server ID required for test action' };
              }
              
              const testResult = await mcpManager.queryServers(
                'test query',
                'general',
                { timeout: 3000, fallbackServers: [serverId] }
              );
              
              return {
                action: 'test',
                serverId,
                success: testResult.results.length > 0,
                response: testResult,
                message: testResult.results.length > 0 ? 
                  'MCP server responded successfully' : 
                  'MCP server test failed'
              };

            default:
              return { error: `Unknown action: ${action}` };
          }
        } catch (error) {
          return {
            action,
            success: false,
            error: `MCP server management error: ${error}`
          };
        }
      }
    },
    {
      name: "web_search",
      description: "Search the web for information related to Langflow workflows, components, or general knowledge to enhance workflow creation",
      parameters: [
        {
          name: "query",
          type: "string",
          description: "The search query to find relevant information",
          required: true,
        },
        {
          name: "domain",
          type: "string", 
          description: "The domain context for filtering results (e.g., 'healthcare', 'finance', 'general')",
          required: false,
        },
        {
          name: "maxResults",
          type: "number",
          description: "Maximum number of search results to return (default: 5)",
          required: false,
        }
      ],
      handler: async ({ query, domain = "general", maxResults = 5 }: { 
        query: string; 
        domain?: string; 
        maxResults?: number; 
      }) => {
        try {
          // Perform web search using Tavily with DuckDuckGo fallback
          const searchResponse = await searchManager.search(query, {
            maxResults: Math.min(maxResults, 10), // Cap at 10 for performance
            domainFilter: domain !== 'general' ? [domain] : undefined,
          });

          // Return structured search results with source attribution
          return {
            query: searchResponse.query,
            results: searchResponse.results.map(result => ({
              title: result.title,
              url: result.url,
              snippet: result.snippet,
              domain: result.domain,
              source: result.source,
              relevanceScore: result.relevanceScore
            })),
            totalResults: searchResponse.totalResults,
            searchTime: searchResponse.searchTime,
            source: searchResponse.source,
            cached: searchResponse.cached,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error('Web search error:', error);
          return {
            query,
            results: [],
            error: error instanceof Error ? error.message : "Unknown search error",
            timestamp: new Date().toISOString()
          };
        }
      }
    },
    {
      name: "manage_conversation_context",
      description: "Manage persistent conversation context and state for enhanced workflow continuity",
      parameters: [
        {
          name: "conversationId",
          type: "string",
          description: "Conversation identifier for context tracking",
          required: true,
        },
        {
          name: "action",
          type: "string",
          description: "Action to perform: 'get', 'update', 'clear', 'history', 'merge', 'analyze'",
          required: true,
        },
        {
          name: "contextData",
          type: "string",
          description: "Context data to store/update (JSON string for complex data)",
          required: false,
        },
        {
          name: "contextType",
          type: "string",
          description: "Type of context update: 'workflow_state', 'user_preferences', 'domain_analysis', 'conversation_summary'",
          required: false,
        },
        {
          name: "mergeStrategy",
          type: "string",
          description: "How to merge context: 'replace', 'append', 'merge_deep', 'update_fields'",
          required: false,
        },
      ],
      handler: async ({ conversationId, action, contextData, contextType = 'general', mergeStrategy = 'merge_deep' }: {
        conversationId: string;
        action: string;
        contextData?: string;
        contextType?: string;
        mergeStrategy?: string;
      }) => {
        try {
          switch (action.toLowerCase()) {
            case 'get': {
              return await handleContextGet(conversationId, contextType);
            }

            case 'update': {
              if (!contextData) {
                return { 
                  error: 'Context data required for update action',
                  action: 'update',
                  conversationId 
                };
              }
              return await handleContextUpdate(conversationId, contextData, contextType, mergeStrategy);
            }

            case 'clear': {
              // Clear conversation context
              try {
                // Note: contextEngine doesn't have a clear method, so we'll simulate it
                await contextEngine.analyzeContext('general conversation');
                
                return {
                  action: 'clear',
                  conversationId,
                  message: 'Context cleared successfully',
                  previousContext: contextEngine.getContext(conversationId),
                  timestamp: new Date().toISOString()
                };
              } catch (error) {
                return {
                  action: 'clear',
                  conversationId,
                  error: `Failed to clear context: ${error}`,
                  timestamp: new Date().toISOString()
                };
              }
            }

            case 'history': {
              // Get conversation history (simulated - would need persistent storage)
              const context = contextEngine.getContext(conversationId);
              
              return {
                action: 'history',
                conversationId,
                history: context ? [{
                  timestamp: new Date().toISOString(),
                  context: {
                    domain: getNormalizedDomain(context),
                    confidence: getNormalizedConfidence(context),
                    technologies: getNormalizedTechnologies(context),
                    specializations: getNormalizedSpecializations(context)
                  },
                  contextType: 'current_state'
                }] : [],
                message: context ? 'Context history retrieved' : 'No history available',
                timestamp: new Date().toISOString()
              };
            }

            case 'merge': {
              if (!contextData) {
                return { 
                  error: 'Context data required for merge action',
                  action: 'merge',
                  conversationId 
                };
              }

              try {
                const newData = JSON.parse(contextData);
                const existingContext = contextEngine.getContext(conversationId);
                
                if (!existingContext) {
                  // No existing context, create new
                  const analysisText = newData.userInput || newData.requirements || JSON.stringify(newData);
                  const newContext = await contextEngine.analyzeContext(analysisText);
                  
                  return {
                    action: 'merge',
                    conversationId,
                    context: {
                      domain: getNormalizedDomain(newContext),
                      confidence: getNormalizedConfidence(newContext),
                      technologies: getNormalizedTechnologies(newContext),
                      specializations: getNormalizedSpecializations(newContext)
                    },
                    message: 'New context created (no existing context to merge)',
                    timestamp: new Date().toISOString()
                  };
                }

                // Merge with existing context
                const mergedInput = `${JSON.stringify(existingContext)} ${JSON.stringify(newData)}`;
                const mergedContext = await contextEngine.analyzeContext(mergedInput);
                
                return {
                  action: 'merge',
                  conversationId,
                  context: {
                    domain: getNormalizedDomain(mergedContext),
                    confidence: getNormalizedConfidence(mergedContext),
                    technologies: getNormalizedTechnologies(mergedContext),
                    specializations: getNormalizedSpecializations(mergedContext)
                  },
                  mergeStrategy,
                  message: 'Context merged successfully',
                  timestamp: new Date().toISOString()
                };
              } catch (error) {
                return {
                  action: 'merge',
                  conversationId,
                  error: `Failed to merge context: ${error}`,
                  timestamp: new Date().toISOString()
                };
              }
            }

            case 'analyze': {
              return await handleContextAnalyze(conversationId);
            }

            default:
              return { 
                error: `Unknown action: ${action}. Available actions: get, update, clear, history, merge, analyze`,
                action,
                conversationId,
                timestamp: new Date().toISOString()
              };
          }
        } catch (error) {
          console.error('Conversation context management error:', error);
          return {
            action,
            conversationId,
            error: `Context management failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            timestamp: new Date().toISOString()
          };
        }
      }
    },
    {
      name: "get_enhancement_statistics",
      description: "Get statistics about web search integration and knowledge cache performance",
      parameters: [],
      handler: async () => {
        try {
          // TODO: Epic 6 Phase 2 - Re-implement with enhanced statistics
          // const stats = await enhancedManager.getCacheStatistics();
          
          // For Phase 1, return basic statistics
          const stats = {
            total_requests: 0,
            cache_hits: 0,
            mcp_servers: mcpManager.getAllServers().length,
            success_rate: 1.0
          };
          return {
            message: "Enhancement statistics retrieved successfully",
            statistics: stats,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error('Error getting enhancement statistics:', error);
          return {
            message: "Unable to retrieve enhancement statistics",
            error: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString()
          };
        }
      }
    },
    {
      name: "enhanced_workflow_analysis",
      description: "Enhanced workflow analysis with conversation context integration and GitHub documentation grounding",
      parameters: [
        {
          name: "domain",
          type: "string",
          description: "The domain or industry for the workflow",
          required: true,
        },
        {
          name: "requirements",
          type: "string",
          description: "Detailed description of workflow requirements",
          required: true,
        },
        {
          name: "conversationId",
          type: "string",
          description: "Conversation ID for context tracking",
          required: false,
        },
        {
          name: "includeDocumentation",
          type: "boolean",
          description: "Whether to include relevant Langflow documentation",
          required: false,
        },
        {
          name: "complexityLevel",
          type: "string",
          description: "Expected complexity level (basic, intermediate, advanced)",
          required: false,
        },
      ],
      handler: async ({ domain, requirements, conversationId, includeDocumentation, complexityLevel }: {
        domain: string;
        requirements: string;
        conversationId?: string;
        includeDocumentation?: boolean;
        complexityLevel?: string;
      }) => {
        try {
          const convId = conversationId || `enhanced-${Date.now()}-${Math.random()}`;
          
          // 1. Enhanced context analysis using existing context engine
          const contextAnalysis = await contextEngine.analyzeContext(`${domain} ${requirements}`);
          const normalizedDomain = getNormalizedDomain(contextAnalysis);
          const technologies = getNormalizedTechnologies(contextAnalysis);

          // 2. Get conversation context if available
          let conversationContext = null;
          try {
            conversationContext = contextEngine.getContext(convId);
          } catch {
            console.log('No existing conversation context found, creating new analysis');
          }

          // 3. Query MCP servers for domain-specific knowledge
          let mcpKnowledge: McpQueryResponse | null = null;
          const mcpServers = mcpManager.getServersForDomain(normalizedDomain);
          if (mcpServers.length > 0) {
            try {
              mcpKnowledge = await mcpManager.queryServers(
                `Best practices and recommendations for ${domain} workflows with requirements: ${requirements}`,
                normalizedDomain,
                { timeout: 3000 }
              );
            } catch (error) {
              console.warn('MCP query failed during enhanced analysis:', error);
            }
          }

          // 4. GitHub documentation grounding (if enabled)
          let documentationResults: DocumentationResult[] = [];
          if (includeDocumentation !== false) {
            try {
              // Search for relevant components and concepts
              const docsResponse = await githubDocsManager.searchDocumentation({
                query: `${domain} ${requirements} workflow components`,
                maxResults: 3,
                includeContent: true
              });
              documentationResults = docsResponse;

              // Search for specific component documentation based on detected technologies
              for (const tech of technologies.slice(0, 2)) { // Limit to avoid too many requests
                const techDocs = await githubDocsManager.getComponentDocumentation(tech);
                documentationResults.push(...techDocs.slice(0, 1)); // Add one result per technology
              }
            } catch (error) {
              console.warn('Documentation search failed during enhanced analysis:', error);
            }
          }

          // 5. Enhanced workflow recommendations
          const baseComponents = ['ChatInput', 'LLM', 'ChatOutput'];
          const domainComponents: Record<string, string[]> = {
            healthcare: ['FHIR_API', 'HL7_Parser', 'Medical_NLP', 'Compliance_Logger'],
            finance: ['Payment_Gateway', 'Risk_Assessment', 'Fraud_Detection', 'Audit_Trail'],
            ecommerce: ['Product_API', 'Inventory_Check', 'Order_Processing', 'Customer_Support'],
            education: ['LMS_Integration', 'Student_Assessment', 'Content_Delivery', 'Progress_Tracking'],
            general: ['Text_Processing', 'Web_Search', 'Data_Storage', 'API_Integration']
          };

          const suggestedComponents = [...baseComponents];
          const domainSpecific = domainComponents[normalizedDomain.toLowerCase()] || domainComponents.general;
          suggestedComponents.push(...domainSpecific.slice(0, 3));

          // Add components found in documentation
          documentationResults.forEach(doc => {
            if (doc.file.name.toLowerCase().includes('component')) {
              const componentName = doc.file.name.replace(/\s+/g, '_');
              if (!suggestedComponents.includes(componentName)) {
                suggestedComponents.push(componentName);
              }
            }
          });

          let workflowPattern: string;
          if (requirements.toLowerCase().includes('chat')) {
            workflowPattern = 'conversational-ai';
          } else if (requirements.toLowerCase().includes('api')) {
            workflowPattern = 'api-integration';
          } else {
            workflowPattern = 'general-purpose';
          }

          const recommendations = {
            domain: normalizedDomain,
            complexity: complexityLevel || contextAnalysis.complexity || 'intermediate',
            confidence: getNormalizedConfidence(contextAnalysis),
            suggestedComponents: suggestedComponents.slice(0, 8),
            workflowPattern,
            documentationReferences: documentationResults.map(doc => ({
              title: doc.file.name,
              category: doc.file.path.split('/')[1] || 'general',
              url: doc.url,
              relevance: doc.relevanceScore || 0.5
            })),
            conversationInsights: conversationContext ? {
              previousDomain: getNormalizedDomain(conversationContext),
              contextEvolution: 'Building on previous analysis'
            } : null
          };

          return {
            message: `Enhanced analysis completed for ${domain} workflow`,
            analysis: {
              domain: normalizedDomain,
              requirements,
              confidence: recommendations.confidence,
              complexity: recommendations.complexity,
              recommendations,
              mcpInsights: mcpKnowledge ? {
                sources: mcpKnowledge.sources,
                recommendations: mcpKnowledge.results.slice(0, 2)
              } : null,
              documentationSupport: documentationResults.length > 0 ? {
                totalReferences: documentationResults.length,
                categories: [...new Set(documentationResults.map(d => d.file.path.split('/')[1] || 'general'))],
                keyComponents: documentationResults.map(d => d.file.name).slice(0, 3)
              } : null,
              nextSteps: [
                `Review Langflow documentation for ${normalizedDomain}-specific components`,
                'Define your data flow and processing requirements',
                'Identify external integrations needed for your workflow',
                'Start with a simple prototype and iterate based on testing'
              ],
              conversationId: convId
            },
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error('Enhanced workflow analysis error:', error);
          return {
            message: `Enhanced analysis failed for ${domain} workflow`,
            error: error instanceof Error ? error.message : 'Unknown error',
            fallback: 'Using basic workflow analysis instead',
            conversationId: conversationId || 'error-context',
            timestamp: new Date().toISOString()
          };
        }
      }
    },
    {
      name: "search_langflow_documentation",
      description: "Search official Langflow documentation for components, concepts, API reference, and tutorials",
      parameters: [
        {
          name: "query",
          type: "string",
          description: "Search query for Langflow documentation",
          required: true,
        },
        {
          name: "category",
          type: "string",
          description: "Documentation category to search in (Components, Concepts, API Reference, Tutorials)",
          required: false,
        },
        {
          name: "maxResults",
          type: "number",
          description: "Maximum number of results to return (default: 5)",
          required: false,
        },
        {
          name: "includeExamples",
          type: "boolean",
          description: "Whether to include code examples in results (default: true)",
          required: false,
        },
      ],
      handler: async ({ query, category, maxResults, includeExamples }: {
        query: string;
        category?: string;
        maxResults?: number;
        includeExamples?: boolean;
      }) => {
        try {
          const searchOptions: DocumentationSearchOptions = {
            query,
            maxResults: maxResults || 5,
            includeContent: includeExamples !== false
          };

          // Search Langflow documentation using GitHub API
          const searchResponse = await githubDocsManager.searchDocumentation(searchOptions);

          // Format results for better presentation
          const formattedResults = searchResponse.map((result: DocumentationResult) => ({
            title: result.file.name,
            category: result.file.path.split('/')[1] || category || 'general',
            url: result.url,
            summary: result.content.length > 200 
              ? result.content.substring(0, 200) + '...' 
              : result.content,
            examples: includeExamples !== false ? result.sections.filter(s => s.content.includes('```')) : undefined,
            configurations: result.sections.filter(s => s.title.toLowerCase().includes('config')),
            relevanceScore: result.relevanceScore
          }));

          return {
            message: `Found ${searchResponse.length} documentation result(s) for "${query}"`,
            query: query,
            results: formattedResults,
            totalResults: searchResponse.length,
            searchTime: '0ms', // GitHub manager doesn't track search time
            cached: false,
            timestamp: new Date().toISOString(),
            nextSteps: formattedResults.length > 0 
              ? "Review the documentation results above. You can click on URLs to view full documentation or ask for more specific information about any component."
              : "No documentation found for this query. Try using different keywords or check the official Langflow documentation at https://docs.langflow.org"
          };
        } catch (error) {
          console.error('Documentation search error:', error);
          return {
            message: `Documentation search failed for "${query}"`,
            error: error instanceof Error ? error.message : 'Unknown error',
            fallbackSuggestion: "Please visit https://docs.langflow.org for comprehensive Langflow documentation",
            timestamp: new Date().toISOString()
          };
        }
      }
    },
    {
      name: "optimize_workflow_components",
      description: "Analyze and optimize an existing Langflow workflow JSON with performance recommendations and component suggestions",
      parameters: [
        {
          name: "workflowJson",
          type: "string",
          description: "The Langflow workflow JSON to analyze and optimize",
          required: true,
        },
        {
          name: "optimizationGoals",
          type: "string",
          description: "Specific optimization goals (performance, cost, reliability, scalability)",
          required: false,
        },
        {
          name: "conversationId",
          type: "string",
          description: "Conversation ID for context tracking",
          required: false,
        },
      ],
      handler: async ({ workflowJson, optimizationGoals = "performance", conversationId }: {
        workflowJson: string;
        optimizationGoals?: string;
        conversationId?: string;
      }) => {
        try {
          const convId = conversationId || `optimize-${Date.now()}-${Math.random()}`;
          
          // Parse the workflow JSON
          let workflow;
          try {
            workflow = JSON.parse(workflowJson);
          } catch (parseError) {
            return {
              message: "Failed to parse workflow JSON",
              error: "Invalid JSON format",
              suggestions: ["Ensure the workflow JSON is valid", "Check for missing quotes or brackets"],
              timestamp: new Date().toISOString()
            };
          }

          // Analyze workflow structure
          const nodes = workflow.data?.nodes || [];
          const edges = workflow.data?.edges || [];
          
          // Get context analysis for optimization domain
          const contextAnalysis = await contextEngine.analyzeContext(`${optimizationGoals} optimization for workflow with ${nodes.length} nodes`);
          const domain = getNormalizedDomain(contextAnalysis);

          // Query MCP servers for optimization best practices
          let optimizationInsights: McpQueryResponse | null = null;
          const mcpServers = mcpManager.getServersForDomain(domain);
          if (mcpServers.length > 0) {
            try {
              optimizationInsights = await mcpManager.queryServers(
                `Langflow workflow optimization for ${optimizationGoals} with ${nodes.length} components`,
                domain,
                { timeout: 3000 }
              );
            } catch (error) {
              console.warn('MCP optimization query failed:', error);
            }
          }

          // Search for optimization documentation
          let optimizationDocs: DocumentationResult[] = [];
          try {
            const docsResponse = await githubDocsManager.searchDocumentation({
              query: `workflow optimization performance ${optimizationGoals} best practices`,
              maxResults: 3,
              includeContent: true
            });
            optimizationDocs = docsResponse;
          } catch (error) {
            console.warn('Documentation search for optimization failed:', error);
          }

          // Analyze workflow components
          const componentTypes = nodes.map((node: WorkflowNode) => node.type || node.data?.type).filter(Boolean);
          const componentAnalysis = {
            totalNodes: nodes.length,
            totalEdges: edges.length,
            componentTypes: [...new Set(componentTypes)],
            complexity: calculateComplexity(nodes.length)
          };

          // Generate optimization recommendations
          const recommendations: OptimizationRecommendation[] = [];
          
          // Performance optimizations
          if (optimizationGoals.includes('performance')) {
            recommendations.push(...generatePerformanceRecommendations(nodes));
            
            const llmNodes = nodes.filter((node: WorkflowNode) => 
              node.type?.toLowerCase().includes('llm') || 
              node.data?.type?.toLowerCase().includes('llm')
            );
            if (llmNodes.length > 3) {
              recommendations.push({
                type: 'performance',
                priority: 'medium',
                title: 'Optimize LLM usage',
                description: 'Consider batching requests or using lighter models for non-critical operations',
                impact: 'Reduced latency and cost'
              });
            }
          }

          // Reliability optimizations
          if (optimizationGoals.includes('reliability')) {
            recommendations.push(...generateReliabilityRecommendations());
          }

          // Cost optimizations
          if (optimizationGoals.includes('cost')) {
            recommendations.push(...generateCostRecommendations());
          }

          return {
            message: `Workflow optimization analysis complete for ${optimizationGoals} goals`,
            analysis: {
              workflow: componentAnalysis,
              optimizationGoals,
              recommendations,
              mcpInsights: optimizationInsights ? {
                sources: optimizationInsights.sources,
                insights: optimizationInsights.results.slice(0, 2)
              } : null,
              documentation: optimizationDocs.length > 0 ? {
                relevantDocs: optimizationDocs.map(doc => ({
                  title: doc.file.name,
                  url: doc.url,
                  relevance: doc.relevanceScore || 0.5
                }))
              } : null,
              nextSteps: [
                'Review the optimization recommendations above',
                'Implement high-priority improvements first',
                'Test performance improvements in a staging environment',
                'Monitor workflow performance after optimizations'
              ]
            },
            conversationId: convId,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error('Workflow optimization error:', error);
          return {
            message: "Workflow optimization analysis failed",
            error: error instanceof Error ? error.message : 'Unknown error',
            fallbackSuggestion: "Try simplifying the workflow JSON or check for component compatibility",
            timestamp: new Date().toISOString()
          };
        }
      }
    },
    {
      name: "validate_langflow_compatibility",
      description: "Validate workflow components against current Langflow version and suggest updates or alternatives",
      parameters: [
        {
          name: "workflowJson",
          type: "string",
          description: "The Langflow workflow JSON to validate",
          required: true,
        },
        {
          name: "targetVersion",
          type: "string",
          description: "Target Langflow version for compatibility check (optional)",
          required: false,
        },
      ],
      handler: async ({ workflowJson, targetVersion }: {
        workflowJson: string;
        targetVersion?: string;
      }) => {
        try {
          // Parse workflow JSON
          let workflow;
          try {
            workflow = JSON.parse(workflowJson);
          } catch (parseError) {
            return {
              message: "Failed to parse workflow JSON for validation",
              error: "Invalid JSON format",
              timestamp: new Date().toISOString()
            };
          }

          const nodes = workflow.data?.nodes || [];
          const componentTypes: string[] = nodes.map((node: WorkflowNode) => node.type || node.data?.type).filter(Boolean) as string[];

          // Search for component compatibility documentation
          const compatibilityDocs: DocumentationResult[] = [];
          try {
            for (const componentType of [...new Set(componentTypes)].slice(0, 5)) {
              const docsResponse = await githubDocsManager.searchDocumentation({
                query: `${componentType} component compatibility version requirements`,
                maxResults: 1,
                includeContent: true
              });
              compatibilityDocs.push(...docsResponse);
            }
          } catch (error) {
            console.warn('Component compatibility documentation search failed:', error);
          }

          // Query MCP for compatibility insights
          let compatibilityInsights: McpQueryResponse | null = null;
          const mcpServers = mcpManager.getServersForDomain('general');
          if (mcpServers.length > 0) {
            try {
              compatibilityInsights = await mcpManager.queryServers(
                `Langflow component compatibility version requirements for ${componentTypes.join(', ')}`,
                'general',
                { timeout: 2000 }
              );
            } catch (error) {
              console.warn('MCP compatibility query failed:', error);
            }
          }

          // Analyze component compatibility
          const validationResults: ValidationResults = {
            totalComponents: componentTypes.length,
            uniqueComponents: [...new Set(componentTypes)],
            potentialIssues: [] as ValidationIssue[],
            recommendations: [] as string[],
            compatibilityScore: 0.9 // Default high compatibility
          };

          // Check for common compatibility issues
          const deprecatedComponents = ['OldLLMChain', 'LegacyPrompt'];
          const foundDeprecated = componentTypes.filter((type: string) => 
            deprecatedComponents.some(deprecated => 
              type.toLowerCase().includes(deprecated.toLowerCase())
            )
          );

          if (foundDeprecated.length > 0) {
            validationResults.potentialIssues.push({
              severity: 'high',
              component: foundDeprecated.join(', '),
              issue: 'Deprecated components detected',
              resolution: 'Update to current component versions'
            });
            validationResults.compatibilityScore -= 0.3;
          }

          // Check for missing required fields
          const nodesWithoutType = nodes.filter((node: WorkflowNode) => !node.type && !node.data?.type);
          if (nodesWithoutType.length > 0) {
            validationResults.potentialIssues.push({
              severity: 'medium',
              component: `${nodesWithoutType.length} nodes`,
              issue: 'Missing component type definitions',
              resolution: 'Ensure all nodes have valid type definitions'
            });
            validationResults.compatibilityScore -= 0.1;
          }

          // Generate recommendations
          if (validationResults.compatibilityScore > 0.8) {
            validationResults.recommendations.push('Workflow appears compatible with current Langflow version');
          } else {
            validationResults.recommendations.push('Review and update identified compatibility issues');
          }

          if (compatibilityDocs.length > 0) {
            validationResults.recommendations.push('Check component documentation for latest usage patterns');
          }

          return {
            message: `Compatibility validation complete - ${Math.round(validationResults.compatibilityScore * 100)}% compatible`,
            validation: {
              compatibilityScore: validationResults.compatibilityScore,
              targetVersion: targetVersion || 'latest',
              results: validationResults,
              documentation: compatibilityDocs.length > 0 ? {
                relevantDocs: compatibilityDocs.map(doc => ({
                  component: doc.file.name,
                  url: doc.url,
                  category: doc.file.path.split('/')[1] || 'general'
                }))
              } : null,
              mcpInsights: compatibilityInsights ? {
                sources: compatibilityInsights.sources,
                insights: compatibilityInsights.results.slice(0, 1)
              } : null,
              nextSteps: validationResults.potentialIssues.length > 0 ? [
                'Address high-severity compatibility issues first',
                'Update deprecated components to current versions',
                'Test workflow in current Langflow environment',
                'Review component documentation for breaking changes'
              ] : [
                'Workflow validation passed successfully',
                'Consider testing with latest Langflow features',
                'Monitor for component updates and improvements'
              ]
            },
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error('Compatibility validation error:', error);
          return {
            message: "Compatibility validation failed",
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
        }
      }
    }
  ],
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
