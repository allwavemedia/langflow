/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import McpToolCall from '../McpToolCall';

describe('McpToolCall Component', () => {
  const mockProps = {
    status: 'complete' as const,
    name: 'test-tool',
    args: { param1: 'value1', param2: 42 },
    result: { success: true, data: 'test result' }
  };

  test('renders tool call with basic information', () => {
    render(<McpToolCall {...mockProps} />);
    
    expect(screen.getByText('🔧 test-tool')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  test('expands and shows detailed information when clicked', () => {
    render(<McpToolCall {...mockProps} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Tool Name:')).toBeInTheDocument();
    expect(screen.getByText('Parameters:')).toBeInTheDocument();
    expect(screen.getByText('Result:')).toBeInTheDocument();
  });

  test('shows executing status correctly', () => {
    render(<McpToolCall {...{ ...mockProps, status: 'executing' }} />);
    
    expect(screen.getByText('Executing')).toBeInTheDocument();
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Executing tool...')).toBeInTheDocument();
  });

  test('shows in progress status correctly', () => {
    render(<McpToolCall {...{ ...mockProps, status: 'inProgress' }} />);
    
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  test('handles unknown content gracefully', () => {
    const propsWithUnknown = {
      ...mockProps,
      args: undefined,
      result: new Date() // Complex object that might cause JSON.stringify issues
    };
    
    render(<McpToolCall {...propsWithUnknown} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    // Should not crash and should render something
    expect(screen.getByText('Tool Name:')).toBeInTheDocument();
  });

  test('accessibility attributes are correct', () => {
    render(<McpToolCall {...mockProps} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-label', 'Toggle details for test-tool');
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
