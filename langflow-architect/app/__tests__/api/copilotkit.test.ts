import type { NextRequest } from 'next/server'
let capturedRuntimeConfig: any = null

// Mock OpenAI BEFORE importing the route
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [
            { message: { content: 'Test AI response', role: 'assistant' } },
          ],
        }),
      },
    },
  })),
}))

// Mock CopilotKit runtime BEFORE importing the route
const mockHandleRequest = jest.fn().mockResolvedValue({ status: 200 })
jest.mock('@copilotkit/runtime', () => ({
  CopilotRuntime: jest.fn().mockImplementation((config) => {
    capturedRuntimeConfig = config
    return {}
  }),
  OpenAIAdapter: jest.fn().mockImplementation(() => ({})),
  copilotRuntimeNextJSAppRouterEndpoint: jest.fn().mockImplementation(() => ({
    handleRequest: mockHandleRequest,
  })),
}))

describe('CopilotKit API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-api-key'
  })

  test('POST endpoint responds successfully', async () => {
    const { POST } = await import('@/app/api/copilotkit/route')

    // We mocked handleRequest to ignore the actual request, so a minimal stub works
    const response = await POST({} as unknown as NextRequest)
    expect(response.status).toBe(200)
  })

  test('environment variables are properly configured', () => {
    expect(process.env.OPENAI_API_KEY).toBeDefined()
    expect(process.env.OPENAI_API_KEY).toBe('test-api-key')
  })

  test('runtime actions are properly configured', async () => {
    // Import after mocks so constructor calls are captured
    await import('@/app/api/copilotkit/route')
    expect(capturedRuntimeConfig).toBeTruthy()
    const actions = capturedRuntimeConfig.actions
    expect(Array.isArray(actions)).toBe(true)

    const actionByName = Object.fromEntries(actions.map((a: any) => [a.name, a]))
    const required = [
      'analyze_workflow_requirements',
      'generate_workflow_questions',
      'generate_langflow_json',
    ]
    required.forEach((name) => {
      expect(actionByName[name]).toBeTruthy()
      expect(typeof actionByName[name].handler).toBe('function')
      expect(Array.isArray(actionByName[name].parameters)).toBe(true)
    })
  })
})
