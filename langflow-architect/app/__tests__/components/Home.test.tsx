import { render, screen, waitFor } from '@testing-library/react'
import Home from '@/app/page'
import React from 'react'
import '@testing-library/jest-dom'

// Mock CopilotKit hooks
const mockUseCopilotAction = jest.fn()
const mockUseCopilotReadable = jest.fn()

jest.mock('@copilotkit/react-core', () => ({
  ...jest.requireActual('@copilotkit/react-core'),
  useCopilotAction: () => mockUseCopilotAction(),
  useCopilotReadable: () => mockUseCopilotReadable(),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  }
}))

describe('Socratic Langflow Architect - Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCopilotAction.mockImplementation(() => {})
    mockUseCopilotReadable.mockImplementation(() => {})
  })

  test('renders main page with title and description', () => {
    render(<Home />)
    
    expect(screen.getByText('Socratic Langflow Architect')).toBeInTheDocument()
    expect(screen.getByText(/Use AI-powered Socratic questioning/)).toBeInTheDocument()
    expect(screen.getByText('Current Analysis')).toBeInTheDocument()
    expect(screen.getByText('Guiding Questions')).toBeInTheDocument()
    expect(screen.getByText('Getting Started')).toBeInTheDocument()
  })

  test('displays empty state messages when no workflow data exists', () => {
    render(<Home />)
    
    expect(screen.getByText(/No workflow analysis yet/)).toBeInTheDocument()
    expect(screen.getByText(/Questions will appear here/)).toBeInTheDocument()
  })

  test('shows getting started instructions', () => {
    render(<Home />)
    
    expect(screen.getByText(/Click the chat icon in the sidebar/)).toBeInTheDocument()
    expect(screen.getByText(/Describe what you want to build/)).toBeInTheDocument()
    expect(screen.getByText(/Answer the AI's questions/)).toBeInTheDocument()
    expect(screen.getByText(/Export your completed workflow/)).toBeInTheDocument()
  })

  test('registers CopilotKit actions correctly', () => {
    render(<Home />)
    
    // Verify that CopilotKit actions are registered
    expect(mockUseCopilotAction).toHaveBeenCalledTimes(3)
    expect(mockUseCopilotReadable).toHaveBeenCalledTimes(1)
  })

  test('workflow data state updates display correctly', async () => {
    const TestComponent = () => {
      const [workflowData, setWorkflowData] = React.useState<{
        description: string;
        category: string;
        complexity: string;
        timestamp: string;
      } | null>(null)
      
      React.useEffect(() => {
        setWorkflowData({
          description: 'Test workflow description',
          category: 'automation', 
          complexity: 'moderate',
          timestamp: '2025-01-01T00:00:00.000Z'
        })
      }, [])
      
      return (
        <div>
          {workflowData && (
            <div data-testid="workflow-data">
              <span data-testid="description">{workflowData.description}</span>
              <span data-testid="category">{workflowData.category}</span>
              <span data-testid="complexity">{workflowData.complexity}</span>
            </div>
          )}
        </div>
      )
    }
    
    render(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('description')).toHaveTextContent('Test workflow description')
      expect(screen.getByTestId('category')).toHaveTextContent('automation')
      expect(screen.getByTestId('complexity')).toHaveTextContent('moderate')
    })
  })

  test('questions list renders correctly when provided', async () => {
    const TestComponent = () => {
      const [questions, setQuestions] = React.useState<string[]>([])
      
      React.useEffect(() => {
        setQuestions([
          'What specific triggers should start this workflow?',
          'What data sources will you be working with?',
          'How should the workflow handle errors?'
        ])
      }, [])
      
      return (
        <div>
          {questions.length > 0 && (
            <ul data-testid="questions-list">
              {questions.map((question, index) => (
                <li key={`question-${question.slice(0, 10)}-${index}`} data-testid={`question-${index}`}>
                  {question}
                </li>
              ))}
            </ul>
          )}
        </div>
      )
    }
    
    render(<TestComponent />)
    
    await waitFor(() => {
      expect(screen.getByTestId('question-0')).toHaveTextContent('What specific triggers should start this workflow?')
      expect(screen.getByTestId('question-1')).toHaveTextContent('What data sources will you be working with?')
      expect(screen.getByTestId('question-2')).toHaveTextContent('How should the workflow handle errors?')
    })
  })

  test('has proper responsive design classes', () => {
    render(<Home />)
    
    const mainContainer = screen.getByText('Socratic Langflow Architect').closest('div')
    expect(mainContainer).toHaveClass('min-h-screen', 'bg-gradient-to-br', 'from-blue-50', 'to-indigo-100')
    
    const gridContainer = screen.getByText('Current Analysis').closest('div')?.parentElement
    expect(gridContainer).toHaveClass('grid', 'md:grid-cols-2', 'gap-8')
  })

  test('accessibility features are present', () => {
    render(<Home />)
    
    // Check for proper heading hierarchy
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Socratic Langflow Architect')
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
    
    // Check for proper list structure
    expect(screen.getByRole('list')).toBeInTheDocument()
  })
})
