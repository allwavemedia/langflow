// MCP Manager - Phase 1 Foundation  
// Enhanced for Phase 2 with advanced server orchestration and domain filtering

import type { McpServerConfig } from '@/types/mcp';

interface McpQueryOptions {
  timeout?: number;
  fallbackServers?: string[];
  domain?: string;
}

interface McpQueryResult {
  results: any[];
  sources: string[];
  success: boolean;
  errors: string[];
}

interface McpServer extends McpServerConfig {
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked?: Date;
  isActive: boolean;
}

export class McpManager {
  private servers: Map<string, McpServer> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultServers();
    this.startHealthChecking();
  }

  private initializeDefaultServers(): void {
    const defaultServers: McpServer[] = [
      {
        id: 'copilotkit-official',
        name: 'CopilotKit Official',
        description: 'Official CopilotKit MCP server with web search and general capabilities',
        transport: {
          type: 'sse',
          url: 'https://mcp.copilotkit.ai/sse'
        },
        capabilities: ['web_search', 'general_knowledge'],
        domains: ['general', 'web_search'],
        metadata: {
          category: 'Web Search',
          icon: '🔍',
          version: '1.0.0',
          author: 'CopilotKit',
          rating: 5,
          tags: ['official', 'web_search']
        },
        enabled: true,
        userAdded: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        healthStatus: 'unknown',
        isActive: true
      }
    ];

    defaultServers.forEach(server => {
      this.servers.set(server.id, server);
    });
  }

  private startHealthChecking(): void {
    // Health check every 5 minutes
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 300000);
  }

  private async performHealthChecks(): Promise<void> {
    const promises = Array.from(this.servers.values())
      .filter(server => server.enabled)
      .map(server => this.checkServerHealth(server));

    await Promise.allSettled(promises);
  }

  private async checkServerHealth(server: McpServer): Promise<void> {
    try {
      // Simple ping/health check based on transport type
      let healthy = false;
      
      switch (server.transport.type) {
        case 'sse':
        case 'http':
          if (server.transport.url) {
            const response = await fetch(server.transport.url, {
              method: 'HEAD',
              signal: AbortSignal.timeout(5000)
            });
            healthy = response.ok;
          }
          break;
        case 'stdio':
          // For stdio, we assume it's healthy if we can create a connection
          healthy = true; // Simplified for now
          break;
      }

      server.healthStatus = healthy ? 'healthy' : 'unhealthy';
      server.lastChecked = new Date();
      
    } catch (error) {
      server.healthStatus = 'unhealthy';
      server.lastChecked = new Date();
    }
  }

  async registerServer(config: McpServerConfig): Promise<boolean> {
    try {
      const server: McpServer = {
        ...config,
        healthStatus: 'unknown',
        isActive: config.enabled,
        lastChecked: new Date()
      };

      this.servers.set(config.id, server);
      
      // Perform initial health check
      await this.checkServerHealth(server);
      
      return true;
    } catch (error) {
      console.error('Failed to register MCP server:', error);
      return false;
    }
  }

  removeServer(serverId: string): boolean {
    const server = this.servers.get(serverId);
    if (!server || !server.userAdded) {
      return false; // Can't remove system servers
    }

    return this.servers.delete(serverId);
  }

  toggleServer(serverId: string): boolean {
    const server = this.servers.get(serverId);
    if (!server) {
      return false;
    }

    server.enabled = !server.enabled;
    server.isActive = server.enabled;
    server.updatedAt = new Date();
    
    return true;
  }

  getServer(serverId: string): McpServer | undefined {
    return this.servers.get(serverId);
  }

  getAllServers(): McpServer[] {
    return Array.from(this.servers.values());
  }

  getServersForDomain(domain: string): McpServer[] {
    return Array.from(this.servers.values())
      .filter(server => 
        server.enabled && 
        server.isActive &&
        server.healthStatus !== 'unhealthy' &&
        (server.domains?.includes(domain) || server.domains?.includes('general'))
      );
  }

  async queryServers(
    query: string, 
    domain: string = 'general', 
    options: McpQueryOptions = {}
  ): Promise<McpQueryResult> {
    const { timeout = 5000, fallbackServers = [] } = options;
    
    // Get appropriate servers for the domain
    let servers = this.getServersForDomain(domain);
    
    // Add fallback servers if specified
    if (fallbackServers.length > 0) {
      const fallbacks = fallbackServers
        .map(id => this.servers.get(id))
        .filter((server): server is McpServer => server !== undefined && server.enabled);
      servers = [...servers, ...fallbacks];
    }

    if (servers.length === 0) {
      return {
        results: [],
        sources: [],
        success: false,
        errors: ['No available MCP servers for domain: ' + domain]
      };
    }

    // Query servers in parallel
    const queryPromises = servers.map(server => this.queryServer(server, query, timeout));
    const results = await Promise.allSettled(queryPromises);
    
    const successfulResults: any[] = [];
    const sources: string[] = [];
    const errors: string[] = [];

    results.forEach((result, index) => {
      const server = servers[index];
      if (result.status === 'fulfilled' && result.value.success) {
        successfulResults.push(...result.value.data);
        sources.push(server.name);
      } else if (result.status === 'rejected') {
        errors.push(`${server.name}: ${result.reason}`);
      } else if (result.status === 'fulfilled' && !result.value.success) {
        errors.push(`${server.name}: ${result.value.error}`);
      }
    });

    return {
      results: successfulResults,
      sources,
      success: successfulResults.length > 0,
      errors
    };
  }

  private async queryServer(
    server: McpServer, 
    query: string, 
    timeout: number
  ): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Simulate MCP server query - this would be implemented based on actual MCP protocol
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // For Phase 1, we'll simulate server responses
      // In Phase 2, this will use actual MCP protocol implementation
      const mockResponse = {
        success: true,
        data: [
          {
            content: `Mock response from ${server.name} for query: ${query}`,
            source: server.name,
            timestamp: new Date().toISOString()
          }
        ]
      };

      clearTimeout(timeoutId);
      return mockResponse;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Enhanced methods for Phase 2
  getServerCapabilities(serverId: string): string[] {
    const server = this.servers.get(serverId);
    return server?.capabilities || [];
  }

  getServersByCapability(capability: string): McpServer[] {
    return Array.from(this.servers.values())
      .filter(server => 
        server.enabled && 
        server.capabilities?.includes(capability)
      );
  }

  async refreshServerHealth(serverId?: string): Promise<void> {
    if (serverId) {
      const server = this.servers.get(serverId);
      if (server) {
        await this.checkServerHealth(server);
      }
    } else {
      await this.performHealthChecks();
    }
  }

  getServerStatistics(): {
    total: number;
    active: number;
    healthy: number;
    userAdded: number;
  } {
    const servers = Array.from(this.servers.values());
    
    return {
      total: servers.length,
      active: servers.filter(s => s.isActive).length,
      healthy: servers.filter(s => s.healthStatus === 'healthy').length,
      userAdded: servers.filter(s => s.userAdded).length
    };
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
}

export const mcpManager = new McpManager();