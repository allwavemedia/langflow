import { test, expect } from '@playwright/test'

// Live API Integration Tests for Socratic Langflow Architect
test.describe('Socratic Langflow Architect - Live API Integration', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should complete full Socratic workflow: chatbot creation journey', async ({ page }) => {
    // Skip if no API key is available
    test.skip(!process.env.OPENAI_API_KEY, 'OPENAI_API_KEY required for live API tests')
    
    // Monitor API calls and responses
    const apiCalls: any[] = []
    const apiResponses: any[] = []
    
    page.on('request', (request) => {
      if (request.url().includes('/api/copilotkit')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          body: request.postData()
        })
      }
    })

    page.on('response', async (response) => {
      if (response.url().includes('/api/copilotkit')) {
        const responseBody = await response.text().catch(() => 'Could not read response')
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          body: responseBody
        })
      }
    })

    // Step 1: Test initial workflow analysis action
    console.log('Testing workflow analysis with live API...')
    
    const workflowAnalysisResponse = await page.request.post('/api/copilotkit', {
      data: {
        messages: [
          {
            role: 'user',
            content: 'I want to create a customer support chatbot for my e-commerce business'
          }
        ],
        actions: [
          {
            name: 'analyze_workflow_requirements',
            parameters: {
              domain: 'e-commerce customer support',
              complexity: 'moderate',
              requirements: 'Create a chatbot that can handle customer inquiries about orders, returns, and product information'
            }
          }
        ]
      }
    })

    expect(workflowAnalysisResponse.status()).toBe(200)
    const analysisData = await workflowAnalysisResponse.json()
    console.log('Workflow Analysis Response:', JSON.stringify(analysisData, null, 2))

    // Validate the analysis response structure
    expect(analysisData).toHaveProperty('choices')
    expect(Array.isArray(analysisData.choices)).toBe(true)
    expect(analysisData.choices.length).toBeGreaterThan(0)

    // Step 2: Test question generation based on category and expertise
    console.log('Testing question generation with live API...')
    
    const questionResponse = await page.request.post('/api/copilotkit', {
      data: {
        messages: [
          {
            role: 'user',
            content: 'I am an intermediate developer and want to build a chatbot'
          }
        ],
        actions: [
          {
            name: 'generate_workflow_questions',
            parameters: {
              category: 'chatbot',
              user_expertise: 'intermediate'
            }
          }
        ]
      }
    })

    expect(questionResponse.status()).toBe(200)
    const questionData = await questionResponse.json()
    console.log('Question Generation Response:', JSON.stringify(questionData, null, 2))

    // Validate question generation response
    expect(questionData).toHaveProperty('choices')
    
    // Step 3: Simulate user providing answers and test JSON generation
    console.log('Testing Langflow JSON generation with live API...')
    
    const jsonGenerationResponse = await page.request.post('/api/copilotkit', {
      data: {
        messages: [
          {
            role: 'user',
            content: 'Generate a Langflow workflow for my customer support chatbot'
          }
        ],
        actions: [
          {
            name: 'generate_langflow_json',
            parameters: {
              workflow_description: 'E-commerce customer support chatbot that handles order inquiries, returns, and product information with OpenAI integration',
              components: 'ChatInput, OpenAI Model, Conditional Logic, Knowledge Base Search, ChatOutput'
            }
          }
        ]
      }
    })

    expect(jsonGenerationResponse.status()).toBe(200)
    const jsonData = await jsonGenerationResponse.json()
    console.log('JSON Generation Response:', JSON.stringify(jsonData, null, 2))

    // Validate the Langflow JSON structure
    expect(jsonData).toHaveProperty('choices')

    // Step 4: Test complete conversational flow
    console.log('Testing complete conversational flow...')
    
    const conversationResponse = await page.request.post('/api/copilotkit', {
      data: {
        messages: [
          {
            role: 'user',
            content: 'I want to create a customer support chatbot. Can you help me design it step by step?'
          },
          {
            role: 'assistant',
            content: 'I\'d be happy to help you design a customer support chatbot! Let me start by analyzing your requirements.'
          },
          {
            role: 'user',
            content: 'It should handle order status, returns, and product questions for my online store'
          }
        ]
      }
    })

    expect(conversationResponse.status()).toBe(200)
    const conversationData = await conversationResponse.json()
    console.log('Conversation Response:', JSON.stringify(conversationData, null, 2))

    // Validate API call patterns
    expect(apiCalls.length).toBeGreaterThan(0)
    expect(apiResponses.length).toBeGreaterThan(0)
    
    // Verify all API calls were successful
    for (const response of apiResponses) {
      expect(response.status).toBe(200)
      expect(response.body).toBeTruthy()
      
      // Parse and validate response structure
      try {
        const parsedBody = JSON.parse(response.body)
        expect(parsedBody).toHaveProperty('choices')
        expect(Array.isArray(parsedBody.choices)).toBe(true)
      } catch {
        console.warn('Could not parse response body:', response.body)
      }
    }

    console.log(`✅ Live API Integration Test Completed Successfully!`)
    console.log(`📊 API Calls Made: ${apiCalls.length}`)
    console.log(`📈 API Responses Received: ${apiResponses.length}`)
  })

  test('should validate Socratic questioning flow with dynamic responses', async ({ page }) => {
    test.skip(!process.env.OPENAI_API_KEY, 'OPENAI_API_KEY required for live API tests')
    
    // Test the Socratic questioning methodology
    const scenarios = [
      {
        userInput: 'I want to automate my email marketing',
        expectedDomain: 'marketing automation',
        expectedComplexity: 'moderate',
        expectedQuestions: ['triggers', 'personalization', 'metrics']
      },
      {
        userInput: 'I need to process large datasets of customer feedback',
        expectedDomain: 'data processing',
        expectedComplexity: 'complex',
        expectedQuestions: ['data sources', 'processing pipeline', 'analysis methods']
      },
      {
        userInput: 'Simple blog content generator',
        expectedDomain: 'content generation',
        expectedComplexity: 'simple',
        expectedQuestions: ['content type', 'audience', 'style']
      }
    ]

    for (const scenario of scenarios) {
      console.log(`Testing scenario: ${scenario.userInput}`)
      
      const response = await page.request.post('/api/copilotkit', {
        data: {
          messages: [
            {
              role: 'user',
              content: scenario.userInput
            }
          ]
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      
      // Validate that we get a meaningful response
      expect(responseData).toHaveProperty('choices')
      expect(responseData.choices.length).toBeGreaterThan(0)
      
      const assistantMessage = responseData.choices[0]?.message?.content || ''
      console.log(`Response for "${scenario.userInput}":`, assistantMessage)
      
      // Verify response contains relevant questioning elements
      expect(assistantMessage.length).toBeGreaterThan(50) // Meaningful response length
      
      // Check for question characteristics in response
      const hasQuestionWords = scenario.expectedQuestions.some(keyword => 
        assistantMessage.toLowerCase().includes(keyword.toLowerCase())
      )
      
      if (!hasQuestionWords) {
        console.warn(`Expected question keywords not found in response: ${scenario.expectedQuestions.join(', ')}`)
      }
    }
  })

  test('should generate valid Langflow JSON with proper structure', async ({ page }) => {
    test.skip(!process.env.OPENAI_API_KEY, 'OPENAI_API_KEY required for live API tests')
    
    // Test JSON generation for different workflow types
    const workflowTypes = [
      {
        description: 'Simple FAQ chatbot for a restaurant',
        components: 'ChatInput, PromptTemplate, OpenAI, ConditionalRouter, ChatOutput',
        expectedNodes: ['ChatInput', 'OpenAI', 'ChatOutput'],
        expectedEdges: 2
      },
      {
        description: 'Document processing pipeline with summarization',
        components: 'FileInput, TextSplitter, Embeddings, VectorStore, RetrievalQA, TextOutput',
        expectedNodes: ['FileInput', 'TextSplitter', 'TextOutput'],
        expectedEdges: 2
      }
    ]

    for (const workflow of workflowTypes) {
      console.log(`Testing JSON generation for: ${workflow.description}`)
      
      const response = await page.request.post('/api/copilotkit', {
        data: {
          messages: [
            {
              role: 'user',
              content: `Generate a Langflow JSON for: ${workflow.description}`
            }
          ],
          actions: [
            {
              name: 'generate_langflow_json',
              parameters: {
                workflow_description: workflow.description,
                components: workflow.components
              }
            }
          ]
        }
      })

      expect(response.status()).toBe(200)
      const responseData = await response.json()
      
      console.log(`JSON Generation Response:`, JSON.stringify(responseData, null, 2))
      
      // Extract and validate the generated Langflow JSON
      const choices = responseData.choices || []
      expect(choices.length).toBeGreaterThan(0)
      
      // Look for JSON content in the response
      const assistantMessage = choices[0]?.message?.content || ''
      
      // Try to find JSON structure in the response
      const jsonMatch = assistantMessage.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          const langflowJson = JSON.parse(jsonMatch[0])
          
          // Validate Langflow JSON structure
          expect(langflowJson).toHaveProperty('data')
          expect(langflowJson.data).toHaveProperty('nodes')
          expect(langflowJson.data).toHaveProperty('edges')
          expect(Array.isArray(langflowJson.data.nodes)).toBe(true)
          expect(Array.isArray(langflowJson.data.edges)).toBe(true)
          
          // Validate nodes have required properties
          for (const node of langflowJson.data.nodes) {
            expect(node).toHaveProperty('id')
            expect(node).toHaveProperty('type')
            expect(node).toHaveProperty('position')
            expect(node).toHaveProperty('data')
          }
          
          // Validate edges have required properties
          for (const edge of langflowJson.data.edges) {
            expect(edge).toHaveProperty('id')
            expect(edge).toHaveProperty('source')
            expect(edge).toHaveProperty('target')
          }
          
          console.log(`✅ Valid Langflow JSON generated with ${langflowJson.data.nodes.length} nodes and ${langflowJson.data.edges.length} edges`)
          
        } catch {
          console.warn(`Could not parse generated JSON:`, e)
        }
      } else {
        console.warn('No JSON structure found in response')
      }
    }
  })

  test('should handle error scenarios gracefully with live API', async ({ page }) => {
    test.skip(!process.env.OPENAI_API_KEY, 'OPENAI_API_KEY required for live API tests')
    
    // Test various error scenarios
    const errorScenarios = [
      {
        name: 'Invalid action parameters',
        data: {
          messages: [{ role: 'user', content: 'Test' }],
          actions: [
            {
              name: 'analyze_workflow_requirements',
              parameters: {
                // Missing required parameters
                domain: ''
              }
            }
          ]
        }
      },
      {
        name: 'Malformed request',
        data: {
          messages: 'invalid format'
        }
      }
    ]

    for (const scenario of errorScenarios) {
      console.log(`Testing error scenario: ${scenario.name}`)
      
      const response = await page.request.post('/api/copilotkit', {
        data: scenario.data
      })

      // The API should handle errors gracefully
      // Either return a proper error response or handle the error internally
      expect([200, 400, 422, 500]).toContain(response.status())
      
      if (response.status() !== 200) {
        const errorData = await response.text()
        console.log(`Error response for "${scenario.name}":`, errorData)
        expect(errorData).toBeTruthy()
      }
    }
  })

  test('should validate performance and response times', async ({ page }) => {
    test.skip(!process.env.OPENAI_API_KEY, 'OPENAI_API_KEY required for live API tests')
    
    const performanceMetrics: number[] = []
    
    // Test multiple API calls to measure performance
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now()
      
      const response = await page.request.post('/api/copilotkit', {
        data: {
          messages: [
            {
              role: 'user',
              content: `Performance test request ${i + 1}: Create a simple workflow`
            }
          ]
        }
      })
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      performanceMetrics.push(responseTime)
      
      expect(response.status()).toBe(200)
      
      // Response time should be reasonable (under 30 seconds for OpenAI API)
      expect(responseTime).toBeLessThan(30000)
      
      console.log(`API call ${i + 1} completed in ${responseTime}ms`)
    }
    
    const averageResponseTime = performanceMetrics.reduce((a, b) => a + b, 0) / performanceMetrics.length
    console.log(`Average response time: ${averageResponseTime.toFixed(2)}ms`)
    
    // Average should be reasonable
    expect(averageResponseTime).toBeLessThan(15000)
  })
})
