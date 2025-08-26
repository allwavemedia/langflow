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
