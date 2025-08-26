import { POST } from '@/app/api/copilotkit/route'
import { NextRequest } from 'next/server'

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: 'Test AI response',
                  role: 'assistant'
                }
              }
            ]
          })
        }
      }
    }))
  }
})

// Mock CopilotKit runtime
jest.mock('@copilotkit/runtime', () => ({
  CopilotRuntime: jest.fn().mockImplementation(() => ({})),
  OpenAIAdapter: jest.fn().mockImplementation(() => ({})),
  copilotRuntimeNextJSAppRouterEndpoint: jest.fn().mockImplementation(() => ({
    handleRequest: jest.fn().mockResolvedValue(new Response('OK', { status: 200 }))
  }))
}))

describe('CopilotKit API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
  })

  test('POST endpoint responds successfully', async () => {
    const mockRequest = new Request('http://localhost:3000/api/copilotkit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: 'Test message'
          }
        ]
      })
    }) as NextRequest

    const response = await POST(mockRequest)
    expect(response.status).toBe(200)
  })

  test('environment variables are properly configured', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined()
    expect(process.env.OPENAI_API_KEY).toBe('test-api-key')
  })

  test('runtime actions are properly configured', () => {
    const { CopilotRuntime } = require('@copilotkit/runtime')
    expect(CopilotRuntime).toHaveBeenCalledWith({
      actions: expect.arrayContaining([
        expect.objectContaining({
          name: 'analyze_workflow_requirements',
          description: expect.stringContaining('Analyze user requirements'),
          parameters: expect.any(Array),
          handler: expect.any(Function)
        }),
        expect.objectContaining({
          name: 'generate_workflow_questions',
          description: expect.stringContaining('Generate Socratic questions'),
          parameters: expect.any(Array),
          handler: expect.any(Function)
        }),
        expect.objectContaining({
          name: 'generate_langflow_json',
          description: expect.stringContaining('Generate a Langflow JSON'),
          parameters: expect.any(Array),
          handler: expect.any(Function)
        })
      ])
    })
  })
})
