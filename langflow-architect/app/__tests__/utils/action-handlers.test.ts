import '@testing-library/jest-dom'

// Mock workflow analysis action handler
const mockAnalyzeWorkflowRequirements = async ({
  domain,
  complexity,
  requirements
}: {
  domain: string;
  complexity: string;
  requirements: string;
}) => {
  const complexityLevels = {
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
  }

  const level = complexityLevels[complexity.toLowerCase() as keyof typeof complexityLevels] || complexityLevels.simple

  return {
    analysis: `Analyzing ${complexity} workflow for ${domain} domain`,
    suggested_questions: level.questions,
    recommended_components: level.components,
    requirements: requirements,
    next_steps: `Let's explore the specific components and flow for your ${domain} workflow.`
  }
}

const mockGenerateWorkflowQuestions = async ({
  category,
  user_expertise
}: {
  category: string;
  user_expertise: string;
}) => {
  const questionTemplates = {
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
      ]
    },
    intermediate: {
      chatbot: [
        "How will your chatbot maintain conversation context?",
        "What APIs or external services will it integrate with?",
        "How will you handle user authentication and personalization?",
        "What fallback mechanisms will you implement for unclear queries?"
      ]
    }
  }

  const expertiseQuestions = questionTemplates[user_expertise.toLowerCase() as keyof typeof questionTemplates]
  const questions = expertiseQuestions?.[category.toLowerCase() as keyof typeof expertiseQuestions] || 
                   [`What are the main requirements for your ${category} workflow?`]

  return {
    questions,
    category,
    expertise_level: user_expertise,
    next_steps: `Based on your answers, I'll help you design the specific Langflow components for your ${category} workflow.`
  }
}

const mockGenerateLangflowJson = async ({
  workflow_description,
  components
}: {
  workflow_description: string;
  components: string;
}) => {
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
  }

  return {
    langflow_json: langflowTemplate,
    description: "Generated Langflow workflow based on your requirements",
    components_used: components,
    next_steps: "You can now download this JSON file and import it into Langflow for further customization."
  }
}

describe('CopilotKit Action Handlers', () => {
  describe('analyze_workflow_requirements', () => {
    test('handles simple workflow analysis correctly', async () => {
      const result = await mockAnalyzeWorkflowRequirements({
        domain: 'e-commerce',
        complexity: 'simple',
        requirements: 'Basic product recommendation system'
      })

      expect(result.analysis).toBe('Analyzing simple workflow for e-commerce domain')
      expect(result.suggested_questions).toHaveLength(3)
      expect(result.suggested_questions[0]).toContain('e-commerce workflow')
      expect(result.recommended_components).toContain('Input nodes')
      expect(result.requirements).toBe('Basic product recommendation system')
    })

    test('handles moderate complexity workflow', async () => {
      const result = await mockAnalyzeWorkflowRequirements({
        domain: 'healthcare',
        complexity: 'moderate',
        requirements: 'Patient data processing pipeline'
      })

      expect(result.analysis).toBe('Analyzing moderate workflow for healthcare domain')
      expect(result.suggested_questions).toHaveLength(4)
      expect(result.suggested_questions[0]).toContain('healthcare workflow')
      expect(result.recommended_components).toContain('Conditional logic')
    })

    test('handles complex workflow analysis', async () => {
      const result = await mockAnalyzeWorkflowRequirements({
        domain: 'fintech',
        complexity: 'complex',
        requirements: 'Real-time fraud detection system'
      })

      expect(result.analysis).toBe('Analyzing complex workflow for fintech domain')
      expect(result.suggested_questions).toHaveLength(4)
      expect(result.recommended_components).toContain('Monitoring')
      expect(result.recommended_components).toContain('Scalability patterns')
    })

    test('defaults to simple complexity for unknown levels', async () => {
      const result = await mockAnalyzeWorkflowRequirements({
        domain: 'unknown',
        complexity: 'invalid',
        requirements: 'Test requirements'
      })

      expect(result.suggested_questions).toHaveLength(3)
      expect(result.recommended_components).toContain('Input nodes')
    })
  })

  describe('generate_workflow_questions', () => {
    test('generates beginner chatbot questions', async () => {
      const result = await mockGenerateWorkflowQuestions({
        category: 'chatbot',
        user_expertise: 'beginner'
      })

      expect(result.questions).toHaveLength(4)
      expect(result.questions[0]).toContain('conversations should your chatbot handle')
      expect(result.category).toBe('chatbot')
      expect(result.expertise_level).toBe('beginner')
    })

    test('generates intermediate chatbot questions', async () => {
      const result = await mockGenerateWorkflowQuestions({
        category: 'chatbot',
        user_expertise: 'intermediate'
      })

      expect(result.questions).toHaveLength(4)
      expect(result.questions[0]).toContain('conversation context')
      expect(result.expertise_level).toBe('intermediate')
    })

    test('generates beginner data processing questions', async () => {
      const result = await mockGenerateWorkflowQuestions({
        category: 'data processing',
        user_expertise: 'beginner'
      })

      expect(result.questions).toHaveLength(4)
      expect(result.questions[0]).toContain('type of data')
    })

    test('falls back to generic questions for unknown categories', async () => {
      const result = await mockGenerateWorkflowQuestions({
        category: 'unknown_category',
        user_expertise: 'beginner'
      })

      expect(result.questions).toHaveLength(1)
      expect(result.questions[0]).toContain('main requirements for your unknown_category workflow')
    })
  })

  describe('generate_langflow_json', () => {
    test('generates basic langflow workflow structure', async () => {
      const result = await mockGenerateLangflowJson({
        workflow_description: 'Simple chatbot workflow',
        components: 'Input, LLM, Output'
      })

      expect(result.langflow_json.data.nodes).toHaveLength(3)
      expect(result.langflow_json.data.edges).toHaveLength(2)
      expect(result.langflow_json.description).toBe('Simple chatbot workflow')
      expect(result.langflow_json.name).toBe('Generated Workflow')
    })

    test('includes correct node types and connections', async () => {
      const result = await mockGenerateLangflowJson({
        workflow_description: 'Test workflow',
        components: 'Standard components'
      })

      const { nodes, edges } = result.langflow_json.data

      // Check node types
      expect(nodes[0].type).toBe('ChatInput')
      expect(nodes[1].type).toBe('OpenAIModel')
      expect(nodes[2].type).toBe('ChatOutput')

      // Check connections
      expect(edges[0].source).toBe('input-1')
      expect(edges[0].target).toBe('llm-1')
      expect(edges[1].source).toBe('llm-1')
      expect(edges[1].target).toBe('output-1')
    })

    test('includes proper node positioning', async () => {
      const result = await mockGenerateLangflowJson({
        workflow_description: 'Test workflow',
        components: 'Standard components'
      })

      const { nodes } = result.langflow_json.data

      expect(nodes[0].position).toEqual({ x: 100, y: 200 })
      expect(nodes[1].position).toEqual({ x: 400, y: 200 })
      expect(nodes[2].position).toEqual({ x: 700, y: 200 })
    })

    test('provides proper response metadata', async () => {
      const result = await mockGenerateLangflowJson({
        workflow_description: 'Test workflow',
        components: 'Test components'
      })

      expect(result.description).toBe('Generated Langflow workflow based on your requirements')
      expect(result.components_used).toBe('Test components')
      expect(result.next_steps).toContain('download this JSON file')
    })
  })
})
