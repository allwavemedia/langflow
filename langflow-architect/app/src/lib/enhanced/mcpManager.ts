// MCP Manager - Enhanced for Phase 2
// Manages MCP server registration, discovery, health checks, and querying.

import type { McpServerConfig as BaseConfig } from '@/types/mcp';

export type McpServerType = 'local' | 'remote';

// Extended interface that includes all fields from base config plus enhanced fields
export interface McpServerConfig extends Omit<BaseConfig, 'transport' | 'enabled' | 'createdAt' | 'updatedAt'> {
  type: McpServerType;
  endpoint?: string;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  domains: string[];
  isActive: boolean;
}

export interface McpQueryOptions {
  timeout?: number;
  fallbackServers?: string[];
}

export interface McpQueryResponse<T = unknown> {
  results: T[];
  sources: string[];
  success: boolean;
  errors: string[];
}

class McpManager {
  private servers: Map<string, McpServerConfig> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeDefaultServers();
    this.startHealthChecking();
  }

  private initializeDefaultServers(): void {
    const defaultServers: McpServerConfig[] = [
      {
        id: 'copilotkit-official',
        name: 'CopilotKit Official',
        description: 'Official CopilotKit MCP server with web search and general capabilities',
        type: 'remote',
        endpoint: 'https://mcp.copilotkit.ai/sse',
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
        userAdded: false,
        healthStatus: 'unknown',
        lastChecked: new Date(),
        isActive: true,
      },
      {
        id: 'langflow-docs',
        name: 'Langflow Documentation MCP',
        description: 'Serves Langflow schemas, components, and examples',
        type: 'remote',
        endpoint: 'https://docs.langflow.org',
        capabilities: ['docs', 'schemas'],
        domains: ['langflow', 'documentation', 'general'],
        isActive: false,
        userAdded: false,
        healthStatus: 'unknown',
        lastChecked: new Date(),
      },
      {
        id: 'web-search',
        name: 'Web Search MCP',
        description: 'Provides web search integrations',
        type: 'local',
        command: 'node',
        args: ['search-server.js'],
        capabilities: ['search'],
        domains: ['general', 'research'],
        isActive: false,
        userAdded: false,
        healthStatus: 'unknown',
        lastChecked: new Date(),
      },
    ];

    defaultServers.forEach((s) => this.servers.set(s.id, s));
  }

  private startHealthChecking(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthChecks();
    }, 300000); // 5 minutes
  }

  private async performHealthChecks(): Promise<void> {
    const promises = Array.from(this.servers.values())
      .filter(server => server.isActive)
      .map(server => this.checkServerHealth(server));

    await Promise.allSettled(promises);
  }

  private async checkServerHealth(server: McpServerConfig): Promise<void> {
    try {
      let healthy = false;
      if (server.type === 'remote' && server.endpoint) {
        const response = await fetch(server.endpoint, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000)
        });
        healthy = response.ok;
      } else if (server.type === 'local') {
        healthy = true; // Simplified for now
      }
      server.healthStatus = healthy ? 'healthy' : 'unhealthy';
    } catch {
      server.healthStatus = 'unhealthy';
    } finally {
      server.lastChecked = new Date();
    }
  }

  async registerServer(config: McpServerConfig): Promise<boolean> {
    if (!config?.id || !config?.name) return false;
    const normalized: McpServerConfig = {
      ...config,
      description: config.description ?? '',
      userAdded: config.userAdded ?? true,
      healthStatus: 'unknown',
      lastChecked: new Date(),
    };
    this.servers.set(normalized.id, normalized);
    await this.checkServerHealth(normalized);
    return true;
  }

  removeServer(id: string): boolean {
    const current = this.servers.get(id);
    if (!current || !current.userAdded) return false;
    return this.servers.delete(id);
  }

  toggleServer(id: string): boolean {
    const s = this.servers.get(id);
    if (!s) return false;
    s.isActive = !s.isActive;
    s.lastChecked = new Date();
    this.servers.set(id, s);
    return true;
  }

  getServer(id: string): McpServerConfig | undefined {
    return this.servers.get(id);
  }

  getAllServers(): McpServerConfig[] {
    return Array.from(this.servers.values());
  }

  getServersForDomain(domain: string): McpServerConfig[] {
    return Array.from(this.servers.values()).filter(
      (s) => s.isActive && s.healthStatus !== 'unhealthy' && (s.domains.includes(domain) || s.domains.includes('general'))
    );
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  async queryServers(query: string, domain: string = 'general', options: McpQueryOptions = {}): Promise<McpQueryResponse<any>> {
    const { timeout = 5000, fallbackServers = [] } = options;
    
    let candidates = this.getServersForDomain(domain);
    if (fallbackServers.length > 0) {
      const fallbacks = fallbackServers
          .map((id) => this.servers.get(id))
          .filter((s): s is McpServerConfig => !!s && s.isActive);
      candidates = [...new Set([...candidates, ...fallbacks])];
    }

    if (candidates.length === 0) {
      return { results: [], sources: [], success: false, errors: [`No available MCP servers for domain: ${domain}`] };
    }

    const queryPromises = candidates.map(server => this.queryServer(server, query, timeout));
    const settledResults = await Promise.allSettled(queryPromises);
    
    const successfulResults: any[] = [];
    const sources: string[] = [];
    const errors: string[] = [];

    settledResults.forEach((result, index) => {
      const server = candidates[index];
      if (result.status === 'fulfilled' && result.value.success) {
        successfulResults.push(...(result.value.data || []));
        sources.push(server.name);
      } else {
        const errorMsg = result.status === 'rejected' ? result.reason : (result.value as any).error;
        errors.push(`${server.name}: ${errorMsg}`);
      }
    });

    return { results: successfulResults, sources, success: successfulResults.length > 0, errors };
  }

  private async queryServer(server: McpServerConfig, query: string, timeout: number): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // Simulate MCP server query
      const mockResponse = {
        success: true,
        data: [{
          content: `Mock response from ${server.name} for query: "${query}"`,
          source: server.name,
          timestamp: new Date().toISOString(),
        }]
      };
      await new Promise(resolve => setTimeout(resolve, Math.min(timeout, 1000))); // Simulate network latency
      return mockResponse;
    } catch {
      return { success: false, error: 'Unknown error' };
    }
  }

  getServerCapabilities(serverId: string): string[] {
    return this.servers.get(serverId)?.capabilities || [];
  }

  getServersByCapability(capability: string): McpServerConfig[] {
    return Array.from(this.servers.values()).filter(s => s.isActive && s.capabilities?.includes(capability));
  }

  async refreshServerHealth(serverId?: string): Promise<void> {
    if (serverId) {
      const server = this.servers.get(serverId);
      if (server) await this.checkServerHealth(server);
    } else {
      await this.performHealthChecks();
    }
  }

  getServerStatistics() {
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
