// Test Helper Functions for Socratic Langflow Architect

export interface ApiCall {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
}

export interface ApiResponse {
  url: string;
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface WorkflowTestScenario {
  name: string;
  userInput: string;
  expectedDomain: string;
  expectedComplexity: 'simple' | 'moderate' | 'complex';
  expectedQuestions: string[];
  expectedComponents: string[];
}

export interface LangflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    type: string;
    node: {
      template: Record<string, unknown>;
    };
  };
}

export interface LangflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface LangflowJSON {
  data: {
    nodes: LangflowNode[];
    edges: LangflowEdge[];
  };
  description: string;
  name: string;
}

export class TestScenarioBuilder {
  private scenarios: WorkflowTestScenario[] = [];

  addChatbotScenario(complexity: 'simple' | 'moderate' | 'complex'): this {
    this.scenarios.push({
      name: `Chatbot - ${complexity}`,
      userInput: `I want to create a ${complexity} customer service chatbot`,
      expectedDomain: 'customer service',
      expectedComplexity: complexity,
      expectedQuestions: ['conversations', 'personality', 'integrations', 'fallback'],
      expectedComponents: ['ChatInput', 'OpenAI', 'ChatOutput']
    });
    return this;
  }

  addDataProcessingScenario(complexity: 'simple' | 'moderate' | 'complex'): this {
    this.scenarios.push({
      name: `Data Processing - ${complexity}`,
      userInput: `I need to build a ${complexity} data processing pipeline`,
      expectedDomain: 'data processing',
      expectedComplexity: complexity,
      expectedQuestions: ['data sources', 'transformation', 'validation', 'output'],
      expectedComponents: ['FileInput', 'DataProcessor', 'TextOutput']
    });
    return this;
  }

  addAutomationScenario(complexity: 'simple' | 'moderate' | 'complex'): this {
    this.scenarios.push({
      name: `Automation - ${complexity}`,
      userInput: `I want to automate a ${complexity} business process`,
      expectedDomain: 'automation',
      expectedComplexity: complexity,
      expectedQuestions: ['triggers', 'steps', 'conditions', 'monitoring'],
      expectedComponents: ['TriggerInput', 'ConditionalLogic', 'ActionOutput']
    });
    return this;
  }

  build(): WorkflowTestScenario[] {
    return this.scenarios;
  }
}

export class ApiTestValidator {
  static validateCopilotKitResponse(responseData: any): boolean {
    try {
      // Validate basic OpenAI response structure
      if (!responseData || typeof responseData !== 'object') {
        return false;
      }

      if (!responseData.choices || !Array.isArray(responseData.choices)) {
        return false;
      }

      if (responseData.choices.length === 0) {
        return false;
      }

      const firstChoice = responseData.choices[0];
      if (!firstChoice.message || typeof firstChoice.message.content !== 'string') {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  static validateLangflowJSON(jsonData: any): boolean {
    try {
      if (!jsonData || typeof jsonData !== 'object') {
        return false;
      }

      if (!jsonData.data || typeof jsonData.data !== 'object') {
        return false;
      }

      if (!Array.isArray(jsonData.data.nodes) || !Array.isArray(jsonData.data.edges)) {
        return false;
      }

      // Validate node structure
      for (const node of jsonData.data.nodes) {
        if (!node.id || !node.type || !node.position || !node.data) {
          return false;
        }
      }

      // Validate edge structure
      for (const edge of jsonData.data.edges) {
        if (!edge.id || !edge.source || !edge.target) {
          return false;
        }
      }

      return true;
    } catch {
      return false;
    }
  }

  static extractJsonFromResponse(responseText: string): any | null {
    try {
      // Try to find JSON in the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch {
      return null;
    }
  }

  static validateSocraticResponse(responseText: string, expectedKeywords: string[]): boolean {
    const lowerResponse = responseText.toLowerCase();
    
    // Check for question indicators
    const hasQuestions = /\?/.test(responseText);
    
    // Check for expected keywords
    const hasKeywords = expectedKeywords.some(keyword => 
      lowerResponse.includes(keyword.toLowerCase())
    );
    
    // Check for reasonable length (meaningful response)
    const hasContent = responseText.length > 50;
    
    return hasQuestions && hasKeywords && hasContent;
  }
}

export class PerformanceTracker {
  private metrics: number[] = [];
  
  startTimer(): number {
    return Date.now();
  }
  
  endTimer(startTime: number): number {
    const endTime = Date.now();
    const duration = endTime - startTime;
    this.metrics.push(duration);
    return duration;
  }
  
  getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    return this.metrics.reduce((a, b) => a + b, 0) / this.metrics.length;
  }
  
  getMaxResponseTime(): number {
    return this.metrics.length > 0 ? Math.max(...this.metrics) : 0;
  }
  
  getMinResponseTime(): number {
    return this.metrics.length > 0 ? Math.min(...this.metrics) : 0;
  }
  
  getAllMetrics(): number[] {
    return [...this.metrics];
  }
  
  reset(): void {
    this.metrics = [];
  }
}

export const commonWorkflowPrompts = {
  chatbot: {
    simple: "I want to create a basic FAQ chatbot for my website",
    moderate: "I need a customer support chatbot with conversation context and external API integration",
    complex: "I want to build an advanced AI assistant with multi-turn conversations, authentication, and analytics"
  },
  dataProcessing: {
    simple: "I need to process CSV files and generate summaries",
    moderate: "I want to build a document processing pipeline with OCR and text extraction",
    complex: "I need a real-time data processing system with streaming, validation, and distributed processing"
  },
  automation: {
    simple: "I want to automate sending email notifications",
    moderate: "I need to automate my order fulfillment process with approval workflows",
    complex: "I want to build a complex business process automation with multiple integrations and monitoring"
  },
  contentGeneration: {
    simple: "I want to generate blog post summaries",
    moderate: "I need an automated content creation system with templates and review processes",
    complex: "I want to build a personalized content generation platform with A/B testing and optimization"
  }
};

export function createMockLangflowJSON(workflowType: string, complexity: string): LangflowJSON {
  const baseNodes: LangflowNode[] = [
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
              value: "User input"
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
  ];

  const baseEdges: LangflowEdge[] = [
    {
      id: "edge-1",
      source: "input-1",
      target: "output-1"
    }
  ];

  return {
    data: {
      nodes: baseNodes,
      edges: baseEdges
    },
    description: `${complexity} ${workflowType} workflow`,
    name: `Generated ${workflowType} Workflow`
  };
}
