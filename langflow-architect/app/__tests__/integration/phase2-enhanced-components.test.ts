// Test Phase 2 enhanced components - Basic integration test

import { contextEngine } from '../../src/lib/enhanced/contextEngine';
import { mcpManager } from '../../src/lib/enhanced/mcpManager';
import { langflowSchemaRegistry } from '../../src/lib/enhanced/langflowSchemaRegistry';
import { searchManager } from '../../src/lib/enhanced/searchManager';

// Mock localStorage for tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock fetch for tests
global.fetch = jest.fn();

describe('Phase 2 Enhanced Components Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('ContextEngine', () => {
    test('should analyze domain from query', async () => {
      const result = await contextEngine.query({
        query: 'healthcare patient data HIPAA compliance',
        maxResults: 5
      });

      expect(result).toBeDefined();
      expect(result.domainAnalysis.domain).toBe('healthcare');
      expect(result.domainAnalysis.confidence).toBeGreaterThan(0);
      expect(result.technologyStack.compliance).toContain('HIPAA');
    });

    test('should generate contextual questions', async () => {
      const analysis = await contextEngine.query({
        query: 'finance trading compliance audit'
      });

      const questions = contextEngine.generateContextualQuestions(analysis);
      
      expect(questions).toBeDefined();
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some(q => q.includes('financial'))).toBe(true);
    });

    test('should maintain conversation context', async () => {
      const conversationId = 'test-conv-123';
      
      const context = contextEngine.updateContext(
        conversationId,
        'healthcare patient management system',
        'domain_refinement'
      );

      expect(context).toBeDefined();
      expect(context.domainAnalysis.domain).toBe('healthcare');

      const retrieved = contextEngine.getContext(conversationId);
      expect(retrieved).toEqual(context);
    });
  });

  describe('McpManager', () => {
    test('should initialize with default servers', () => {
      const servers = mcpManager.getAllServers();
      
      expect(servers).toBeDefined();
      expect(servers.length).toBeGreaterThan(0);
      expect(servers[0].name).toBe('CopilotKit Official');
    });

    test('should filter servers by domain', () => {
      const servers = mcpManager.getServersForDomain('general');
      
      expect(servers).toBeDefined();
      expect(servers.length).toBeGreaterThan(0);
      expect(servers.every(s => s.domains?.includes('general'))).toBe(true);
    });

    test('should handle server registration', async () => {
      const serverConfig = {
        id: 'test-server',
        name: 'Test Server',
        description: 'Test MCP server',
        transport: {
          type: 'sse' as const,
          url: 'https://test.example.com/mcp'
        },
        capabilities: ['test'],
        domains: ['test'],
        enabled: true,
        userAdded: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const success = await mcpManager.registerServer(serverConfig);
      expect(success).toBe(true);

      const server = mcpManager.getServer('test-server');
      expect(server).toBeDefined();
      expect(server?.name).toBe('Test Server');
    });

    test('should provide server statistics', () => {
      const stats = mcpManager.getServerStatistics();
      
      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.active).toBe('number');
      expect(typeof stats.healthy).toBe('number');
      expect(typeof stats.userAdded).toBe('number');
    });
  });

  describe('LangflowSchemaRegistry', () => {
    test('should initialize with default workflow schema', () => {
      const stats = langflowSchemaRegistry.getCacheStatistics();
      
      expect(stats).toBeDefined();
      expect(stats.totalSchemas).toBeGreaterThan(0);
      expect(stats.version).toBeDefined();
    });

    test('should validate workflow JSON', () => {
      const validWorkflow = {
        data: {
          nodes: [
            {
              id: 'node-1',
              type: 'TestNode',
              position: { x: 100, y: 100 },
              data: {
                type: 'TestNode',
                node: {}
              }
            }
          ],
          edges: []
        },
        description: 'Test workflow',
        name: 'Test'
      };

      const result = langflowSchemaRegistry.validateWorkflow(validWorkflow);
      
      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    test('should detect invalid workflow JSON', () => {
      const invalidWorkflow = {
        data: {
          nodes: [], // Missing required node properties
          edges: 'invalid' // Should be array
        }
      };

      const result = langflowSchemaRegistry.validateWorkflow(invalidWorkflow);
      
      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should get available components', () => {
      const components = langflowSchemaRegistry.getAvailableComponents();
      
      expect(components).toBeDefined();
      expect(Array.isArray(components)).toBe(true);
    });
  });

  describe('SearchManager', () => {
    beforeEach(() => {
      // Mock successful fetch responses
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('tavily')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              results: [
                {
                  title: 'Test Tavily Result',
                  url: 'https://example.com/tavily',
                  content: 'Test content from Tavily',
                  score: 0.8
                }
              ]
            })
          });
        } else if (url.includes('duckduckgo')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              RelatedTopics: [
                {
                  FirstURL: 'https://example.com/ddg',
                  Text: 'Test DuckDuckGo Result - Test content'
                }
              ]
            })
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });
    });

    test('should perform search with fallback', async () => {
      const result = await searchManager.search('test query', {
        maxResults: 5
      });

      expect(result).toBeDefined();
      expect(result.results).toBeDefined();
      expect(result.sources).toBeDefined();
      expect(result.attribution).toBeDefined();
      expect(typeof result.responseTime).toBe('number');
    });

    test('should provide search metrics', () => {
      const metrics = searchManager.getMetrics();
      
      expect(metrics).toBeDefined();
      expect(typeof metrics.totalQueries).toBe('number');
      expect(typeof metrics.cacheHits).toBe('number');
      expect(typeof metrics.cacheMisses).toBe('number');
    });

    test('should handle search errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await searchManager.search('test query');
      
      expect(result).toBeDefined();
      expect(result.results.length).toBe(0);
      expect(result.attribution.some(a => a.includes('error'))).toBe(true);
    });
  });

  describe('Integration - Components Working Together', () => {
    test('should analyze context and perform domain-specific search', async () => {
      // Analyze context
      const context = await contextEngine.query({
        query: 'healthcare patient data processing workflow'
      });

      expect(context.domainAnalysis.domain).toBe('healthcare');

      // Get relevant MCP servers
      const servers = mcpManager.getServersForDomain(context.domainAnalysis.domain);
      expect(servers).toBeDefined();

      // Perform domain-specific search
      const searchResult = await searchManager.search(
        'healthcare data processing best practices',
        { maxResults: 3 }
      );

      expect(searchResult.results).toBeDefined();
    });

    test('should validate generated workflow with context', async () => {
      // Generate context-aware workflow
      const context = await contextEngine.query({
        query: 'simple chatbot for customer support'
      });

      // Create a workflow based on context
      const workflow = {
        data: {
          nodes: [
            {
              id: 'input-1',
              type: 'ChatInput',
              position: { x: 100, y: 100 },
              data: {
                type: 'ChatInput',
                node: {}
              }
            },
            {
              id: 'llm-1',
              type: 'OpenAIModel', 
              position: { x: 300, y: 100 },
              data: {
                type: 'OpenAIModel',
                node: {}
              }
            },
            {
              id: 'output-1',
              type: 'ChatOutput',
              position: { x: 500, y: 100 },
              data: {
                type: 'ChatOutput',
                node: {}
              }
            }
          ],
          edges: [
            {
              id: 'edge-1',
              source: 'input-1',
              target: 'llm-1'
            },
            {
              id: 'edge-2',
              source: 'llm-1',
              target: 'output-1'
            }
          ]
        },
        description: `${context.domainAnalysis.domain} workflow`,
        name: 'Context-Generated Workflow'
      };

      // Validate the workflow
      const validation = langflowSchemaRegistry.validateWorkflow(workflow);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });
});