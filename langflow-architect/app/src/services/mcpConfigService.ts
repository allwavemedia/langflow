// Configuration Service for Epic 6: User-Friendly MCP Server Integration

import type { 
  McpServerConfig, 
  McpTemplate, 
  McpConfiguration,
  McpServerUsageStats 
} from '@/types/mcp';

export class McpConfigService {
  private readonly CONFIG_KEY = 'mcp-configuration';
  private readonly STORAGE_KEY = 'mcp-servers'; // Legacy key
  private readonly TEMPLATES_KEY = 'mcp-templates';
  private readonly STATS_KEY = 'mcp-usage-stats';

  private getDefaultConfig(): McpConfiguration {
    return {
      servers: [],
      templates: [],
      settings: {
        autoStart: true,
        healthCheckInterval: 300000, // 5 minutes
        theme: 'auto',
        notifications: true
      },
      version: '1.0.0',
      lastUpdated: new Date()
    };
  }

  // New configuration methods using McpConfiguration
  async saveFullConfig(config: McpConfiguration): Promise<void> {
    try {
      const configToSave = {
        ...config,
        lastUpdated: new Date()
      };
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(configToSave));
    } catch (error) {
      console.error('Failed to save MCP full configuration:', error);
      throw new Error('Failed to save full configuration to local storage');
    }
  }

  async loadFullConfig(): Promise<McpConfiguration> {
    try {
      const stored = localStorage.getItem(this.CONFIG_KEY);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...this.getDefaultConfig(),
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated)
        };
      }

      // Try to migrate from legacy storage
      const legacyServers = await this.loadConfig();
      const config = {
        ...this.getDefaultConfig(),
        servers: legacyServers
      };
      await this.saveFullConfig(config);
      return config;
    } catch (error) {
      console.error('Failed to load MCP full configuration:', error);
      return this.getDefaultConfig();
    }
  }

  // Configuration Management (Legacy methods - keeping for compatibility)
  async saveConfig(config: McpServerConfig[]): Promise<void> {
    try {
      const configWithDates = config.map(server => ({
        ...server,
        createdAt: server.createdAt instanceof Date ? server.createdAt.toISOString() : server.createdAt,
        updatedAt: new Date().toISOString(),
        lastChecked: server.lastChecked instanceof Date ? server.lastChecked.toISOString() : server.lastChecked
      }));
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configWithDates));
      
      // Optional: Sync to cloud storage (implement as needed)
      // await this.syncToCloud(configWithDates);
    } catch (error) {
      console.error('Failed to save MCP configuration:', error);
      throw new Error('Failed to save server configuration');
    }
  }

  async loadConfig(): Promise<McpServerConfig[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) {
        return this.getDefaultServers();
      }

      const configs = JSON.parse(stored);
      return configs.map((config: McpServerConfig & { createdAt: string; updatedAt: string; lastChecked?: string }) => ({
        ...config,
        createdAt: new Date(config.createdAt),
        updatedAt: new Date(config.updatedAt),
        lastChecked: config.lastChecked ? new Date(config.lastChecked) : undefined
      }));
    } catch (error) {
      console.error('Failed to load MCP configuration:', error);
      return this.getDefaultServers();
    }
  }

  async addServer(serverConfig: Omit<McpServerConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const servers = await this.loadConfig();
    
    const newServer: McpServerConfig = {
      ...serverConfig,
      id: `mcp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      userAdded: true
    };

    servers.push(newServer);
    await this.saveConfig(servers);
    
    return newServer.id;
  }

  async updateServer(serverId: string, updates: Partial<McpServerConfig>): Promise<boolean> {
    const servers = await this.loadConfig();
    const serverIndex = servers.findIndex(s => s.id === serverId);
    
    if (serverIndex === -1) {
      return false;
    }

    servers[serverIndex] = {
      ...servers[serverIndex],
      ...updates,
      updatedAt: new Date()
    };

    await this.saveConfig(servers);
    return true;
  }

  async removeServer(serverId: string): Promise<boolean> {
    const servers = await this.loadConfig();
    const filteredServers = servers.filter(s => s.id !== serverId);
    
    if (filteredServers.length === servers.length) {
      return false; // Server not found
    }

    await this.saveConfig(filteredServers);
    return true;
  }

  async toggleServer(serverId: string): Promise<boolean> {
    const servers = await this.loadConfig();
    const server = servers.find(s => s.id === serverId);
    
    if (!server) {
      return false;
    }

    return await this.updateServer(serverId, { enabled: !server.enabled });
  }

  // Template Management
  async saveTemplate(template: McpTemplate): Promise<void> {
    const templates = await this.loadTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  async loadTemplates(): Promise<McpTemplate[]> {
    try {
      const stored = localStorage.getItem(this.TEMPLATES_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultTemplates();
    } catch (error) {
      console.error('Failed to load templates:', error);
      return this.getDefaultTemplates();
    }
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    const templates = await this.loadTemplates();
    const filteredTemplates = templates.filter(t => t.id !== templateId);
    
    if (filteredTemplates.length === templates.length) {
      return false;
    }

    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(filteredTemplates));
    return true;
  }

  // Usage Statistics
  async updateUsageStats(serverId: string, success: boolean, responseTime: number): Promise<void> {
    const stats = await this.loadUsageStats();
    const existingStats = stats.find(s => s.serverId === serverId);

    if (existingStats) {
      existingStats.requestCount++;
      if (success) {
        existingStats.successCount++;
      } else {
        existingStats.failureCount++;
      }
      existingStats.averageResponseTime = 
        (existingStats.averageResponseTime * (existingStats.requestCount - 1) + responseTime) / 
        existingStats.requestCount;
      existingStats.lastUsed = new Date();
    } else {
      stats.push({
        serverId,
        requestCount: 1,
        successCount: success ? 1 : 0,
        failureCount: success ? 0 : 1,
        averageResponseTime: responseTime,
        lastUsed: new Date()
      });
    }

    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  async loadUsageStats(): Promise<McpServerUsageStats[]> {
    try {
      const stored = localStorage.getItem(this.STATS_KEY);
      if (!stored) return [];

      return JSON.parse(stored).map((stat: McpServerUsageStats & { lastUsed?: string }) => ({
        ...stat,
        lastUsed: stat.lastUsed ? new Date(stat.lastUsed) : undefined
      }));
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      return [];
    }
  }

  // Validation
  validateServerConfig(config: Partial<McpServerConfig>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.name?.trim()) {
      errors.push('Server name is required');
    }

    if (!config.transport) {
      errors.push('Transport configuration is required');
    } else {
      const { type, url, command } = config.transport;
      
      if (!['sse', 'stdio', 'http'].includes(type)) {
        errors.push('Invalid transport type');
      }

      if (type === 'sse' || type === 'http') {
        if (!url) {
          errors.push('URL is required for SSE/HTTP transport');
        } else if (!this.isValidUrl(url)) {
          errors.push('Invalid URL format');
        }
      }

      if (type === 'stdio' && !command) {
        errors.push('Command is required for stdio transport');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Default configurations
  private getDefaultServers(): McpServerConfig[] {
    return [
      {
        id: 'copilotkit-official',
        name: 'CopilotKit Official',
        description: 'Official CopilotKit MCP server with web search and general capabilities',
        transport: {
          type: 'sse',
          url: 'https://mcp.copilotkit.ai/sse'
        },
        capabilities: ['web_search', 'general_knowledge'],
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
        healthStatus: 'unknown'
      }
    ];
  }

  private getDefaultTemplates(): McpTemplate[] {
    return [
      {
        id: 'web-search-template',
        name: 'Web Search Server',
        description: 'Template for web search MCP servers',
        config: {
          transport: { type: 'sse' },
          capabilities: ['web_search'],
          metadata: { category: 'Web Search' }
        },
        requiredFields: ['name', 'transport.url'],
        category: 'Web Search',
        isPublic: true,
        version: '1.0.0'
      },
      {
        id: 'api-integration-template',
        name: 'API Integration Server',
        description: 'Template for API integration MCP servers',
        config: {
          transport: { type: 'http' },
          capabilities: ['api_integration'],
          metadata: { category: 'API Integrations' }
        },
        requiredFields: ['name', 'transport.url'],
        category: 'API Integrations',
        isPublic: true,
        version: '1.0.0'
      }
    ];
  }

  // Export/Import functionality
  async exportConfig(): Promise<string> {
    const servers = await this.loadConfig();
    const templates = await this.loadTemplates();
    const stats = await this.loadUsageStats();

    return JSON.stringify({
      servers,
      templates,
      stats,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2);
  }

  async importConfig(configJson: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(configJson);
      
      if (data.servers) {
        await this.saveConfig(data.servers);
      }
      
      if (data.templates) {
        localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(data.templates));
      }

      return {
        success: true,
        message: `Imported ${data.servers?.length || 0} servers and ${data.templates?.length || 0} templates`
      };
    } catch (error) {
      return {
        success: false,
        message: `Import failed: ${error instanceof Error ? error.message : 'Invalid format'}`
      };
    }
  }
}

export const mcpConfigService = new McpConfigService();
