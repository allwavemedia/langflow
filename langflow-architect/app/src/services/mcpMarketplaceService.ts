/**
 * MCP Marketplace Service
 * Story 6.1 Task 5: CopilotKit SSE Integration and marketplace data fetching
 */

import { McpMarketplaceEntry, DEFAULT_SSE_ENDPOINT } from '../types/mcp';

export interface MarketplaceResponse {
  servers: McpMarketplaceEntry[];
  featured: McpMarketplaceEntry[];
  categories: string[];
  totalCount: number;
  error?: string;
}

export class McpMarketplaceService {
  private static instance: McpMarketplaceService;
  private baseUrl: string;
  private cache: Map<string, { data: MarketplaceResponse; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.baseUrl = DEFAULT_SSE_ENDPOINT;
  }

  public static getInstance(): McpMarketplaceService {
    if (!McpMarketplaceService.instance) {
      McpMarketplaceService.instance = new McpMarketplaceService();
    }
    return McpMarketplaceService.instance;
  }

  /**
   * Fetch marketplace data from CopilotKit SSE endpoint
   */
  public async fetchMarketplaceData(): Promise<MarketplaceResponse> {
    const cacheKey = 'marketplace_data';
    const cached = this.cache.get(cacheKey);
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      // For now, return mock data that represents what would come from the CopilotKit marketplace
      // In production, this would make actual API calls to the CopilotKit marketplace
      const mockResponse = await this.getMockMarketplaceData();
      
      // Cache the response
      this.cache.set(cacheKey, {
        data: mockResponse,
        timestamp: Date.now()
      });

      return mockResponse;
    } catch (error) {
      console.error('Failed to fetch marketplace data:', error);
      
      // Return fallback data with error
      return {
        servers: [],
        featured: [],
        categories: [],
        totalCount: 0,
        error: 'Unable to connect to CopilotKit marketplace. Please check your internet connection and try again.'
      };
    }
  }

  /**
   * Fetch featured servers specifically
   */
  public async fetchFeaturedServers(): Promise<McpMarketplaceEntry[]> {
    const data = await this.fetchMarketplaceData();
    return data.featured;
  }

  /**
   * Test connection to a specific server
   */
  public async testServerConnection(server: McpMarketplaceEntry): Promise<boolean> {
    try {
      if (server.transport.type === 'sse' && server.transport.url) {
        // For SSE servers, attempt to establish a connection
        const response = await fetch(`${server.transport.url}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // Short timeout for health checks
          signal: AbortSignal.timeout(5000)
        });
        
        return response.ok;
      } else {
        // For stdio/http servers, just return true as we can't test them directly
        return true;
      }
    } catch (error) {
      console.warn(`Connection test failed for ${server.name}:`, error);
      return false;
    }
  }

  /**
   * Get server details by ID from marketplace
   */
  public async getServerDetails(serverId: string): Promise<McpMarketplaceEntry | null> {
    const data = await this.fetchMarketplaceData();
    return data.servers.find(server => server.id === serverId) || null;
  }

  /**
   * Mock marketplace data representing what would come from CopilotKit
   * This simulates the expected structure and content from the official marketplace
   */
  private async getMockMarketplaceData(): Promise<MarketplaceResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const servers: McpMarketplaceEntry[] = [
      {
        id: 'copilotkit-web-search',
        name: 'CopilotKit Web Search',
        description: 'Official CopilotKit web search integration with Tavily API for high-quality search results and content extraction.',
        category: 'Web Search',
        author: 'CopilotKit Team',
        version: '1.3.0',
        rating: 4.9,
        downloads: 25420,
        transport: { type: 'sse', url: `${this.baseUrl}/web-search` },
        capabilities: ['search', 'extract', 'summarize', 'filter'],
        tags: ['search', 'web', 'tavily', 'official'],
        icon: '🔍',
        documentation: 'https://docs.copilotkit.ai/mcp/web-search',
        repository: 'https://github.com/CopilotKit/web-search-mcp',
        featured: true
      },
      {
        id: 'copilotkit-github-integration',
        name: 'GitHub Repository Manager',
        description: 'Comprehensive GitHub integration for repository management, issue tracking, and code analysis directly within your CopilotKit workflows.',
        category: 'Development Tools',
        author: 'CopilotKit Team',
        version: '2.1.0',
        rating: 4.8,
        downloads: 18950,
        transport: { type: 'sse', url: `${this.baseUrl}/github` },
        capabilities: ['repo-search', 'issue-management', 'code-review', 'analytics'],
        tags: ['github', 'development', 'repository', 'official'],
        icon: '🐙',
        documentation: 'https://docs.copilotkit.ai/mcp/github',
        repository: 'https://github.com/CopilotKit/github-mcp',
        featured: true
      },
      {
        id: 'copilotkit-database-connector',
        name: 'Universal Database Connector',
        description: 'Connect to multiple database types (PostgreSQL, MySQL, MongoDB) with intelligent query generation and schema understanding.',
        category: 'Database',
        author: 'CopilotKit Team',
        version: '1.8.0',
        rating: 4.7,
        downloads: 15200,
        transport: { type: 'sse', url: `${this.baseUrl}/database` },
        capabilities: ['query-generation', 'schema-analysis', 'data-visualization', 'migration-support'],
        tags: ['database', 'sql', 'nosql', 'analytics'],
        icon: '🗄️',
        documentation: 'https://docs.copilotkit.ai/mcp/database',
        repository: 'https://github.com/CopilotKit/database-mcp',
        featured: true
      },
      {
        id: 'slack-notifications',
        name: 'Slack Workspace Integration',
        description: 'Send notifications, create channels, and manage Slack workspaces directly from your AI workflows.',
        category: 'Communication',
        author: 'Community Contributor',
        version: '1.2.1',
        rating: 4.5,
        downloads: 8340,
        transport: { type: 'sse', url: 'https://mcp-slack.example.com/sse' },
        capabilities: ['messaging', 'channel-management', 'user-lookup', 'bot-integration'],
        tags: ['slack', 'notifications', 'communication'],
        icon: '💬',
        documentation: 'https://github.com/slack-mcp/docs',
        repository: 'https://github.com/community/slack-mcp',
        featured: false
      },
      {
        id: 'openapi-generator',
        name: 'OpenAPI Integration Generator',
        description: 'Automatically generate MCP server integrations from OpenAPI/Swagger specifications.',
        category: 'API Integrations',
        author: 'Developer Tools Inc.',
        version: '2.0.3',
        rating: 4.6,
        downloads: 12100,
        transport: { type: 'stdio', command: 'openapi-mcp', args: ['--config', 'config.json'] },
        capabilities: ['api-discovery', 'code-generation', 'validation', 'testing'],
        tags: ['openapi', 'swagger', 'api', 'generator'],
        icon: '🔧',
        documentation: 'https://openapi-mcp.dev/docs',
        repository: 'https://github.com/devtools/openapi-mcp',
        featured: false
      },
      {
        id: 'file-operations-advanced',
        name: 'Advanced File Operations',
        description: 'Comprehensive file system operations with support for cloud storage providers (AWS S3, Google Drive, Dropbox).',
        category: 'File Operations',
        author: 'CloudTools Team',
        version: '1.5.2',
        rating: 4.4,
        downloads: 9800,
        transport: { type: 'sse', url: 'https://file-ops-mcp.cloudtools.com/sse' },
        capabilities: ['file-upload', 'cloud-sync', 'batch-operations', 'metadata-extraction'],
        tags: ['files', 'cloud', 'storage', 'sync'],
        icon: '📁',
        documentation: 'https://cloudtools.com/file-ops-mcp',
        repository: 'https://github.com/cloudtools/file-ops-mcp',
        featured: false
      },
      {
        id: 'analytics-dashboard',
        name: 'Real-time Analytics Dashboard',
        description: 'Create interactive dashboards and visualizations from your data sources with real-time updates.',
        category: 'Analytics',
        author: 'DataViz Solutions',
        version: '3.1.0',
        rating: 4.7,
        downloads: 6750,
        transport: { type: 'http', url: 'https://analytics-mcp.dataviz.com/api' },
        capabilities: ['dashboard-creation', 'real-time-updates', 'chart-generation', 'data-export'],
        tags: ['analytics', 'dashboard', 'visualization', 'charts'],
        icon: '📊',
        documentation: 'https://dataviz.com/analytics-mcp',
        repository: 'https://github.com/dataviz/analytics-mcp',
        featured: false
      },
      {
        id: 'security-scanner',
        name: 'Security Vulnerability Scanner',
        description: 'Scan code repositories, containers, and infrastructure for security vulnerabilities and compliance issues.',
        category: 'Security',
        author: 'SecureCode Labs',
        version: '1.9.1',
        rating: 4.8,
        downloads: 11200,
        transport: { type: 'stdio', command: 'security-scanner', args: ['--mode', 'mcp'] },
        capabilities: ['vulnerability-scanning', 'compliance-checking', 'threat-analysis', 'reporting'],
        tags: ['security', 'vulnerability', 'compliance', 'scanning'],
        icon: '🔒',
        documentation: 'https://securecode.dev/scanner-mcp',
        repository: 'https://github.com/securecode/scanner-mcp',
        featured: false
      }
    ];

    const featured = servers.filter(server => server.featured);
    const categories = [...new Set(servers.map(server => server.category))];

    return {
      servers,
      featured,
      categories,
      totalCount: servers.length
    };
  }

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update base URL for marketplace endpoint
   */
  public setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.clearCache(); // Clear cache when changing endpoints
  }
}

// Export singleton instance
export const marketplaceService = McpMarketplaceService.getInstance();