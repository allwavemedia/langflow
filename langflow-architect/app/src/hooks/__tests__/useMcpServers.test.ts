/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useMcpServers } from '../useMcpServers';

// Mock the services
jest.mock('@/services/mcpConfigService', () => ({
  mcpConfigService: {
    loadFullConfig: jest.fn().mockReturnValue({ servers: [], templates: [] }),
    saveFullConfig: jest.fn(),
    getUsageStats: jest.fn().mockReturnValue({})
  }
}));

jest.mock('@/services/mcpValidationService', () => ({
  mcpValidationService: {
    testConnection: jest.fn().mockResolvedValue({
      success: true,
      latency: 150,
      version: '1.0.0',
      capabilities: ['search', 'tools']
    })
  }
}));

describe('useMcpServers Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes with empty servers', async () => {
    const { result } = renderHook(() => useMcpServers());
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    
    // Wait for async effect to complete
    await act(async () => {
      // Wait for the hook to finish loading
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(result.current.servers).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('adds server successfully', async () => {
    const { result } = renderHook(() => useMcpServers());
    
    const mockServer = {
      name: 'Test Server',
      description: 'Test MCP Server',
      transport: {
        type: 'sse' as const,
        url: 'http://localhost:3000/mcp'
      },
      capabilities: ['search'],
      userAdded: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await act(async () => {
      await result.current.addServer(mockServer);
    });

    expect(result.current.servers).toHaveLength(1);
  });

  test('handles server connection testing', async () => {
    const { result } = renderHook(() => useMcpServers());
    
    const mockServer = {
      id: 'test-server',
      name: 'Test Server',
      description: 'Test MCP Server',
      transport: {
        type: 'sse' as const,
        url: 'http://localhost:3000/mcp'
      },
      capabilities: ['search'],
      enabled: true,
      userAdded: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await act(async () => {
      const result_test = await result.current.testConnection(mockServer);
      expect(result_test.success).toBe(true);
    });
  });

  test('removes server successfully', async () => {
    const { result } = renderHook(() => useMcpServers());
    
    const mockServer = {
      name: 'Test Server',
      description: 'Test MCP Server',
      transport: {
        type: 'sse' as const,
        url: 'http://localhost:3000/mcp'
      },
      capabilities: ['search'],
      userAdded: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add server first
    await act(async () => {
      await result.current.addServer(mockServer);
    });

    expect(result.current.servers).toHaveLength(1);

    // Remove server (assuming first server gets id)
    await act(async () => {
      await result.current.removeServer(result.current.servers[0].id);
    });

    expect(result.current.servers).toHaveLength(0);
  });

  test('toggles server enabled status', async () => {
    const { result } = renderHook(() => useMcpServers());
    
    const mockServer = {
      name: 'Test Server', 
      description: 'Test MCP Server',
      transport: {
        type: 'sse' as const,
        url: 'http://localhost:3000/mcp'
      },
      capabilities: ['search'],
      userAdded: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add server first
    await act(async () => {
      await result.current.addServer(mockServer);
    });

    const serverId = result.current.servers[0].id;
    expect(result.current.servers[0].enabled).toBe(true);

    // Toggle enabled status
    await act(async () => {
      await result.current.toggleServer(serverId);
    });

    expect(result.current.servers[0].enabled).toBe(false);
  });
});
