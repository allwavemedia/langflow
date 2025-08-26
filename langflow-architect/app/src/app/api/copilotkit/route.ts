import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import OpenAI from "openai";
import { NextRequest } from "next/server";
import { contextEngine } from "../../../lib/enhanced/contextEngine";
import { mcpManager } from "../../../lib/enhanced/mcpManager";
import { EnhancedCopilotManager } from "../../../lib/enhanced/enhancedManager";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const serviceAdapter = new OpenAIAdapter({ openai });

// Initialize the enhanced copilot manager
const enhancedManager = new EnhancedCopilotManager();

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
          const enhancedResult = await enhancedManager.analyzeWorkflowWithEnhancement(
            domain,
            complexity,
            requirements
          );

          return enhancedResult;
        } catch (error) {
          console.error('Enhanced workflow analysis error:', error);
          
          // Fallback to contextEngine approach if enhanced features fail
          try {
            // Generate conversation ID if not provided
            const convId = conversationId || `conv-${Date.now()}-${Math.random()}`;
            
            // Enhanced context analysis using Context Understanding Engine
            const contextAnalysis = contextEngine.analyzeInitialContext(
              convId,
              `${domain} ${requirements}`,
              { expertiseLevel: complexity }
            );

            // Get domain-specific MCP servers
            const mcpServers = mcpManager.getServersForDomain(contextAnalysis.domainAnalysis.domain);
            
            // Query MCP servers for domain-specific knowledge (if available)
            let mcpKnowledge: any = null;
            if (mcpServers.length > 0) {
              try {
                const mcpResults = await mcpManager.queryServers(
                  `Best practices for ${domain} workflows with ${requirements}`,
                  contextAnalysis.domainAnalysis.domain,
                  { timeout: 3000 }
                );
                mcpKnowledge = mcpResults;
              } catch (error) {
                console.warn('MCP query failed, continuing with local knowledge:', error);
              }
            }

            // Generate contextual questions using the context engine
            const contextualQuestions = contextEngine.generateContextualQuestions(contextAnalysis);

            // Enhanced Socratic questioning logic for Langflow workflows
            interface ComplexityLevel {
              questions: string[];
              components: string[];
            }
            
            const complexityLevels: Record<string, ComplexityLevel> = {
              simple: {
                questions: [
                  `For a ${contextAnalysis.domainAnalysis.domain} workflow, what specific data will you be processing?`,
                  "What is the main goal or output you want to achieve?",
                  "Do you need any external integrations (APIs, databases, etc.)?",
                  ...contextualQuestions.slice(0, 2)
                ],
                components: ["Input nodes", "LLM processing", "Output formatting"]
              },
              moderate: {
                questions: [
                  `What are the key decision points in your ${contextAnalysis.domainAnalysis.domain} workflow?`,
                  "How should the system handle different types of inputs?",
                  "What conditional logic or branching do you need?",
                  "How will you validate and process the outputs?",
                  ...contextualQuestions.slice(0, 2)
                ],
                components: ["Multi-step processing", "Conditional logic", "Data validation", "Error handling"]
              },
              complex: {
                questions: [
                  `What are the performance and scalability requirements for your ${contextAnalysis.domainAnalysis.domain} solution?`,
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
              analysis: `Analyzing ${complexity} workflow for ${contextAnalysis.domainAnalysis.domain} domain (${(contextAnalysis.domainAnalysis.confidence * 100).toFixed(1)}% confidence)`,
              suggested_questions: level.questions,
              recommended_components: level.components,
              requirements: requirements,
              context_analysis: {
                domain: contextAnalysis.domainAnalysis.domain,
                confidence: contextAnalysis.domainAnalysis.confidence,
                technology_stack: contextAnalysis.technologyStack.platform,
                compliance_requirements: contextAnalysis.technologyStack.compliance,
                specializations: contextAnalysis.specializations
              },
              mcp_sources: mcpServers.map((server: any) => server.name),
              external_knowledge: mcpKnowledge ? {
                sources: mcpKnowledge.sources,
                insights: mcpKnowledge.results.length > 0 ? "Enhanced with domain-specific knowledge" : null
              } : null,
              conversation_id: convId,
              next_steps: `Let's explore the specific components and flow for your ${contextAnalysis.domainAnalysis.domain} workflow with ${contextAnalysis.technologyStack.platform} integration.`
            };

            return response;
          } catch (fallbackError) {
            console.error('Fallback analysis also failed:', fallbackError);
            
            // Basic fallback if all enhanced features fail
            const complexityLevels: Record<string, any> = {
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
          // Use enhanced question generation with external knowledge
          const enhancedResult = await enhancedManager.generateEnhancedQuestions(
            category,
            user_expertise
          );

          return enhancedResult;
        } catch (error) {
          console.error('Enhanced question generation error:', error);
          
          // Fallback to contextEngine approach
          try {
            let contextAnalysis = null;
            
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
            let domainKnowledge: any = null;
            if (contextAnalysis) {
              const mcpServers = mcpManager.getServersForDomain(contextAnalysis.domainAnalysis.domain);
              
              if (mcpServers.length > 0) {
                try {
                  const mcpResults = await mcpManager.queryServers(
                    `Common questions and considerations for ${category} in ${contextAnalysis.domainAnalysis.domain}`,
                    contextAnalysis.domainAnalysis.domain,
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
              const contextualQuestions = contextEngine.generateContextualQuestions(contextAnalysis);
              questions = [...questions.slice(0, 3), ...contextualQuestions.slice(0, 2)];
            }

            // Build response with enhanced information
            const response = {
              questions: questions.slice(0, 5), // Limit to 5 questions
              category,
              expertise_level: user_expertise,
              context_intelligence: contextAnalysis ? {
                domain: contextAnalysis.domainAnalysis.domain,
                confidence: contextAnalysis.domainAnalysis.confidence,
                technology_stack: contextAnalysis.technologyStack.platform,
                specializations: contextAnalysis.specializations
              } : null,
              external_sources: domainKnowledge ? domainKnowledge.sources : [],
              enhanced_insights: domainKnowledge?.results.length > 0 ? 
                "Questions enhanced with domain-specific knowledge" : null,
              next_steps: `Based on your answers to these ${contextAnalysis?.domainAnalysis.domain || 'workflow'}-specific questions, I'll help you design the specific Langflow components for your ${category} workflow.`
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
                servers: servers.map((server: any) => ({
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
                summary: `Found ${servers.length} MCP servers (${servers.filter((s: any) => s.isActive).length} active)`
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
              } catch (parseError) {
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
      name: "get_enhancement_statistics",
      description: "Get statistics about web search integration and knowledge cache performance",
      parameters: [],
      handler: async () => {
        try {
          const stats = await enhancedManager.getCacheStatistics();
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
