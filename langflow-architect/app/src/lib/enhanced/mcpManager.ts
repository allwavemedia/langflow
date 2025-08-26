/**
 * Unified MCP Manager - Phase 2
 * Minimal orchestration to support route handlers, with room to grow.
 */

import { McpServerConfig as BaseConfig } from '../../types/mcp';

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
}

class McpManager {
  private servers: Map<string, McpServerConfig> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults(): void {
    const defaults: McpServerConfig[] = [
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

    defaults.forEach((s) => this.servers.set(s.id, s));
  }

  // --- Management API expected by route.ts ---
  getAllServers(): McpServerConfig[] {
    return Array.from(this.servers.values());
  }

  getServer(id: string): McpServerConfig | undefined {
    return this.servers.get(id);
  }

  async registerServer(config: McpServerConfig): Promise<boolean> {
    if (!config?.id || !config?.name) return false;
    // Spread first, then apply safe defaults for optional fields without overriding required ones
    const normalized: McpServerConfig = {
      ...config,
      description: config.description ?? '',
      userAdded: config.userAdded ?? true,
      healthStatus: config.healthStatus ?? 'unknown',
      lastChecked: config.lastChecked ?? new Date(),
    };
    this.servers.set(normalized.id, normalized);
    return true;
  }

  removeServer(id: string): boolean {
    const current = this.servers.get(id);
    if (!current) return false;
    if (!current.userAdded) return false; // keep system servers
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

  getServersForDomain(domain: string): McpServerConfig[] {
    return Array.from(this.servers.values()).filter(
      (s) => s.isActive && (s.domains.includes(domain) || s.domains.includes('general'))
    );
  }

  async queryServers(query: string, domain: string, options: McpQueryOptions = {}): Promise<McpQueryResponse> {
    const candidates = (options.fallbackServers && options.fallbackServers.length > 0)
      ? options.fallbackServers
          .map((id) => this.servers.get(id))
          .filter((s): s is McpServerConfig => !!s)
      : this.getServersForDomain(domain);

    // Mock response for now; integrate real MCP comms in later phase
    const sources = candidates.map((c) => c.name);
    const results = candidates.map((c) => ({
      serverId: c.id,
      snippet: `Mock answer for "${query}" from ${c.name}`,
      timestamp: new Date().toISOString(),
    }));

    // Simulate timeout usage
    void options.timeout;
    return { results, sources };
  }
}

export const mcpManager = new McpManager();
// End of file
